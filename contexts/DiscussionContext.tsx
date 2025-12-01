import React, { createContext, useContext, useState, useEffect } from 'react';
import { Discussion, User } from '../types';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  content: string;
  author: User;
  discussionId: string;
  parentId?: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  replies?: Comment[];
}

interface DiscussionContextType {
  discussions: Discussion[];
  comments: Comment[];
  loading: boolean;
  createDiscussion: (discussion: Omit<Discussion, 'id' | 'author' | 'upvotes' | 'commentsCount' | 'postedAt' | 'reactions'>) => Promise<void>;
  voteDiscussion: (discussionId: string, voteType: 'up' | 'down') => Promise<void>;
  addComment: (discussionId: string, content: string, parentId?: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  addReaction: (discussionId: string, reactionType: string) => Promise<void>;
  getDiscussion: (id: string) => Discussion | undefined;
  getComments: (discussionId: string) => Comment[];
  getUserVote: (discussionId: string) => 'up' | 'down' | null;
  getUserCommentLike: (commentId: string) => boolean;
  getUserReaction: (discussionId: string) => string | null;
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined);

export const useDiscussions = () => {
  const context = useContext(DiscussionContext);
  if (!context) {
    throw new Error('useDiscussions must be used within DiscussionProvider');
  }
  return context;
};

export const DiscussionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { awardPoints, getUserById } = useUsers();

  useEffect(() => {
    loadDiscussions();
  }, [user?.id]);

  const loadDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles!discussions_author_id_fkey(
            id, username, full_name, avatar_url, impact_points, role
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedDiscussions = data.map((d: any) => {
          const author = d.is_anonymous ? {
            id: 'anonymous',
            username: 'anonymous',
            fullName: 'Anonymous User',
            avatarUrl: '',
            impactPoints: 0,
            badges: [],
            role: 'user' as const
          } : {
            id: d.profiles?.id || d.author_id,
            username: d.profiles?.username || 'User',
            fullName: d.profiles?.full_name || 'User',
            avatarUrl: d.profiles?.avatar_url || '',
            impactPoints: d.profiles?.impact_points || 0,
            badges: [],
            role: (d.profiles?.role || 'user') as const
          };
          
          return {
            id: d.id,
            title: d.title,
            content: d.content,
            category: d.category,
            author,
            upvotes: d.upvotes || 0,
            commentsCount: d.comment_count || 0,
            postedAt: new Date(d.created_at).toLocaleDateString(),
            reactions: [],
            isAnonymous: d.is_anonymous || false,
            realAuthorId: d.author_id,
            tags: d.tags || [],
            mediaUrls: d.media_urls || [],
            mediaType: d.media_type || null
          };
        });
        setDiscussions(formattedDiscussions);
      }
    } catch (error) {
      console.error('Error loading discussions:', error);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const saveDiscussions = (newDiscussions: Discussion[]) => {
    setDiscussions(newDiscussions);
  };

  const createDiscussion = async (discussionData: Omit<Discussion, 'id' | 'author' | 'upvotes' | 'commentsCount' | 'postedAt' | 'reactions' | 'realAuthorId'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert({
          title: discussionData.title,
          content: discussionData.content,
          category: discussionData.category,
          author_id: user.id,
          is_anonymous: discussionData.isAnonymous || false,
          media_urls: discussionData.mediaUrls || [],
          media_type: discussionData.mediaType || null,
          tags: discussionData.tags || []
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadDiscussions();
      awardPoints(user.id, 20, 'discussion_created');
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  };

  const voteDiscussion = async (discussionId: string, voteType: 'up' | 'down') => {
    if (!user) return;
    
    try {
      const currentVote = userVotes[discussionId];
      
      if (currentVote === voteType) {
        // Remove vote if clicking same vote type
        const { error } = await supabase
          .from('discussion_votes')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        const newVotes = { ...userVotes };
        delete newVotes[discussionId];
        setUserVotes(newVotes);
        localStorage.setItem(`user_votes_${user.id}`, JSON.stringify(newVotes));
      } else {
        // Add or update vote
        const { error } = await supabase
          .from('discussion_votes')
          .upsert({
            discussion_id: discussionId,
            user_id: user.id,
            vote_type: voteType
          });
        
        if (error) throw error;
        
        const newVotes = { ...userVotes, [discussionId]: voteType };
        setUserVotes(newVotes);
        localStorage.setItem(`user_votes_${user.id}`, JSON.stringify(newVotes));
        
        // Award points for voting (only for new votes)
        if (!currentVote) {
          awardPoints(user.id, 2, 'discussion_voted');
        }
      }
      
      // Reload discussions to get updated counts
      await loadDiscussions();
    } catch (error) {
      console.error('Error voting on discussion:', error);
    }
  };
  
  const addComment = async (discussionId: string, content: string, parentId?: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          discussion_id: discussionId,
          author_id: user.id,
          content: content,
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;
      
      // Reload comments and discussions to get updated counts
      await loadComments(discussionId);
      await loadDiscussions();
      awardPoints(user.id, 5, 'comment_created');
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };
  
  const likeComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();
      
      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
        
        if (error) throw error;
      }
      
      // Reload comments to get updated counts
      const discussionId = comments.find(c => c.id === commentId)?.discussionId;
      if (discussionId) {
        await loadComments(discussionId);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  
  const addReaction = async (discussionId: string, reactionType: string) => {
    if (!user) return;
    
    try {
      // Check if user already has this reaction
      const { data: existingReaction } = await supabase
        .from('discussion_reactions')
        .select('id')
        .eq('discussion_id', discussionId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .single();
      
      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('discussion_reactions')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);
        
        if (error) throw error;
      } else {
        // Remove any existing reaction from this user and add new one
        await supabase
          .from('discussion_reactions')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', user.id);
        
        const { error } = await supabase
          .from('discussion_reactions')
          .insert({
            discussion_id: discussionId,
            user_id: user.id,
            reaction_type: reactionType
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };
  
  const loadComments = async (discussionId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_author_id_fkey(
            id, username, full_name, avatar_url, impact_points, role
          )
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const formattedComments = (data || []).map((c: any) => {
        const author = {
          id: c.profiles?.id || c.author_id,
          username: c.profiles?.username || 'User',
          fullName: c.profiles?.full_name || 'User',
          avatarUrl: c.profiles?.avatar_url || '',
          impactPoints: c.profiles?.impact_points || 0,
          badges: [],
          role: (c.profiles?.role || 'user') as const
        };
        
        return {
          id: c.id,
          content: c.content,
          author,
          discussionId: c.discussion_id,
          parentId: c.parent_id,
          likeCount: c.like_count || 0,
          replyCount: c.reply_count || 0,
          createdAt: c.created_at
        };
      });
      
      // Organize comments into threads (parent comments with their replies)
      const parentComments = formattedComments.filter(c => !c.parentId);
      const replies = formattedComments.filter(c => c.parentId);
      
      const commentsWithReplies = parentComments.map(parent => ({
        ...parent,
        replies: replies.filter(reply => reply.parentId === parent.id)
      }));
      
      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };
  
  const getComments = (discussionId: string) => {
    // Load comments from database when requested
    loadComments(discussionId);
    return comments.filter(comment => comment.discussionId === discussionId);
  };
  
  const getUserVote = (discussionId: string) => {
    return userVotes[discussionId] || null;
  };
  
  const getUserCommentLike = (commentId: string) => {
    // This would need to be loaded from database, for now return false
    return false;
  };
  
  const getUserReaction = (discussionId: string) => {
    // This would need to be loaded from database, for now return null
    return null;
  };

  const getDiscussion = (id: string) => {
    return discussions.find(discussion => discussion.id === id);
  };

  const value = {
    discussions,
    comments,
    loading,
    createDiscussion,
    voteDiscussion,
    addComment,
    likeComment,
    addReaction,
    getDiscussion,
    getComments,
    getUserVote,
    getUserCommentLike,
    getUserReaction
  };

  return (
    <DiscussionContext.Provider value={value}>
      {children}
    </DiscussionContext.Provider>
  );
};