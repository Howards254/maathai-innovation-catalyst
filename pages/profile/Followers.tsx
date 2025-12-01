import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Users, UserCheck } from 'lucide-react';
import FollowButton from '../../components/FollowButton';

interface Follower {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  isFriend: boolean;
}

const Followers: React.FC = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<any>(null);

  useEffect(() => {
    loadFollowers();
  }, [username]);

  const loadFollowers = async () => {
    try {
      // Get profile user
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('username', username)
        .single();

      if (!profile) return;
      setProfileUser(profile);

      // Get followers with friend status
      const { data: followersData } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey(
            id, username, full_name, avatar_url, bio
          )
        `)
        .eq('following_id', profile.id);

      if (followersData) {
        // Check which followers are also friends (mutual follows)
        const followerIds = followersData.map(f => f.follower_id);
        const { data: mutualFollows } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', profile.id)
          .in('follower_id', followerIds);

        const friendIds = new Set(mutualFollows?.map(f => f.follower_id) || []);

        const formattedFollowers = followersData.map(f => ({
          id: f.profiles.id,
          username: f.profiles.username,
          full_name: f.profiles.full_name,
          avatar_url: f.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.profiles.full_name)}&background=10b981&color=fff&size=80`,
          bio: f.profiles.bio || 'Environmental enthusiast',
          isFriend: friendIds.has(f.follower_id)
        }));

        setFollowers(formattedFollowers);
      }
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading followers...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Followers</h1>
              <p className="text-gray-600 text-sm">@{profileUser?.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {followers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No followers yet</h3>
            <p className="text-gray-500">When people follow this account, they'll show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {followers.map(follower => (
              <div key={follower.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Link to={`/app/profile/${follower.username}`}>
                    <img
                      src={follower.avatar_url}
                      alt={follower.full_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 hover:ring-green-300 transition-all"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        to={`/app/profile/${follower.username}`}
                        className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                      >
                        {follower.full_name}
                      </Link>
                      {follower.isFriend && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          Friend
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-1">@{follower.username}</p>
                    <p className="text-gray-500 text-sm">{follower.bio}</p>
                  </div>
                  <div className="ml-4">
                    {currentUser?.id !== follower.id && (
                      <FollowButton userId={follower.id} size="sm" />
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

export default Followers;