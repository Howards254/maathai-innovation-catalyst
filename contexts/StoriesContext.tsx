import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

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
  file_size?: number;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
    level?: string;
  };
  reactions?: Array<{ type?: string; reaction_type?: string; count: number }>;
  comments?: Array<{ id: string; content: string; author_id: string; author?: { id: string; full_name: string; avatar_url?: string } }>;
  user_reaction?: string;
}

interface StoriesContextType {
  stories: Story[];
  loading: boolean;
  createStory: (data: Partial<Story>) => Promise<void>;
  loadStories: () => Promise<void>;
  reactToStory: (storyId: string, reactionType: string) => Promise<void>;
  removeReaction: (storyId: string, reactionType: string) => Promise<void>;
  incrementViews: (storyId: string) => Promise<void>;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

export const StoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && user.id !== 'user-1') {
      loadStories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadStories = async () => {
    setLoading(true);
    try {
      // Use optimized RPC function
      const { data, error } = await supabase
        .rpc('get_stories_with_stats', {
          current_user_id: user?.id || null,
          limit_count: 30
        });

      if (error) {
        // Fallback to basic query
        const { data: basicData, error: basicError } = await supabase
          .from('stories')
          .select(`
            id, title, description, media_url, media_type, duration, story_type,
            location, tags, views_count, created_at, expires_at, author_id,
            author:profiles!stories_author_id_fkey(id, full_name, username, avatar_url)
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(30);
        
        if (basicError) throw basicError;
        const formattedStories = (basicData || []).map(story => {
          const author = story.author as unknown as { id: string; full_name: string; username: string; avatar_url?: string } | null;
          return {
            ...story,
            author: author || { id: '', full_name: 'Unknown', username: 'unknown' }
          };
        });
        setStories(formattedStories);
        return;
      }
      
      setStories(data || []);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (storyData: Partial<Story>) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { error } = await supabase
        .from('stories')
        .insert({
          author_id: user.id,
          title: storyData.title,
          description: storyData.description,
          media_url: storyData.media_url,
          media_type: storyData.media_type,
          duration: storyData.duration,
          file_size: storyData.file_size,
          story_type: storyData.story_type || 'general',
          location: storyData.location,
          tags: storyData.tags,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        })
        .select(`
          *,
          author:profiles!stories_author_id_fkey(id, full_name, username, avatar_url)
        `)
        .single();

      if (error) throw error;
      await loadStories();
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  };

  const reactToStory = async (storyId: string, reactionType: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { error } = await supabase
        .from('story_reactions')
        .upsert({
          story_id: storyId,
          user_id: user.id,
          reaction_type: reactionType
        }, { onConflict: 'story_id,user_id' });

      if (error) throw error;
      
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, user_reaction: reactionType }
          : story
      ));
    } catch (error) {
      console.error('Error reacting to story:', error);
    }
  };

  const removeReaction = async (storyId: string, reactionType: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { error } = await supabase
        .from('story_reactions')
        .delete()
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (error) throw error;
      
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, user_reaction: undefined }
          : story
      ));
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const incrementViews = async (storyId: string) => {
    try {
      const { error } = await supabase.rpc('increment_story_views', { story_id: storyId });
      
      if (error) {
        // Fallback: direct update
        await supabase
          .from('stories')
          .update({ views_count: supabase.rpc('increment', { x: 1 }) })
          .eq('id', storyId);
      }
      
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, views_count: story.views_count + 1 }
          : story
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  return (
    <StoriesContext.Provider value={{
      stories,
      loading,
      createStory,
      loadStories,
      reactToStory,
      removeReaction,
      incrementViews
    }}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error('useStories must be used within StoriesProvider');
  }
  return context;
};