import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_urls?: string[];
  media_type?: string;
  reply_to?: string;
  is_deleted: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  is_group: boolean;
  name?: string;
  avatar_url?: string;
  created_by: string;
  updated_at: string;
  participants?: any[];
  last_message?: Message;
  unread_count?: number;
}

interface MessagingContextType {
  conversations: Conversation[];
  messages: Message[];
  activeConversation: string | null;
  loading: boolean;
  startDirectChat: (userId: string) => Promise<string>;
  createGroupChat: (name: string, userIds: string[]) => Promise<string>;
  sendMessage: (conversationId: string, content: string, mediaUrls?: string[]) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
      const unsub = subscribeToMessages();
      return unsub;
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data: participations } = await supabase
        .from('conversation_participants')
        .select('conversation_id, unread_count, last_read_at')
        .eq('user_id', user.id);

      if (!participations?.length) return;

      const convIds = participations.map(p => p.conversation_id);
      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .in('id', convIds)
        .order('updated_at', { ascending: false });

      const enriched = await Promise.all((convs || []).map(async (conv) => {
        const { data: parts } = await supabase
          .from('conversation_participants')
          .select('user_id, profiles(id, full_name, avatar_url)')
          .eq('conversation_id', conv.id);

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const unread = participations.find(p => p.conversation_id === conv.id)?.unread_count || 0;

        return { ...conv, participants: parts, last_message: lastMsg, unread_count: unread };
      }));

      setConversations(enriched);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
      setActiveConversation(conversationId);
      await markAsRead(conversationId);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const startDirectChat = async (userId: string) => {
    if (!user) return '';

    try {
      const { data } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: userId
      });

      await loadConversations();
      return data;
    } catch (error) {
      console.error('Error starting chat:', error);
      return '';
    }
  };

  const createGroupChat = async (name: string, userIds: string[]) => {
    if (!user) return '';

    try {
      const { data: conv } = await supabase
        .from('conversations')
        .insert({ is_group: true, name, created_by: user.id })
        .select()
        .single();

      if (conv) {
        const participants = [user.id, ...userIds].map(uid => ({
          conversation_id: conv.id,
          user_id: uid,
          is_admin: uid === user.id
        }));

        await supabase.from('conversation_participants').insert(participants);
        await loadConversations();
        return conv.id;
      }
      return '';
    } catch (error) {
      console.error('Error creating group:', error);
      return '';
    }
  };

  const sendMessage = async (conversationId: string, content: string, mediaUrls?: string[]) => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          media_urls: mediaUrls,
          media_type: mediaUrls?.length ? 'image' : undefined
        })
        .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
        .single();

      if (data) setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString(), unread_count: 0 })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      await loadConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!user) return () => {};

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          const msg = payload.new as Message;
          if (msg.conversation_id === activeConversation) {
            setMessages(prev => [...prev, msg]);
          }
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
      startDirectChat,
      createGroupChat,
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