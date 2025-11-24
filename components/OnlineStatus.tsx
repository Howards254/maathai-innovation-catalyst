import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface OnlineStatusProps {
  userId: string;
  showText?: boolean;
}

export default function OnlineStatus({ userId, showText = false }: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>('');

  useEffect(() => {
    loadStatus();
    const channel = supabase
      .channel(`online:${userId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload: any) => {
          setIsOnline(payload.new.is_online);
          setLastSeen(payload.new.last_seen);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadStatus = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('is_online, last_seen')
      .eq('id', userId)
      .single();

    if (data) {
      setIsOnline(data.is_online);
      setLastSeen(data.last_seen);
    }
  };

  if (showText) {
    return (
      <span className="text-sm text-gray-500">
        {isOnline ? 'Active now' : `Last seen ${new Date(lastSeen).toLocaleString()}`}
      </span>
    );
  }

  return (
    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
  );
}
