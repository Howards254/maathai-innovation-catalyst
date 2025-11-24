import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Campaign {
  id: string;
  title: string;
  description: string;
  target_trees: number;
  planted_trees: number;
  image_url: string;
  organizer_id: string;
  organizer?: { full_name: string; avatar_url: string };
  location: string;
  status: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  created_at: string;
}

interface TreeSubmission {
  id: string;
  campaign_id: string;
  user_id: string;
  trees_count: number;
  photo_url?: string;
  notes?: string;
  status: string;
  user?: { full_name: string; avatar_url: string };
  created_at: string;
}

interface CampaignContextType {
  campaigns: Campaign[];
  submissions: TreeSubmission[];
  loading: boolean;
  createCampaign: (data: any) => Promise<void>;
  joinCampaign: (campaignId: string) => Promise<void>;
  submitTreePlanting: (data: any) => Promise<void>;
  approveSubmission: (submissionId: string) => Promise<void>;
  rejectSubmission: (submissionId: string) => Promise<void>;
  getCampaign: (id: string) => Campaign | undefined;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) throw new Error('useCampaigns must be used within CampaignProvider');
  return context;
};

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<TreeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCampaigns();
      loadSubmissions();
    }
  }, [user]);

  const loadCampaigns = async () => {
    try {
      const { data } = await supabase
        .from('campaigns')
        .select('*, organizer:profiles!campaigns_organizer_id_fkey(full_name, avatar_url)')
        .order('created_at', { ascending: false });

      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data } = await supabase
        .from('tree_submissions')
        .select('*, user:profiles!tree_submissions_user_id_fkey(full_name, avatar_url)')
        .order('created_at', { ascending: false });

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const createCampaign = async (campaignData: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          title: campaignData.title,
          description: campaignData.description,
          target_trees: campaignData.targetTrees,
          image_url: campaignData.imageUrl,
          organizer_id: user.id,
          location: campaignData.location,
          start_date: campaignData.startDate,
          end_date: campaignData.endDate,
          is_public: campaignData.isPublic ?? true,
          status: 'active'
        })
        .select()
        .single();

      if (!error && data) {
        await loadCampaigns();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const joinCampaign = async (campaignId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('campaign_participants')
        .insert({ campaign_id: campaignId, user_id: user.id });

      await loadCampaigns();
    } catch (error) {
      console.error('Error joining campaign:', error);
    }
  };

  const submitTreePlanting = async (submissionData: any) => {
    if (!user) return;

    try {
      await supabase
        .from('tree_submissions')
        .insert({
          campaign_id: submissionData.campaignId,
          user_id: user.id,
          trees_count: submissionData.treesCount,
          photo_url: submissionData.photoUrl,
          notes: submissionData.notes,
          status: 'pending'
        });

      await loadSubmissions();
    } catch (error) {
      console.error('Error submitting trees:', error);
    }
  };

  const approveSubmission = async (submissionId: string) => {
    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      await supabase
        .from('tree_submissions')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', submissionId);

      await supabase.rpc('increment', {
        table_name: 'campaigns',
        row_id: submission.campaign_id,
        column_name: 'planted_trees',
        increment_by: submission.trees_count
      });

      await supabase
        .from('profiles')
        .update({ impact_points: supabase.raw(`impact_points + ${submission.trees_count * 10}`) })
        .eq('id', submission.user_id);

      await loadSubmissions();
      await loadCampaigns();
    } catch (error) {
      console.error('Error approving submission:', error);
    }
  };

  const rejectSubmission = async (submissionId: string) => {
    try {
      await supabase
        .from('tree_submissions')
        .update({ status: 'rejected' })
        .eq('id', submissionId);

      await loadSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
    }
  };

  const getCampaign = (id: string) => campaigns.find(c => c.id === id);

  return (
    <CampaignContext.Provider value={{
      campaigns,
      submissions,
      loading,
      createCampaign,
      joinCampaign,
      submitTreePlanting,
      approveSubmission,
      rejectSubmission,
      getCampaign
    }}>
      {children}
    </CampaignContext.Provider>
  );
};
