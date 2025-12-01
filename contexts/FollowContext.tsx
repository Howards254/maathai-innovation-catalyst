import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FollowContextType {
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  areFriends: (userId: string) => boolean;
  getFollowers: (userId: string) => Promise<any[]>;
  getFollowing: (userId: string) => Promise<any[]>;
  getFriends: (userId: string) => Promise<any[]>;
  followingIds: Set<string>;
  friendIds: Set<string>;
  loading: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFollowData();
    } else {
      setFollowingIds(new Set());
      setFriendIds(new Set());
      setLoading(false);
    }
  }, [user]);

  const loadFollowData = async () => {
    if (!user) return;
    
    try {
      // Get who I'm following
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingSet = new Set(following?.map(f => f.following_id) || []);
      setFollowingIds(followingSet);

      // Get mutual friends (people who follow me AND I follow them)
      if (following && following.length > 0) {
        const followingIds = following.map(f => f.following_id);
        const { data: mutualFollows } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', user.id)
          .in('follower_id', followingIds);

        setFriendIds(new Set(mutualFollows?.map(f => f.follower_id) || []));
      } else {
        setFriendIds(new Set());
      }
    } catch (error) {
      console.error('Error loading follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    if (!user || userId === user.id) return;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({ 
          follower_id: user.id, 
          following_id: userId,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Follow error:', error);
        return;
      }

      // Update local state
      setFollowingIds(prev => new Set([...prev, userId]));
      
      // Check if they follow me back (making us friends)
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', user.id)
        .single();

      if (data) {
        setFriendIds(prev => new Set([...prev, userId]));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (!error) {
        setFollowingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        setFriendIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const isFollowing = (userId: string) => followingIds.has(userId);
  const areFriends = (userId: string) => friendIds.has(userId);

  const getFollowers = async (userId: string) => {
    const { data } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(id, full_name, avatar_url, bio)')
      .eq('following_id', userId);

    return data?.map(f => f.profiles).filter(Boolean) || [];
  };

  const getFollowing = async (userId: string) => {
    const { data } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(id, full_name, avatar_url, bio)')
      .eq('follower_id', userId);

    return data?.map(f => f.profiles).filter(Boolean) || [];
  };

  const getFriends = async (userId: string) => {
    // Get mutual follows (friends)
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (!following || following.length === 0) return [];

    const followingIds = following.map(f => f.following_id);
    const { data: friends } = await supabase
      .from('follows')
      .select(`
        follower_id,
        profiles!follows_follower_id_fkey(id, username, full_name, avatar_url, bio)
      `)
      .eq('following_id', userId)
      .in('follower_id', followingIds);

    return friends?.map(f => f.profiles).filter(Boolean) || [];
  };

  return (
    <FollowContext.Provider value={{
      followUser,
      unfollowUser,
      isFollowing,
      areFriends,
      getFollowers,
      getFollowing,
      getFriends,
      followingIds,
      friendIds,
      loading
    }}>
      {children}
    </FollowContext.Provider>
  );
}

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) throw new Error('useFollow must be used within FollowProvider');
  return context;
};
