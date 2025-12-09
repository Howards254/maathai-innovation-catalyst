import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign, CampaignUpdate, TreePlantingSubmission } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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

  // Load campaigns from Supabase
  useEffect(() => {
    if (user) {
      loadCampaigns();
      loadSubmissions();
      
      // Real-time subscriptions
      const campaignsSubscription = supabase
        .channel('campaigns_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => {
          loadCampaigns();
        })
        .subscribe();
      
      const submissionsSubscription = supabase
        .channel('submissions_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tree_submissions' }, () => {
          loadSubmissions();
        })
        .subscribe();
      
      return () => {
        campaignsSubscription.unsubscribe();
        submissionsSubscription.unsubscribe();
      };
    }
  }, [user]);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          organizer:profiles!campaigns_organizer_id_fkey(id, full_name, username, avatar_url),
          participants:campaign_participants(user_id)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedCampaigns = data?.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        targetTrees: campaign.goal_trees,
        plantedTrees: campaign.current_trees,
        location: campaign.location,
        latitude: campaign.latitude,
        longitude: campaign.longitude,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        status: campaign.status,
        imageUrl: campaign.image_url,
        organizerId: campaign.organizer_id,
        organizer: campaign.organizer?.full_name || 'Unknown',
        organizerAvatar: campaign.organizer?.avatar_url || '',
        isPublic: campaign.is_public,
        tags: campaign.tags || [],
        participants: campaign.participants?.map((p: any) => p.user_id) || [],
        pendingParticipants: [],
        updates: [],
        completionPhotos: campaign.completion_photos || [],
        isCompletionPending: campaign.is_completion_pending,
        createdAt: campaign.created_at,
        daysLeft: Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      })) || [];
      
      setCampaigns(formattedCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('tree_submissions')
        .select(`
          *,
          user:profiles!tree_submissions_user_id_fkey(id, full_name, username, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedSubmissions = data?.map(sub => ({
        id: sub.id,
        campaignId: sub.campaign_id,
        userId: sub.user_id,
        userName: sub.user?.full_name || 'Unknown',
        userAvatar: sub.user?.avatar_url || '',
        treesCount: sub.trees_count,
        location: sub.location,
        latitude: sub.latitude,
        longitude: sub.longitude,
        description: sub.description,
        photoUrl: sub.photo_url,
        status: sub.status,
        approvedAt: sub.approved_at,
        createdAt: sub.created_at
      })) || [];
      
      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'plantedTrees' | 'daysLeft' | 'organizerId' | 'organizerAvatar' | 'participants' | 'pendingParticipants' | 'updates' | 'completionPhotos' | 'isCompletionPending' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          title: campaignData.title,
          description: campaignData.description,
          goal_trees: campaignData.targetTrees,
          current_trees: 0,
          location: campaignData.location,
          latitude: campaignData.latitude,
          longitude: campaignData.longitude,
          start_date: campaignData.startDate,
          end_date: campaignData.endDate,
          status: campaignData.status,
          image_url: campaignData.imageUrl,
          organizer_id: user.id,
          is_public: campaignData.isPublic,
          tags: campaignData.tags
        });
      
      if (error) throw error;
      await loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };

  const joinCampaign = async (campaignId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaignId,
          user_id: user.id
        });
      
      if (error) throw error;
      await loadCampaigns();
    } catch (error) {
      console.error('Error joining campaign:', error);
      throw error;
    }
  };

  const approveMember = async (campaignId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaignId,
          user_id: userId
        });
      
      if (error) throw error;
      await loadCampaigns();
    } catch (error) {
      console.error('Error approving member:', error);
      throw error;
    }
  };

  const rejectMember = async (campaignId: string, userId: string) => {
    // For now, just a placeholder since we need pending_participants table
    console.log('Reject member:', userId);
  };

  const submitTreePlanting = async (submissionData: Omit<TreePlantingSubmission, 'id' | 'createdAt' | 'status' | 'userName' | 'userAvatar'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tree_submissions')
        .insert({
          campaign_id: submissionData.campaignId,
          user_id: user.id,
          trees_count: submissionData.treesCount,
          location: submissionData.location,
          latitude: submissionData.latitude,
          longitude: submissionData.longitude,
          description: submissionData.description,
          photo_url: submissionData.photoUrl,
          status: 'pending'
        });
      
      if (error) throw error;
      await loadSubmissions();
    } catch (error) {
      console.error('Error submitting tree planting:', error);
      throw error;
    }
  };

  const approveSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('tree_submissions')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', submissionId);
      
      if (error) throw error;
      
      // Award points via user_activities
      const submission = submissions.find(s => s.id === submissionId);
      if (submission) {
        await supabase.from('user_activities').insert({
          user_id: submission.userId,
          activity_type: 'tree_planting',
          points_earned: submission.treesCount * 10,
          description: `Planted ${submission.treesCount} trees`,
          reference_id: submissionId
        });
      }
      
      await loadSubmissions();
      await loadCampaigns();
    } catch (error) {
      console.error('Error approving submission:', error);
      throw error;
    }
  };

  const rejectSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('tree_submissions')
        .update({ status: 'rejected' })
        .eq('id', submissionId);
      
      if (error) throw error;
      await loadSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      throw error;
    }
  };

  const addUpdate = async (campaignId: string, updateData: Omit<CampaignUpdate, 'id' | 'campaignId' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('campaign_updates')
        .insert({
          campaign_id: campaignId,
          title: updateData.title,
          description: updateData.description,
          image_url: updateData.imageUrl
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error adding update:', error);
      throw error;
    }
  };

  const editCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          title: updates.title,
          description: updates.description,
          goal_trees: updates.targetTrees,
          location: updates.location,
          image_url: updates.imageUrl,
          tags: updates.tags
        })
        .eq('id', campaignId);
      
      if (error) throw error;
      await loadCampaigns();
    } catch (error) {
      console.error('Error editing campaign:', error);
      throw error;
    }
  };

  const cancelCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'cancelled' })
        .eq('id', campaignId);
      
      if (error) throw error;
      await loadCampaigns();
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      throw error;
    }
  };

  const completeCampaign = async (campaignId: string, completionPhotos: string[]) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'completed',
          completion_photos: completionPhotos,
          is_completion_pending: true
        })
        .eq('id', campaignId);
      
      if (error) throw error;
      await loadCampaigns();
    } catch (error) {
      console.error('Error completing campaign:', error);
      throw error;
    }
  };

  const approveCompletion = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ is_completion_pending: false })
        .eq('id', campaignId);
      
      if (error) throw error;
      await loadCampaigns();
    } catch (error) {
      console.error('Error approving completion:', error);
      throw error;
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