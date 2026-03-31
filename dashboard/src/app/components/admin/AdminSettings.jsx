import { Settings as SettingsIcon, Bell, Shield, Globe, Mail, Database, Code, Zap } from 'lucide-react';
import { useState } from 'react';

export function AdminSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoModeration, setAutoModeration] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-3xl font-semibold">System Settings</h2>
        </div>
        <p className="text-gray-500">Configure platform settings and preferences</p>
      </div>

      {/* Platform Configuration */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold">Platform Configuration</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              defaultValue="Rumi"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Support Email
            </label>
            <input
              type="email"
              defaultValue="support@rumi.com"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform URL
            </label>
            <input
              type="text"
              defaultValue="https://rumi.com"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Language
            </label>
            <select className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold">Notification Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Send email alerts for critical events</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-500">Enable push notifications for admins</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Email Alert Recipients</p>
                <p className="text-sm text-blue-800 mb-3">Add admin emails to receive system notifications</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    className="flex-1 px-3 py-2 bg-white rounded-lg border border-blue-200 outline-none text-sm"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Security Settings */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Security Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Require 2FA for all admins</p>
              </div>
              <button
                onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    twoFactorAuth ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Auto Moderation</p>
                <p className="text-sm text-gray-500">AI-powered content moderation</p>
              </div>
              <button
                onClick={() => setAutoModeration(!autoModeration)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  autoModeration ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    autoModeration ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Expiry (days)
              </label>
              <input
                type="number"
                defaultValue="90"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* System Management */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">System Management</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-yellow-900">Maintenance Mode</p>
                  <p className="text-sm text-yellow-700">Disable user access temporarily</p>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    maintenanceMode ? 'bg-yellow-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  ></div>
                </button>
              </div>
              {maintenanceMode && (
                <p className="text-xs text-yellow-800">⚠️ Maintenance mode is currently active</p>
              )}
            </div>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Database Backup</p>
                  <p className="text-sm text-gray-500">Last backup: 2 hours ago</p>
                </div>
              </div>
              <span className="text-blue-600 font-medium">Run Now</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Clear Cache</p>
                  <p className="text-sm text-gray-500">Improve performance</p>
                </div>
              </div>
              <span className="text-green-600 font-medium">Clear</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">View System Logs</p>
                  <p className="text-sm text-gray-500">Access error logs</p>
                </div>
              </div>
              <span className="text-purple-600 font-medium">View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment & Billing */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold">Payment & Billing Settings</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Premium Price ($)
            </label>
            <input
              type="number"
              defaultValue="29.99"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yearly Premium Price ($)
            </label>
            <input
              type="number"
              defaultValue="299.99"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Gateway
            </label>
            <select className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors">
              <option>Stripe</option>
              <option>PayPal</option>
              <option>Square</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors">
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>GBP - British Pound</option>
              <option>INR - Indian Rupee</option>
            </select>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Code className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold">API Configuration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                defaultValue="sk_live_••••••••••••••••••••••••"
                disabled
                className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none text-gray-500"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Regenerate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Rate Limit</p>
              <p className="text-2xl font-bold text-gray-900">1000/hour</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">API Version</p>
              <p className="text-2xl font-bold text-gray-900">v2.1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
          Reset to Default
        </button>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Save All Settings
        </button>
      </div>
    </div>
  );
}
