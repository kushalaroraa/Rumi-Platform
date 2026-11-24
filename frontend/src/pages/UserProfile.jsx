import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Save, Sliders, User, Users } from 'lucide-react';
import { getProfile, normalizeImageUrl, updateProfile, uploadProfilePhoto } from '../services/api';
import { BudgetRangeInput } from '../components/common/BudgetRangeInput';
import { BUDGET_MAX, BUDGET_MIN, parseBudgetRange } from '../utils/budget';

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
  preferredGender: 'any',
  ageMin: '18',
  ageMax: '60',
  petsPreference: 'any',
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
      const rp = user?.roommatePreferences || {};
      const lp = user?.lifestylePreferences || {};
      const parsedBudget = parseBudgetRange(user?.budgetRange ?? user?.budget);
      const initBudgetMin = parsedBudget.hasValue
        ? (parsedBudget.min > 0 ? parsedBudget.min : parsedBudget.max)
        : '';
      const initBudgetMax = parsedBudget.hasValue
        ? (parsedBudget.max > 0 ? parsedBudget.max : parsedBudget.min)
        : '';
      setForm({
        name: user?.name || '',
        age: user?.age ?? '',
        gender: user?.gender || '',
        city: user?.city || user?.location?.city || '',
        profession: user?.profession || '',
        intent: user?.intent || '',
        bio: user?.bio || '',
        budgetMin: initBudgetMin,
        budgetMax: initBudgetMax,
        smoking: lp.smoking || 'no',
        petsAllowed: Boolean(lp.petsAllowed),
        sleepSchedule: lp.sleepSchedule || 'flexible',
        foodPreference: lp.foodPreference || 'veg',
        cleanliness: lp.cleanliness || lp.cleanlinessLevel || 'medium',
        preferredGender: rp.preferredGender || 'any',
        ageMin: rp.ageMin != null ? String(rp.ageMin) : '18',
        ageMax: rp.ageMax != null ? String(rp.ageMax) : '60',
        petsPreference: rp.petsPreference || 'any',
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
    setError('');
    setSuccess('');

    const isOfferer = form.intent === 'offer';
    const minB = form.budgetMin === '' ? 0 : Number(form.budgetMin);
    const maxB = form.budgetMax === '' ? 0 : Number(form.budgetMax);
    if (!isOfferer) {
      if (!Number.isFinite(minB) || !Number.isFinite(maxB) || minB < BUDGET_MIN || maxB > BUDGET_MAX || minB > maxB) {
        setError('Budget range must be between ₹5,000 and ₹1,00,000/month, with minimum <= maximum.');
        return;
      }
    }

    const ageMinNum = form.ageMin === '' ? 18 : Number(form.ageMin);
    const ageMaxNum = form.ageMax === '' ? 60 : Number(form.ageMax);
    if (!Number.isFinite(ageMinNum) || !Number.isFinite(ageMaxNum) || ageMinNum < 18 || ageMaxNum > 120 || ageMinNum > ageMaxNum) {
      setError('Preferred roommate age range must be between 18 and 120, with min age <= max age.');
      return;
    }

    setSaving(true);
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
        ...(isOfferer ? {} : {
          budgetRange: {
            min: minB,
            max: maxB,
          },
        }),
        lifestylePreferences: {
          smoking: form.smoking,
          petsAllowed: Boolean(form.petsAllowed),
          sleepSchedule: form.sleepSchedule,
          foodPreference: form.foodPreference,
          cleanliness: form.cleanliness,
        },
        roommatePreferences: {
          preferredGender: form.preferredGender || 'any',
          ageMin: ageMinNum,
          ageMax: ageMaxNum,
          petsPreference: form.petsPreference || 'any',
        },
      };

      const res = await updateProfile(payload);
      const updatedUser = res?.data?.user;
      if (updatedUser) {
        localStorage.setItem('rumi_user', JSON.stringify(updatedUser));
        const nextParsed = parseBudgetRange(updatedUser?.budgetRange ?? updatedUser?.budget);
        if (nextParsed.hasValue) {
          setForm((prev) => ({
            ...prev,
            budgetMin: nextParsed.min > 0 ? nextParsed.min : nextParsed.max,
            budgetMax: nextParsed.max > 0 ? nextParsed.max : nextParsed.min,
          }));
        }
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
        <p className="text-gray-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      {/* Header & Photo Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">My Profile</h2>
            <p className="text-sm text-gray-500">Keep your personal details, budget, and roommate preferences up to date.</p>
          </div>
          <button type="submit" disabled={saving || uploadingPhoto} className="inline-flex items-center gap-2 px-5 py-2.5 rumi-btn-primary text-sm">
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {error ? <div className="mb-4 rumi-banner-error">{error}</div> : null}
        {success ? <div className="mb-4 rumi-banner-success">{success}</div> : null}

        <div className="flex flex-wrap items-center gap-5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-gray-100" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{form.name || 'Rumi Member'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{form.city || 'Add your city below'}</p>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 shadow-sm">
            <Camera size={16} />
            {uploadingPhoto ? 'Uploading…' : 'Change Photo'}
            <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} disabled={uploadingPhoto} />
          </label>
        </div>
      </div>

      {/* Wide Two-Column Sections */}
      <div className="rumi-wide-two-col">
        {/* Left: Personal Info & Budget */}
        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            Personal Details & Budget
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input value={form.name} onChange={(e) => onField('name', e.target.value)} className="rumi-form-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
              <input type="number" min="18" max="120" value={form.age} onChange={(e) => onField('age', e.target.value)} className="rumi-form-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select value={form.gender} onChange={(e) => onField('gender', e.target.value)} className="rumi-form-field">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input value={form.city} onChange={(e) => onField('city', e.target.value)} placeholder="e.g. Delhi" className="rumi-form-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Profession</label>
              <select value={form.profession} onChange={(e) => onField('profession', e.target.value)} className="rumi-form-field">
                <option value="">Select</option>
                <option value="student">Student</option>
                <option value="working">Working</option>
                <option value="WFH">WFH</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Goal</label>
              <select value={form.intent} onChange={(e) => onField('intent', e.target.value)} className="rumi-form-field">
                <option value="">Select</option>
                <option value="find">Find a Room</option>
                <option value="offer">Offer a Room</option>
                <option value="explore">Just Exploring</option>
              </select>
            </div>
            {form.intent !== 'offer' ? (
              <div className="md:col-span-2 pt-2">
                <BudgetRangeInput
                  label="Monthly Budget"
                  minValue={form.budgetMin || 15000}
                  maxValue={form.budgetMax || form.budgetMin || 35000}
                  onChange={({ min, max }) => {
                    setForm((prev) => ({ ...prev, budgetMin: min, budgetMax: max }));
                  }}
                />
              </div>
            ) : (
              <div className="md:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-gray-600">
                Your room&apos;s monthly rent is configured under <span className="font-semibold text-gray-800">Room Profile</span>. Seeker budget preferences are hidden while offering a room.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => onField('bio', e.target.value)} className="rumi-form-field" />
          </div>
        </div>

        {/* Right: My Lifestyle & Roommate Preferences */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sliders size={18} className="text-blue-600" />
              My Lifestyle
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Smoking</label>
                <select value={form.smoking} onChange={(e) => onField('smoking', e.target.value)} className="rumi-form-field">
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                  <option value="social">Social</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sleep Schedule</label>
                <select value={form.sleepSchedule} onChange={(e) => onField('sleepSchedule', e.target.value)} className="rumi-form-field">
                  <option value="early_sleeper">Early Sleeper</option>
                  <option value="night_owl">Night Owl</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Food Preference</label>
                <select value={form.foodPreference} onChange={(e) => onField('foodPreference', e.target.value)} className="rumi-form-field">
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="egg">Egg</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cleanliness</label>
                <select value={form.cleanliness} onChange={(e) => onField('cleanliness', e.target.value)} className="rumi-form-field">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700 pt-1">
              <input type="checkbox" checked={form.petsAllowed} onChange={(e) => onField('petsAllowed', e.target.checked)} className="w-4 h-4 accent-[#081A35]" />
              I have pets / bringing pets
            </label>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Roommate Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Gender</label>
                <select value={form.preferredGender} onChange={(e) => onField('preferredGender', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pets Preference</label>
                <select value={form.petsPreference} onChange={(e) => onField('petsPreference', e.target.value)} className="rumi-form-field">
                  <option value="any">Any</option>
                  <option value="allowed">Pets Allowed</option>
                  <option value="not_allowed">No Pets</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Age</label>
                <input type="number" min={18} max={120} value={form.ageMin} onChange={(e) => onField('ageMin', e.target.value)} className="rumi-form-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Age</label>
                <input type="number" min={18} max={120} value={form.ageMax} onChange={(e) => onField('ageMax', e.target.value)} className="rumi-form-field" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UserProfile;
