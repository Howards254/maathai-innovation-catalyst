import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Heart, MessageCircle, Share2, Eye, Clock, Music, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CreateStoryModal from '../components/CreateStoryModal';
import EnhancedCreateStoryModal from '../components/EnhancedCreateStoryModal';

interface Story {
  id: string;
  author_id: string;
  title: string;
  description?: string;
  media_url: string;
  media_type: 'image' | 'video';
  duration?: number;
  story_type: string;
  location?: string;
  tags?: string[];
  music_url?: string;
  music_title?: string;
  filters?: any;
  stickers?: any[];
  text_overlays?: any[];
  views_count: number;
  reactions_count: number;
  comments_count: number;
  created_at: string;
  expires_at: string;
  author_name: string;
  author_username: string;
  author_avatar?: string;
  has_viewed: boolean;
  user_reaction?: string;
}

const EnhancedStories: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showUserTransition, setShowUserTransition] = useState(false);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [storyReactions, setStoryReactions] = useState<Record<string, any>>({});
  const [storyComments, setStoryComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>();
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    loadStories();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isFullScreen && !isPaused && !showComments) {
      startProgress();
    } else {
      stopProgress();
    }
    return () => stopProgress();
  }, [isFullScreen, currentIndex, isPaused, showComments]);

  useEffect(() => {
    if (videoRef.current) {
      if (showComments || isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [showComments, isPaused]);

  const loadStories = async (pageNum = 0, append = false) => {
    if (!append) setLoading(true);
    
    try {
      const limit = 20;
      const offset = pageNum * limit;
      
      // Single optimized query with pagination
      const { data: storiesData, error } = await supabase
        .rpc('get_stories_with_stats', {
          current_user_id: user?.id || null,
          limit_count: limit,
          offset_count: offset
        });
      
      if (error) {
        // Fallback to basic query if RPC doesn't exist
        const { data: basicData, error: basicError } = await supabase
          .from('stories')
          .select(`
            id, title, description, media_url, media_type, duration, story_type,
            location, tags, views_count, created_at, expires_at, author_id,
            author:profiles!stories_author_id_fkey(id, full_name, username, avatar_url)
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        
        if (basicError) throw basicError;
        
        const formattedStories = basicData?.map(story => ({
          ...story,
          author_name: story.author?.full_name || 'Unknown User',
          author_username: story.author?.username || 'unknown',
          author_avatar: story.author?.avatar_url,
          reactions_count: 0,
          comments_count: 0,
          has_viewed: false,
          user_reaction: null
        })) || [];
        
        if (append) {
          setStories(prev => [...prev, ...formattedStories]);
        } else {
          setStories(formattedStories);
        }
        
        setHasMore(formattedStories.length === limit);
        return;
      }
      
      // Process RPC results
      const formattedStories = storiesData?.map((story: any) => ({
        ...story,
        author_name: story.author_name || 'Unknown User',
        author_username: story.author_username || 'unknown',
        author_avatar: story.author_avatar,
        has_viewed: false
      })) || [];
      
      // Set user reactions for UI state
      const userReactions: Record<string, string> = {};
      formattedStories.forEach((story: any) => {
        if (story.user_reaction) {
          userReactions[story.id] = story.user_reaction;
        }
      });
      
      if (append) {
        setStoryReactions(prev => ({ ...prev, ...userReactions }));
        setStories(prev => [...prev, ...formattedStories]);
      } else {
        setStoryReactions(userReactions);
        setStories(formattedStories);
      }
      
      setHasMore(formattedStories.length === limit);
    } catch (error) {
      console.error('Error loading stories:', error);
      if (!append) setStories([]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreStories = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadStories(nextPage, true);
    }
  };

  const recordView = async (storyId: string, duration: number = 0) => {
    if (!user) return;
    
    try {
      // Only update view count, skip story_views table if it causes conflicts
      const { data: story } = await supabase
        .from('stories')
        .select('views_count')
        .eq('id', storyId)
        .single();
        
      if (story) {
        await supabase
          .from('stories')
          .update({ views_count: (story.views_count || 0) + 1 })
          .eq('id', storyId);
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const reactToStory = async (storyId: string, reactionType: string) => {
    if (!user) return;
    
    try {
      const existingReaction = storyReactions[storyId];
      
      if (existingReaction === reactionType) {
        // Remove reaction
        const { error } = await supabase
          .from('story_reactions')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', user.id);
        
        if (!error) {
          setStoryReactions(prev => ({ ...prev, [storyId]: null }));
          setStories(prev => prev.map(story => {
            if (story.id === storyId) {
              return { ...story, reactions_count: Math.max(0, story.reactions_count - 1) };
            }
            return story;
          }));
        } else {
          console.error('Error removing reaction:', error);
        }
      } else {
        // Add or update reaction - use insert with conflict handling
        const { error } = await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: user.id,
            reaction_type: reactionType
          });
        
        if (error) {
          // If conflict, update existing reaction
          if (error.code === '23505') {
            const { error: updateError } = await supabase
              .from('story_reactions')
              .update({ reaction_type: reactionType })
              .eq('story_id', storyId)
              .eq('user_id', user.id);
            
            if (!updateError) {
              setStoryReactions(prev => ({ ...prev, [storyId]: reactionType }));
            } else {
              console.error('Error updating reaction:', updateError);
            }
          } else {
            console.error('Error adding reaction:', error);
          }
        } else {
          setStoryReactions(prev => ({ ...prev, [storyId]: reactionType }));
          setStories(prev => prev.map(story => {
            if (story.id === storyId) {
              const increment = existingReaction ? 0 : 1;
              return { ...story, reactions_count: story.reactions_count + increment };
            }
            return story;
          }));
        }
      }
    } catch (error) {
      console.error('Error reacting to story:', error);
    }
  };

  const loadComments = async (storyId: string) => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('story_comments')
        .select(`
          *,
          author:profiles!story_comments_author_id_fkey(id, full_name, username, avatar_url)
        `)
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });
      
      if (!error) {
        setStoryComments(data || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async (storyId: string, content: string) => {
    if (!user || !content.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('story_comments')
        .insert({
          story_id: storyId,
          author_id: user.id,
          content: content.trim()
        })
        .select(`
          *,
          author:profiles!story_comments_author_id_fkey(id, full_name, username, avatar_url)
        `);
      
      if (!error && data) {
        setStoryComments(prev => [...prev, data[0]]);
        setStories(prev => prev.map(story => {
          if (story.id === storyId) {
            return { ...story, comments_count: story.comments_count + 1 };
          }
          return story;
        }));
        
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const startProgress = () => {
    const story = stories[currentIndex];
    if (!story) return;
    
    const duration = story.media_type === 'video' ? (story.duration || 15) : 5;
    const increment = 100 / (duration * 10); // Update every 100ms
    
    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + increment;
      });
    }, 100);
  };

  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      const currentStory = stories[currentIndex];
      const nextStory = stories[currentIndex + 1];
      
      // Check if switching to different user
      if (currentStory.author_id !== nextStory.author_id) {
        setShowUserTransition(true);
        setTimeout(() => {
          setShowUserTransition(false);
          setCurrentIndex(currentIndex + 1);
          setProgress(0);
        }, 1000);
      } else {
        setCurrentIndex(currentIndex + 1);
        setProgress(0);
      }
    } else {
      setIsFullScreen(false);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const openFullScreen = (index: number) => {
    setCurrentIndex(index);
    setIsFullScreen(true);
    recordView(stories[index].id);
    
    // Mark story as viewed
    setViewedStories(prev => new Set([...prev, stories[index].id]));
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="flex gap-4 p-4 overflow-x-auto">
            {/* Loading skeleton for stories ring */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-12 h-3 bg-gray-200 rounded mt-2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  // Group stories by author (like Facebook/Instagram)
  const groupedStories = stories.reduce((groups, story, index) => {
    const authorId = story.author_id;
    if (!groups[authorId]) {
      groups[authorId] = {
        author: {
          id: authorId,
          name: story.author_name,
          username: story.author_username,
          avatar: story.author_avatar
        },
        stories: [],
        firstIndex: index
      };
    }
    groups[authorId].stories.push({ ...story, originalIndex: index });
    return groups;
  }, {} as Record<string, any>);

  const storyGroups = Object.values(groupedStories);

  // Stories Ring View (like Instagram/Facebook)
  const StoriesRing = () => (
    <div className="flex gap-4 p-4 overflow-x-auto">
      {/* Add Story Button */}
      <div className="flex-shrink-0 text-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>
        <p className="text-xs mt-2 text-gray-600">Your Story</p>
      </div>

      {/* Grouped Stories */}
      {storyGroups.map((group) => {
        const hasUnviewed = group.stories.some((s: any) => !viewedStories.has(s.id));
        const storyCount = group.stories.length;
        
        return (
          <div key={group.author.id} className="flex-shrink-0 text-center">
            <button
              onClick={() => openFullScreen(group.firstIndex)}
              className={`relative w-16 h-16 rounded-full p-0.5 ${
                hasUnviewed 
                  ? 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500'
                  : 'bg-gray-300'
              }`}
            >
              <img
                src={group.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.author.name)}&background=10b981&color=fff`}
                alt={group.author.name}
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
              {storyCount > 1 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-bold">
                  {storyCount}
                </div>
              )}
              {hasUnviewed && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </button>
            <p className="text-xs mt-2 text-gray-600 truncate w-16">{group.author.name.split(' ')[0]}</p>
          </div>
        );
      })}
    </div>
  );

  // Grid View (like TikTok Discover)
  if (!isFullScreen) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Stories Ring */}
        <div className="bg-white border-b">
          <StoriesRing />
        </div>

        {/* Header */}
        <div className="bg-white p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Camera className="w-6 h-6 text-green-600" />
                Impact Stories
              </h1>
              <p className="text-gray-600 text-sm">Stories disappear after 24 hours</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Story
            </button>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="p-4">
          {stories.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active stories</h3>
              <p className="text-gray-500 mb-4">Be the first to share your environmental impact!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
              >
                Share Your Story
              </button>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {storyGroups.map((group) => (
                group.stories.map((story: any, storyIndex: number) => (
                <div
                  key={story.id}
                  onClick={() => openFullScreen(story.originalIndex)}
                  className="relative bg-black rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  style={{ aspectRatio: '9/16' }}
                >
                  {story.media_type === 'video' ? (
                    <video
                      src={story.media_url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={story.media_url}
                      alt={story.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Story Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={story.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.author_name)}&background=10b981&color=fff`}
                        alt={story.author_name}
                        className="w-6 h-6 rounded-full"
                        loading="lazy"
                      />
                      <span className="text-white text-sm font-medium">{story.author_name}</span>
                    </div>
                    <p className="text-white text-sm line-clamp-2">{story.title}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2 text-white text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {story.views_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {story.reactions_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeRemaining(story.expires_at)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Viewed indicator */}
                  {viewedStories.has(story.id) && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                  )}
                </div>
                ))
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreStories}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More Stories'}
                </button>
              </div>
            )}
            </>
          )}
        </div>

        {isMobile ? (
          <CreateStoryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        ) : (
          <EnhancedCreateStoryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    );
  }

  // Full Screen Story View (like TikTok/Instagram Stories)
  const currentStory = stories[currentIndex];
  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 pt-8">
        <div className="flex items-center gap-3">
          <img
            src={currentStory.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStory.author_name)}&background=10b981&color=fff`}
            alt={currentStory.author_name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <p className="text-white font-semibold">{currentStory.author_name}</p>
            <p className="text-white/80 text-sm">{getTimeRemaining(currentStory.expires_at)} left</p>
          </div>
        </div>
        <button
          onClick={() => setIsFullScreen(false)}
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Media */}
      <div className="absolute inset-0 flex items-center justify-center">
        {currentStory.media_type === 'video' ? (
          <video
            ref={videoRef}
            src={currentStory.media_url}
            className="max-w-full max-h-full object-contain"
            autoPlay
            loop
            muted
            playsInline
            onClick={() => setIsPaused(!isPaused)}
          />
        ) : (
          <img
            src={currentStory.media_url}
            alt={currentStory.title}
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Navigation */}
      <button
        onClick={prevStory}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2"
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={nextStory}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Tap areas for navigation */}
      <div className="absolute inset-0 flex">
        <div className="flex-1" onClick={prevStory} />
        <div className="flex-1" onClick={nextStory} />
      </div>

      {/* Story content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <h2 className="text-white text-lg font-semibold mb-2">{currentStory.title}</h2>
        {currentStory.description && (
          <p className="text-white/90 mb-3">{currentStory.description}</p>
        )}
        
        {/* Music info */}
        {currentStory.music_title && (
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4 text-white" />
            <span className="text-white text-sm">{currentStory.music_title}</span>
          </div>
        )}

        {/* Tags */}
        {currentStory.tags && currentStory.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {currentStory.tags.map((tag, i) => (
              <span key={i} className="text-white text-sm">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-4">
        <button
          onClick={() => reactToStory(currentStory.id, 'love')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            storyReactions[currentStory.id] === 'love'
              ? 'bg-red-500 scale-110' 
              : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          <Heart className={`w-6 h-6 ${storyReactions[currentStory.id] === 'love' ? 'text-white fill-white' : 'text-white'}`} />
        </button>
        <div className="text-center">
          <span className="text-white text-xs">{currentStory.reactions_count}</span>
        </div>

        <button 
          onClick={() => {
            setShowComments(true);
            loadComments(currentStory.id);
          }}
          className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
        <div className="text-center">
          <span className="text-white text-xs">{currentStory.comments_count}</span>
        </div>

        <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
          <Share2 className="w-6 h-6 text-white" />
        </button>
        
        {/* Sound toggle for videos */}
        {currentStory.media_type === 'video' && (
          <button
            onClick={() => {
              if (videoRef.current) {
                const newMutedState = !isMuted;
                videoRef.current.muted = newMutedState;
                setIsMuted(newMutedState);
              }
            }}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            {isMuted ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        )}
        
        {/* Pause indicator */}
        {currentStory.media_type === 'video' && isPaused && (
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v1" />
            </svg>
          </div>
        )}
      </div>

      {/* User Transition Overlay */}
      {showUserTransition && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <p className="text-white text-lg font-semibold">Next User</p>
            <p className="text-white/80 text-sm">{stories[currentIndex + 1]?.author_name}</p>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-30">
          <div className="bg-white w-full max-h-[70vh] rounded-t-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button onClick={() => {
                setShowComments(false);
                setStoryComments([]);
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 mb-4 max-h-60 overflow-y-auto">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : storyComments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-3">
                  {storyComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.full_name || 'User')}&background=10b981&color=fff`}
                        alt={comment.author?.full_name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <p className="font-medium text-sm">{comment.author?.full_name || 'Anonymous'}</p>
                          <p className="text-gray-800">{comment.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addComment(currentStory.id, commentText)}
              />
              <button
                onClick={() => addComment(currentStory.id, commentText)}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
        <CreateStoryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      ) : (
        <EnhancedCreateStoryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default EnhancedStories;