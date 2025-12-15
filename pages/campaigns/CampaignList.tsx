import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useAuth } from '../../contexts/AuthContext';
import ShareButton from '../../components/ShareButton';
import MobileCampaigns from '../../components/mobile/MobileCampaigns';

const CampaignList: React.FC = () => {
  const { campaigns, loading } = useCampaigns();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'public' | 'private'>('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use mobile campaigns on small screens
  if (isMobile) {
    return <MobileCampaigns />;
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    switch (filter) {
      case 'active': return campaign.status === 'active';
      case 'completed': return campaign.status === 'completed';
      case 'public': return campaign.isPublic;
      case 'private': return !campaign.isPublic;
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🌳 Tree Campaigns
              </h1>
              <p className="text-gray-600 text-sm mt-1">Join or create environmental restoration projects</p>
            </div>
            <Link 
              to="create" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start Campaign
            </Link>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All', emoji: '🌍' },
            { key: 'active', label: 'Active', emoji: '🟢' },
            { key: 'completed', label: 'Completed', emoji: '✅' },
            { key: 'public', label: 'Public', emoji: '🌐' },
            { key: 'private', label: 'Private', emoji: '🔒' }
          ].map(filterType => (
            <button
              key={filterType.key}
              onClick={() => setFilter(filterType.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === filterType.key
                  ? 'bg-green-100 text-green-700 border-2 border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              {filterType.emoji} {filterType.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="px-4 py-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const isOrganizer = user?.id === campaign.organizerId;
            const isParticipant = campaign.participants?.includes(user?.id || '') || false;
            const isPending = campaign.pendingParticipants?.includes(user?.id || '') || false;

            return (
              <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300 flex flex-col group">
                <div className="relative h-48">
                  <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                      campaign.status === 'active' ? 'bg-green-500/90 text-white' :
                      campaign.status === 'completed' ? 'bg-blue-500/90 text-white' :
                      'bg-red-500/90 text-white'
                    }`}>
                      {campaign.status === 'active' ? '🟢 Active' :
                       campaign.status === 'completed' ? '✅ Completed' : '❌ Inactive'}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                      campaign.isPublic ? 'bg-blue-500/90 text-white' : 'bg-purple-500/90 text-white'
                    }`}>
                      {campaign.isPublic ? '🌐 Public' : '🔒 Private'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                      📍 {campaign.location}
                    </div>
                    {campaign.daysLeft > 0 && (
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                        ⏰ {campaign.daysLeft}d left
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-1">
                      {campaign.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {campaign.tags.length > 2 && (
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          +{campaign.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {isOrganizer && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">👑 Organizer</span>}
                      {isParticipant && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">✅ Joined</span>}
                      {isPending && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">⏳ Pending</span>}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{campaign.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1 leading-relaxed">{campaign.description}</p>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        👤 <span className="font-medium">{campaign.organizer}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        👥 <span className="font-medium">{campaign.participants?.length || 0} joined</span>
                      </span>
                    </div>
                    {campaign.pendingParticipants?.length > 0 && isOrganizer && (
                      <div className="text-orange-600 text-xs mt-2 bg-orange-50 px-2 py-1 rounded">
                        ⏳ {campaign.pendingParticipants.length} pending approval
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-green-600">🌳 {campaign.plantedTrees.toLocaleString()}</span>
                      <span className="text-gray-500">Goal: {campaign.targetTrees.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (campaign.plantedTrees / campaign.targetTrees) * 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to={`/app/campaigns/${campaign.id}`} 
                        className="flex-1 text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        View Campaign
                      </Link>
                      <ShareButton type="campaign" data={campaign} size="lg" className="!w-12 !h-12 border border-gray-300 bg-white hover:bg-gray-50" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CampaignList;