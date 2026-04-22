import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { getProfile, normalizeImageUrl, updateProfile, uploadProfilePhoto } from '../services/api';

const emptyForm = {
  name: '',
  age: '',
  gender: '',
  city: '',
  profession: '',
  intent: '',
  bio: '',
  budgetMin: '',
  budgetMax: '',
  smoking: 'no',
  petsAllowed: false,
  sleepSchedule: 'flexible',
  foodPreference: 'veg',
  cleanliness: 'medium',
  photo: '',
};

const UserProfile = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const photoPreview = useMemo(() => normalizeImageUrl(form.photo), [form.photo]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProfile();
      const user = res?.data?.user || {};
      setForm({
        name: user?.name || '',
        age: user?.age ?? '',
        gender: user?.gender || '',
        city: user?.city || '',
        profession: user?.profession || '',
        intent: user?.intent || '',
        bio: user?.bio || '',
        budgetMin: user?.budgetRange?.min ?? '',
        budgetMax: user?.budgetRange?.max ?? '',
        smoking: user?.lifestylePreferences?.smoking || 'no',
        petsAllowed: Boolean(user?.lifestylePreferences?.petsAllowed),
        sleepSchedule: user?.lifestylePreferences?.sleepSchedule || 'flexible',
        foodPreference: user?.lifestylePreferences?.foodPreference || 'veg',
        cleanliness: user?.lifestylePreferences?.cleanliness || 'medium',
        photo: user?.photo || user?.profilePicture || '',
      });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onPhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError('');
    setSuccess('');
    try {
      const res = await uploadProfilePhoto(file);
      const url = res?.data?.url || res?.data?.secure_url;
      if (!url) throw new Error('Upload succeeded but no image URL returned.');
      setForm((prev) => ({ ...prev, photo: url }));
      setSuccess('Profile photo uploaded. Click Save Changes to persist.');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: form.name.trim(),
        age: form.age === '' ? undefined : Number(form.age),
        gender: form.gender,
        city: form.city.trim(),
        profession: form.profession,
        intent: form.intent,
        bio: form.bio,
        photo: form.photo,
        budgetRange: {
          min: form.budgetMin === '' ? 0 : Number(form.budgetMin),
          max: form.budgetMax === '' ? 0 : Number(form.budgetMax),
        },
        lifestylePreferences: {
          smoking: form.smoking,
          petsAllowed: Boolean(form.petsAllowed),
          sleepSchedule: form.sleepSchedule,
          foodPreference: form.foodPreference,
          cleanliness: form.cleanliness,
        },
      };

      const res = await updateProfile(payload);
      const updatedUser = res?.data?.user;
      if (updatedUser) {
        localStorage.setItem('rumi_user', JSON.stringify(updatedUser));
      }
      setSuccess('Profile updated successfully.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">Edit Profile</h2>
      <p className="text-gray-500 mb-6">Change your profile picture and preferences anytime.</p>

      {error ? <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

      <form onSubmit={onSave} className="space-y-6">
        <div className="flex items-center gap-5">
          <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-700">
            <Camera size={16} />
            {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
            <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} disabled={uploadingPhoto} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => onField('name', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
            <input type="number" min="18" max="120" value={form.age} onChange={(e) => onField('age', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <input value={form.city} onChange={(e) => onField('city', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <input value={form.bio} onChange={(e) => onField('bio', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Profession</label>
            <select value={form.profession} onChange={(e) => onField('profession', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
              <option value="">Select</option>
              <option value="student">Student</option>
              <option value="working">Working</option>
              <option value="WFH">WFH</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Intent</label>
            <select value={form.intent} onChange={(e) => onField('intent', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
              <option value="">Select</option>
              <option value="find">Find</option>
              <option value="offer">Offer</option>
              <option value="explore">Explore</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Min</label>
            <input type="number" value={form.budgetMin} onChange={(e) => onField('budgetMin', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Max</label>
            <input type="number" value={form.budgetMax} onChange={(e) => onField('budgetMax', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Lifestyle Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Smoking</label>
              <select value={form.smoking} onChange={(e) => onField('smoking', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="social">Social</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sleep Schedule</label>
              <select value={form.sleepSchedule} onChange={(e) => onField('sleepSchedule', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
                <option value="early_sleeper">Early Sleeper</option>
                <option value="night_owl">Night Owl</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Food Preference</label>
              <select value={form.foodPreference} onChange={(e) => onField('foodPreference', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
                <option value="egg">Egg</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cleanliness</label>
              <select value={form.cleanliness} onChange={(e) => onField('cleanliness', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.petsAllowed} onChange={(e) => onField('petsAllowed', e.target.checked)} className="w-4 h-4" />
              Pets Allowed
            </label>
          </div>
        </div>

        <button type="submit" disabled={saving || uploadingPhoto} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#081A35] text-white text-sm font-semibold hover:bg-[#081A35]/90 disabled:opacity-60">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
