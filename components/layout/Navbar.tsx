import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useDiscussions } from '../../contexts/DiscussionContext';
import { useUsers, useUser } from '../../contexts/UserContext';

const Navbar: React.FC = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { campaigns } = useCampaigns();
  const { discussions } = useDiscussions();
  const { users } = useUsers();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const searchResults = searchQuery.length > 2 ? {
    campaigns: campaigns.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    discussions: discussions.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    users: users.filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || u.username.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
  } : { campaigns: [], discussions: [], users: [] };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/campaigns?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-[1800px]">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link to="/app/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              🌱
            </div>
            <span className="hidden sm:block text-xl font-bold text-gray-900 tracking-tight">
              Maathai<span className="text-primary-600">Catalyst</span>
            </span>
          </Link>
        </div>

        {/* Center: Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-2xl px-4">
          <div className="relative w-full">
            <form onSubmit={handleSearch}>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 2);
                }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-200 rounded-full bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-white hover:border-gray-300 transition-all duration-200 focus:w-full focus:max-w-3xl"
                placeholder="Search campaigns, discussions, people..."
              />
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && (searchResults.campaigns.length > 0 || searchResults.discussions.length > 0 || searchResults.users.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchResults.campaigns.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Campaigns</div>
                    {searchResults.campaigns.map(campaign => (
                      <Link
                        key={campaign.id}
                        to={`/app/campaigns/${campaign.id}`}
                        className="block px-2 py-2 hover:bg-gray-50 rounded text-sm"
                        onClick={() => setShowSearchResults(false)}
                      >
                        <div className="font-medium">{campaign.title}</div>
                        <div className="text-gray-500 text-xs">{campaign.location}</div>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.discussions.length > 0 && (
                  <div className="p-2 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">Discussions</div>
                    {searchResults.discussions.map(discussion => (
                      <Link
                        key={discussion.id}
                        to={`/app/discussions`}
                        className="block px-2 py-2 hover:bg-gray-50 rounded text-sm"
                        onClick={() => setShowSearchResults(false)}
                      >
                        <div className="font-medium">{discussion.title}</div>
                        <div className="text-gray-500 text-xs">{discussion.category}</div>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.users.length > 0 && (
                  <div className="p-2 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 py-1">People</div>
                    {searchResults.users.map(user => (
                      <Link
                        key={user.id}
                        to={`/app/profile/${user.username}`}
                        className="block px-2 py-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2"
                        onClick={() => setShowSearchResults(false)}
                      >
                        <img src={user.avatarUrl} alt={user.username} className="w-6 h-6 rounded-full" />
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-gray-500 text-xs">@{user.username}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center justify-end gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Actions */}
          <Link to="/app/campaigns/create" className="hidden md:flex items-center justify-center w-9 h-9 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </Link>

          {/* User Dropdown Trigger - Desktop */}
          <div className="hidden md:block relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 pr-3 border border-transparent rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-all"
            >
              <img src={user?.avatarUrl || 'https://picsum.photos/200'} alt="User" className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-100" />
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-700">{user?.fullName && typeof user.fullName === 'string' ? user.fullName.split(' ')[0] : 'User'}</span>
                <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {user?.impactPoints?.toLocaleString() || '0'} pts
                </span>
              </div>
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <Link 
                  to={`/app/profile/${user?.username || 'me'}`} 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  👤 View Profile
                </Link>
                <Link 
                  to={`/app/profile/${user?.username || 'me'}/edit`} 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  ✏️ Edit Profile
                </Link>
                <div className="border-t border-gray-100"></div>
                <button 
                  onClick={() => {
                    signOut();
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition-colors"
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <form onSubmit={handleSearch}>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-200 rounded-xl bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search campaigns, discussions..."
                />
              </form>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <img src={user?.avatarUrl || 'https://picsum.photos/200'} alt="User" className="w-12 h-12 rounded-full ring-2 ring-primary-100" />
              <div>
                <p className="font-semibold text-gray-900">{user?.fullName || 'User'}</p>
                <p className="text-sm text-primary-600 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {user?.impactPoints?.toLocaleString() || '0'} points
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <Link to="/app/dashboard" className="block px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>🏠 Dashboard</Link>
              <Link to="/app/campaigns" className="block px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>🌳 Campaigns</Link>
              <Link to="/app/events" className="block px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>📅 Events</Link>
              <Link to="/app/innovation" className="block px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>💡 Innovation Hub</Link>
              <Link to="/app/discussions" className="block px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>💬 Discussions</Link>
              <Link to="/app/leaderboard" className="block px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(false)}>🏆 Leaderboard</Link>
            </div>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Link
                to={`/app/profile/${user?.username || 'me'}`}
                className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                👤 View Profile
              </Link>
              <Link
                to="/app/campaigns/create"
                className="block w-full text-center bg-gradient-to-r from-primary-600 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Campaign
              </Link>
              <button
                onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                className="block w-full text-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;