import React, { createContext, useContext, useState, useEffect } from 'react';
import { Innovation, InnovationHubSettings } from '../types';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';

interface InnovationContextType {
  innovations: Innovation[];
  hubSettings: InnovationHubSettings;
  loading: boolean;
  createInnovation: (innovation: Omit<Innovation, 'id' | 'creatorId' | 'creatorName' | 'status' | 'createdAt' | 'updatedAt' | 'currentFunding'>) => Promise<void>;
  updateInnovation: (id: string, updates: Partial<Innovation>) => Promise<void>;
  approveInnovation: (id: string) => Promise<void>;
  rejectInnovation: (id: string, reason: string) => Promise<void>;
  toggleHub: (isOpen: boolean) => Promise<void>;
  updateHubSettings: (settings: Partial<InnovationHubSettings>) => Promise<void>;
  getApprovedInnovations: () => Innovation[];
  getPendingInnovations: () => Innovation[];
  getUserInnovations: (userId: string) => Innovation[];
}

const InnovationContext = createContext<InnovationContextType | undefined>(undefined);

export const useInnovations = () => {
  const context = useContext(InnovationContext);
  if (!context) {
    throw new Error('useInnovations must be used within InnovationProvider');
  }
  return context;
};

export const InnovationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [hubSettings, setHubSettings] = useState<InnovationHubSettings>({
    isOpen: true,
    description: 'Submit your innovative wood-free products and DAT solutions to help combat deforestation.',
    guidelines: [
      'Focus on wood-free alternatives or deforestation-addressing technologies',
      'Provide detailed business plan and implementation strategy',
      'Include realistic funding goals and timelines',
      'Demonstrate environmental impact potential'
    ]
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { awardPoints } = useUsers();

  useEffect(() => {
    const mockInnovations: Innovation[] = [
      {
        id: 'i1',
        title: 'Bamboo Fiber Building Materials',
        description: 'Revolutionary bamboo-based construction materials that replace traditional wood in building applications.',
        category: 'Wood-Free Products',
        fundingGoal: 50000,
        currentFunding: 12500,
        imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
        creatorId: 'user-2',
        creatorName: 'John Planter',
        status: 'approved',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        tags: ['Bamboo', 'Construction', 'Sustainable'],
        contactEmail: 'john@example.com'
      }
    ];

    const saved = localStorage.getItem('innovations');
    const savedSettings = localStorage.getItem('innovation_hub_settings');
    
    if (saved) {
      setInnovations(JSON.parse(saved));
    } else {
      setInnovations(mockInnovations);
      localStorage.setItem('innovations', JSON.stringify(mockInnovations));
    }

    if (savedSettings) {
      setHubSettings(JSON.parse(savedSettings));
    } else {
      localStorage.setItem('innovation_hub_settings', JSON.stringify(hubSettings));
    }
    
    setLoading(false);
  }, []);

  const saveInnovations = (newInnovations: Innovation[]) => {
    setInnovations(newInnovations);
    localStorage.setItem('innovations', JSON.stringify(newInnovations));
  };

  const saveHubSettings = (newSettings: InnovationHubSettings) => {
    setHubSettings(newSettings);
    localStorage.setItem('innovation_hub_settings', JSON.stringify(newSettings));
  };

  const createInnovation = async (innovationData: Omit<Innovation, 'id' | 'creatorId' | 'creatorName' | 'status' | 'createdAt' | 'updatedAt' | 'currentFunding'>) => {
    if (!user) return;

    const newInnovation: Innovation = {
      ...innovationData,
      id: `i${Date.now()}`,
      creatorId: user.id,
      creatorName: user.fullName,
      status: 'pending',
      currentFunding: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newInnovations = [...innovations, newInnovation];
    saveInnovations(newInnovations);
    
    // Award points for innovation submission
    awardPoints(user.id, 50, 'innovation_submitted');
  };

  const updateInnovation = async (id: string, updates: Partial<Innovation>) => {
    const newInnovations = innovations.map(innovation =>
      innovation.id === id
        ? { ...innovation, ...updates, updatedAt: new Date().toISOString() }
        : innovation
    );
    saveInnovations(newInnovations);
  };

  const approveInnovation = async (id: string) => {
    const innovation = innovations.find(i => i.id === id);
    await updateInnovation(id, { status: 'approved', rejectionReason: undefined });
    
    // Award bonus points for approved innovation
    if (innovation) {
      awardPoints(innovation.creatorId, 100, 'innovation_approved');
    }
  };

  const rejectInnovation = async (id: string, reason: string) => {
    await updateInnovation(id, { status: 'rejected', rejectionReason: reason });
  };

  const toggleHub = async (isOpen: boolean) => {
    const newSettings = { ...hubSettings, isOpen };
    saveHubSettings(newSettings);
  };

  const updateHubSettings = async (settings: Partial<InnovationHubSettings>) => {
    const newSettings = { ...hubSettings, ...settings };
    saveHubSettings(newSettings);
  };

  const getApprovedInnovations = () => {
    return innovations.filter(innovation => innovation.status === 'approved');
  };

  const getPendingInnovations = () => {
    return innovations.filter(innovation => innovation.status === 'pending');
  };

  const getUserInnovations = (userId: string) => {
    return innovations.filter(innovation => innovation.creatorId === userId);
  };

  const value = {
    innovations,
    hubSettings,
    loading,
    createInnovation,
    updateInnovation,
    approveInnovation,
    rejectInnovation,
    toggleHub,
    updateHubSettings,
    getApprovedInnovations,
    getPendingInnovations,
    getUserInnovations
  };

  return (
    <InnovationContext.Provider value={value}>
      {children}
    </InnovationContext.Provider>
  );
};