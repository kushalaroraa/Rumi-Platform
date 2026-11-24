import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Heart,
  Check,
  Clock,
  MapPin,
  Home,
  Sparkles,
  Users,
  ShieldCheck,
  Eye,
  Calendar,
  BedDouble
} from 'lucide-react';
import { normalizeImageUrl } from '../../services/api';

const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&h=500&fit=crop';

const AMENITY_LABELS = {
  wifi: 'Wi-Fi',
  ac: 'Air Conditioning',
  washing_machine: 'Washing Machine',
  kitchen_access: 'Kitchen Access',
  parking: 'Parking',
  power_backup: 'Power Backup',
  attached_bathroom: 'Attached Bathroom',
};

const PREFERENCE_VALUE_LABELS = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
  other: 'Other',
  any: 'Any',
  student: 'Student',
  working: 'Working Professional',
  allowed: 'Allowed',
  not_allowed: 'Not Allowed',
  low: 'Relaxed',
  medium: 'Moderate',
  high: 'Very Clean',
  early_sleeper: 'Early Sleeper',
  night_owl: 'Night Owl',
  veg: 'Vegetarian',
  'non-veg': 'Non-Veg',
  furnished: 'Furnished',
  semi_furnished: 'Semi-Furnished',
  unfurnished: 'Unfurnished',
};

function formatToken(value) {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (PREFERENCE_VALUE_LABELS[lower]) return PREFERENCE_VALUE_LABELS[lower];
  if (AMENITY_LABELS[lower]) return AMENITY_LABELS[lower];
  if (lower === 'pg') return 'PG';
  return raw
    .split(/[_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export const RoomDetailsModal = ({
  open,
  room,
  onClose,
  interactionStatus = null,
  currentUserId = '',
  onLikeRoom,
  onPassRoom
}) => {
  const roomKey = room?._id ? String(room._id) : 'room';
  const [photoSelection, setPhotoSelection] = useState({ key: roomKey, index: 0 });
  const [actionState, setActionState] = useState({
    key: roomKey,
    submitting: null,
    error: '',
    feedback: '',
    overrideStatus: null
  });
  const activePhotoIndex = open && photoSelection.key === roomKey ? photoSelection.index : 0;
  const activeAction = actionState.key === roomKey
    ? actionState
    : { key: roomKey, submitting: null, error: '', feedback: '', overrideStatus: null };

  const photos = useMemo(() => {
    if (!room) return [FALLBACK_ROOM_IMAGE];
    const rawList = [
      room.coverUrl,
      ...(Array.isArray(room.photoUrls) ? room.photoUrls : [])
    ].filter(Boolean);

    const uniqueNormalized = [];
    const seen = new Set();
    for (const item of rawList) {
      const normalized = normalizeImageUrl(item);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        uniqueNormalized.push(normalized);
      }
    }
    return uniqueNormalized.length > 0 ? uniqueNormalized : [FALLBACK_ROOM_IMAGE];
  }, [room]);

  useEffect(() => {
    if (!open || !room) return undefined;

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
  }, [open, room, onClose]);

  if (!open || !room || typeof document === 'undefined') return null;

  const score = Math.round(Number(room?.compatibility ?? room?.matchScore ?? room?.score ?? 0) || 0);
  const tags = Array.isArray(room?.tags) ? room.tags.filter(Boolean) : [];
  const rules = Array.isArray(room?.rules) ? room.rules.filter(Boolean) : [];

  const propertyLabel = formatToken(room?.propertyType) || 'Room';
  const roomTypeLabel = formatToken(room?.roomType);
  const statusLabel = formatToken(room?.status);
  const monthlyRent = Number(room?.monthlyRent ?? 0);

  const rawAmenities = Array.isArray(room?.amenities) ? room.amenities.filter(Boolean) : [];
  let furnishingValue = room?.furnishingStatus ? formatToken(room.furnishingStatus) : '';
  const amenityChips = [];

  for (const entry of rawAmenities) {
    const str = String(entry).trim();
    if (!str) continue;
    if (str.toLowerCase().startsWith('furnishing:')) {
      const parsed = str.slice('furnishing:'.length).trim();
      if (parsed && !furnishingValue) {
        furnishingValue = formatToken(parsed);
      }
      continue;
    }
    const label = formatToken(str);
    if (label && !amenityChips.includes(label)) {
      amenityChips.push(label);
    }
  }
  if (room?.attachedBathroom && !amenityChips.includes('Attached Bathroom')) {
    amenityChips.push('Attached Bathroom');
  }

  const loc = room?.location || {};
  const locationSummary = [loc.area, loc.city, loc.state].filter(Boolean).join(', ');
  const fullAddressParts = [loc.address, loc.area, loc.city, loc.state, loc.pincode].filter(Boolean);
  const fullLocationText = fullAddressParts.join(', ');

  const prefs = room?.flatmatePreferences || {};
  const preferenceItems = [];
  const ageMin = prefs.ageMin != null && prefs.ageMin !== '' ? Number(prefs.ageMin) : null;
  const ageMax = prefs.ageMax != null && prefs.ageMax !== '' ? Number(prefs.ageMax) : null;
  if (Number.isFinite(ageMin) && Number.isFinite(ageMax) && ageMin > 0 && ageMax > 0) {
    preferenceItems.push({ label: 'Age Range', value: `${ageMin} – ${ageMax} yrs` });
  }
  if (prefs.preferredGender) {
    preferenceItems.push({ label: 'Preferred Gender', value: formatToken(prefs.preferredGender) });
  }
  if (prefs.occupation) {
    preferenceItems.push({ label: 'Occupation', value: formatToken(prefs.occupation) });
  }
  if (prefs.cleanlinessLevel) {
    preferenceItems.push({ label: 'Cleanliness', value: formatToken(prefs.cleanlinessLevel) });
  }
  if (prefs.sleepSchedule) {
    preferenceItems.push({ label: 'Sleep Schedule', value: formatToken(prefs.sleepSchedule) });
  }
  if (prefs.foodPreference) {
    preferenceItems.push({ label: 'Food Preference', value: formatToken(prefs.foodPreference) });
  }
  if (prefs.smokingAllowed) {
    preferenceItems.push({ label: 'Smoking', value: formatToken(prefs.smokingAllowed) });
  }
  if (prefs.drinkingAllowed) {
    preferenceItems.push({ label: 'Drinking', value: formatToken(prefs.drinkingAllowed) });
  }
  if (prefs.petsAllowed) {
    preferenceItems.push({ label: 'Pets', value: formatToken(prefs.petsAllowed) });
  }
  if (prefs.socialLevel) {
    preferenceItems.push({ label: 'Social Vibe', value: formatToken(prefs.socialLevel) });
  }

  const securityDeposit = room?.securityDeposit != null ? Number(room.securityDeposit) : null;
  const bedAvailability = room?.bedAvailability != null && room.bedAvailability !== '' ? Number(room.bedAvailability) : null;
  const leaseDurationMonths = room?.leaseDurationMonths != null && room.leaseDurationMonths !== '' ? Number(room.leaseDurationMonths) : null;
  const availableFrom = room?.availableFrom ? new Date(room.availableFrom) : null;
  const availableFromFormatted = availableFrom && !Number.isNaN(availableFrom.getTime())
    ? availableFrom.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const listedDate = room?.createdAt ? new Date(room.createdAt) : null;
  const listedDateFormatted = listedDate && !Number.isNaN(listedDate.getTime())
    ? listedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const activePhoto = photos[activePhotoIndex] || photos[0] || FALLBACK_ROOM_IMAGE;
  const effectiveStatus = activeAction.overrideStatus || interactionStatus || room?.userInteractionStatus || null;
  const ownerId = room?.ownerUserId?._id || room?.ownerUserId || '';
  const isOwnRoom = Boolean(currentUserId && ownerId && String(ownerId) === String(currentUserId));
  const isUnavailable = Boolean(room?.status && room.status !== 'active');
  const actionsDisabled = Boolean(
    activeAction.submitting ||
    effectiveStatus === 'pending' ||
    effectiveStatus === 'accepted' ||
    isOwnRoom ||
    isUnavailable
  );

  const handleLikeClick = async () => {
    if (!onLikeRoom || actionsDisabled) return;
    setActionState({
      key: roomKey,
      submitting: 'like',
      error: '',
      feedback: '',
      overrideStatus: null
    });
    try {
      const result = await onLikeRoom(room);
      const nextStatus = result?.matched ? 'accepted' : 'pending';
      setActionState({
        key: roomKey,
        submitting: null,
        error: '',
        feedback: result?.matched
          ? "It's a match! You are now connected for this room."
          : 'Request sent to the room owner!',
        overrideStatus: nextStatus
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to send room request.';
      const status = err?.response?.status;
      const inferredStatus = status === 409
        ? (/connected/i.test(msg) ? 'accepted' : 'pending')
        : null;
      setActionState({
        key: roomKey,
        submitting: null,
        error: inferredStatus ? '' : msg,
        feedback: inferredStatus ? msg : '',
        overrideStatus: inferredStatus
      });
    }
  };

  const handlePassClick = async () => {
    if (!onPassRoom || actionsDisabled) return;
    setActionState({
      key: roomKey,
      submitting: 'pass',
      error: '',
      feedback: '',
      overrideStatus: null
    });
    try {
      await onPassRoom(room);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to pass this room.';
      setActionState({
        key: roomKey,
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
        aria-labelledby="rumi-room-modal-title"
      >
        <div
          className="rumi-room-modal-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4 flex-shrink-0 bg-white">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="rumi-room-modal-title" className="text-xl font-semibold text-gray-900">
                  {propertyLabel}{roomTypeLabel ? ` · ${roomTypeLabel}` : ''}
                </h2>
                <span className="rumi-match-badge">
                  {score}% Match
                </span>
                {statusLabel && (
                  <span className="rumi-chip-neutral">
                    {statusLabel}
                  </span>
                )}
              </div>
              {locationSummary && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <MapPin size={14} className="flex-shrink-0 text-gray-400" />
                  <span className="truncate">{locationSummary}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close room details"
              className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="rumi-room-modal-body p-6 space-y-6">
            <div className="rumi-room-modal-grid">
              {/* Left Column: Photo Gallery & Quick Highlights */}
              <div>
                <div className="rounded-2xl overflow-hidden bg-slate-100 border border-gray-100" style={{ height: '210px' }}>
                  <img
                    src={activePhoto}
                    alt={`${propertyLabel} preview`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK_ROOM_IMAGE) {
                        e.currentTarget.src = FALLBACK_ROOM_IMAGE;
                      }
                    }}
                  />
                </div>

                {photos.length > 1 && (
                  <div className="rumi-room-modal-thumbs">
                    {photos.map((photoSrc, idx) => (
                      <button
                        key={`${photoSrc}-${idx}`}
                        type="button"
                        onClick={() => setPhotoSelection({ key: roomKey, index: idx })}
                        aria-label={`View photo ${idx + 1}`}
                        className={`rumi-room-modal-thumb ${idx === activePhotoIndex ? 'rumi-room-modal-thumb--active' : ''}`}
                      >
                        <img
                          src={photoSrc}
                          alt={`${propertyLabel} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((t, i) => (
                      <span key={i} className="rumi-chip-blue">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rent Card */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-gray-500 font-medium">Monthly Rent</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{Number.isFinite(monthlyRent) ? monthlyRent.toLocaleString('en-IN') : 0}
                    </span>
                    <span className="text-xs text-gray-500">/ month</span>
                  </div>
                  {Number.isFinite(securityDeposit) && securityDeposit > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      Security Deposit: <span className="font-semibold text-gray-900">₹{securityDeposit.toLocaleString('en-IN')}</span>
                    </p>
                  )}
                </div>

                {/* Room Like / Pass Actions */}
                {(onLikeRoom || onPassRoom) && (
                  <div className="mt-3">
                    <div className="rumi-modal-actions-row">
                      <button
                        type="button"
                        onClick={handlePassClick}
                        disabled={actionsDisabled || !onPassRoom}
                        aria-label="Pass room"
                        title={effectiveStatus ? 'Already interacted' : 'Pass room'}
                        className="rumi-action-circle-btn rumi-action-circle-btn--pass"
                      >
                        <X size={24} strokeWidth={2.5} />
                      </button>

                      <button
                        type="button"
                        onClick={handleLikeClick}
                        disabled={actionsDisabled || !onLikeRoom}
                        aria-label="Like room"
                        title={
                          effectiveStatus === 'accepted'
                            ? 'Connected'
                            : effectiveStatus === 'pending'
                              ? 'Request Sent'
                              : 'Like room'
                        }
                        className="rumi-action-circle-btn rumi-action-circle-btn--like"
                      >
                        <Heart size={24} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="mt-3 text-center">
                      {activeAction.submitting && (
                        <p className="text-xs text-gray-500">
                          {activeAction.submitting === 'like' ? 'Sending request…' : 'Passing room…'}
                        </p>
                      )}

                      {!activeAction.submitting && effectiveStatus === 'accepted' && (
                        <span className="rumi-status-pill rumi-status-pill--connected">
                          <Check size={12} />
                          Connected
                        </span>
                      )}

                      {!activeAction.submitting && effectiveStatus === 'pending' && (
                        <span className="rumi-status-pill rumi-status-pill--pending">
                          <Clock size={12} />
                          Request Sent
                        </span>
                      )}

                      {!activeAction.submitting && isOwnRoom && (
                        <p className="text-xs text-gray-500">This is your own listing.</p>
                      )}

                      {!activeAction.submitting && !isOwnRoom && isUnavailable && (
                        <p className="text-xs text-gray-500">This room is currently unavailable.</p>
                      )}

                      {activeAction.feedback && (
                        <p className="text-xs text-emerald-600 font-medium mt-2">{activeAction.feedback}</p>
                      )}

                      {activeAction.error && (
                        <p className="text-xs text-red-600 font-medium mt-2">{activeAction.error}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Structured Room Info */}
              <div className="space-y-4 min-w-0">
                {/* Key Specs Grid */}
                <div className="rumi-specs-grid">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Home size={12} className="text-blue-600" />
                      Property Type
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{propertyLabel}</p>
                  </div>

                  {roomTypeLabel && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <BedDouble size={12} className="text-blue-600" />
                        Room Type
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{roomTypeLabel}</p>
                    </div>
                  )}

                  {furnishingValue && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles size={12} className="text-blue-600" />
                        Furnishing
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{furnishingValue}</p>
                    </div>
                  )}

                  {Number.isFinite(bedAvailability) && bedAvailability > 0 && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500">Beds Available</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{bedAvailability}</p>
                    </div>
                  )}

                  {availableFromFormatted && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} className="text-blue-600" />
                        Available From
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{availableFromFormatted}</p>
                    </div>
                  )}

                  {Number.isFinite(leaseDurationMonths) && leaseDurationMonths > 0 && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500">Lease Duration</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{leaseDurationMonths} months</p>
                    </div>
                  )}

                  {typeof room?.viewsCount === 'number' && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Eye size={12} className="text-blue-600" />
                        Listing Views
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{room.viewsCount}</p>
                    </div>
                  )}

                  {listedDateFormatted && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} className="text-blue-600" />
                        Listed On
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{listedDateFormatted}</p>
                    </div>
                  )}
                </div>

                {/* Location */}
                {fullLocationText && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <MapPin size={15} className="text-blue-600" />
                      Location
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{fullLocationText}</p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1.5">Description</p>
                  {room?.roomDescription ? (
                    <p className="text-sm text-gray-700 leading-relaxed rumi-whitespace-pre-wrap">
                      {room.roomDescription}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No description provided yet.</p>
                  )}
                </div>

                {/* Amenities */}
                {amenityChips.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {amenityChips.map((item) => (
                        <span key={item} className="rumi-chip-blue">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flatmate Preferences */}
                {preferenceItems.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                      <Users size={15} className="text-blue-600" />
                      Flatmate Preferences
                    </p>
                    <div className="rumi-specs-grid">
                      {preferenceItems.map((pref) => (
                        <div key={pref.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-xs text-gray-500">{pref.label}</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{pref.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* House Rules */}
                {rules.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-blue-600" />
                      House Rules
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rules.map((rule, idx) => (
                        <span key={idx} className="rumi-chip-neutral">
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};