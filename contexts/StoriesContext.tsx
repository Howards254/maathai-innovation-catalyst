import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

interface Story {
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
  };
  reactions?: any[];
  comments?: any[];
}

interface StoriesContextType {
  stories: Story[];
  loading: boolean;
  createStory: (data: Partial<Story>) => Promise<void>;
  loadStories: () => Promise<void>;
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
  }, [user?.id]);

  const loadStories = async () => {
    setLoading(true);
    try {
      // Use regular query for compatibility
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles!stories_author_id_fkey(id, full_name, username, avatar_url),
          reactions:story_reactions(id, user_id, reaction_type),
          comments:story_comments(id, author_id, content)
        `)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
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
      const { data, error } = await supabase
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
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          is_archived: false
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

  return (
    <StoriesContext.Provider value={{
      stories,
      loading,
      createStory,
      loadStories
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