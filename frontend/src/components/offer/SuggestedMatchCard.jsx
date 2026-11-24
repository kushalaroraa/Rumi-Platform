import React from 'react';
import { Check, MapPin, Send } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { normalizeImageUrl } from '../../services/api';
import { formatBudgetLabel } from '../../utils/budget';

export const SuggestedMatchCard = ({
  suggestion,
  onInvite,
  inviting = false,
  invited = false
}) => {
  const avatar = normalizeImageUrl(suggestion?.image || '');
  const compatibility = Math.round(Number(suggestion?.compatibility ?? suggestion?.matchScore ?? suggestion?.score ?? 0));
  const city = suggestion?.city || '';
  const profession = suggestion?.profession || '';
  const budgetText = formatBudgetLabel(suggestion?.budgetRange ?? suggestion?.budget);

  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white">
      <div className="flex items-start gap-3 min-w-0">
        <Avatar src={avatar} alt={suggestion?.name || 'User'} className="w-12 h-12 rounded-full" iconSize={20} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {suggestion?.name || 'User'}{suggestion?.age ? `, ${suggestion.age}` : ''}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="rumi-match-badge">{compatibility}% Match</span>
                {city && (
                  <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                    <MapPin size={11} className="text-blue-600" />
                    {city}
                  </span>
                )}
              </div>
            </div>
            {profession && (
              <span className="rumi-chip-neutral text-[10px]">{profession}</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            {suggestion?.bio || 'Looking for a compatible flatmate.'}
          </p>
          {budgetText && (
            <p className="text-xs font-medium text-gray-800 mt-1.5">
              Budget: {budgetText}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        {invited ? (
          <div className="w-full px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5">
            <Check size={14} />
            Invitation Sent (Pending)
          </div>
        ) : (
          <button
            type="button"
            onClick={onInvite}
            disabled={inviting}
            className="w-full px-3 py-2 rumi-btn-primary text-xs inline-flex items-center justify-center gap-1.5"
          >
            <Send size={13} />
            {inviting ? 'Sending Invite…' : 'Invite to Connect'}
          </button>
        )}
      </div>
    </div>
  );
};
