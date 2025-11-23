import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import { useDiscussions } from '../contexts/DiscussionContext';

const Dashboard: React.FC = () => {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { discussions, loading: discussionsLoading, voteDiscussion, getUserVote } = useDiscussions();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'hot' | 'new' | 'top'>('hot');

  const getFilteredDiscussions = () => {
    switch (filter) {
      case 'hot':
        return [...discussions].sort((a, b) => {
          const aScore = a.upvotes + a.commentsCount;
          const bScore = b.upvotes + b.commentsCount;
          return bScore - aScore;
        }).slice(0, 5);
      case 'new':
        return [...discussions].sort((a, b) => {
          const aTime = new Date(a.postedAt).getTime() || Date.now();
          const bTime = new Date(b.postedAt).getTime() || Date.now();
          return bTime - aTime;
        }).slice(0, 5);
      case 'top':
        return [...discussions].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);
      default:
        return discussions.slice(0, 5);
    }
  };

  const filteredDiscussions = getFilteredDiscussions();

  return (
    <div className="bg-gray-50 min-h-full">
        {/* Create Post Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
          <div className="p-4 flex items-center gap-3">
            <img src="https://picsum.photos/200" alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
            <input 
                type="text" 
                placeholder="What's on your mind about the environment?" 
                className="flex-1 bg-gray-100 hover:bg-white border border-gray-200 hover:border-green-300 rounded-full px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                onClick={() => navigate('/app/discussions')}
                readOnly
            />
            <button className="p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
            {/* Featured Campaigns */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🌟 Featured Campaigns
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaignsLoading ? (
                        <div className="col-span-full text-center py-8">
                            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-gray-500 text-sm">Loading campaigns...</p>
                        </div>
                    ) : (
                        campaigns.slice(0, 6).map(campaign => (
                        <Link to={`/app/campaigns/${campaign.id}`} key={campaign.id} className="group block bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all">
                            <div className="h-40 bg-gray-200 relative">
                                <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                    {campaign.daysLeft}d left
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 group-hover:text-green-600 mb-2 line-clamp-2">{campaign.title}</h3>
                                <p className="text-sm text-gray-500 mb-3">by {campaign.organizer}</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: `${(campaign.plantedTrees / campaign.targetTrees) * 100}%` }}></div>
                                </div>
                                <div className="text-sm text-gray-600 flex justify-between">
                                    <span>🌳 {campaign.plantedTrees.toLocaleString()}</span>
                                    <span className="font-medium">{Math.round((campaign.plantedTrees / campaign.targetTrees) * 100)}%</span>
                                </div>
                            </div>
                        </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Discussion Feed */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💬 Recent Discussions
                </h2>
                
                {/* Filter Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1 w-fit mb-4">
                    <button 
                      onClick={() => setFilter('hot')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        filter === 'hot' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      🔥 Hot
                    </button>
                    <button 
                      onClick={() => setFilter('new')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        filter === 'new' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      ✨ New
                    </button>
                    <button 
                      onClick={() => setFilter('top')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        filter === 'top' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      🏆 Top
                    </button>
                </div>
                <div className="space-y-3">
                    {discussionsLoading ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-gray-500 text-sm">Loading discussions...</p>
                        </div>
                    ) : filteredDiscussions.length > 0 ? (
                        filteredDiscussions.map(post => (
                        <Link key={post.id} to={`/app/discussions`} className="block bg-white rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-md transition-all">
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <img 
                                      src={post.author?.avatarUrl || 'https://picsum.photos/200'} 
                                      alt={post.author?.username || 'User'} 
                                      className="w-10 h-10 rounded-full ring-2 ring-gray-100" 
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                              {post.category}
                                            </span>
                                            <span>•</span>
                                            <span>@{post.author?.username || 'Anonymous'}</span>
                                            <span>•</span>
                                            <span>{post.postedAt || 'Just now'}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                                          {post.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                          {post.content}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                                <span>{post.upvotes || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span>{post.commentsCount || 0} comments</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
                            <div className="text-4xl mb-2">💬</div>
                            <p className="text-gray-500 text-sm">No discussions yet. Be the first to start a conversation!</p>
                            <button 
                              onClick={() => navigate('/app/discussions')}
                              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              Start Discussion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;