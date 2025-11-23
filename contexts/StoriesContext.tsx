import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

interface Story {
  id: string;
  user_id: string;
  story_type: 'image' | 'video';
  media_url: string;
  caption: string;
  location?: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
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
  }, [user]);

  const loadStories = async () => {
    // Disabled until stories table is properly set up
    setLoading(false);
    setStories([]);
  };

  const createStory = async (storyData: Partial<Story>) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          ...storyData,
          user_id: user.id
        })
        .select(`
          *,
          user:profiles!stories_user_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      setStories(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error creating story:', error);
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