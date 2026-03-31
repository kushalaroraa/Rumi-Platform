import { Settings as SettingsIcon, Bell, Lock, Eye, Globe, CreditCard, HelpCircle, LogOut, Shield, Smartphone } from 'lucide-react';
import { useState } from 'react';

export function Settings({ onNavigate }) {
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    matchRequests: true,
    email: false,
    push: true,
  });

  const [privacy, setPrivacy] = useState({
    showOnline: true,
    showLocation: true,
    showLastSeen: false,
    profileVisibility: 'public',
  });

  // Function to switch to admin mode - will be passed from parent
  const switchToAdminMode = () => {
    window.location.href = '/?admin=true';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-3xl font-semibold">Settings</h2>
        </div>
        <p className="text-gray-500">Manage your account preferences and settings</p>
      </div>

      {/* Admin Access Card - Only visible for admins */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-1">Admin Panel Access</h3>
              <p className="text-gray-300">Access advanced platform management features</p>
            </div>
          </div>
          <a
            href="/admin"
            className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Open Admin Panel
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">New Matches</p>
                <p className="text-sm text-gray-500">Get notified about new matches</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, newMatches: !notifications.newMatches })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifications.newMatches ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    notifications.newMatches ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Messages</p>
                <p className="text-sm text-gray-500">Get notified about new messages</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, messages: !notifications.messages })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifications.messages ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    notifications.messages ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Match Requests</p>
                <p className="text-sm text-gray-500">Get notified about match requests</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, matchRequests: !notifications.matchRequests })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifications.matchRequests ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    notifications.matchRequests ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifications.push ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Privacy & Security</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Show Online Status</p>
                <p className="text-sm text-gray-500">Let others see when you're active</p>
              </div>
              <button
                onClick={() => setPrivacy({ ...privacy, showOnline: !privacy.showOnline })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  privacy.showOnline ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    privacy.showOnline ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Show Location</p>
                <p className="text-sm text-gray-500">Display your location to matches</p>
              </div>
              <button
                onClick={() => setPrivacy({ ...privacy, showLocation: !privacy.showLocation })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  privacy.showLocation ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    privacy.showLocation ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Show Last Seen</p>
                <p className="text-sm text-gray-500">Let others see when you were last active</p>
              </div>
              <button
                onClick={() => setPrivacy({ ...privacy, showLastSeen: !privacy.showLastSeen })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  privacy.showLastSeen ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    privacy.showLastSeen ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium mb-3">Profile Visibility</p>
              <div className="space-y-2">
                <button
                  onClick={() => setPrivacy({ ...privacy, profileVisibility: 'public' })}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    privacy.profileVisibility === 'public'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">Public</span>
                  </div>
                  <p className="text-sm mt-1 opacity-90">Visible to everyone</p>
                </button>
                <button
                  onClick={() => setPrivacy({ ...privacy, profileVisibility: 'matches' })}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    privacy.profileVisibility === 'matches'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">Matches Only</span>
                  </div>
                  <p className="text-sm mt-1 opacity-90">Only visible to your matches</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold">Account Management</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-gray-500">Update your password</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Two-Factor Auth</p>
              <p className="text-sm text-gray-500">Enable 2FA security</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Billing</p>
              <p className="text-sm text-gray-500">Manage subscriptions</p>
            </div>
          </button>
        </div>
      </div>

      {/* Support & Resources */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold">Support & Resources</h3>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-medium text-center">Help Center</span>
          </button>

          <button className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <span className="font-medium text-center">Privacy Policy</span>
          </button>

          <button className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-medium text-center">Terms of Service</span>
          </button>

          <button className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="font-medium text-center">Contact Us</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-red-100">
        <div className="flex items-center gap-2 mb-6">
          <LogOut className="w-5 h-5 text-red-600" />
          <h3 className="text-xl font-semibold text-red-600">Danger Zone</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (window.confirm('Do you really want to deactivate your account?')) {
                alert('Your account has been deactivated (simulation)');
              }
            }}
            className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            <div>
              <p className="font-medium text-red-900">Deactivate Account</p>
              <p className="text-sm text-red-700">Temporarily disable your account</p>
            </div>
            <LogOut className="w-5 h-5 text-red-600" />
          </button>

          <button
            onClick={() => {
              if (window.confirm('Do you really want to delete your account? This cannot be undone.')) {
                alert('Account deleted (simulation)');
                onNavigate('dashboard');
              }
            }}
            className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account</p>
            </div>
            <LogOut className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
          Reset to Default
        </button>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
