import React from 'react';
import { LogOut, Home, Sparkles } from 'lucide-react';

export const Sidebar = ({
  items = [],
  activeNav,
  onNavChange,
  onLogout,
  aiCard = {
    title: 'AI in action',
    desc: 'Find your perfect match! Explore and complete new matches with higher precision.',
    icon: Sparkles
  }
}) => {
  const AICardIcon = aiCard.icon || Sparkles;

  return (
    <aside className="w-64 bg-white shadow-sm flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Home size={18} className="text-white" />
        </div>
        <span className="text-xl font-semibold text-gray-900">Rumi</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.customIcon ? (
                item.customIcon(isActive)
              ) : (
                Icon && <Icon size={20} />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Card */}
      <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white">
        <div className="flex items-center gap-2 mb-2">
          <AICardIcon size={16} />
          <span className="text-sm font-semibold">{aiCard.title}</span>
        </div>
        <p className="text-xs leading-relaxed opacity-90">
          {aiCard.desc}
        </p>
      </div>

      {/* Logout */}
      <button 
        onClick={onLogout} 
        className="mx-4 mb-6 flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
};
