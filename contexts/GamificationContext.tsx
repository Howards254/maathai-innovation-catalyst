import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
}

interface UserBadge {
  badge: Badge;
  earned_at: string;
}

interface LeaderboardEntry {
  id: string;
  full_name: string;
  avatar_url: string;
  impact_points: number;
  rank: number;
}

interface GamificationContextType {
  badges: Badge[];
  userBadges: UserBadge[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  loadLeaderboard: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used within GamificationProvider');
  return context;
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadBadges();
      loadUserBadges();
      loadLeaderboard();
    }
  }, [user]);

  const loadBadges = async () => {
    try {
      const { data } = await supabase
        .from('badges')
        .select('*')
        .order('points_required', { ascending: true });

      setBadges(data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const loadUserBadges = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      setUserBadges(data || []);
    } catch (error) {
      console.error('Error loading user badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, impact_points')
        .order('impact_points', { ascending: false })
        .limit(100);

      const ranked = (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      setLeaderboard(ranked);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  return (
    <GamificationContext.Provider value={{
      badges,
      userBadges,
      leaderboard,
      loading,
      loadLeaderboard
    }}>
      {children}
    </GamificationContext.Provider>
  );
};
