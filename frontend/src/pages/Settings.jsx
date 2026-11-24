import React, { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { changePassword, getProfile } from '../services/api';

const Settings = ({ userEmail = '' }) => {
  const [account, setAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    const loadAccount = async () => {
      setAccountLoading(true);
      try {
        const res = await getProfile();
        if (active && res?.data?.user) {
          setAccount(res.data.user);
        }
      } catch {
        // Fallback to userEmail prop when profile fetch is unavailable
      } finally {
        if (active) setAccountLoading(false);
      }
    };
    loadAccount();
    return () => {
      active = false;
    };
  }, []);

  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[A-Za-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const matchesConfirm = Boolean(newPassword) && newPassword === confirmPassword;
  const differsFromCurrent = Boolean(newPassword) && newPassword !== currentPassword;

  const validateForm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'Please fill in your current password, new password, and confirmation.';
    }
    if (!hasMinLength || !hasLetter || !hasNumber) {
      return 'New password must be at least 8 characters and include at least one letter and one number.';
    }
    if (!matchesConfirm) {
      return 'New password and confirmation do not match.';
    }
    if (!differsFromCurrent) {
      return 'New password must be different from your current password.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess(res?.data?.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  const displayEmail = account?.email || userEmail || 'Signed-in account';
  const displayName = account?.name || 'Rumi Member';
  const displayCity = account?.city || account?.location?.city || '';

  return (
    <div className="rumi-wide-two-col items-start">
      {/* Account Summary Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Account Settings</h2>
            <p className="text-sm text-gray-500">Manage your account information and password security.</p>
          </div>
          <span className="rumi-status-pill rumi-status-pill--connected">
            <ShieldCheck size={13} />
            Active Session
          </span>
        </div>

        <div className="mt-6 rumi-specs-grid">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <User size={13} className="text-blue-600" />
              Account Holder
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {accountLoading ? 'Loading…' : displayName}
            </p>
            {displayCity && (
              <p className="text-xs text-gray-500 mt-0.5">{displayCity}</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500">Email Address</p>
            <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
              {accountLoading ? 'Loading…' : displayEmail}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Used for sign-in & notifications</p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            <p className="text-xs text-gray-500">Verify your current password before choosing a new one.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-2xl" noValidate>
          {error && <div className="rumi-banner-error">{error}</div>}
          {success && <div className="rumi-banner-success">{success}</div>}

          <div>
            <label htmlFor="rumi-current-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Current Password
            </label>
            <div className="rumi-settings-input-wrap">
              <input
                id="rumi-current-password"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="rumi-settings-input"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                className="rumi-eye-btn"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rumi-new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="rumi-settings-input-wrap">
                <input
                  id="rumi-new-password"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="rumi-settings-input"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  aria-label={showNew ? 'Hide new password' : 'Show new password'}
                  className="rumi-eye-btn"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="rumi-confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="rumi-settings-input-wrap">
                <input
                  id="rumi-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="rumi-settings-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
                  className="rumi-eye-btn"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-gray-700 mb-2">Password requirements</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                <Check size={13} />
                At least 8 characters
              </div>
              <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                <Check size={13} />
                Contains a letter (A–Z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                <Check size={13} />
                Contains a number (0–9)
              </div>
              <div className={`flex items-center gap-1.5 ${matchesConfirm ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                <Check size={13} />
                Matches confirmation
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rumi-btn-primary text-sm"
            >
              {saving ? 'Updating Password…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
