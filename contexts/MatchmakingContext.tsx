import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

interface UserMatch {
  id: string;
  matched_user_id: string;
  match_type: 'teammate' | 'volunteer' | 'mentor' | 'mentee' | 'collaborator' | 'friend';
  compatibility_score: number;
  distance_km?: number;
  common_causes: string[];
  common_skills: string[];
  common_activities: string[];
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  matched_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    location_city?: string;
    location_country?: string;
    experience_level?: string;
  };
}

interface GreenTeam {
  id: string;
  name: string;
  description?: string;
  team_type: 'project' | 'campaign' | 'research' | 'volunteer' | 'social';
  max_members: number;
  current_members: number;
  location_city?: string;
  location_country?: string;
  is_remote: boolean;
  required_skills: string[];
  preferred_causes: string[];
  creator_id: string;
  is_active: boolean;
  created_at: string;
  creator?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface MatchmakingContextType {
  matches: UserMatch[];
  teams: GreenTeam[];
  loading: boolean;
  findMatches: (matchType?: string) => Promise<void>;
  respondToMatch: (matchId: string, action: 'accept' | 'decline') => Promise<void>;
  createTeam: (teamData: Partial<GreenTeam>) => Promise<void>;
  joinTeam: (teamId: string) => Promise<void>;
  loadTeams: () => Promise<void>;
  updateMatchmakingPreferences: (preferences: any) => Promise<void>;
}

const MatchmakingContext = createContext<MatchmakingContextType | undefined>(undefined);

export const MatchmakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const [teams, setTeams] = useState<GreenTeam[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && user.id !== 'user-1') {
      loadMatches();
      loadTeams();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('user_matches')
        .select(`
          *,
          matched_user:profiles!user_matches_matched_user_id_fkey(
            id, full_name, avatar_url, location_city, location_country, experience_level
          )
        `)
        .eq('user_id', user.id)
        .order('compatibility_score', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const findMatches = async (matchType?: string) => {
    if (!user?.id || user.id === 'user-1') return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('find_green_matches', {
        target_user_id: user.id,
        match_type_filter: matchType,
        max_distance: user.max_distance_km || 50,
        limit_results: 20
      });

      if (error) throw error;

      // Create match records for new matches
      const newMatches = data?.filter((match: any) => 
        !matches.some(existing => existing.matched_user_id === match.matched_user_id)
      ) || [];

      if (newMatches.length > 0) {
        const matchInserts = newMatches.map((match: any) => ({
          user_id: user.id,
          matched_user_id: match.matched_user_id,
          match_type: matchType || 'collaborator',
          compatibility_score: match.compatibility_score,
          distance_km: match.distance_km,
          common_causes: match.common_causes,
          common_skills: match.common_skills,
          common_activities: match.common_activities
        }));

        await supabase.from('user_matches').insert(matchInserts);
        await loadMatches();
      }
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToMatch = async (matchId: string, action: 'accept' | 'decline') => {
    try {
      const status = action === 'accept' ? 'accepted' : 'declined';
      
      const { error } = await supabase
        .from('user_matches')
        .update({ status })
        .eq('id', matchId);

      if (error) throw error;

      // Record interaction
      await supabase
        .from('match_interactions')
        .insert({
          match_id: matchId,
          user_id: user?.id,
          action: action === 'accept' ? 'like' : 'pass'
        });

      await loadMatches();
    } catch (error) {
      console.error('Error responding to match:', error);
    }
  };

  const createTeam = async (teamData: Partial<GreenTeam>) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('green_teams')
        .insert({
          ...teamData,
          creator_id: user.id,
          current_members: 1
        })
        .select(`
          *,
          creator:profiles!green_teams_creator_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Add creator as team member
      await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: user.id,
          role: 'leader'
        });

      setTeams(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member'
        });

      // Update team member count
      await supabase
        .from('green_teams')
        .update({ current_members: supabase.sql`current_members + 1` })
        .eq('id', teamId);

      await loadTeams();
    } catch (error) {
      console.error('Error joining team:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('green_teams')
        .select(`
          *,
          creator:profiles!green_teams_creator_id_fkey(id, full_name, avatar_url)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const updateMatchmakingPreferences = async (preferences: any) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      await supabase
        .from('matchmaking_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <MatchmakingContext.Provider value={{
      matches,
      teams,
      loading,
      findMatches,
      respondToMatch,
      createTeam,
      joinTeam,
      loadTeams,
      updateMatchmakingPreferences
    }}>
      {children}
    </MatchmakingContext.Provider>
  );
};

export const useMatchmaking = () => {
  const context = useContext(MatchmakingContext);
  if (!context) {
    throw new Error('useMatchmaking must be used within MatchmakingProvider');
  }
  return context;
};