import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign, CampaignUpdate, TreePlantingSubmission } from '../types';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';
import { getCampaignImage, getOrganizerAvatar } from '../utils/imageUtils';

interface CampaignContextType {
  campaigns: Campaign[];
  submissions: TreePlantingSubmission[];
  loading: boolean;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'plantedTrees' | 'daysLeft' | 'organizerId' | 'organizerAvatar' | 'participants' | 'pendingParticipants' | 'updates' | 'completionPhotos' | 'isCompletionPending' | 'createdAt'>) => Promise<void>;
  joinCampaign: (campaignId: string) => Promise<void>;
  approveMember: (campaignId: string, userId: string) => Promise<void>;
  rejectMember: (campaignId: string, userId: string) => Promise<void>;
  submitTreePlanting: (submission: Omit<TreePlantingSubmission, 'id' | 'createdAt' | 'status' | 'userName' | 'userAvatar'>) => Promise<void>;
  approveSubmission: (submissionId: string) => Promise<void>;
  rejectSubmission: (submissionId: string) => Promise<void>;
  addUpdate: (campaignId: string, update: Omit<CampaignUpdate, 'id' | 'campaignId' | 'createdAt'>) => Promise<void>;
  editCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<void>;
  cancelCampaign: (campaignId: string) => Promise<void>;
  completeCampaign: (campaignId: string, completionPhotos: string[]) => Promise<void>;
  approveCompletion: (campaignId: string) => Promise<void>;
  getCampaign: (id: string) => Campaign | undefined;
  getCampaignSubmissions: (campaignId: string) => TreePlantingSubmission[];
  getUserSubmissions: (userId: string) => TreePlantingSubmission[];
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaigns must be used within CampaignProvider');
  }
  return context;
};

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<TreePlantingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { awardPoints } = useUsers();

  // Load campaigns from localStorage only (no mock data)
  useEffect(() => {
    const saved = localStorage.getItem('campaigns');
    const savedSubmissions = localStorage.getItem('submissions');
    
    if (saved) {
      setCampaigns(JSON.parse(saved));
    } else {
      setCampaigns([]);
    }
    
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
    
    setLoading(false);
  }, []);

  const saveCampaigns = (newCampaigns: Campaign[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('campaigns', JSON.stringify(newCampaigns));
  };

  const saveSubmissions = (newSubmissions: TreePlantingSubmission[]) => {
    setSubmissions(newSubmissions);
    localStorage.setItem('submissions', JSON.stringify(newSubmissions));
  };

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'plantedTrees' | 'daysLeft' | 'organizerId' | 'organizerAvatar' | 'participants' | 'pendingParticipants' | 'updates' | 'completionPhotos' | 'isCompletionPending' | 'createdAt'>) => {
    if (!user) return;

    const endDate = new Date(campaignData.endDate);
    const startDate = new Date(campaignData.startDate);
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    const campaignId = `c${Date.now()}`;
    const newCampaign: Campaign = {
      ...campaignData,
      id: campaignId,
      imageUrl: campaignData.imageUrl || getCampaignImage(campaignId),
      plantedTrees: 0,
      daysLeft,
      organizerId: user.id,
      organizerAvatar: getOrganizerAvatar(user.id),
      participants: [],
      pendingParticipants: [],
      updates: [],
      completionPhotos: [],
      isCompletionPending: false,
      createdAt: new Date().toISOString()
    };
    
    const newCampaigns = [newCampaign, ...campaigns];
    saveCampaigns(newCampaigns);
  };

  const joinCampaign = async (campaignId: string) => {
    if (!user) return;

    const newCampaigns = campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        if (campaign.isPublic) {
          return {
            ...campaign,
            participants: [...campaign.participants, user.id]
          };
        } else {
          return {
            ...campaign,
            pendingParticipants: [...campaign.pendingParticipants, user.id]
          };
        }
      }
      return campaign;
    });
    saveCampaigns(newCampaigns);
  };

  const approveMember = async (campaignId: string, userId: string) => {
    const newCampaigns = campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          participants: [...campaign.participants, userId],
          pendingParticipants: campaign.pendingParticipants.filter(id => id !== userId)
        };
      }
      return campaign;
    });
    saveCampaigns(newCampaigns);
  };

  const rejectMember = async (campaignId: string, userId: string) => {
    const newCampaigns = campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          pendingParticipants: campaign.pendingParticipants.filter(id => id !== userId)
        };
      }
      return campaign;
    });
    saveCampaigns(newCampaigns);
  };

  const submitTreePlanting = async (submissionData: Omit<TreePlantingSubmission, 'id' | 'createdAt' | 'status' | 'userName' | 'userAvatar'>) => {
    if (!user) return;

    const newSubmission: TreePlantingSubmission = {
      ...submissionData,
      id: `s${Date.now()}`,
      userName: user.fullName,
      userAvatar: user.avatarUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const newSubmissions = [newSubmission, ...submissions];
    saveSubmissions(newSubmissions);
  };

  const approveSubmission = async (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    const newSubmissions = submissions.map(s => 
      s.id === submissionId 
        ? { ...s, status: 'approved' as const, approvedAt: new Date().toISOString() }
        : s
    );
    saveSubmissions(newSubmissions);

    const newCampaigns = campaigns.map(campaign => {
      if (campaign.id === submission.campaignId) {
        return {
          ...campaign,
          plantedTrees: campaign.plantedTrees + submission.treesCount
        };
      }
      return campaign;
    });
    saveCampaigns(newCampaigns);

    // Award points for tree planting (10 points per tree)
    const pointsEarned = submission.treesCount * 10;
    awardPoints(submission.userId, pointsEarned, 'tree_planting');
  };

  const rejectSubmission = async (submissionId: string) => {
    const newSubmissions = submissions.map(s => 
      s.id === submissionId 
        ? { ...s, status: 'rejected' as const }
        : s
    );
    saveSubmissions(newSubmissions);
  };

  const addUpdate = async (campaignId: string, updateData: Omit<CampaignUpdate, 'id' | 'campaignId' | 'createdAt'>) => {
    const newUpdate: CampaignUpdate = {
      ...updateData,
      id: `u${Date.now()}`,
      campaignId,
      createdAt: new Date().toISOString()
    };

    const newCampaigns = campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          updates: [newUpdate, ...campaign.updates]
        };
      }
      return campaign;
    });
    saveCampaigns(newCampaigns);
  };

  const editCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    const newCampaigns = campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, ...updates }
        : campaign
    );
    saveCampaigns(newCampaigns);
  };

  const cancelCampaign = async (campaignId: string) => {
    const newCampaigns = campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: 'cancelled' as const }
        : campaign
    );
    saveCampaigns(newCampaigns);
  };

  const completeCampaign = async (campaignId: string, completionPhotos: string[]) => {
    const newCampaigns = campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            status: 'completed' as const,
            completionPhotos,
            isCompletionPending: true
          }
        : campaign
    );
    saveCampaigns(newCampaigns);
  };

  const approveCompletion = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const newCampaigns = campaigns.map(c => 
      c.id === campaignId 
        ? { ...c, isCompletionPending: false }
        : c
    );
    saveCampaigns(newCampaigns);

    // Award points to all participants
    const pointsPerParticipant = Math.floor(campaign.plantedTrees * 2);
    campaign.participants.forEach(participantId => {
      if (participantId === user?.id) {
        awardPoints(user.id, pointsPerParticipant, 'campaign_completed');
      }
    });
    
    // Award organizer bonus points
    if (campaign.organizerId === user?.id) {
      awardPoints(user.id, pointsPerParticipant * 2, 'campaign_organized');
    }
  };

  const getCampaign = (id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  };

  const getCampaignSubmissions = (campaignId: string) => {
    return submissions.filter(submission => submission.campaignId === campaignId);
  };

  const getUserSubmissions = (userId: string) => {
    return submissions.filter(submission => submission.userId === userId);
  };

  const value = {
    campaigns,
    submissions,
    loading,
    createCampaign,
    joinCampaign,
    approveMember,
    rejectMember,
    submitTreePlanting,
    approveSubmission,
    rejectSubmission,
    addUpdate,
    editCampaign,
    cancelCampaign,
    completeCampaign,
    approveCompletion,
    getCampaign,
    getCampaignSubmissions,
    getUserSubmissions
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};