import React, { useEffect, useState } from 'react';
import { Camera, Home, MapPin, Plus, Save, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { getMyRooms, normalizeImageUrl, updateRoom } from '../services/api';
import { RentSliderInput } from '../components/common/RentSliderInput';
import { BUDGET_MAX, BUDGET_MIN } from '../utils/budget';

const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=600&h=360&fit=crop';

function parseRoomToForm(room) {
  const amenitiesList = Array.isArray(room?.amenities) ? room.amenities : [];
  const furnishingToken = amenitiesList.find((a) => String(a).startsWith('furnishing:'));
  const furnishingStatus = furnishingToken
    ? String(furnishingToken).slice('furnishing:'.length)
    : (room?.furnishingStatus || 'furnished');

  const hasAmenity = (key) => {
    if (Array.isArray(room?.amenities)) return amenitiesList.includes(key);
    return Boolean(room?.amenities?.[key]);
  };

  const prefs = room?.flatmatePreferences || {};
  return {
    propertyType: room?.propertyType || 'apartment',
    roomType: room?.roomType || 'private',
    monthlyRent: room?.monthlyRent ?? '',
    status: room?.status || 'active',
    city: room?.location?.city || '',
    area: room?.location?.area || '',
    address: room?.location?.address || '',
    state: room?.location?.state || '',
    pincode: room?.location?.pincode || '',
    furnishingStatus,
    attachedBathroom: hasAmenity('attached_bathroom') || Boolean(room?.attachedBathroom),
    wifi: hasAmenity('wifi'),
    ac: hasAmenity('ac'),
    washingMachine: hasAmenity('washing_machine'),
    kitchenAccess: hasAmenity('kitchen_access'),
    parking: hasAmenity('parking'),
    powerBackup: hasAmenity('power_backup'),
    preferredGender: prefs.preferredGender || 'any',
    ageMin: prefs.ageMin != null ? String(prefs.ageMin) : '18',
    ageMax: prefs.ageMax != null ? String(prefs.ageMax) : '45',
    occupation: prefs.occupation || 'any',
    smokingAllowed: prefs.smokingAllowed || 'any',
    drinkingAllowed: prefs.drinkingAllowed || 'any',
    petsAllowed: prefs.petsAllowed || 'any',
    cleanlinessLevel: prefs.cleanlinessLevel || 'any',
    sleepSchedule: prefs.sleepSchedule || 'any',
    foodPreference: prefs.foodPreference || 'any',
    roomDescription: room?.roomDescription || '',
    rulesText: Array.isArray(room?.rules) ? room.rules.join('\n') : '',
  };
}

const RoomProfile = ({ initialRoomId = null, onRoomsUpdated, onCreateListing }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedId, setSelectedId] = useState(initialRoomId ? String(initialRoomId) : '');
  const [form, setForm] = useState(null);
  const [newPhotos, setNewPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadRooms = async (preferredId = selectedId) => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyRooms();
      const list = res?.data?.rooms || [];
      setRooms(list);
      if (list.length === 0) {
        setSelectedId('');
        setForm(null);
        return;
      }
      const match = list.find((r) => String(r._id) === String(preferredId)) || list[0];
      setSelectedId(String(match._id));
      setForm(parseRoomToForm(match));
      setNewPhotos([]);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load room listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(initialRoomId || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentRoom = rooms.find((r) => String(r._id) === String(selectedId)) || null;

  const handleSelectRoom = (roomId) => {
    setSelectedId(roomId);
    setError('');
    setSuccess('');
    setNewPhotos([]);
    const found = rooms.find((r) => String(r._id) === String(roomId));
    if (found) setForm(parseRoomToForm(found));
  };

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentRoom || !form) return;

    setError('');
    setSuccess('');

    if (!form.city.trim()) {
      setError('City is required.');
      return;
    }
    const rent = Number(form.monthlyRent);
    if (!Number.isFinite(rent) || rent < BUDGET_MIN || rent > BUDGET_MAX) {
      setError('Monthly rent must be between ₹5,000 and ₹1,00,000.');
      return;
    }
    const ageMinNum = Number(form.ageMin || 18);
    const ageMaxNum = Number(form.ageMax || 100);
    if (!Number.isFinite(ageMinNum) || !Number.isFinite(ageMaxNum) || ageMinNum < 18 || ageMaxNum > 120 || ageMinNum > ageMaxNum) {
      setError('Preferred flatmate age range must be between 18 and 120, with min <= max.');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('propertyType', form.propertyType);
      payload.append('roomType', form.roomType);
      payload.append('monthlyRent', String(rent));
      payload.append('status', form.status);
      payload.append('city', form.city.trim());
      payload.append('area', form.area.trim());
      payload.append('address', form.address.trim());
      payload.append('state', form.state.trim());
      payload.append('pincode', form.pincode.trim());
      payload.append('furnishingStatus', form.furnishingStatus);
      payload.append('attachedBathroom', String(form.attachedBathroom));
      payload.append('wifi', String(form.wifi));
      payload.append('ac', String(form.ac));
      payload.append('washingMachine', String(form.washingMachine));
      payload.append('kitchenAccess', String(form.kitchenAccess));
      payload.append('parking', String(form.parking));
      payload.append('powerBackup', String(form.powerBackup));
      payload.append('preferredGender', form.preferredGender);
      payload.append('ageMin', String(ageMinNum));
      payload.append('ageMax', String(ageMaxNum));
      payload.append('occupation', form.occupation);
      payload.append('smokingAllowed', form.smokingAllowed);
      payload.append('drinkingAllowed', form.drinkingAllowed);
      payload.append('petsAllowed', form.petsAllowed);
      payload.append('cleanlinessLevel', form.cleanlinessLevel);
      payload.append('sleepSchedule', form.sleepSchedule);
      payload.append('foodPreference', form.foodPreference);
      payload.append('roomDescription', form.roomDescription.trim());
      payload.append('rules', form.rulesText);
      if (newPhotos.length > 0) {
        newPhotos.slice(0, 10).forEach((file) => payload.append('photos', file));
      }

      const res = await updateRoom(String(currentRoom._id), payload);
      const updated = res?.data?.room;
      if (updated) {
        setRooms((prev) => prev.map((r) => (String(r._id) === String(updated._id) ? updated : r)));
        setForm(parseRoomToForm(updated));
      }
      setNewPhotos([]);
      setSuccess('Room profile saved and persisted.');
      await onRoomsUpdated?.();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update room profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <p className="text-gray-500">Loading room profile…</p>
      </div>
    );
  }

  if (rooms.length === 0 || !form) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
        <div className="rumi-empty-state-icon">
          <Home size={20} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">No Room Listing Yet</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Create your first room listing to manage property details, amenities, and flatmate preferences here.
        </p>
        {onCreateListing && (
          <button type="button" onClick={onCreateListing} className="px-5 py-3 rumi-btn-primary text-sm inline-flex items-center gap-2">
            <Plus size={16} />
            Add New Listing
          </button>
        )}
      </div>
    );
  }

  const coverUrl = normalizeImageUrl(currentRoom?.coverUrl || currentRoom?.photoUrls?.[0] || FALLBACK_ROOM_IMAGE);
  const gallery = Array.isArray(currentRoom?.photoUrls) ? currentRoom.photoUrls : [];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header & Listing Selector */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Room Profile</h2>
            <p className="text-sm text-gray-500">Manage your property details, amenities, house rules, and ideal flatmate preferences.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {rooms.length > 1 && (
              <select
                aria-label="Select room listing"
                value={selectedId}
                onChange={(e) => handleSelectRoom(e.target.value)}
                className="rumi-city-select"
              >
                {rooms.map((r, idx) => (
                  <option key={r._id} value={String(r._id)}>
                    Listing {idx + 1}: {r.propertyType} ({r.location?.area || r.location?.city || 'Room'})
                  </option>
                ))}
              </select>
            )}
            <button type="submit" disabled={saving} className="px-5 py-2.5 rumi-btn-primary text-sm inline-flex items-center gap-2">
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && <div className="mt-4 rumi-banner-error">{error}</div>}
        {success && <div className="mt-4 rumi-banner-success">{success}</div>}
      </div>

      {/* Main Two-Column Grid */}
      <div className="rumi-wide-two-col">
        {/* Left Column: Property, Location & Photos */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Home size={18} className="text-blue-600" />
              Property & Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Property Type</label>
                <select value={form.propertyType} onChange={(e) => setField('propertyType', e.target.value)} className="rumi-form-field">
                  <option value="apartment">Apartment</option>
                  <option value="pg">PG</option>
                  <option value="independent_house">Independent House</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Type</label>
                <select value={form.roomType} onChange={(e) => setField('roomType', e.target.value)} className="rumi-form-field">
                  <option value="private">Private</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <RentSliderInput
                  label="Monthly Rent"
                  value={form.monthlyRent}
                  onChange={(val) => setField('monthlyRent', val)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Listing Status</label>
                <select value={form.status} onChange={(e) => setField('status', e.target.value)} className="rumi-form-field">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" />
              Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="e.g. Delhi" className="rumi-form-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Area / Locality</label>
                <input value={form.area} onChange={(e) => setField('area', e.target.value)} placeholder="e.g. Hauz Khas" className="rumi-form-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input value={form.state} onChange={(e) => setField('state', e.target.value)} placeholder="e.g. Delhi" className="rumi-form-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
                <input value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} placeholder="e.g. 110016" className="rumi-form-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address / Landmark</label>
                <input value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="Building / street / landmark" className="rumi-form-field" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Camera size={18} className="text-blue-600" />
              Photos & Media
            </h3>

            <div className="rounded-2xl overflow-hidden bg-slate-100 border border-gray-100" style={{ height: '200px' }}>
              <img
                src={coverUrl}
                alt="Room cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_ROOM_IMAGE) {
                    e.currentTarget.src = FALLBACK_ROOM_IMAGE;
                  }
                }}
              />
            </div>

            {gallery.length > 1 && (
              <div className="rumi-room-modal-thumbs">
                {gallery.map((url, idx) => (
                  <div key={`${url}-${idx}`} className="rumi-room-modal-thumb">
                    <img src={normalizeImageUrl(url)} alt={`Room ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Replace Room Photos (optional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewPhotos(Array.from(e.target.files || []).slice(0, 10))}
                className="block w-full text-sm text-gray-700"
              />
              {newPhotos.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">{newPhotos.length} new photo(s) ready to upload on save.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Amenities, Flatmate Preferences, Description & Rules */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              Furnishing & Amenities
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Furnishing Status</label>
              <select value={form.furnishingStatus} onChange={(e) => setField('furnishingStatus', e.target.value)} className="rumi-form-field">
                <option value="furnished">Furnished</option>
                <option value="semi_furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                ['attachedBathroom', 'Attached Bathroom'],
                ['wifi', 'Wi-Fi'],
                ['ac', 'Air Conditioning'],
                ['washingMachine', 'Washing Machine'],
                ['kitchenAccess', 'Kitchen Access'],
                ['parking', 'Parking'],
                ['powerBackup', 'Power Backup'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key])}
                    onChange={(e) => setField(key, e.target.checked)}
                    className="w-4 h-4 accent-[#081A35]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Ideal Flatmate Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Gender</label>
                <select value={form.preferredGender} onChange={(e) => setField('preferredGender', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Occupation</label>
                <select value={form.occupation} onChange={(e) => setField('occupation', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="student">Student</option>
                  <option value="working">Working</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age Min</label>
                <input type="number" min={18} max={120} value={form.ageMin} onChange={(e) => setField('ageMin', e.target.value)} className="rumi-form-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age Max</label>
                <input type="number" min={18} max={120} value={form.ageMax} onChange={(e) => setField('ageMax', e.target.value)} className="rumi-form-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Smoking</label>
                <select value={form.smokingAllowed} onChange={(e) => setField('smokingAllowed', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="allowed">Allowed</option>
                  <option value="not_allowed">Not Allowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Drinking</label>
                <select value={form.drinkingAllowed} onChange={(e) => setField('drinkingAllowed', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="allowed">Allowed</option>
                  <option value="not_allowed">Not Allowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pets</label>
                <select value={form.petsAllowed} onChange={(e) => setField('petsAllowed', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="allowed">Allowed</option>
                  <option value="not_allowed">Not Allowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Food Preference</label>
                <select value={form.foodPreference} onChange={(e) => setField('foodPreference', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sleep Schedule</label>
                <select value={form.sleepSchedule} onChange={(e) => setField('sleepSchedule', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="early_sleeper">Early Sleeper</option>
                  <option value="night_owl">Night Owl</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cleanliness</label>
                <select value={form.cleanlinessLevel} onChange={(e) => setField('cleanlinessLevel', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" />
              Description & House Rules
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Description</label>
              <textarea rows={4} value={form.roomDescription} onChange={(e) => setField('roomDescription', e.target.value)} placeholder="Describe the space, neighborhood, and ideal flatmate fit…" className="rumi-form-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">House Rules (one per line)</label>
              <textarea rows={3} value={form.rulesText} onChange={(e) => setField('rulesText', e.target.value)} placeholder="e.g. No loud music after 11 PM&#10;Guests allowed with prior notice" className="rumi-form-field" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RoomProfile;
