import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Heart,
  Check,
  Clock,
  MapPin,
  Briefcase,
  DollarSign,
  ShieldCheck,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { normalizeImageUrl } from '../../services/api';
import { formatBudgetLabel } from '../../utils/budget';

const VALUE_LABELS = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
  other: 'Other',
  student: 'Student',
  working: 'Working Professional',
  wfh: 'Work From Home',
  hybrid: 'Hybrid',
  find: 'Looking for a Room',
  offer: 'Offering a Room',
  explore: 'Just Exploring',
  early_sleeper: 'Early Sleeper',
  night_owl: 'Night Owl',
  flexible: 'Flexible',
  veg: 'Vegetarian',
  'non-veg': 'Non-Veg',
  egg: 'Eggetarian',
  both: 'Veg & Non-Veg',
  no: 'Non-Smoker',
  never: 'Non-Smoker',
  yes: 'Smoker',
  social: 'Social Smoker',
  low: 'Relaxed',
  medium: 'Moderate',
  high: 'Very Clean',
};

function formatProfileToken(val) {
  if (val == null) return '';
  const raw = String(val).trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (VALUE_LABELS[lower]) return VALUE_LABELS[lower];
  return raw
    .split(/[_-]+/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

export const ProfileDetailsModal = ({
  open,
  profile,
  onClose,
  requestStatus = null,
  onSendRequest,
  onPassProfile,
  onOpenChat
}) => {
  const profileKey = profile?._id ? String(profile._id) : 'profile';
  const [actionState, setActionState] = useState({
    key: profileKey,
    submitting: null,
    error: '',
    feedback: '',
    overrideStatus: null
  });

  const activeAction = actionState.key === profileKey
    ? actionState
    : { key: profileKey, submitting: null, error: '', feedback: '', overrideStatus: null };

  useEffect(() => {
    if (!open || !profile) return undefined;

    const currentCount = Number(document.body.dataset.rumiRoomModalCount || '0');
    document.body.dataset.rumiRoomModalCount = String(currentCount + 1);
    document.body.classList.add('rumi-room-modal-open');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      const nextCount = Math.max(0, Number(document.body.dataset.rumiRoomModalCount || '1') - 1);
      if (nextCount === 0) {
        delete document.body.dataset.rumiRoomModalCount;
        document.body.classList.remove('rumi-room-modal-open');
      } else {
        document.body.dataset.rumiRoomModalCount = String(nextCount);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, profile, onClose]);

  if (!open || !profile || typeof document === 'undefined') return null;

  const effectiveStatus = activeAction.overrideStatus || requestStatus || profile?.requestStatus || null;
  const avatarSrc = normalizeImageUrl(profile?.photo || profile?.profilePicture || '');
  const score = typeof profile?.compatibility === 'number' || typeof profile?.matchScore === 'number'
    ? Math.round(Number(profile?.compatibility ?? profile?.matchScore ?? 0))
    : null;

  const cityText = [profile?.city || profile?.location?.city, profile?.location?.state]
    .filter(Boolean)
    .join(', ');
  const professionLabel = formatProfileToken(profile?.profession);
  const genderLabel = formatProfileToken(profile?.gender);
  const intentLabel = formatProfileToken(profile?.intent);

  const budgetLabel = formatBudgetLabel(profile?.budgetRange ?? profile?.budget);
  const hasBudget = Boolean(budgetLabel) && profile?.intent !== 'offer';

  const prefs = profile?.lifestylePreferences || {};
  const roommatePrefs = profile?.roommatePreferences || {};
  const cleanlinessVal = prefs.cleanliness || prefs.cleanlinessLevel || '';
  const lifestyleItems = [
    prefs.foodPreference ? { label: 'Food Preference', value: formatProfileToken(prefs.foodPreference) } : null,
    prefs.smoking ? { label: 'Smoking', value: formatProfileToken(prefs.smoking) } : null,
    prefs.sleepSchedule ? { label: 'Sleep Schedule', value: formatProfileToken(prefs.sleepSchedule) } : null,
    cleanlinessVal ? { label: 'Cleanliness', value: formatProfileToken(cleanlinessVal) } : null,
    typeof prefs.petsAllowed === 'boolean'
      ? { label: 'Pets', value: prefs.petsAllowed ? 'Pet Friendly' : 'No Pets' }
      : null,
    genderLabel ? { label: 'Gender', value: genderLabel } : null,
  ].filter(Boolean);

  const prefAgeMin = Number(roommatePrefs.ageMin);
  const prefAgeMax = Number(roommatePrefs.ageMax);
  const preferredAgeLabel = prefAgeMin > 0 && prefAgeMax > 0
    ? `${prefAgeMin} – ${prefAgeMax} yrs`
    : prefAgeMin > 0
      ? `${prefAgeMin}+ yrs`
      : prefAgeMax > 0
        ? `Up to ${prefAgeMax} yrs`
        : '';

  const roommatePrefItems = [
    roommatePrefs.preferredGender ? { label: 'Preferred Gender', value: formatProfileToken(roommatePrefs.preferredGender) } : null,
    preferredAgeLabel ? { label: 'Preferred Age', value: preferredAgeLabel } : null,
    roommatePrefs.petsPreference ? { label: 'Pets Preference', value: formatProfileToken(roommatePrefs.petsPreference) } : null,
  ].filter(Boolean);

  const verifications = [];
  if (profile?.verificationStatus?.emailVerified) verifications.push('Email Verified');
  if (profile?.verificationStatus?.phoneVerified) verifications.push('Phone Verified');
  if (profile?.verificationStatus?.aadharVerified) verifications.push('ID Verified');

  const reasons = Array.isArray(profile?.reasons) ? profile.reasons.filter(Boolean) : [];

  const handleSend = async () => {
    if (!onSendRequest || activeAction.submitting) return;
    setActionState({
      key: profileKey,
      submitting: 'send',
      error: '',
      feedback: '',
      overrideStatus: null
    });
    try {
      const res = await onSendRequest(profile);
      const nextStatus = res?.matched ? 'connected' : 'pending_sent';
      setActionState({
        key: profileKey,
        submitting: null,
        error: '',
        feedback: res?.matched ? "It's a match! You can now chat." : 'Roommate request sent!',
        overrideStatus: nextStatus
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send request.';
      const status = err?.response?.status;
      const inferred = status === 409
        ? (/connected/i.test(msg) ? 'connected' : 'pending_sent')
        : null;
      setActionState({
        key: profileKey,
        submitting: null,
        error: inferred ? '' : msg,
        feedback: inferred ? msg : '',
        overrideStatus: inferred
      });
    }
  };

  const handlePass = async () => {
    if (!onPassProfile || activeAction.submitting) return;
    setActionState({
      key: profileKey,
      submitting: 'pass',
      error: '',
      feedback: '',
      overrideStatus: null
    });
    try {
      await onPassProfile(profile);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to pass profile.';
      setActionState({
        key: profileKey,
        submitting: null,
        error: msg,
        feedback: '',
        overrideStatus: null
      });
    }
  };

  return createPortal(
    <>
      <div
        className="rumi-room-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="rumi-room-modal-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rumi-profile-modal-title"
      >
        <div
          className="rumi-room-modal-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4 flex-shrink-0 bg-white">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar
                src={avatarSrc}
                alt={profile?.name || 'User'}
                className="w-16 h-16 rounded-full border border-gray-100"
                iconSize={24}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="rumi-profile-modal-title" className="text-xl font-semibold text-gray-900">
                    {profile?.name || 'Rumi Member'}{profile?.age ? `, ${profile.age}` : ''}
                  </h2>
                  {score !== null && (
                    <span className="rumi-match-badge">
                      {score}% Match
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                  {cityText && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} className="text-blue-600" />
                      {cityText}
                    </span>
                  )}
                  {professionLabel && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase size={14} className="text-gray-400" />
                      {professionLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile details"
              className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="rumi-room-modal-body p-6 space-y-4">
            {/* Bio */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1.5">About</p>
              {profile?.bio ? (
                <p className="text-sm text-gray-700 leading-relaxed rumi-whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-gray-500">No bio provided yet.</p>
              )}
            </div>

            {/* Budget & Intent */}
            {(hasBudget || intentLabel) && (
              <div className="rumi-specs-grid">
                {hasBudget && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <DollarSign size={12} className="text-blue-600" />
                      Budget Range
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{budgetLabel}</p>
                  </div>
                )}
                {intentLabel && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Sparkles size={12} className="text-blue-600" />
                      Looking For
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{intentLabel}</p>
                  </div>
                )}
              </div>
            )}

            {/* Compatibility Reasons */}
            {reasons.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Why you match</p>
                <div className="flex flex-wrap gap-2">
                  {reasons.map((r) => (
                    <span key={r} className="rumi-chip-blue">{r}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle Preferences */}
            {lifestyleItems.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Lifestyle Preferences</p>
                <div className="rumi-specs-grid">
                  {lifestyleItems.map((item) => (
                    <div key={item.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roommate Preferences */}
            {roommatePrefItems.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Looking For in a Roommate</p>
                <div className="rumi-specs-grid">
                  {roommatePrefItems.map((item) => (
                    <div key={item.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust & Verifications */}
            {(verifications.length > 0 || Number(profile?.trustScore) > 0) && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-blue-600" />
                  Verification & Trust
                </p>
                <div className="flex flex-wrap gap-2">
                  {Number(profile?.trustScore) > 0 && (
                    <span className="rumi-chip-neutral">Trust Score: {profile.trustScore}%</span>
                  )}
                  {verifications.map((v) => (
                    <span key={v} className="rumi-chip-neutral">{v}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback / Error */}
            {activeAction.feedback && (
              <div className="rumi-banner-success">
                {activeAction.feedback}
              </div>
            )}
            {activeAction.error && (
              <div className="rumi-banner-error">
                {activeAction.error}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            {effectiveStatus === 'connected' ? (
              <>
                <span className="rumi-status-pill rumi-status-pill--connected">
                  <Check size={12} />
                  Connected Match
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChat?.(profile._id);
                    onClose?.();
                  }}
                  className="px-4 py-2.5 rumi-btn-primary text-sm inline-flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  Open Chat
                </button>
              </>
            ) : effectiveStatus === 'pending_sent' ? (
              <>
                <span className="rumi-status-pill rumi-status-pill--pending">
                  <Clock size={12} />
                  Request Sent
                </span>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2.5 rumi-btn-secondary text-sm"
                >
                  Awaiting Response
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePass}
                  disabled={Boolean(activeAction.submitting) || !onPassProfile}
                  className="px-4 py-2.5 rumi-btn-secondary text-sm inline-flex items-center gap-2"
                >
                  <X size={16} />
                  {activeAction.submitting === 'pass' ? 'Passing…' : 'Pass'}
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={Boolean(activeAction.submitting) || !onSendRequest}
                  className="px-5 py-2.5 rumi-btn-primary text-sm inline-flex items-center gap-2"
                >
                  <Heart size={16} />
                  {activeAction.submitting === 'send'
                    ? 'Sending…'
                    : effectiveStatus === 'pending_received'
                      ? 'Accept & Connect'
                      : 'Send Request'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
