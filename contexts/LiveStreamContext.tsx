import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  host_id: string;
  stream_key: string;
  stream_url?: string;
  thumbnail_url?: string;
  category: 'environmental' | 'education' | 'campaign' | 'workshop';
  is_live: boolean;
  viewer_count: number;
  max_viewers: number;
  started_at?: string;
  ended_at?: string;
  scheduled_for?: string;
  duration_seconds: number;
  host?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  message_type: 'chat' | 'reaction' | 'system';
  reaction_emoji?: string;
  is_highlighted: boolean;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface LiveStreamContextType {
  streams: LiveStream[];
  activeStream: LiveStream | null;
  chatMessages: ChatMessage[];
  isWatching: boolean;
  loading: boolean;
  createStream: (data: Partial<LiveStream>) => Promise<void>;
  startStream: (streamId: string) => Promise<void>;
  endStream: (streamId: string) => Promise<void>;
  joinStream: (streamId: string) => Promise<void>;
  leaveStream: (streamId: string) => Promise<void>;
  sendChatMessage: (streamId: string, message: string) => Promise<void>;
  sendReaction: (streamId: string, emoji: string) => Promise<void>;
  loadStreams: () => Promise<void>;
}

const LiveStreamContext = createContext<LiveStreamContextType | undefined>(undefined);

export const LiveStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isWatching, setIsWatching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStreams();
    subscribeToStreams();
  }, []);

  const loadStreams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          host:profiles!live_streams_host_id_fkey(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStreams(data || []);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStream = async (streamData: Partial<LiveStream>) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('live_streams')
        .insert({
          ...streamData,
          host_id: user.id,
          stream_key: streamKey
        })
        .select(`
          *,
          host:profiles!live_streams_host_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      setStreams(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error creating stream:', error);
    }
  };

  const startStream = async (streamId: string) => {
    try {
      const { error } = await supabase
        .from('live_streams')
        .update({
          is_live: true,
          started_at: new Date().toISOString()
        })
        .eq('id', streamId);

      if (error) throw error;
      await loadStreams();
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  };

  const endStream = async (streamId: string) => {
    try {
      const stream = streams.find(s => s.id === streamId);
      const duration = stream?.started_at 
        ? Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 1000)
        : 0;

      const { error } = await supabase
        .from('live_streams')
        .update({
          is_live: false,
          ended_at: new Date().toISOString(),
          duration_seconds: duration
        })
        .eq('id', streamId);

      if (error) throw error;
      await loadStreams();
    } catch (error) {
      console.error('Error ending stream:', error);
    }
  };

  const joinStream = async (streamId: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      // Add viewer record
      await supabase
        .from('stream_viewers')
        .upsert({
          stream_id: streamId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      // Load stream details and chat
      const stream = streams.find(s => s.id === streamId);
      if (stream) {
        setActiveStream(stream);
        setIsWatching(true);
        await loadChatMessages(streamId);
        subscribeToChatMessages(streamId);
      }
    } catch (error) {
      console.error('Error joining stream:', error);
    }
  };

  const leaveStream = async (streamId: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      await supabase
        .from('stream_viewers')
        .update({ left_at: new Date().toISOString() })
        .eq('stream_id', streamId)
        .eq('user_id', user.id);

      setActiveStream(null);
      setIsWatching(false);
      setChatMessages([]);
    } catch (error) {
      console.error('Error leaving stream:', error);
    }
  };

  const loadChatMessages = async (streamId: string) => {
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select(`
          *,
          user:profiles!live_chat_messages_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const sendChatMessage = async (streamId: string, message: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          message,
          message_type: 'chat'
        })
        .select(`
          *,
          user:profiles!live_chat_messages_user_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      setChatMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const sendReaction = async (streamId: string, emoji: string) => {
    if (!user?.id || user.id === 'user-1') return;

    try {
      await supabase
        .from('live_chat_messages')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          message: emoji,
          message_type: 'reaction',
          reaction_emoji: emoji
        });

      // Also add to live_reactions table
      await supabase
        .from('live_reactions')
        .upsert({
          target_type: 'stream',
          target_id: streamId,
          user_id: user.id,
          reaction_type: emoji
        });
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  const subscribeToStreams = () => {
    const channel = supabase
      .channel('live_streams')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'live_streams' }, 
        () => loadStreams()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const subscribeToChatMessages = (streamId: string) => {
    const channel = supabase
      .channel(`chat_${streamId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'live_chat_messages',
          filter: `stream_id=eq.${streamId}`
        }, 
        (payload) => {
          setChatMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  return (
    <LiveStreamContext.Provider value={{
      streams,
      activeStream,
      chatMessages,
      isWatching,
      loading,
      createStream,
      startStream,
      endStream,
      joinStream,
      leaveStream,
      sendChatMessage,
      sendReaction,
      loadStreams
    }}>
      {children}
    </LiveStreamContext.Provider>
  );
};

export const useLiveStream = () => {
  const context = useContext(LiveStreamContext);
  if (!context) {
    throw new Error('useLiveStream must be used within LiveStreamProvider');
  }
  return context;
};