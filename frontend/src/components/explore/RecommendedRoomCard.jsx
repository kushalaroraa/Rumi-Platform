import React from 'react';
import { Check, Clock, MapPin } from 'lucide-react';
import { normalizeImageUrl } from '../../services/api';

const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=400&h=240&fit=crop';

function formatLabel(value, fallback = '') {
  if (!value) return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;
  if (raw.toLowerCase() === 'pg') return 'PG';
  return raw
    .split(/[_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export const RecommendedRoomCard = ({
  room,
  interactionStatus = null,
  onViewDetails
}) => {
  const rawCover = room?.coverUrl || room?.photoUrls?.[0] || FALLBACK_ROOM_IMAGE;
  const cover = normalizeImageUrl(rawCover);
  const locationLabel = [room?.location?.area, room?.location?.city].filter(Boolean).join(', ')
    || room?.location?.address
    || 'Location';
  const score = Math.round(Number(room?.compatibility ?? room?.matchScore ?? room?.score ?? 0) || 0);
  const tags = Array.isArray(room?.tags) ? room.tags.filter(Boolean) : [];
  const propertyTitle = formatLabel(room?.propertyType, 'Room');
  const roomTypeLabel = formatLabel(room?.roomType, 'Listing');
  const monthlyRent = Number(room?.monthlyRent ?? 0);
  const effectiveStatus = interactionStatus || room?.userInteractionStatus || null;

  return (
    <div className="rumi-room-card">
      <div className="rumi-room-card-media">
        <img
          src={cover}
          alt={propertyTitle}
          className="w-full h-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_ROOM_IMAGE) {
              e.currentTarget.src = FALLBACK_ROOM_IMAGE;
            }
          }}
        />
      </div>

      <div className="p-3 flex-1 flex flex-col">
        {/* Dedicated Header Row: Room Type + Compact Match Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-gray-500 truncate min-w-0">
            {roomTypeLabel}
          </span>
          <span className="rumi-match-badge">
            {score}% Match
          </span>
        </div>

        <p className="text-sm font-semibold text-gray-900 truncate">
          {propertyTitle}
        </p>

        <p className="text-xs text-gray-500 truncate mt-1 flex items-center gap-1">
          <MapPin size={12} className="flex-shrink-0 text-gray-400" />
          <span className="truncate">{locationLabel}</span>
        </p>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-base font-bold text-gray-900">
            ₹{Number.isFinite(monthlyRent) ? monthlyRent.toLocaleString('en-IN') : 0}
          </span>
          <span className="text-xs text-gray-500">/ month</span>
        </div>

        {effectiveStatus === 'accepted' && (
          <div className="mt-2">
            <span className="rumi-status-pill rumi-status-pill--connected">
              <Check size={11} />
              Connected
            </span>
          </div>
        )}

        {effectiveStatus === 'pending' && (
          <div className="mt-2">
            <span className="rumi-status-pill rumi-status-pill--pending">
              <Clock size={11} />
              Request Sent
            </span>
          </div>
        )}

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((t, i) => (
              <span key={i} className="rumi-chip-blue">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={() => onViewDetails?.(room)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={!onViewDetails}
          >
            See room details
          </button>
        </div>
      </div>
    </div>
  );
};