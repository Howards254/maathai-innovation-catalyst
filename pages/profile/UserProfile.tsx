import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUsers } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ActivityFeed from '../../components/ActivityFeed';
import FollowButton from '../../components/FollowButton';
import { MapPin, Calendar, Globe, Users, TreePine, MessageCircle, Award, Star, Heart, Share2, Settings } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { username } = useParams();
  const { updateProfile } = useUsers();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');
  const [stats, setStats] = useState({
    treesPlanted: 0,
    campaignsJoined: 0,
    discussionsCreated: 0,
    followers: 0,
    following: 0
  });
  
  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Simple query without joins
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error);
        setLoading(false);
        return;
      }
      
      if (data) {
        setUser({
          id: data.id,
          username: data.username,
          fullName: data.full_name,
          avatarUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || data.username)}&background=10b981&color=fff&size=128`,
          impactPoints: data.impact_points || 0,
          bio: data.bio,
          location: data.location,
          website: data.website,
          interests: data.interests || [],
          skills: data.skills || [],
          joinedAt: data.created_at,
          badges: [],
          role: data.role || 'user'
        });
        
        // Load user stats
        loadUserStats(data.id);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      // Get all stats in parallel
      const [followersRes, followingRes, campaignsRes, discussionsRes, treesRes] = await Promise.all([
        supabase.from('follows').select('id').eq('following_id', userId),
        supabase.from('follows').select('id').eq('follower_id', userId),
        supabase.from('campaign_participants').select('id').eq('user_id', userId),
        supabase.from('discussions').select('id').eq('author_id', userId),
        supabase.from('tree_plantings').select('trees_planted').eq('user_id', userId)
      ]);

      // Calculate total trees planted
      const totalTrees = treesRes.data?.reduce((sum, record) => sum + (record.trees_planted || 0), 0) || 0;

      setStats({
        treesPlanted: totalTrees,
        campaignsJoined: campaignsRes.data?.length || 0,
        discussionsCreated: discussionsRes.data?.length || 0,
        followers: followersRes.data?.length || 0,
        following: followingRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  
  const isOwnProfile = currentUser?.id === user?.id;

  const getBadgeLevel = (points: number) => {
    if (points >= 5000) return { name: 'Environmental Champion', icon: '👑', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (points >= 3000) return { name: 'Earth Guardian', icon: '🏆', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (points >= 1500) return { name: 'Green Champion', icon: '🌳', color: 'bg-green-100 text-green-800 border-green-200' };
    if (points >= 500) return { name: 'Eco Warrior', icon: '🌿', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (points >= 100) return { name: 'Tree Hugger', icon: '🌱', color: 'bg-lime-100 text-lime-800 border-lime-200' };
    return { name: 'New Sprout', icon: '🌱', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const currentBadge = getBadgeLevel(user?.impactPoints || 0);

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Enhanced Header with Cover Photo */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-4 right-4 flex gap-2">
            {isOwnProfile && (
              <Link 
                to={`/app/profile/${user.username}/edit`}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Profile Info Section */}
        <div className="px-6 pb-6">
          <div className="relative -mt-20 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <img 
                  src={user.avatarUrl} 
                  alt={user.username} 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white" 
                />
                <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-xs font-bold border ${currentBadge.color} flex items-center gap-1`}>
                  <span>{currentBadge.icon}</span>
                  <span className="hidden sm:inline">{currentBadge.name}</span>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 truncate">
                        {user.fullName || 'User'}
                      </h1>
                      <p className="text-gray-600 mb-2">@{user.username}</p>
                      
                      {user.bio && (
                        <p className="text-gray-700 mb-3 leading-relaxed">{user.bio}</p>
                      )}
                      
                      {/* User Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {user.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                              {user.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                        {user.joinedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {formatJoinDate(user.joinedAt)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Follow Stats */}
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-gray-600">
                          <span className="font-bold text-gray-900">{stats.following}</span> Following
                        </span>
                        <span className="text-gray-600">
                          <span className="font-bold text-gray-900">{stats.followers}</span> Followers
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="ml-4">
                      {isOwnProfile ? (
                        <Link 
                          to={`/app/profile/${user.username}/edit`}
                          className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors border border-gray-300"
                        >
                          Edit Profile
                        </Link>
                      ) : (
                        <div className="flex gap-2">
                          <FollowButton userId={user.id} />
                          <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors">
                            Message
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">{user.impactPoints?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Star className="w-4 h-4" />
                Impact Points
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.treesPlanted}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <TreePine className="w-4 h-4" />
                Trees Planted
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.campaignsJoined}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Users className="w-4 h-4" />
                Campaigns
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.discussionsCreated}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <MessageCircle className="w-4 h-4" />
                Discussions
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-yellow-600">{user.badges?.length || 1}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                Badges
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Interests */}
              {user.interests && user.interests.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Skills */}
              {user.skills && user.skills.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Current Badge */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Current Badge</h3>
                <div className={`p-4 rounded-lg border ${currentBadge.color} text-center`}>
                  <div className="text-3xl mb-2">{currentBadge.icon}</div>
                  <div className="font-bold">{currentBadge.name}</div>
                  <div className="text-sm mt-1">{user.impactPoints} points</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex gap-6">
                    {[
                      { id: 'activity', label: 'Activity', icon: Heart },
                      { id: 'campaigns', label: 'Campaigns', icon: Users },
                      { id: 'discussions', label: 'Discussions', icon: MessageCircle },
                      { id: 'achievements', label: 'Achievements', icon: Award }
                    ].map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 font-medium pb-4 -mb-4 border-b-2 transition-colors ${
                            activeTab === tab.id
                              ? 'text-green-600 border-green-600'
                              : 'text-gray-500 border-transparent hover:text-gray-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Tab Content */}
                <div className="p-6 min-h-[400px]">
                  {activeTab === 'activity' && <ActivityFeed user={user} />}
                  {activeTab === 'campaigns' && (
                    <div className="text-center text-gray-500 py-12">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No campaigns to show yet</p>
                    </div>
                  )}
                  {activeTab === 'discussions' && (
                    <div className="text-center text-gray-500 py-12">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No discussions to show yet</p>
                    </div>
                  )}
                  {activeTab === 'achievements' && (
                    <div className="text-center text-gray-500 py-12">
                      <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No achievements to show yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;