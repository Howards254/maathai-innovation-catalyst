import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Users, Plus } from 'lucide-react';
import { useCampaigns } from '../../contexts/CampaignContext';

const MobileCampaigns: React.FC = () => {
  const { campaigns, loading } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filters = [
    { id: 'all', label: 'All Campaigns', count: campaigns.length },
    { id: 'active', label: 'Active', count: campaigns.filter(c => c.daysLeft > 0).length },
    { id: 'nearby', label: 'Nearby', count: campaigns.filter(c => c.location.includes('Nairobi')).length },
    { id: 'trending', label: 'Trending', count: campaigns.filter(c => c.plantedTrees > 1000).length }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedFilter) {
      case 'active':
        return matchesSearch && campaign.daysLeft > 0;
      case 'nearby':
        return matchesSearch && campaign.location.includes('Nairobi');
      case 'trending':
        return matchesSearch && campaign.plantedTrees > 1000;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-14 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Campaigns</h1>
          <Link
            to="/app/campaigns/create"
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-full text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Link
              to="/app/campaigns/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {filteredCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/app/campaigns/${campaign.id}`}
                className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 transition-colors"
              >
                <div className="relative">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-xs font-medium text-gray-700">
                      {campaign.daysLeft}d left
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg mb-1">{campaign.title}</h3>
                    <p className="text-white/90 text-sm">by {campaign.organizer}</p>
                  </div>
                </div>

                <div className="p-4">
                  {/* Location & Date */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {campaign.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {Math.round((campaign.plantedTrees / campaign.targetTrees) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((campaign.plantedTrees / campaign.targetTrees) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-green-600">
                        🌳 {campaign.plantedTrees.toLocaleString()} planted
                      </span>
                      <span className="text-sm text-gray-600">
                        👥 {campaign.participants?.length || 0} joined
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Target</p>
                      <p className="text-sm font-medium text-gray-900">
                        {campaign.targetTrees.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCampaigns;