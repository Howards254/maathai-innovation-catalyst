import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  media_url?: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_id?: string;
  last_activity: string;
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  unread_count?: number;
}

interface MessagingContextType {
  conversations: Conversation[];
  messages: Message[];
  activeConversation: string | null;
  loading: boolean;
  sendMessage: (recipientId: string, content: string, type?: 'text' | 'image' | 'file', mediaUrl?: string) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && user.id !== 'user-1') {
      loadConversations();
      subscribeToMessages();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          other_user:profiles!conversations_participant_2_fkey(id, full_name, avatar_url)
        `)
        .eq('participant_1', user.id)
        .order('last_activity', { ascending: false });

      if (error) throw error;

      // Get unread counts
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', conv.participant_2)
            .eq('recipient_id', user.id)
            .eq('is_read', false);

          return { ...conv, unread_count: count || 0 };
        })
      );

      setConversations(conversationsWithUnread);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    if (!user?.id || user.id === 'user-1') return;

    setLoading(true);
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${conversation.participant_2}),and(sender_id.eq.${conversation.participant_2},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      setActiveConversation(conversationId);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', conversation.participant_2)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (recipientId: string, content: string, type: 'text' | 'image' | 'file' = 'text', mediaUrl?: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          message_type: type,
          media_url: mediaUrl
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      await loadConversations(); // Refresh conversations list
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!user?.id || user.id === 'user-1') return;

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        }, 
        (payload) => {
          // Add new message if it's for active conversation
          if (activeConversation) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
          // Refresh conversations list
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <MessagingContext.Provider value={{
      conversations,
      messages,
      activeConversation,
      loading,
      sendMessage,
      loadConversation,
      markAsRead,
      setActiveConversation
    }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within MessagingProvider');
  }
  return context;
};