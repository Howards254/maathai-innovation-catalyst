import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Eye, MoreHorizontal, Play } from 'lucide-react';
import { useStories, Story } from '../contexts/StoriesContext';
import { useAuth } from '../contexts/AuthContext';
import { getOptimizedUrl, getVideoThumbnail } from '../lib/cloudinaryClient';

interface StoriesFeedProps {
  feedType?: 'all' | 'following' | 'trending';
}

const StoriesFeed = ({ feedType = 'all' }: StoriesFeedProps) => {
  const { stories, loading, getStories, reactToStory, removeReaction, incrementViews } = useStories();
  const { user } = useAuth();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    getStories(feedType);
  }, [feedType]);

  const reactionEmojis = {
    planted: '🌱',
    love: '💚',
    inspiring: '🔥',
    share: '📣',
    congrats: '🎉'
  };

  const storyTypeColors = {
    tree_planting: 'bg-green-100 text-green-800',
    campaign_progress: 'bg-blue-100 text-blue-800',
    event: 'bg-purple-100 text-purple-800',
    education: 'bg-yellow-100 text-yellow-800',
    cleanup: 'bg-orange-100 text-orange-800',
    general: 'bg-gray-100 text-gray-800'
  };

  const levelColors = {
    seed: 'text-green-500',
    sprout: 'text-green-600',
    bud: 'text-green-700',
    sapling: 'text-blue-600',
    young_tree: 'text-blue-700',
    forest_guardian: 'text-purple-600',
    earth_hero: 'text-yellow-600'
  };

  const handleReaction = async (story: Story, reactionType: string) => {
    if (!user) return;

    try {
      if (story.user_reaction === reactionType) {
        await removeReaction(story.id, reactionType);
      } else {
        await reactToStory(story.id, reactionType);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleStoryClick = (story: Story) => {
    incrementViews(story.id);
    setSelectedStory(story);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getReactionCount = (story: Story, reactionType: string) => {
    return story.reactions?.filter(r => r.reaction_type === reactionType).length || 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
            <div className="h-64 bg-gray-200 rounded-xl mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-500">
              {feedType === 'following' 
                ? "Follow some users to see their impact stories here"
                : "Be the first to share your environmental impact story!"
              }
            </p>
          </div>
        ) : (
          stories.map((story) => (
            <div key={story.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Story Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={story.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.author?.full_name || 'User')}&background=10b981&color=fff`}
                    alt={story.author?.full_name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{story.author?.full_name}</h3>
                      <span className={`text-xs font-medium ${levelColors[story.author?.level as keyof typeof levelColors] || 'text-gray-500'}`}>
                        {story.author?.level?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>@{story.author?.username}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(story.created_at)}</span>
                      {story.location && (
                        <>
                          <span>•</span>
                          <span>{story.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${storyTypeColors[story.story_type]}`}>
                    {story.story_type.replace('_', ' ')}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Story Content */}
              <div className="px-4 pb-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{story.title}</h2>
                {story.description && (
                  <p className="text-gray-600 mb-3">{story.description}</p>
                )}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {story.tags.map((tag, index) => (
                      <span key={index} className="text-green-600 text-sm">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Media */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => handleStoryClick(story)}
              >
                {story.media_type === 'video' ? (
                  <div className="relative">
                    <img
                      src={getVideoThumbnail(story.media_url && typeof story.media_url === 'string' ? (story.media_url.split('/').pop()?.split('.')[0] || '') : '')}
                      alt={story.title}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                      <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-800 ml-1" />
                      </div>
                    </div>
                    {story.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(story.duration / 60)}:{(story.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                ) : (
                  <img
                    src={getOptimizedUrl(story.media_url && typeof story.media_url === 'string' ? (story.media_url.split('/').pop()?.split('.')[0] || '') : '', { width: 800, height: 600 })}
                    alt={story.title}
                    className="w-full h-96 object-cover"
                  />
                )}
                
                {/* View count overlay */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {story.views_count}
                </div>
              </div>

              {/* Reactions and Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    {Object.entries(reactionEmojis).map(([type, emoji]) => {
                      const count = getReactionCount(story, type);
                      const isActive = story.user_reaction === type;
                      
                      return (
                        <button
                          key={type}
                          onClick={() => handleReaction(story, type)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
                            isActive 
                              ? 'bg-green-100 text-green-700 scale-110' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span className="text-base">{emoji}</span>
                          {count > 0 && <span className="font-medium">{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{story.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Recent comments preview */}
                {story.comments && story.comments.length > 0 && (
                  <div className="space-y-2">
                    {story.comments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <img
                          src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.full_name || 'User')}&background=10b981&color=fff`}
                          alt={comment.author?.full_name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-sm text-gray-900">{comment.author?.username}</span>
                          <span className="text-sm text-gray-600 ml-2">{comment.content}</span>
                        </div>
                      </div>
                    ))}
                    {story.comments.length > 2 && (
                      <button 
                        onClick={() => handleStoryClick(story)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        View all {story.comments.length} comments
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex h-full">
              {/* Media */}
              <div className="flex-1 bg-black flex items-center justify-center">
                {selectedStory.media_type === 'video' ? (
                  <video
                    src={selectedStory.media_url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <img
                    src={selectedStory.media_url}
                    alt={selectedStory.title}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              
              {/* Sidebar with details */}
              <div className="w-96 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{selectedStory.title}</h3>
                    <button
                      onClick={() => setSelectedStory(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Story details and comments would go here */}
                  <p className="text-gray-600">{selectedStory.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesFeed;