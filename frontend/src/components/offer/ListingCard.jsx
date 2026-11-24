import React from 'react';
import { Edit, Pause, Play, Trash2 } from 'lucide-react';
import { normalizeImageUrl } from '../../services/api';

const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=300&h=200&fit=crop';

function formatLabel(value, fallback = '') {
  if (!value) return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;
  if (raw.toLowerCase() === 'pg') return 'PG';
  return raw
    .split(/[_-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

export const ListingCard = ({
  room,
  selected,
  onSelect,
  onEdit,
  onTogglePause,
  onDelete
}) => {
  const status = room?.status || 'active';
  const statusLabel = status === 'active' ? 'Active' : status === 'paused' ? 'Paused' : 'Rented';
  const statusBadgeClass = status === 'active'
    ? 'rumi-status-pill rumi-status-pill--connected'
    : status === 'paused'
      ? 'rumi-status-pill rumi-status-pill--pending'
      : 'rumi-chip-blue';

  const pauseBtnClass = status === 'active'
    ? 'rumi-btn-status-pause'
    : status === 'paused'
      ? 'rumi-btn-status-activate'
      : 'rumi-btn-status-rented';

  const cover = normalizeImageUrl(room?.coverUrl || room?.photoUrls?.[0] || FALLBACK_ROOM_IMAGE);
  const title = `${formatLabel(room?.propertyType, 'Room')}${room?.roomType ? ` · ${formatLabel(room.roomType)}` : ''}`;
  const locationText = [room?.location?.area, room?.location?.city].filter(Boolean).join(', ')
    || room?.location?.address
    || 'Location';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`border rounded-2xl p-4 bg-white transition-shadow cursor-pointer hover:shadow-sm ${selected ? 'border-blue-600 shadow-md' : 'border-gray-100'}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="rumi-listing-thumb">
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_ROOM_IMAGE) {
                e.currentTarget.src = FALLBACK_ROOM_IMAGE;
              }
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{locationText}</p>
            </div>
            <span className={statusBadgeClass}>{statusLabel}</span>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-baseline gap-1 text-sm">
              <span className="font-semibold text-gray-900">
                ₹{Number(room?.monthlyRent ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-500">/ month</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-[10px] text-gray-500">Views</p>
                <p className="text-sm font-semibold text-gray-900">{room?.viewsCount ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-[10px] text-gray-500">Requests</p>
                <p className="text-sm font-semibold text-gray-900">
                  {room?.incomingRequestsCount ?? room?.totalRequests ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-xs font-medium text-gray-700 inline-flex items-center gap-1.5"
        >
          <Edit size={14} />
          Edit
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePause();
          }}
          className={`px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 ${pauseBtnClass}`}
        >
          {status === 'active' ? <Pause size={14} /> : <Play size={14} />}
          {status === 'active' ? 'Pause' : 'Activate'}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 rounded-xl text-xs font-medium inline-flex items-center gap-1.5"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
};
