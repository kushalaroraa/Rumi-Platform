import React from 'react';
import { Briefcase, Check, Clock, MapPin, Users } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { normalizeImageUrl } from '../../services/api';
import { formatBudgetLabel } from '../../utils/budget';

const PREF_TAG_MAP = {
  cleanliness: {
    high: 'Clean & Tidy',
    medium: 'Moderate',
    low: 'Relaxed',
  },
  sleep: {
    early_sleeper: 'Early Sleeper',
    night_owl: 'Night Owl',
    flexible: 'Flexible Sleep',
  },
  food: {
    veg: 'Vegetarian',
    'non-veg': 'Non-Veg',
    egg: 'Eggetarian',
    both: 'Veg & Non-Veg',
  },
  smoking: {
    no: 'Non-Smoker',
    never: 'Non-Smoker',
    yes: 'Smoker',
    social: 'Social Smoker',
  },
  profession: {
    student: 'Student',
    working: 'Working',
    WFH: 'WFH',
    hybrid: 'Hybrid',
  },
};

function deriveProfileTags(profile) {
  const prefs = profile?.lifestylePreferences || {};
  const tags = [];
  const cleanKey = prefs.cleanliness || prefs.cleanlinessLevel;
  if (cleanKey && PREF_TAG_MAP.cleanliness[cleanKey]) tags.push(PREF_TAG_MAP.cleanliness[cleanKey]);
  if (prefs.sleepSchedule && PREF_TAG_MAP.sleep[prefs.sleepSchedule]) tags.push(PREF_TAG_MAP.sleep[prefs.sleepSchedule]);
  if (prefs.foodPreference && PREF_TAG_MAP.food[prefs.foodPreference]) tags.push(PREF_TAG_MAP.food[prefs.foodPreference]);
  if (prefs.smoking && PREF_TAG_MAP.smoking[prefs.smoking]) tags.push(PREF_TAG_MAP.smoking[prefs.smoking]);
  if (prefs.petsAllowed === true) tags.push('Pet Friendly');
  return tags.slice(0, 3);
}

export const FindNextRumiSection = ({
  profiles = [],
  city = '',
  availableCities = [],
  missingCity = false,
  loading = false,
  error = '',
  onSelectCity,
  onSelectProfile,
  onSetCity
}) => {
  const cityOptions = Array.isArray(availableCities) ? availableCities : [];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Find Your Next Rumi</h3>
          <p className="text-sm text-gray-500 mt-1">Roommates sorted by your city</p>
        </div>

        <div className="rumi-section-controls">
          {city && (
            <span className="rumi-city-pill">
              <MapPin size={12} />
              {city}
            </span>
          )}
          <select
            aria-label="Filter roommates by city"
            value={city}
            onChange={(e) => onSelectCity?.(e.target.value)}
            disabled={loading || cityOptions.length === 0}
            className="rumi-city-select"
          >
            {!city && <option value="">Select city</option>}
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
          <Users size={24} className="mr-2 opacity-50" />
          Loading roommates in your city…
        </div>
      ) : error ? (
        <div className="rumi-empty-state">
          <p className="text-sm font-semibold text-gray-900">Unable to load city recommendations</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      ) : missingCity ? (
        <div className="rumi-empty-state">
          <div className="rumi-empty-state-icon">
            <MapPin size={18} />
          </div>
          <p className="text-sm font-semibold text-gray-900">Set your city to see local roommates</p>
          <p className="text-xs text-gray-500 mt-1">
            Add your city in your profile preferences to discover compatible roommates near you.
          </p>
          {onSetCity && (
            <button
              type="button"
              onClick={onSetCity}
              className="mt-3 px-4 py-2 rumi-btn-primary text-xs"
            >
              Update Profile City
            </button>
          )}
        </div>
      ) : profiles.length === 0 ? (
        <div className="rumi-empty-state">
          <div className="rumi-empty-state-icon">
            <Users size={18} />
          </div>
          <p className="text-sm font-semibold text-gray-900">No roommates found in {city} yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Check back soon as more people in {city} complete their profiles.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3">
            {profiles.map((profile) => {
              const avatarSrc = normalizeImageUrl(profile?.photo || profile?.profilePicture || '');
              const profileCity = profile?.city || profile?.location?.city || city;
              const profession = PREF_TAG_MAP.profession[profile?.profession] || profile?.profession || '';
              const tags = deriveProfileTags(profile);
              const budgetText = profile?.intent === 'offer' ? '' : formatBudgetLabel(profile?.budgetRange ?? profile?.budget);
              const score = typeof profile?.compatibility === 'number' || typeof profile?.matchScore === 'number'
                ? Math.round(Number(profile?.compatibility ?? profile?.matchScore ?? 0))
                : null;

              return (
                <div
                  key={profile._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectProfile?.(profile)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectProfile?.(profile);
                    }
                  }}
                  className="rumi-profile-card cursor-pointer text-left"
                >
                  {/* Card Header: Avatar + Compatibility */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Avatar
                      src={avatarSrc}
                      alt={profile?.name || 'User'}
                      className="w-12 h-12 rounded-full"
                      iconSize={20}
                    />
                    {score !== null && (
                      <span className="rumi-match-badge">
                        {score}% Match
                      </span>
                    )}
                  </div>

                  {/* Name & City / Profession */}
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile?.name || 'Rumi Member'}{profile?.age ? `, ${profile.age}` : ''}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 min-w-0">
                    {profileCity && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin size={12} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">{profileCity}</span>
                      </span>
                    )}
                    {profession && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <Briefcase size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{profession}</span>
                      </span>
                    )}
                  </div>

                  {budgetText && (
                    <p className="text-xs font-medium text-gray-800 mt-1.5 truncate">
                      {budgetText}
                    </p>
                  )}

                  {profile?.bio && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}

                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="rumi-chip-blue">{tag}</span>
                      ))}
                    </div>
                  )}

                  {profile?.requestStatus === 'connected' && (
                    <div className="mt-2">
                      <span className="rumi-status-pill rumi-status-pill--connected">
                        <Check size={11} />
                        Connected
                      </span>
                    </div>
                  )}

                  {profile?.requestStatus === 'pending_sent' && (
                    <div className="mt-2">
                      <span className="rumi-status-pill rumi-status-pill--pending">
                        <Clock size={11} />
                        Request Sent
                      </span>
                    </div>
                  )}

                  <div className="mt-auto pt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProfile?.(profile);
                      }}
                      className="w-full px-3 py-2 rumi-btn-primary text-xs"
                    >
                      View profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
