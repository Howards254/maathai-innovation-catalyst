import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

let heartbeatInterval: NodeJS.Timeout | null = null;

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
  loadConversation: (conversationId: string | null) => Promise<void>;
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
      setOnlineStatus(true);
      startHeartbeat();
    }
    return () => {
      if (user) {
        setOnlineStatus(false);
        stopHeartbeat();
      }
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Small delay to ensure user is properly authenticated
    const timer = setTimeout(() => {
      const unsub = subscribeToMessages();
      return () => unsub();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, activeConversation]);

  const setOnlineStatus = async (online: boolean) => {
    if (!user) return;
    await supabase.rpc('update_online_status', { user_id: user.id, online });
  };

  const startHeartbeat = () => {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(() => {
      if (user) setOnlineStatus(true);
    }, 30000);
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };

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

  const loadConversation = async (conversationId: string | null) => {
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }
    
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
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: userId
      });

      if (error) throw error;

      await loadConversations();
      if (data) {
        await loadConversation(data);
      }
      return data || '';
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
      // Use only fields that exist in the actual database
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: content || '',
        media_urls: mediaUrls || null,
        is_deleted: false
      };
      
      console.log('Sending message with data:', JSON.stringify(messageData, null, 2));
      
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
        .single();

      if (error) {
        console.error('Database error:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (data) {
        console.log('Message sent successfully:', data);
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error sending message:', JSON.stringify(error, null, 2));
      throw error;
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

    const messagesChannel = supabase
      .channel(`messages-${user.id}`, {
        config: {
          broadcast: { self: false },
          presence: { key: user.id }
        }
      })
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `sender_id=neq.${user.id}` // Only listen to messages not from current user
        }, 
        async (payload) => {
          const msg = payload.new as Message;
          
          // Load sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', msg.sender_id)
            .single();
          
          const enrichedMsg = { ...msg, sender };
          
          // Add to active conversation
          if (msg.conversation_id === activeConversation) {
            setMessages(prev => {
              // Check for duplicates
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, enrichedMsg];
            });
          }
          
          // Update conversations list
          loadConversations();
        }
      )
      .subscribe((status) => {
        console.log('Messages realtime status:', status);
      });

    const conversationsChannel = supabase
      .channel(`conversations-${user.id}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'conversations' }, 
        () => {
          console.log('Conversation updated, reloading...');
          loadConversations();
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'conversations' }, 
        () => {
          console.log('New conversation created, reloading...');
          loadConversations();
        }
      )
      .subscribe((status) => {
        console.log('Conversations realtime status:', status);
      });

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
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