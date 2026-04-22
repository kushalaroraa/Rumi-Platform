import { useState, useEffect } from 'react';
import { getProfile, updateProfile, deleteAccount } from '../services/api';

const DEFAULT_SETTINGS = {
  notificationSettings: {
    newMatches: true,
    messages: true,
    matchRequests: true,
    emailNotifications: false,
    pushNotifications: true
  },
  privacySettings: {
    showOnlineStatus: true,
    showLocation: true,
    showLastSeen: false,
    profileVisibility: 'public'
  },
  securitySettings: {
    twoFactorEnabled: false,
    billingStatus: 'Free'
  }
};

function mergeSettings(user) {
  return {
    notificationSettings: { ...DEFAULT_SETTINGS.notificationSettings, ...(user?.notificationSettings || {}) },
    privacySettings: { ...DEFAULT_SETTINGS.privacySettings, ...(user?.privacySettings || {}) },
    securitySettings: { ...DEFAULT_SETTINGS.securitySettings, ...(user?.securitySettings || {}) }
  };
}

export function useSettingsManager(onLogout) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [initialSettings, setInitialSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        const profile = res?.data?.user || null;
        setUser(profile);
        const merged = mergeSettings(profile);
        setSettings(merged);
        setInitialSettings(merged);
      } catch {
        // Just fail silently for UI if backend returns error
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const updateSectionValue = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const payload = {
        notificationSettings: settings.notificationSettings,
        privacySettings: settings.privacySettings,
        securitySettings: settings.securitySettings
      };
      const res = await updateProfile(payload);
      if (res?.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('rumi_user', JSON.stringify(res.data.user));
        const merged = mergeSettings(res.data.user);
        setSettings(merged);
        setInitialSettings(merged);
      }
      setMessage('Settings saved successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(initialSettings);
    setMessage('Settings restored to saved versions.');
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      localStorage.removeItem('rumi_token');
      localStorage.removeItem('rumi_user');
      setUser(null);
      setSettings(DEFAULT_SETTINGS);
      setInitialSettings(DEFAULT_SETTINGS);
      setMessage('');
      setError('');
      if (onLogout) onLogout();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to delete account.');
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  return {
    settings,
    user,
    loading,
    saving,
    message,
    error,
    updateSectionValue,
    saveSettings,
    resetSettings,
    handleDeleteAccount,
    deleting,
    setMessage,
    setError
  };
}
