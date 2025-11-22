import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { getUserAvatar } from '../utils/imageUtils';
import { migrateExistingData } from '../utils/dataMigration';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run data migration once
    const migrationRun = localStorage.getItem('migration_v5_completed');
    if (!migrationRun) {
      migrateExistingData();
      localStorage.setItem('migration_v5_completed', 'true');
    }

    // Check for existing session
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // Check stored users
    const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const foundUser = storedUsers.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
    } else if (email === 'demo@example.com' && password === 'password') {
      // Demo user fallback
      const mockUser: User = {
        id: 'user-1',
        username: 'eco_warrior',
        fullName: 'Wangari Demo',
        avatarUrl: getUserAvatar('user-1'),
        impactPoints: 1250,
        badges: ['Early Adopter', 'Tree Hugger'],
        role: 'admin'
      };
      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    setLoading(true);
    
    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const existingUser = storedUsers.find((u: any) => u.email === email || u.username === username);
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    
    const userId = `user-${Date.now()}`;
    const newUser = {
      id: userId,
      email,
      password,
      username,
      fullName,
      avatarUrl: getUserAvatar(userId),
      impactPoints: 0,
      badges: ['Early Adopter'],
      role: 'user' as const
    };
    
    // Store user credentials
    storedUsers.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(storedUsers));
    
    // Set current user (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
    setLoading(false);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};