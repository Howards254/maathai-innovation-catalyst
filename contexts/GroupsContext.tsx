import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

interface Group {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  category: string;
  is_private: boolean;
  creator_id: string;
  member_count: number;
  created_at: string;
  is_member?: boolean;
  user_role?: 'admin' | 'moderator' | 'member';
}

interface GroupPost {
  id: string;
  group_id: string;
  author_id: string;
  title: string;
  content: string;
  media_url?: string;
  post_type: 'discussion' | 'announcement' | 'event' | 'poll';
  like_count: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface GroupsContextType {
  groups: Group[];
  myGroups: Group[];
  groupPosts: GroupPost[];
  loading: boolean;
  createGroup: (data: Partial<Group>) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  loadGroupPosts: (groupId: string) => Promise<void>;
  createGroupPost: (groupId: string, data: Partial<GroupPost>) => Promise<void>;
  loadGroups: () => Promise<void>;
  loadMyGroups: () => Promise<void>;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const GroupsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Disabled to prevent ERR_INSUFFICIENT_RESOURCES
    setLoading(false);
  }, [user]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(user_id, role)
        `)
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check membership status
      const groupsWithMembership = await Promise.all(
        (data || []).map(async (group) => {
          if (!user) return { ...group, is_member: false };

          const { data: membership } = await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', group.id)
            .eq('user_id', user.id)
            .single();

          return {
            ...group,
            is_member: !!membership,
            user_role: membership?.role
          };
        })
      );

      setGroups(groupsWithMembership);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyGroups = async () => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          role,
          groups (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const myGroupsData = (data || []).map(item => ({
        ...item.groups,
        user_role: item.role,
        is_member: true
      }));

      setMyGroups(myGroupsData);
    } catch (error) {
      console.error('Error loading my groups:', error);
    }
  };

  const createGroup = async (groupData: Partial<Group>) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          creator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      await loadGroups();
      await loadMyGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      // Update member count
      await supabase
        .from('groups')
        .update({ member_count: supabase.sql`member_count + 1` })
        .eq('id', groupId);

      await loadGroups();
      await loadMyGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      // Update member count
      await supabase
        .from('groups')
        .update({ member_count: supabase.sql`member_count - 1` })
        .eq('id', groupId);

      await loadGroups();
      await loadMyGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const loadGroupPosts = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_posts')
        .select(`
          *,
          author:profiles!group_posts_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGroupPosts(data || []);
    } catch (error) {
      console.error('Error loading group posts:', error);
    }
  };

  const createGroupPost = async (groupId: string, postData: Partial<GroupPost>) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('group_posts')
        .insert({
          ...postData,
          group_id: groupId,
          author_id: user.id
        })
        .select(`
          *,
          author:profiles!group_posts_author_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setGroupPosts(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error creating group post:', error);
    }
  };

  return (
    <GroupsContext.Provider value={{
      groups,
      myGroups,
      groupPosts,
      loading,
      createGroup,
      joinGroup,
      leaveGroup,
      loadGroupPosts,
      createGroupPost,
      loadGroups,
      loadMyGroups
    }}>
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups must be used within GroupsProvider');
  }
  return context;
};