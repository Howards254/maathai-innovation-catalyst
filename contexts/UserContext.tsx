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
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  const { updateProfile, users } = context;
  
  // Always use the authenticated user from Supabase
  if (authUser) {
    // Try to get user from profiles table first, fallback to auth metadata
    const profileUser = users.find(u => u.id === authUser.id);
    
    if (profileUser) {
      return { user: profileUser, updateProfile };
    }
    
    // Build clean user object from auth metadata
    const username = typeof authUser.user_metadata?.username === 'string' 
      ? authUser.user_metadata.username 
      : (authUser.email ? authUser.email.split('@')[0] : 'user');
    
    const fullName = typeof authUser.user_metadata?.full_name === 'string'
      ? authUser.user_metadata.full_name
      : (authUser.email || 'User');
    
    const avatarUrl = typeof authUser.user_metadata?.avatar_url === 'string'
      ? authUser.user_metadata.avatar_url
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`;
    
    const impactPoints = typeof authUser.user_metadata?.impact_points === 'number'
      ? authUser.user_metadata.impact_points
      : 0;
    
    const badges: string[] = [];
    
    return {
      user: {
        id: String(authUser.id),
        username,
        fullName,
        avatarUrl,
        impactPoints,
        badges,
        role: 'user' as const
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

  useEffect(() => {
    // Reload users when current user changes
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, impact_points, role')
        .order('impact_points', { ascending: false });
      
      if (error) {
        console.log('Profiles table not found, using auth users only');
        setUsers([]);
        return;
      }
      
      const formattedUsers = (data || []).map(profile => {
        // Ensure all values are primitives, not objects
        const username = typeof profile.username === 'string' ? profile.username : 'user';
        const fullName = typeof profile.full_name === 'string' ? profile.full_name : 'User';
        const avatarUrl = typeof profile.avatar_url === 'string' ? profile.avatar_url : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`;
        const impactPoints = typeof profile.impact_points === 'number' ? profile.impact_points : 0;
        const badges: string[] = [];
        const role = profile.role === 'admin' ? 'admin' : 'user';
        
        return {
          id: String(profile.id),
          username,
          fullName,
          avatarUrl,
          impactPoints,
          badges,
          role
        };
      });
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
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
        .select('impact_points')
        .eq('id', userId)
        .single();
      
      if (profile) {
        const newPoints = (profile.impact_points || 0) + points;
        
        await supabase
          .from('profiles')
          .update({ impact_points: newPoints })
          .eq('id', userId);
        
        // Reload users
        loadUsers();
      } else {
        // If profiles table doesn't exist, update auth metadata
        if (userId === currentUser?.id) {
          const currentPoints = currentUser.user_metadata?.impact_points || 0;
          const newPoints = currentPoints + points;
          
          await supabase.auth.updateUser({
            data: {
              ...currentUser.user_metadata,
              impact_points: newPoints
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