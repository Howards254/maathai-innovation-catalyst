import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../contexts/NotificationContext';

const MobileTopBar: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/campaigns?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🌱</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              Green<span className="text-green-600">Verse</span>
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            
            <Link
              to="/app/campaigns/create"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </Link>
            
            <Link
              to="/app/notifications"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <img
                src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
                alt="Profile"
                className="w-7 h-7 rounded-full"
              />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3 animate-fade-in-down">
            <form onSubmit={handleSearch}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns, discussions..."
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* Profile Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMenu(false)}>
          <div className="absolute top-16 right-4 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[200px]">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">{user?.fullName || 'User'}</p>
                  <p className="text-sm text-green-600">{user?.impactPoints || 0} points</p>
                </div>
              </div>
            </div>
            
            <div className="py-2">
              <Link
                to={`/app/profile/${user?.username || 'me'}`}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMenu(false)}
              >
                👤 View Profile
              </Link>
              <Link
                to="/app/settings"
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMenu(false)}
              >
                ⚙️ Settings
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTopBar;