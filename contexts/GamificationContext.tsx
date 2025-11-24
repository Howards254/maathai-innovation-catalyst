import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  points: number;
  completed: boolean;
  type: 'daily' | 'weekly' | 'milestone';
  expiresAt?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface GamificationContextType {
  challenges: Challenge[];
  achievements: Achievement[];
  updateProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;
  getDailyChallenges: () => Challenge[];
  getStreakCount: () => number;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { user } = useAuth();
  const { awardPoints } = useUsers();

  useEffect(() => {
    // Initialize daily challenges
    const today = new Date().toDateString();
    const dailyChallenges: Challenge[] = [
      {
        id: 'daily-trees',
        title: 'Plant Trees Today',
        description: 'Log 3 newly planted trees',
        target: 3,
        progress: 0,
        points: 50,
        completed: false,
        type: 'daily',
        expiresAt: today
      },
      {
        id: 'daily-discussion',
        title: 'Share Knowledge',
        description: 'Create or comment on 2 discussions',
        target: 2,
        progress: 0,
        points: 30,
        completed: false,
        type: 'daily',
        expiresAt: today
      },
      {
        id: 'daily-vote',
        title: 'Community Engagement',
        description: 'Vote on 5 discussions',
        target: 5,
        progress: 0,
        points: 20,
        completed: false,
        type: 'daily',
        expiresAt: today
      }
    ];

    const milestones: Challenge[] = [
      {
        id: 'milestone-100-trees',
        title: 'Century Planter',
        description: 'Plant 100 trees total',
        target: 100,
        progress: 0,
        points: 500,
        completed: false,
        type: 'milestone'
      },
      {
        id: 'milestone-10-discussions',
        title: 'Community Leader',
        description: 'Create 10 discussions',
        target: 10,
        progress: 0,
        points: 200,
        completed: false,
        type: 'milestone'
      }
    ];

    const saved = localStorage.getItem(`challenges_${user?.id}`);
    if (saved) {
      setChallenges(JSON.parse(saved));
    } else {
      setChallenges([...dailyChallenges, ...milestones]);
    }
  }, [user]);

  const saveChallenges = (newChallenges: Challenge[]) => {
    setChallenges(newChallenges);
    if (user) {
      localStorage.setItem(`challenges_${user.id}`, JSON.stringify(newChallenges));
    }
  };

  const updateProgress = (challengeId: string, progress: number) => {
    const newChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        const newProgress = Math.min(challenge.target, challenge.progress + progress);
        const completed = newProgress >= challenge.target;
        
        if (completed && user) {
          awardPoints(user.id, challenge.points, `challenge_${challengeId}`);
          
          // Add achievement
          const newAchievement: Achievement = {
            id: `achievement_${challengeId}`,
            title: challenge.title,
            description: `Completed: ${challenge.description}`,
            icon: '🏆',
            unlockedAt: new Date().toISOString()
          };
          setAchievements(prev => [...prev, newAchievement]);
        }
        
        return { ...challenge, progress: newProgress, completed };
      }
      return challenge;
    });
    
    saveChallenges(newChallenges);
  };

  const completeChallenge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      updateProgress(challengeId, challenge.target - challenge.progress);
    }
  };

  const getDailyChallenges = () => {
    return challenges.filter(c => c.type === 'daily');
  };

  const getStreakCount = () => {
    // Mock streak calculation - in real app would track daily activity
    return Math.floor(Math.random() * 15) + 1;
  };

  const value = {
    challenges,
    achievements,
    updateProgress,
    completeChallenge,
    getDailyChallenges,
    getStreakCount
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};