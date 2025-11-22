import React, { useState } from 'react';
import { Camera, MapPin, Link as LinkIcon, Calendar, Edit3, MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

interface EnhancedProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const EnhancedProfile: React.FC<EnhancedProfileProps> = ({ userId, isOwnProfile = true }) => {
  const { user, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await updateProfile({
        ...user,
        ...profileData
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !userId) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleMessageUser = () => {
    // Navigate to messages with this user
    console.log('Start conversation with user:', userId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-emerald-400 to-green-500 relative">
        {user?.cover_image_url && (
          <img src={user.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
        )}
        {isOwnProfile && (
          <button className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70">
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex items-start justify-between -mt-16 mb-4">
          <div className="relative">
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=10b981&color=fff`}
              alt={user?.full_name}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isOwnProfile && (
            <div className="flex space-x-2 mt-16">
              <button
                onClick={handleMessageUser}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button
                onClick={handleFollow}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isFollowing
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Name and Verification */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
            {user?.is_verified && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{user?.follower_count || 0}</div>
              <div className="text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{user?.following_count || 0}</div>
              <div className="text-gray-500">Following</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{user?.points || 0}</div>
              <div className="text-gray-500">Points</div>
            </div>
          </div>

          {/* Bio */}
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Your location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://your-website.com"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {user?.bio && (
                <p className="text-gray-700">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {user?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user?.website && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          )}

          {/* Badges */}
          {user?.current_badge && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Current Badge</h3>
              <div className="inline-flex items-center space-x-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-2xl">{user.current_badge.icon}</span>
                <div>
                  <div className="font-medium text-emerald-900">{user.current_badge.name}</div>
                  <div className="text-sm text-emerald-700">{user.current_badge.description}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfile;