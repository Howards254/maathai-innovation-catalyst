import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import { useDiscussions } from '../contexts/DiscussionContext';
import { useUser } from '../contexts/UserContext';
import { Play, ThumbsUp, Camera } from 'lucide-react';
import CreateStoryModal from '../components/CreateStoryModal';
import SuggestedUsers from '../components/SuggestedUsers';

const Dashboard: React.FC = () => {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { discussions, loading: discussionsLoading, voteDiscussion, getUserVote } = useDiscussions();
  const { user } = useUser();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'hot' | 'new' | 'top'>('hot');
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);

  const reactionEmojis = [
    { emoji: '👍', label: 'Like' },
    { emoji: '💚', label: 'Love' },
    { emoji: '🌱', label: 'Growth' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '👏', label: 'Applause' },
    { emoji: '🎉', label: 'Celebrate' }
  ];

  const handleReaction = (postId: string, emoji: string) => {
    setReactions(prev => ({
      ...prev,
      [postId]: prev[postId] === emoji ? '' : emoji
    }));
    setShowReactionPicker(null);
  };

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
            <img src={user?.avatarUrl || 'https://picsum.photos/200'} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
            <input 
                type="text" 
                placeholder="What's on your mind about the environment?" 
                className="flex-1 bg-gray-100 hover:bg-white border border-gray-200 hover:border-green-300 rounded-full px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                onClick={() => navigate('/app/discussions')}
                readOnly
            />
            <button 
                onClick={() => setShowCreateStory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
            >
                <Camera className="w-4 h-4" />
                Share Story
            </button>
            <button className="p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
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
                        <div key={post.id} className="bg-white rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-md transition-all overflow-hidden">
                            <div className="p-4">
                                {/* Header */}
                                <div className="flex items-start gap-3 mb-3">
                                    {post.isAnonymous ? (
                                      <div className="w-10 h-10 rounded-full ring-2 ring-gray-300 bg-gray-100 flex items-center justify-center">
                                        <span className="text-lg">🕶️</span>
                                      </div>
                                    ) : (
                                      <Link to={`/app/profile/${post.author?.username}`}>
                                        <img 
                                          src={post.author?.avatarUrl || 'https://picsum.photos/200'} 
                                          alt={post.author?.username || 'User'} 
                                          className="w-10 h-10 rounded-full ring-2 ring-gray-100 hover:ring-green-300 transition-all" 
                                        />
                                      </Link>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {post.isAnonymous ? (
                                              <>
                                                <span className="font-semibold text-gray-700 text-sm">Anonymous User</span>
                                                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                                  🔒 Anonymous
                                                </span>
                                              </>
                                            ) : (
                                              <Link to={`/app/profile/${post.author?.username}`} className="font-semibold text-gray-900 hover:text-green-600 transition-colors text-sm">
                                                {post.author?.fullName}
                                              </Link>
                                            )}
                                            <span className="text-xs text-gray-400">• {post.postedAt}</span>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                          {post.category}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <Link to={`/app/discussions`} className="block mb-3">
                                    <h3 className="font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                                      {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {post.content}
                                    </p>
                                </Link>

                                {/* Media */}
                                {post.mediaUrls && post.mediaUrls.length > 0 && (
                                  <Link to={`/app/discussions`} className="block mb-3 -mx-4">
                                    {post.mediaUrls.length === 1 ? (
                                      <div className="relative bg-gray-100">
                                        <img src={post.mediaUrls[0]} alt="Post media" className="w-full max-h-64 object-contain" />
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-0.5">
                                        {post.mediaUrls.slice(0, 2).map((url, index) => (
                                          <div key={index} className="relative bg-gray-100 aspect-square overflow-hidden">
                                            <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                                            {index === 1 && post.mediaUrls!.length > 2 && (
                                              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                                <span className="text-white text-xl font-bold">+{post.mediaUrls!.length - 2}</span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </Link>
                                )}

                                {/* Tags */}
                                {post.tags && post.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {post.tags.slice(0, 3).map((tag, index) => (
                                      <span key={index} className="text-green-600 text-xs">#{tag}</span>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Actions */}
                                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                                    {/* Like/Reaction Button */}
                                    <div className="relative">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (!reactions[post.id]) {
                                            handleReaction(post.id, '👍');
                                          } else {
                                            setShowReactionPicker(showReactionPicker === post.id ? null : post.id);
                                          }
                                        }}
                                        onMouseEnter={() => setShowReactionPicker(post.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                          reactions[post.id]
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                      >
                                        {reactions[post.id] ? (
                                          <span className="text-base">{reactions[post.id]}</span>
                                        ) : (
                                          <ThumbsUp className="w-4 h-4" />
                                        )}
                                        <span>{reactions[post.id] ? 'Reacted' : 'Like'}</span>
                                      </button>
                                      
                                      {/* Reaction Picker */}
                                      {showReactionPicker === post.id && (
                                        <div 
                                          className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-2 flex gap-1 z-10"
                                          onMouseLeave={() => setShowReactionPicker(null)}
                                        >
                                          {reactionEmojis.map((reaction, index) => (
                                            <button
                                              key={index}
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleReaction(post.id, reaction.emoji);
                                              }}
                                              className="text-2xl hover:scale-125 transition-transform p-1"
                                              title={reaction.label}
                                            >
                                              {reaction.emoji}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <Link 
                                      to={`/app/discussions`}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                      <span>{post.commentsCount || 0}</span>
                                    </Link>

                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors ml-auto">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                      </svg>
                                      <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
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
            
            {/* Sidebar */}
            <div className="space-y-6">
                <SuggestedUsers />
            </div>
        </div>
        
        {/* Create Story Modal */}
        <CreateStoryModal isOpen={showCreateStory} onClose={() => setShowCreateStory(false)} />
    </div>
  );
};

export default Dashboard;