import React, { createContext, useContext, useState, useEffect } from 'react';
import { Discussion, User } from '../types';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';

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
  createDiscussion: (discussion: Omit<Discussion, 'id' | 'author' | 'upvotes' | 'commentsCount' | 'postedAt'>) => Promise<void>;
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
  const { awardPoints, getUserById } = useUsers();

  useEffect(() => {
    const mockDiscussions: Discussion[] = [
      {
        id: 'd1',
        title: 'Best indigenous trees for dry areas?',
        content: 'I am looking to start a project in a semi-arid area. Any recommendations on species that require minimal water after establishment?',
        author: getUserById('user-1') || {
          id: 'user-1',
          username: 'eco_warrior',
          fullName: 'Wangari Demo',
          avatarUrl: 'https://picsum.photos/200',
          impactPoints: 1250,
          badges: ['Early Adopter', 'Tree Hugger']
        },
        upvotes: 45,
        commentsCount: 12,
        postedAt: '2 hours ago',
        category: 'Help',
      },
      {
        id: 'd2',
        title: 'We just hit 50% of our goal!',
        content: 'Thanks to everyone who donated seedlings this weekend. The Rift Valley project is moving fast.',
        author: getUserById('user-2') || {
          id: 'user-2',
          username: 'project_lead',
          fullName: 'John Smith',
          avatarUrl: 'https://picsum.photos/201',
          impactPoints: 2100,
          badges: ['Early Adopter', 'Tree Hugger', 'Forest Guardian']
        },
        upvotes: 128,
        commentsCount: 34,
        postedAt: '5 hours ago',
        category: 'Success Story',
      },
    ];

    const saved = localStorage.getItem('discussions');
    const savedComments = localStorage.getItem('comments');
    const savedVotes = localStorage.getItem(`user_votes_${user?.id}`);
    
    if (saved) {
      setDiscussions(JSON.parse(saved));
    } else {
      setDiscussions(mockDiscussions);
      localStorage.setItem('discussions', JSON.stringify(mockDiscussions));
    }
    
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
    
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }
    
    setLoading(false);
  }, [getUserById]);

  const saveDiscussions = (newDiscussions: Discussion[]) => {
    setDiscussions(newDiscussions);
    localStorage.setItem('discussions', JSON.stringify(newDiscussions));
  };

  const createDiscussion = async (discussionData: Omit<Discussion, 'id' | 'author' | 'upvotes' | 'commentsCount' | 'postedAt'>) => {
    if (!user) return;

    const newDiscussion: Discussion = {
      ...discussionData,
      id: `d${Date.now()}`,
      author: user,
      upvotes: 0,
      commentsCount: 0,
      postedAt: 'just now'
    };

    const newDiscussions = [newDiscussion, ...discussions];
    saveDiscussions(newDiscussions);
    
    // Award points for creating discussion
    awardPoints(user.id, 20, 'discussion_created');
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
    
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      content,
      author: user,
      discussionId,
      createdAt: new Date().toISOString()
    };
    
    const newComments = [...comments, newComment];
    setComments(newComments);
    localStorage.setItem('comments', JSON.stringify(newComments));
    
    // Update comment count
    const newDiscussions = discussions.map(discussion => {
      if (discussion.id === discussionId) {
        return { ...discussion, commentsCount: discussion.commentsCount + 1 };
      }
      return discussion;
    });
    
    saveDiscussions(newDiscussions);
    awardPoints(user.id, 5, 'comment_created');
  };
  
  const getComments = (discussionId: string) => {
    return comments.filter(comment => comment.discussionId === discussionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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