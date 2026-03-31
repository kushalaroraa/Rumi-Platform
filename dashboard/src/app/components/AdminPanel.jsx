import { LayoutDashboard, Users, Flag, BarChart3, Settings as SettingsIcon, Shield, MessageSquare, DollarSign, Bell, Search, LogOut, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { AdminDashboard } from './admin/AdminDashboard';
import { UserManagement } from './admin/UserManagement';
import { ReportsModeration } from './admin/ReportsModeration';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { AdminSettings } from './admin/AdminSettings';
import { PaymentManagement } from './admin/PaymentManagement';

export function AdminPanel() {
  const [activeNav, setActiveNav] = useState('dashboard');

  const getPageTitle = () => {
    switch (activeNav) {
      case 'dashboard':
        return 'Admin Dashboard';
      case 'users':
        return 'User Management';
      case 'reports':
        return 'Reports & Moderation';
      case 'analytics':
        return 'Analytics & Insights';
      case 'payments':
        return 'Payment Management';
      case 'settings':
        return 'System Settings';
      default:
        return 'Admin Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <ReportsModeration />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'payments':
        return <PaymentManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-[280px] bg-gray-900 flex flex-col p-4 shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-semibold text-white">Rumi Admin</span>
            <p className="text-xs text-gray-400">Control Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeNav === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveNav('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeNav === 'users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </button>
          <button
            onClick={() => setActiveNav('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeNav === 'reports'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Flag className="w-5 h-5" />
            <span>Reports & Moderation</span>
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">8</span>
          </button>
          <button
            onClick={() => setActiveNav('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeNav === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveNav('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeNav === 'payments'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Payments</span>
          </button>
          <button
            onClick={() => setActiveNav('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeNav === 'settings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Admin Profile */}
        <div className="pt-4 border-t border-gray-800">
          <a
            href="/"
            className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer mb-3 text-white"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Back to User App</span>
          </a>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMGF2YXRhcnxlbnwxfHx8fDE3NzQ3MzEzMDF8MA&ixlib=rb-4.1.0&q=80&w=400"
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">admin@rumi.com</p>
            </div>
            <LogOut className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-semibold">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, reports, analytics..."
                className="pl-10 pr-4 py-2 w-[420px] bg-gray-50 rounded-lg border-none outline-none text-gray-600"
              />
            </div>
            <button className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <img
              src="https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMGF2YXRhcnxlbnwxfHx8fDE3NzQ3MzEzMDF8MA&ixlib=rb-4.1.0&q=80&w=400"
              alt="Admin Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
