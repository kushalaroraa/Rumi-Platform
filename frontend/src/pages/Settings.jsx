import React, { useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Mail,
  Lock,
  MessageCircle,
  RefreshCcw,
  Shield,
  Smartphone,
  Sparkles,
  Trash2,
  User,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { changePassword } from '../services/api';
import { useSettingsManager } from '../hooks/useSettingsManager';
import { toast } from 'sonner';

function Toggle({ checked, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={checked}
      onClick={onClick}
      className={`relative h-8 w-14 rounded-full border shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-slate-300 hover:border-slate-400'
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  );
}

function Card({ icon: Icon, title, description, onClick, accent = 'blue', children }) {
  const CardIcon = Icon;
  const accentClass =
    accent === 'purple'
      ? 'bg-violet-100 text-violet-600'
      : accent === 'green'
        ? 'bg-emerald-100 text-emerald-600'
        : accent === 'yellow'
          ? 'bg-amber-100 text-amber-600'
          : 'bg-blue-100 text-blue-600';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClass}`}>
          <CardIcon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-950">{title}</div>
          <div className="text-xs text-slate-500">{description}</div>
        </div>
        <ChevronRight size={18} className="text-slate-400 transition group-hover:translate-x-0.5" />
      </div>
      {children}
    </button>
  );
}

export default function Settings({ onNavigate, onLogout }) {
  const {
    user,
    settings,
    loading,
    saving,
    deleting,
    message,
    error,
    updateSectionValue,
    saveSettings,
    resetSettings,
    handleDeleteAccount,
    setMessage,
    setError
  } = useSettingsManager(onLogout);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [resource, setResource] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const isGoogleAccount = Boolean(user?.authProvider === 'google' && user?.googleId);

  const stats = useMemo(() => {
    const notificationsOn = Object.values(settings.notificationSettings || {}).filter(Boolean).length;
    const privacyOn = Object.values(settings.privacySettings || {}).filter(Boolean).length;
    return [
      { label: 'Notifications on', value: notificationsOn },
      { label: 'Privacy toggles on', value: privacyOn },
      { label: 'Account status', value: settings.securitySettings?.billingStatus || 'Free' }
    ];
  }, [settings]);

  const savePassword = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.trim().length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (!isGoogleAccount && !passwordForm.currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    try {
      setPasswordSaving(true);
      setError('');
      await changePassword({
        currentPassword: isGoogleAccount ? passwordForm.currentPassword || null : passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordOpen(false);
      setMessage('Password updated successfully.');
      toast.success('Password updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update password.');
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const openResource = (type) => {
    if (type === 'help') {
      setResource({
        title: 'Help Center',
        body: 'Need help with matching, profile setup, or account issues? Reach the support team at support@rumi.app.'
      });
      return;
    }
    if (type === 'privacy') {
      setResource({
        title: 'Privacy Policy',
        body: 'Your profile settings are stored on the backend and can be updated from this page at any time.'
      });
      return;
    }
    if (type === 'terms') {
      setResource({
        title: 'Terms of Service',
        body: 'Use the platform respectfully, keep your profile accurate, and follow community guidelines.'
      });
      return;
    }
    if (type === 'contact') {
      window.location.href = 'mailto:support@rumi.app?subject=Rumi%20Support';
    }
  };

  const handleDelete = async () => {
    try {
      await handleDeleteAccount();
      toast.success('Account deleted successfully');
      setConfirmDelete(false);
      if (!onLogout) {
        window.location.replace('/');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Unable to delete account.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[28px] bg-slate-50">
        <div className="text-sm text-slate-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-[28px] bg-slate-50 p-4 md:p-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
              <Sparkles size={14} />
              Settings
            </div>
            <h1 className="text-3xl font-semibold text-slate-950">Manage your account and privacy</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Keep notifications, privacy, security, and account actions in one place. Every change is saved to the backend.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map(stat => (
                <div key={stat.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{stat.label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">{String(stat.value)}</div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onLogout?.()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-2">
          <User size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-950">Quick Links</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigate?.('messages')}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <MessageCircle size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-950">View Messages</div>
                <div className="text-xs text-slate-500">Go back to your inbox</div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('profile')}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <User size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-950">Edit Profile</div>
                <div className="text-xs text-slate-500">Update your profile details</div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('dashboard')}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Shield size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-950">Back to Dashboard</div>
                <div className="text-xs text-slate-500">Return to match discovery</div>
              </div>
            </div>
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-950">Notifications</h2>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ['newMatches', 'New Matches', 'Get notified about new matches'],
              ['messages', 'Messages', 'Get notified about new messages'],
              ['matchRequests', 'Match Requests', 'Get notified about match requests'],
              ['emailNotifications', 'Email Notifications', 'Receive notifications via email'],
              ['pushNotifications', 'Push Notifications', 'Receive push notifications']
            ].map(([key, label, description]) => (
              <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-950">{label}</div>
                    <div className="text-xs text-slate-500">{description}</div>
                  </div>
                  <Toggle
                    checked={Boolean(settings.notificationSettings[key])}
                    ariaLabel={label}
                    onClick={() =>
                      updateSectionValue('notificationSettings', key, !settings.notificationSettings[key])
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-950">Privacy & Security</h2>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ['showOnlineStatus', 'Show Online Status', "Let others see when you're active"],
              ['showLocation', 'Show Location', 'Display your location to matches'],
              ['showLastSeen', 'Show Last Seen', 'Let others see when you were last active']
            ].map(([key, label, description]) => (
              <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-950">{label}</div>
                    <div className="text-xs text-slate-500">{description}</div>
                  </div>
                  <Toggle
                    checked={Boolean(settings.privacySettings[key])}
                    ariaLabel={label}
                    onClick={() =>
                      updateSectionValue('privacySettings', key, !settings.privacySettings[key])
                    }
                  />
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-slate-50/70 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-950">Profile Visibility</div>
              <div className="grid gap-2">
                {[
                  ['public', 'Public', 'Visible to everyone'],
                  ['matches', 'Matches Only', 'Only visible to your matches']
                ].map(([value, label, description]) => {
                  const active = settings.privacySettings.profileVisibility === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateSectionValue('privacySettings', 'profileVisibility', value)}
                      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-950 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{label}</span>
                        <span className={`block text-xs ${active ? 'text-blue-100' : 'text-slate-500'}`}>{description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-950">Account Management</h2>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Lock size={20} />
              </div>
              <div>
                <div className="text-base font-semibold text-slate-950">Password & Security</div>
                <div className="text-sm text-slate-500">Update your password and review security controls.</div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setPasswordOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Lock size={16} />
                Update Password
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSectionValue('securitySettings', 'twoFactorEnabled', !settings.securitySettings.twoFactorEnabled)
                }
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  settings.securitySettings.twoFactorEnabled
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone size={16} />
                {settings.securitySettings.twoFactorEnabled ? '2FA Enabled' : 'Enable 2FA'}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="text-base font-semibold text-slate-950">Billing</div>
                <div className="text-sm text-slate-500">Your plan is currently Free.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setResource({ title: 'Billing', body: 'Your plan is currently Free. Billing controls can be expanded later from here.' })}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              View Billing
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-950">Support & Resources</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Card icon={HelpCircle} title="Help Center" description="FAQs and support" accent="blue" onClick={() => openResource('help')} />
          <Card icon={Shield} title="Privacy Policy" description="How your data is used" accent="green" onClick={() => openResource('privacy')} />
          <Card icon={BookOpen} title="Terms of Service" description="Platform rules" accent="purple" onClick={() => openResource('terms')} />
          <Card icon={Mail} title="Contact Us" description="Reach the support team" accent="yellow" onClick={() => openResource('contact')} />
        </div>
      </section>

      <section className="rounded-[28px] border border-red-200 bg-red-50/70 p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={18} />
          <h2 className="text-lg font-semibold">Danger Zone</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setResource({ title: 'Deactivate Account', body: 'Temporary deactivation is not available yet. If you want a break, contact support and we will help you next.' })}
            className="flex items-center justify-between rounded-2xl border border-red-200 bg-white px-5 py-4 text-left text-red-700 shadow-sm transition hover:bg-red-50 hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <span>
              <span className="block text-sm font-semibold">Deactivate Account</span>
              <span className="block text-xs text-red-500">Temporarily disable your account</span>
            </span>
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            className="flex items-center justify-between rounded-2xl border border-red-600 bg-red-600 px-5 py-4 text-left text-white shadow-sm transition hover:bg-red-700 hover:border-red-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <span>
              <span className="block text-sm font-semibold">Delete Account</span>
              <span className="block text-xs text-red-100">Permanently delete your account</span>
            </span>
            <Trash2 size={18} />
          </button>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <RefreshCcw size={16} />
            Reset to Default
          </button>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <CheckCircle2 size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {passwordOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-950">Change Password</h3>
              <button
                type="button"
                onClick={() => setPasswordOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Close
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ['currentPassword', isGoogleAccount ? 'Current password (optional)' : 'Current password'],
                ['newPassword', 'New password'],
                ['confirmPassword', 'Confirm password']
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
                  <div className="relative">
                    <input
                      type={passwordVisible[key] ? 'text' : 'password'}
                      value={passwordForm[key]}
                      disabled={isGoogleAccount && key === 'currentPassword'}
                      onChange={e => setPasswordForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={isGoogleAccount && key === 'currentPassword' ? 'Optional for Google accounts' : ''}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(prev => ({ ...prev, [key]: !prev[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      {passwordVisible[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPasswordOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePassword}
                disabled={passwordSaving}
                className="rounded-xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resource && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-950">{resource.title}</h3>
              <button
                type="button"
                onClick={() => setResource(null)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{resource.body}</p>
            <div className="mt-6 flex justify-end">
              
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Delete your account?</h3>
                <p className="mt-1 text-sm font-medium text-red-600">Are you sure you want to delete your account?</p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl border border-red-600 bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
