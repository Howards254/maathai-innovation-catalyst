import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface UserContextType {
  users: User[];
  updateProfile: (updates: Partial<User>) => Promise<void>;
  awardPoints: (userId: string, points: number, action: string) => void;
  getLeaderboard: () => User[];
  getUserById: (id: string) => User | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within UserProvider');
  }
  return context;
};

export const useUser = () => {
  const { user: authUser } = useAuth();
  const { updateProfile, users } = useUsers();
  
  // Always use the authenticated user from Supabase
  if (authUser) {
    // Try to get user from profiles table first, fallback to auth metadata
    const profileUser = users.find(u => u.id === authUser.id);
    
    return {
      user: profileUser || {
        id: authUser.id,
        username: authUser.user_metadata?.username || (authUser.email ? authUser.email.split('@')[0] : 'user'),
        fullName: authUser.user_metadata?.full_name || authUser.email || 'User',
        avatarUrl: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
        impactPoints: authUser.user_metadata?.impact_points || 0,
        badges: authUser.user_metadata?.badges || [],
        role: authUser.user_metadata?.role || 'user'
      },
      updateProfile
    };
  }
  
  // Return null if no authenticated user
  return {
    user: null,
    updateProfile
  };
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // Load users from Supabase profiles table
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('impact_points', { ascending: false });
      
      if (error) {
        console.log('Profiles table not found, using auth users only');
        // If profiles table doesn't exist, create mock users for demo
        const mockUsers = [
          {
            id: 'user-1',
            username: 'eco_warrior',
            fullName: 'Wangari Demo',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user-1',
            impactPoints: 1250,
            badges: ['Early Adopter', 'Tree Hugger'],
            role: 'user'
          },
          {
            id: 'user-2',
            username: 'project_lead',
            fullName: 'John Smith',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user-2',
            impactPoints: 2100,
            badges: ['Early Adopter', 'Tree Hugger', 'Forest Guardian'],
            role: 'user'
          }
        ];
        setUsers(mockUsers);
        return;
      }
      
      const formattedUsers = (data || []).map(profile => ({
        id: profile.id,
        username: profile.username || (profile.email ? profile.email.split('@')[0] : 'user'),
        fullName: profile.full_name || profile.email || 'User',
        avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
        impactPoints: profile.impact_points || 0,
        badges: profile.badges || [],
        role: profile.role || 'user'
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    
    try {
      // Update Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentUser.user_metadata,
          full_name: updates.fullName,
          username: updates.username,
          impact_points: updates.impactPoints,
          badges: updates.badges,
          role: updates.role
        }
      });
      
      if (error) throw error;
      
      // Also try to update profiles table if it exists
      await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          username: updates.username,
          full_name: updates.fullName,
          impact_points: updates.impactPoints,
          badges: updates.badges,
          role: updates.role
        });
        
      // Reload users
      loadUsers();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const awardPoints = async (userId: string, points: number, action: string) => {
    try {
      // Try to update points in Supabase profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('impact_points, badges')
        .eq('id', userId)
        .single();
      
      if (profile) {
        const newPoints = (profile.impact_points || 0) + points;
        const newBadges = [...(profile.badges || [])];
        
        // Award badges based on points
        if (newPoints >= 100 && !newBadges.includes('Tree Hugger')) {
          newBadges.push('Tree Hugger');
        }
        if (newPoints >= 500 && !newBadges.includes('Forest Guardian')) {
          newBadges.push('Forest Guardian');
        }
        if (newPoints >= 1000 && !newBadges.includes('Eco Warrior')) {
          newBadges.push('Eco Warrior');
        }
        if (newPoints >= 2000 && !newBadges.includes('Planet Protector')) {
          newBadges.push('Planet Protector');
        }
        if (newPoints >= 5000 && !newBadges.includes('Environmental Champion')) {
          newBadges.push('Environmental Champion');
        }
        
        await supabase
          .from('profiles')
          .update({ 
            impact_points: newPoints, 
            badges: newBadges 
          })
          .eq('id', userId);
        
        // Reload users
        loadUsers();
      } else {
        // If profiles table doesn't exist, update auth metadata
        if (userId === currentUser?.id) {
          const currentPoints = currentUser.user_metadata?.impact_points || 0;
          const newPoints = currentPoints + points;
          const currentBadges = currentUser.user_metadata?.badges || [];
          const newBadges = [...currentBadges];
          
          // Award badges based on points
          if (newPoints >= 100 && !newBadges.includes('Tree Hugger')) {
            newBadges.push('Tree Hugger');
          }
          if (newPoints >= 500 && !newBadges.includes('Forest Guardian')) {
            newBadges.push('Forest Guardian');
          }
          if (newPoints >= 1000 && !newBadges.includes('Eco Warrior')) {
            newBadges.push('Eco Warrior');
          }
          if (newPoints >= 2000 && !newBadges.includes('Planet Protector')) {
            newBadges.push('Planet Protector');
          }
          if (newPoints >= 5000 && !newBadges.includes('Environmental Champion')) {
            newBadges.push('Environmental Champion');
          }
          
          await supabase.auth.updateUser({
            data: {
              ...currentUser.user_metadata,
              impact_points: newPoints,
              badges: newBadges
            }
          });
        }
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };
  
  const updateChallengeProgress = async (action: string, userId: string) => {
    // This would integrate with a proper challenge tracking system
    console.log(`Challenge progress updated for ${userId}: ${action}`);
  };

  const getLeaderboard = () => {
    return [...users].sort((a, b) => b.impactPoints - a.impactPoints);
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const value = {
    users,
    updateProfile,
    awardPoints,
    getLeaderboard,
    getUserById
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};