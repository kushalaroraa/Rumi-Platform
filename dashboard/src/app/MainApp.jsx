import { Bell, Home, Search, Heart, MessageCircle, BarChart3, User, Settings as SettingsIcon, Sparkles, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Messages } from './components/Messages';
import { Preferences } from './components/Preferences';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { DiscoverMatches } from './components/DiscoverMatches';
import { MyMatches } from './components/MyMatches';
import { ActivityStats } from './components/ActivityStats';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'discover', label: 'Discover Matches', icon: Search },
  { key: 'matches', label: 'My Matches', icon: Heart },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'activity', label: 'Activity & Stats', icon: BarChart3 },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function MainApp() {
  const [activeNav, setActiveNav] = useState('dashboard');

  const pageTitleMap = {
    dashboard: 'Dashboard',
    discover: 'Discover Matches',
    matches: 'My Matches',
    messages: 'Messages',
    activity: 'Activity & Stats',
    profile: 'Profile',
    settings: 'Settings',
    preferences: 'Edit Preferences',
  };

  const pageComponents = {
    dashboard: <Dashboard onNavigate={setActiveNav} />,
    discover: <DiscoverMatches />,
    matches: <MyMatches />,
    messages: <Messages />,
    activity: <ActivityStats />,
    profile: <Profile onNavigate={setActiveNav} />,
    settings: <Settings onNavigate={setActiveNav} />,
    preferences: <Preferences />,
  };

  const getPageTitle = () => pageTitleMap[activeNav] || pageTitleMap.dashboard;
  const renderContent = () => pageComponents[activeNav] || pageComponents.dashboard;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-[280px] bg-white flex flex-col p-4 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-semibold">Rumi</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeNav === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ItemIcon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white px-8 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-3xl font-semibold">{getPageTitle()}</h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search matches, locations, preferences"
                className="pl-10 pr-4 py-2 w-[420px] bg-gray-50 rounded-lg border-none outline-none text-gray-600"
              />
            </div>
            <button className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <img
              src="https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMGF2YXRhcnxlbnwxfHx8fDE3NzQ3MzEzMDF8MA&ixlib=rb-4.1.0&q=80&w=400"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          {renderContent()}
        </div>
      </div>

      {/* AI in Action Button */}
      <button className="fixed bottom-8 left-8 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-3">
        <Sparkles className="w-5 h-5" />
        <div className="text-left">
          <div className="font-semibold">AI in action</div>
          <div className="text-xs opacity-90">Find your perfect match! Explore and complete new matches with higher precision.</div>
        </div>
      </button>

      {/* Help Button */}
      <button className="fixed bottom-8 right-8 bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
