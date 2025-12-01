import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Users, UserCheck } from 'lucide-react';
import FollowButton from '../../components/FollowButton';

interface Following {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  isFriend: boolean;
}

const Following: React.FC = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<any>(null);

  useEffect(() => {
    loadFollowing();
  }, [username]);

  const loadFollowing = async () => {
    try {
      // Get profile user
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('username', username)
        .single();

      if (!profile) return;
      setProfileUser(profile);

      // Get following with friend status
      const { data: followingData } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey(
            id, username, full_name, avatar_url, bio
          )
        `)
        .eq('follower_id', profile.id);

      if (followingData) {
        // Check which following are also friends (mutual follows)
        const followingIds = followingData.map(f => f.following_id);
        const { data: mutualFollows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', profile.id)
          .in('following_id', followingIds);

        const friendIds = new Set(mutualFollows?.map(f => f.following_id) || []);

        const formattedFollowing = followingData.map(f => ({
          id: f.profiles.id,
          username: f.profiles.username,
          full_name: f.profiles.full_name,
          avatar_url: f.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.profiles.full_name)}&background=10b981&color=fff&size=80`,
          bio: f.profiles.bio || 'Environmental enthusiast',
          isFriend: friendIds.has(f.following_id)
        }));

        setFollowing(formattedFollowing);
      }
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading following...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to={`/app/profile/${username}`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Following</h1>
              <p className="text-gray-600 text-sm">@{profileUser?.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {following.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Not following anyone yet</h3>
            <p className="text-gray-500">When this account follows people, they'll show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {following.map(user => (
              <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Link to={`/app/profile/${user.username}`}>
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 hover:ring-green-300 transition-all"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        to={`/app/profile/${user.username}`}
                        className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                      >
                        {user.full_name}
                      </Link>
                      {user.isFriend && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          Friend
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-1">@{user.username}</p>
                    <p className="text-gray-500 text-sm">{user.bio}</p>
                  </div>
                  <div className="ml-4">
                    {currentUser?.id !== user.id && (
                      <FollowButton userId={user.id} size="sm" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Following;