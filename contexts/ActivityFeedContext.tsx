import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: 'tree_planted' | 'campaign_joined' | 'story_posted' | 'event_attended' | 'discussion_created' | 'achievement_earned' | 'follow' | 'group_joined';
  title: string;
  description?: string;
  metadata?: any;
  points_earned: number;
  is_public: boolean;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface LiveChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'flash' | 'community';
  target_value: number;
  current_progress: number;
  points_reward: number;
  badge_reward?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  participant_count: number;
  completion_count: number;
  user_progress?: number;
  user_completed?: boolean;
}

interface ActivityFeedContextType {
  activities: ActivityItem[];
  challenges: LiveChallenge[];
  loading: boolean;
  createActivity: (data: Partial<ActivityItem>) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>;
  loadActivities: () => Promise<void>;
  loadChallenges: () => Promise<void>;
}

const ActivityFeedContext = createContext<ActivityFeedContextType | undefined>(undefined);

export const ActivityFeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [challenges, setChallenges] = useState<LiveChallenge[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && user.id !== 'user-1') {
      loadActivities();
      loadChallenges();
      subscribeToActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:profiles!activity_feed_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('live_challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_time', new Date().toISOString())
        .order('end_time', { ascending: true });

      if (error) throw error;

      // Get user progress for each challenge
      const challengesWithProgress = await Promise.all(
        (data || []).map(async (challenge) => {
          if (!user) return challenge;

          const { data: participation } = await supabase
            .from('challenge_participants')
            .select('progress, completed_at')
            .eq('challenge_id', challenge.id)
            .eq('user_id', user.id)
            .single();

          return {
            ...challenge,
            user_progress: participation?.progress || 0,
            user_completed: !!participation?.completed_at
          };
        })
      );

      setChallenges(challengesWithProgress);
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const createActivity = async (activityData: Partial<ActivityItem>) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .insert({
          ...activityData,
          user_id: user.id
        })
        .select(`
          *,
          user:profiles!activity_feed_user_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      setActivities(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          progress: 0
        });

      // Update participant count
      await supabase
        .from('live_challenges')
        .update({ participant_count: supabase.sql`participant_count + 1` })
        .eq('id', challengeId);

      await loadChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const updateChallengeProgress = async (challengeId: string, progress: number) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const isCompleted = progress >= challenge.target_value;
      const updateData: any = { progress };
      
      if (isCompleted && !challenge.user_completed) {
        updateData.completed_at = new Date().toISOString();
        updateData.points_earned = challenge.points_reward;
      }

      await supabase
        .from('challenge_participants')
        .update(updateData)
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      // Update challenge progress
      await supabase
        .from('live_challenges')
        .update({ 
          current_progress: supabase.sql`current_progress + ${progress - (challenge.user_progress || 0)}`,
          completion_count: isCompleted && !challenge.user_completed 
            ? supabase.sql`completion_count + 1` 
            : supabase.sql`completion_count`
        })
        .eq('id', challengeId);

      // Award points to user if completed
      if (isCompleted && !challenge.user_completed) {
        await supabase.rpc('add_user_points', {
          user_id: user.id,
          points_to_add: challenge.points_reward
        });

        // Create activity entry
        await createActivity({
          activity_type: 'achievement_earned',
          title: `Completed challenge: ${challenge.title}`,
          description: `Earned ${challenge.points_reward} points`,
          metadata: { challenge_id: challengeId, points: challenge.points_reward },
          points_earned: challenge.points_reward
        });
      }

      await loadChallenges();
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  const subscribeToActivities = () => {
    const channel = supabase
      .channel('activity_feed')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'activity_feed',
          filter: 'is_public=eq.true'
        }, 
        () => loadActivities()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  return (
    <ActivityFeedContext.Provider value={{
      activities,
      challenges,
      loading,
      createActivity,
      joinChallenge,
      updateChallengeProgress,
      loadActivities,
      loadChallenges
    }}>
      {children}
    </ActivityFeedContext.Provider>
  );
};

export const useActivityFeed = () => {
  const context = useContext(ActivityFeedContext);
  if (!context) {
    throw new Error('useActivityFeed must be used within ActivityFeedProvider');
  }
  return context;
};