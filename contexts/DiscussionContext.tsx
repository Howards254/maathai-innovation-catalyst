import React, { createContext, useContext, useState, useEffect } from 'react';
import { Discussion, User } from '../types';
import { useAuth } from './AuthContext';
// import { useUsers } from './UserContext';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  content: string;
  author: User;
  discussionId: string;
  createdAt: string;
}

interface DiscussionContextType {
  discussions: Discussion[];
  comments: Comment[];
  loading: boolean;
  createDiscussion: (discussion: Omit<Discussion, 'id' | 'author' | 'upvotes' | 'commentsCount' | 'postedAt' | 'reactions'>) => Promise<void>;
  voteDiscussion: (discussionId: string, voteType: 'up' | 'down') => Promise<void>;
  addComment: (discussionId: string, content: string) => Promise<void>;
  getDiscussion: (id: string) => Discussion | undefined;
  getComments: (discussionId: string) => Comment[];
  getUserVote: (discussionId: string) => 'up' | 'down' | null;
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
  // const { awardPoints, getUserById } = useUsers();

  useEffect(() => {
    loadDiscussions();
  }, [user?.id]);

  const loadDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedDiscussions = data.map((d: any) => {
          const author = getUserById(d.author_id) || { 
            id: d.author_id, 
            username: d.is_anonymous ? 'anonymous' : 'User', 
            fullName: d.is_anonymous ? 'Anonymous User' : 'User', 
            avatarUrl: '', 
            impactPoints: 0, 
            badges: [], 
            role: 'user' as const
          };
          
          return {
            id: d.id,
            title: d.title,
            content: d.content,
            category: d.category,
            author: d.is_anonymous ? {
              id: 'anonymous',
              username: 'anonymous',
              fullName: 'Anonymous User',
              avatarUrl: '',
              impactPoints: 0,
              badges: [],
              role: 'user' as const
            } : author,
            upvotes: 0,
            commentsCount: 0,
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
    
    const currentVote = userVotes[discussionId];
    
    // If user already voted the same way, remove vote
    if (currentVote === voteType) {
      const newVotes = { ...userVotes };
      delete newVotes[discussionId];
      setUserVotes(newVotes);
      localStorage.setItem(`user_votes_${user.id}`, JSON.stringify(newVotes));
      
      // Decrease vote count
      const newDiscussions = discussions.map(discussion => {
        if (discussion.id === discussionId) {
          return {
            ...discussion,
            upvotes: voteType === 'up' ? Math.max(0, discussion.upvotes - 1) : discussion.upvotes
          };
        }
        return discussion;
      });
      saveDiscussions(newDiscussions);
      return;
    }
    
    // Update vote
    const newVotes = { ...userVotes, [discussionId]: voteType };
    setUserVotes(newVotes);
    localStorage.setItem(`user_votes_${user.id}`, JSON.stringify(newVotes));
    
    const newDiscussions = discussions.map(discussion => {
      if (discussion.id === discussionId) {
        let newUpvotes = discussion.upvotes;
        
        // Remove previous vote if exists
        if (currentVote === 'up') newUpvotes--;
        
        // Add new vote
        if (voteType === 'up') newUpvotes++;
        
        return {
          ...discussion,
          upvotes: Math.max(0, newUpvotes)
        };
      }
      return discussion;
    });
    
    saveDiscussions(newDiscussions);
    
    // Award points for voting (only for new votes, not removing votes)
    if (!currentVote) {
      awardPoints(user.id, 2, 'discussion_voted');
    }
  };
  
  const addComment = async (discussionId: string, content: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          discussion_id: discussionId,
          author_id: user.id,
          content: content
        })
        .select()
        .single();

      if (error) throw error;
      
      // Reload comments
      await loadComments(discussionId);
      awardPoints(user.id, 5, 'comment_created');
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };
  
  const loadComments = async (discussionId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const formattedComments = (data || []).map((c: any) => {
        const author = getUserById(c.author_id) || {
          id: c.author_id,
          username: 'User',
          fullName: 'User',
          avatarUrl: '',
          impactPoints: 0,
          badges: [],
          role: 'user' as const
        };
        
        return {
          id: c.id,
          content: c.content,
          author,
          discussionId: c.discussion_id,
          createdAt: c.created_at
        };
      });
      
      setComments(formattedComments);
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
    getDiscussion,
    getComments,
    getUserVote
  };

  return (
    <DiscussionContext.Provider value={value}>
      {children}
    </DiscussionContext.Provider>
  );
};