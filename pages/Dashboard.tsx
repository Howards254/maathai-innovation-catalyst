import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import { useDiscussions } from '../contexts/DiscussionContext';
import { useUser } from '../contexts/UserContext';
import { Play, ThumbsUp, ThumbsDown, Camera, ArrowUp, ArrowDown, Sparkles, TrendingUp } from 'lucide-react';
import CreateStoryModal from '../components/CreateStoryModal';
import EnhancedCreateStoryModal from '../components/EnhancedCreateStoryModal';
import SuggestedUsers from '../components/SuggestedUsers';
import FriendsActivityFeed from '../components/FriendsActivityFeed';
import MobileDashboard from '../components/mobile/MobileDashboard';
import { CampaignCardSkeleton, DiscussionCardSkeleton, LoadingSpinner, EmptyState } from '../components/LoadingStates';
import { PersonalizedGreeting, QuickActions, ActivitySummary, PersonalizedRecommendations } from '../components/PersonalizedDashboard';
import { NotificationManager } from '../components/NotificationToast';
import { OnboardingTips } from '../components/OnboardingTips';

const Dashboard: React.FC = () => {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { discussions, loading: discussionsLoading, voteDiscussion, getUserVote } = useDiscussions();
  const { user } = useUser();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'hot' | 'new' | 'top'>('hot');
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use mobile dashboard on small screens
  if (isMobile) {
    return <MobileDashboard />;
  }

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
    let filtered = [...discussions];
    
    // Smart filtering based on user interests (mock implementation)
    if (user?.interests) {
      filtered = filtered.filter(discussion => 
        user.interests.some(interest => 
          discussion.category?.toLowerCase().includes(interest.toLowerCase()) ||
          discussion.title?.toLowerCase().includes(interest.toLowerCase())
        )
      );
    }
    
    switch (filter) {
      case 'hot':
        return filtered.sort((a, b) => {
          const aScore = (a.upvotes || 0) + (a.commentsCount || 0) * 2;
          const bScore = (b.upvotes || 0) + (b.commentsCount || 0) * 2;
          return bScore - aScore;
        }).slice(0, 5);
      case 'new':
        return filtered.sort((a, b) => {
          const aTime = new Date(a.postedAt).getTime() || Date.now();
          const bTime = new Date(b.postedAt).getTime() || Date.now();
          return bTime - aTime;
        }).slice(0, 5);
      case 'top':
        return filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 5);
      default:
        return filtered.slice(0, 5);
    }
  };

  const filteredDiscussions = getFilteredDiscussions();

  return (
    <div className="bg-gray-50 min-h-full">
        {/* Create Post Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-10 animate-fade-in-down">
          <div className="p-4 flex items-center gap-3">
            <div className="relative">
                <img 
                    src={user?.avatarUrl || 'https://picsum.photos/200'} 
                    alt="User" 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 hover:ring-green-300 transition-all cursor-pointer" 
                    onClick={() => navigate(`/app/profile/${user?.username}`)}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse-green"></div>
            </div>
            <div className="flex-1 relative group">
                <input 
                    type="text" 
                    placeholder="What's on your mind about the environment?" 
                    className="w-full bg-gray-100 hover:bg-white border border-gray-200 hover:border-green-300 rounded-full px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer smooth-transition"
                    onClick={() => navigate('/app/discussions')}
                    readOnly
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors">
                    <Sparkles className="w-4 h-4" />
                </div>
            </div>
            <button 
                onClick={() => setShowCreateStory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-all micro-bounce card-hover"
            >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Share Story</span>
                <span className="sm:hidden">Story</span>
            </button>
            <button 
                onClick={() => navigate('/app/campaigns/create')}
                className="p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-full transition-all micro-lift"
                title="Create Campaign"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
            {/* Personalized Header */}
            <PersonalizedGreeting />
            
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Activity Summary */}
            <ActivitySummary />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
            {/* Featured Campaigns */}
            <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      🌟 Featured Campaigns
                    </h2>
                    <Link 
                        to="/app/campaigns" 
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        View all <TrendingUp className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaignsLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <CampaignCardSkeleton key={i} />
                        ))
                    ) : campaigns.length === 0 ? (
                        <div className="col-span-full">
                            <EmptyState 
                                icon="🌱"
                                title="No campaigns yet"
                                description="Be the first to create an environmental campaign and start making a difference!"
                                actionLabel="Create Campaign"
                                onAction={() => navigate('/app/campaigns/create')}
                            />
                        </div>
                    ) : (
                        campaigns.slice(0, 6).map((campaign, index) => (
                        <Link to={`/app/campaigns/${campaign.id}`} key={campaign.id} className="group block bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all card-hover animate-fade-in-up stagger-item">
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
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full animate-progress transition-all duration-1000 ease-out" 
                                        style={{ width: `${(campaign.plantedTrees / campaign.targetTrees) * 100}%` }}
                                    ></div>
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
            <div className="animate-fade-in-up animation-delay-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      💬 Recent Discussions
                    </h2>
                    <Link 
                        to="/app/discussions" 
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        View all <Sparkles className="w-4 h-4" />
                    </Link>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button 
                          onClick={() => setFilter('hot')}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all micro-bounce ${
                            filter === 'hot' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          🔥 Hot
                        </button>
                        <button 
                          onClick={() => setFilter('new')}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all micro-bounce ${
                            filter === 'new' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          ✨ New
                        </button>
                        <button 
                          onClick={() => setFilter('top')}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all micro-bounce ${
                            filter === 'top' 
                              ? 'bg-white text-gray-900 shadow-sm' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          🏆 Top
                        </button>
                    </div>
                    {user?.interests && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            Personalized for you
                        </span>
                    )}
                </div>
                <div className="space-y-3">
                    {discussionsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <DiscussionCardSkeleton key={i} />
                        ))
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
                                    {/* Quora-style Voting */}
                                    <div className="flex items-center">
                                      <button
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          await voteDiscussion(post.id, 'up');
                                        }}
                                        className={`p-2 rounded-l-lg transition-all ${
                                          getUserVote(post.id) === 'up'
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                      >
                                        <ArrowUp className="w-4 h-4" />
                                      </button>
                                      <span className="px-3 py-2 bg-gray-50 text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                                        {Math.max(0, (post.upvotes || 0) - (post.downvotes || 0))}
                                      </span>
                                      <button
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          await voteDiscussion(post.id, 'down');
                                        }}
                                        className={`p-2 rounded-r-lg transition-all ${
                                          getUserVote(post.id) === 'down'
                                            ? 'text-red-600 bg-red-50'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                      >
                                        <ArrowDown className="w-4 h-4" />
                                      </button>
                                    </div>

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
                                      <span>{post.comment_count || post.commentsCount || 0}</span>
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
                        <EmptyState 
                            icon="💬"
                            title="No discussions yet"
                            description="Be the first to start a conversation about environmental topics!"
                            actionLabel="Start Discussion"
                            onAction={() => navigate('/app/discussions')}
                        />
                    )}
                </div>
            </div>
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                    <PersonalizedRecommendations campaigns={campaigns} />
                    <SuggestedUsers />
                    <FriendsActivityFeed />
                </div>
            </div>
        </div>
        
        {/* Create Story Modal */}
        {isMobile ? (
          <CreateStoryModal isOpen={showCreateStory} onClose={() => setShowCreateStory(false)} />
        ) : (
          <EnhancedCreateStoryModal isOpen={showCreateStory} onClose={() => setShowCreateStory(false)} />
        )}
        
        {/* Notification Manager */}
        <NotificationManager />
        
        {/* Onboarding Tips */}
        <OnboardingTips />
    </div>
  );
};

export default Dashboard;