import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFollow } from '../contexts/FollowContext';
import FollowButton from './FollowButton';
import { Link } from 'react-router-dom';

interface SuggestedUser {
  id: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  username: string;
  shared_interests: number;
}

export default function SuggestedUsers() {
  const { user } = useAuth();
  const { followingIds } = useFollow();
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSuggestions();
    }
  }, [user, followingIds]);

  const loadSuggestions = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('interests')
        .eq('id', user.id)
        .single();

      const userInterests = profile?.interests || [];

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, username, interests')
        .neq('id', user.id)
        .limit(20);

      const scored = (data || [])
        .filter(u => !followingIds.has(u.id))
        .map(u => ({
          ...u,
          shared_interests: (u.interests || []).filter((i: string) => userInterests.includes(i)).length
        }))
        .sort((a, b) => b.shared_interests - a.shared_interests)
        .slice(0, 5);

      setSuggested(scored);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (suggested.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-green-600" />
        <h3 className="font-bold text-gray-900">Suggested For You</h3>
      </div>
      <div className="space-y-4">
        {suggested.map(user => (
          <div key={user.id} className="flex items-start gap-3">
            <Link to={`/app/profile/${user.username}`}>
              <img
                src={user.avatar_url || 'https://via.placeholder.com/40'}
                alt={user.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/app/profile/${user.username}`}>
                <p className="font-semibold text-sm text-gray-900 hover:underline truncate">
                  {user.full_name}
                </p>
              </Link>
              <p className="text-xs text-gray-500 truncate">{user.bio || 'Environmental enthusiast'}</p>
              {user.shared_interests > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {user.shared_interests} shared interest{user.shared_interests > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <FollowButton userId={user.id} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
