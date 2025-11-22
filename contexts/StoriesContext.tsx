import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface Story {
  id: string;
  author_id: string;
  title: string;
  description?: string;
  media_url: string;
  media_type: 'image' | 'video';
  duration?: number;
  story_type: 'tree_planting' | 'campaign_progress' | 'event' | 'education' | 'cleanup' | 'general';
  location?: string;
  tags?: string[];
  views_count: number;
  created_at: string;
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    level: string;
  };
  reactions?: StoryReaction[];
  comments?: StoryComment[];
  user_reaction?: string;
}

export interface StoryReaction {
  id: string;
  story_id: string;
  user_id: string;
  reaction_type: 'planted' | 'love' | 'inspiring' | 'share' | 'congrats';
  created_at: string;
  user?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface StoryComment {
  id: string;
  story_id: string;
  author_id: string;
  content: string;
  parent_id?: string;
  mentions?: string[];
  created_at: string;
  author?: {
    username: string;
    full_name: string;
    avatar_url?: string;
    level: string;
  };
  replies?: StoryComment[];
}

interface StoriesContextType {
  stories: Story[];
  loading: boolean;
  error: string | null;
  createStory: (storyData: Omit<Story, 'id' | 'author_id' | 'views_count' | 'created_at'>) => Promise<Story>;
  getStories: (type?: 'following' | 'trending' | 'all') => Promise<void>;
  getStoryById: (id: string) => Promise<Story | null>;
  reactToStory: (storyId: string, reactionType: string) => Promise<void>;
  removeReaction: (storyId: string, reactionType: string) => Promise<void>;
  addComment: (storyId: string, content: string, parentId?: string, mentions?: string[]) => Promise<void>;
  incrementViews: (storyId: string) => Promise<void>;
  getUserStories: (userId: string) => Promise<Story[]>;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

export const useStories = () => {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
};

export const StoriesProvider = ({ children }: { children: ReactNode }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createStory = async (storyData: Omit<Story, 'id' | 'author_id' | 'views_count' | 'created_at'>): Promise<Story> => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          ...storyData,
          author_id: user.id,
        })
        .select(`
          *,
          author:profiles(id, username, full_name, avatar_url, level)
        `)
        .single();

      if (error) throw error;

      const newStory = {
        ...data,
        reactions: [],
        comments: [],
      };

      setStories(prev => [newStory, ...prev]);
      
      // Create activity feed entry
      await supabase.rpc('create_activity_feed_entry', {
        p_user_id: user.id,
        p_actor_id: user.id,
        p_activity_type: 'story_posted',
        p_content_type: 'story',
        p_content_id: data.id
      });

      return newStory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
      throw err;
    }
  };

  const getStories = async (type: 'following' | 'trending' | 'all' = 'all') => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('stories')
        .select(`
          *,
          author:profiles(id, username, full_name, avatar_url, level),
          reactions:story_reactions(
            id, reaction_type, user_id,
            user:profiles(username, full_name, avatar_url)
          ),
          comments:story_comments(
            id, content, created_at,
            author:profiles(username, full_name, avatar_url, level)
          )
        `)
        .order('created_at', { ascending: false });

      if (type === 'following' && user) {
        // Get stories from followed users
        const { data: following } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (following && following.length > 0) {
          const followingIds = following.map(f => f.following_id);
          query = query.in('author_id', followingIds);
        } else {
          // If not following anyone, return empty array
          setStories([]);
          setLoading(false);
          return;
        }
      } else if (type === 'trending') {
        // Get trending stories (most reactions in last 24 hours)
        query = query
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('views_count', { ascending: false })
          .limit(50);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Add user's reaction to each story
      const storiesWithUserReactions = await Promise.all(
        (data || []).map(async (story) => {
          if (user) {
            const { data: userReaction } = await supabase
              .from('story_reactions')
              .select('reaction_type')
              .eq('story_id', story.id)
              .eq('user_id', user.id)
              .single();

            return {
              ...story,
              user_reaction: userReaction?.reaction_type
            };
          }
          return story;
        })
      );

      setStories(storiesWithUserReactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  const getStoryById = async (id: string): Promise<Story | null> => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(id, username, full_name, avatar_url, level),
          reactions:story_reactions(
            id, reaction_type, user_id,
            user:profiles(username, full_name, avatar_url)
          ),
          comments:story_comments(
            id, content, created_at, parent_id,
            author:profiles(username, full_name, avatar_url, level)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch story');
      return null;
    }
  };

  const reactToStory = async (storyId: string, reactionType: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('story_reactions')
        .insert({
          story_id: storyId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (error) throw error;

      // Update local state
      setStories(prev => prev.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            user_reaction: reactionType,
            reactions: [
              ...(story.reactions || []),
              {
                id: Date.now().toString(),
                story_id: storyId,
                user_id: user.id,
                reaction_type: reactionType as any,
                created_at: new Date().toISOString(),
                user: {
                  username: user.user_metadata?.username || '',
                  full_name: user.user_metadata?.full_name || '',
                  avatar_url: user.user_metadata?.avatar_url
                }
              }
            ]
          };
        }
        return story;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to react to story');
    }
  };

  const removeReaction = async (storyId: string, reactionType: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('story_reactions')
        .delete()
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (error) throw error;

      // Update local state
      setStories(prev => prev.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            user_reaction: undefined,
            reactions: (story.reactions || []).filter(r => 
              !(r.user_id === user.id && r.reaction_type === reactionType)
            )
          };
        }
        return story;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove reaction');
    }
  };

  const addComment = async (storyId: string, content: string, parentId?: string, mentions?: string[]) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase
        .from('story_comments')
        .insert({
          story_id: storyId,
          author_id: user.id,
          content,
          parent_id: parentId,
          mentions
        })
        .select(`
          *,
          author:profiles(username, full_name, avatar_url, level)
        `)
        .single();

      if (error) throw error;

      // Update local state
      setStories(prev => prev.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            comments: [...(story.comments || []), data]
          };
        }
        return story;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const incrementViews = async (storyId: string) => {
    try {
      await supabase
        .from('stories')
        .update({ views_count: supabase.raw('views_count + 1') })
        .eq('id', storyId);
    } catch (err) {
      // Silently fail for view counts
      console.error('Failed to increment views:', err);
    }
  };

  const getUserStories = async (userId: string): Promise<Story[]> => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles(id, username, full_name, avatar_url, level),
          reactions:story_reactions(id, reaction_type, user_id),
          comments:story_comments(id)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stories');
      return [];
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('stories_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'stories' },
        (payload) => {
          // Refresh stories when new ones are added
          getStories();
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'story_reactions' },
        (payload) => {
          // Update reaction counts in real-time
          getStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <StoriesContext.Provider value={{
      stories,
      loading,
      error,
      createStory,
      getStories,
      getStoryById,
      reactToStory,
      removeReaction,
      addComment,
      incrementViews,
      getUserStories
    }}>
      {children}
    </StoriesContext.Provider>
  );
};

export default StoriesProvider;