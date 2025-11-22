import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from './AuthContext';
import { getUserAvatar } from '../utils/imageUtils';

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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // Initialize with mock users
    const mockUsers: User[] = [
      {
        id: 'user-1',
        username: 'eco_warrior',
        fullName: 'Wangari Demo',
        avatarUrl: getUserAvatar('user-1'),
        impactPoints: 1250,
        badges: ['Early Adopter', 'Tree Hugger'],
        role: 'admin'
      },
      {
        id: 'user-2',
        username: 'green_thumb',
        fullName: 'John Planter',
        avatarUrl: getUserAvatar('user-2'),
        impactPoints: 2100,
        badges: ['Early Adopter', 'Tree Hugger', 'Forest Guardian'],
        role: 'user'
      },
      {
        id: 'user-3',
        username: 'nature_lover',
        fullName: 'Sarah Green',
        avatarUrl: getUserAvatar('user-3'),
        impactPoints: 890,
        badges: ['Early Adopter'],
        role: 'user'
      }
    ];

    const saved = localStorage.getItem('users');
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      setUsers(mockUsers);
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    
    const newUsers = users.map(user =>
      user.id === currentUser.id ? { ...user, ...updates } : user
    );
    saveUsers(newUsers);
  };

  const awardPoints = (userId: string, points: number, action: string) => {
    const newUsers = users.map(user => {
      if (user.id === userId) {
        const newPoints = user.impactPoints + points;
        const newBadges = [...user.badges];
        
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
        
        return { ...user, impactPoints: newPoints, badges: newBadges };
      }
      return user;
    });
    
    saveUsers(newUsers);
    
    // Update gamification challenges based on action
    updateChallengeProgress(action, userId);
    
    console.log(`Awarded ${points} points to user ${userId} for ${action}`);
  };
  
  const updateChallengeProgress = (action: string, userId: string) => {
    // This would integrate with GamificationContext
    // For now, we'll store challenge updates in localStorage
    const challengeUpdates = JSON.parse(localStorage.getItem(`challenge_updates_${userId}`) || '{}');
    
    switch (action) {
      case 'tree_planting':
        challengeUpdates['daily-trees'] = (challengeUpdates['daily-trees'] || 0) + 1;
        challengeUpdates['milestone-100-trees'] = (challengeUpdates['milestone-100-trees'] || 0) + 1;
        break;
      case 'discussion_created':
      case 'comment_created':
        challengeUpdates['daily-discussion'] = (challengeUpdates['daily-discussion'] || 0) + 1;
        challengeUpdates['milestone-10-discussions'] = (challengeUpdates['milestone-10-discussions'] || 0) + 1;
        break;
      case 'discussion_voted':
        challengeUpdates['daily-vote'] = (challengeUpdates['daily-vote'] || 0) + 1;
        break;
    }
    
    localStorage.setItem(`challenge_updates_${userId}`, JSON.stringify(challengeUpdates));
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