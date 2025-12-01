import React, { useState, useEffect } from 'react';
import { Heart, Users, MapPin, MessageCircle, Search, Sparkles, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFollow } from '../contexts/FollowContext';
import { useMessaging } from '../contexts/MessagingContext';
import FollowButton from '../components/FollowButton';
import MatchmakingSetup from '../components/MatchmakingSetup';
import { useNavigate } from 'react-router-dom';

interface Match {
  match_id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  shared_interests: number;
  shared_goals: number;
  distance_km?: number;
  match_score: number;
}

const GreenMatchmaking: React.FC = () => {
  const { user } = useAuth();
  const { areFriends } = useFollow();
  const { startDirectChat } = useMessaging();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [minInterests, setMinInterests] = useState(1);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      findMatches();
    }
  }, [user, maxDistance, minInterests]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('interests, goals, social_preferences, location')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
      
      // Show setup if profile is incomplete
      const hasInterests = data?.interests && data.interests.length > 0;
      const hasSocial = data?.social_preferences && data.social_preferences.length > 0;
      const hasLocation = data?.location && data.location.trim() !== '';
      setShowSetup(!hasInterests || !hasSocial);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setShowSetup(true);
    }
  };

  const findMatches = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('find_green_matches', {
        user_id: user.id,
        max_distance_km: maxDistance,
        min_shared_interests: minInterests,
        limit_count: 20
      });
      
      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error finding matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (userId: string) => {
    const convId = await startDirectChat(userId);
    if (convId) navigate('/app/messages');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Sparkles className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Green Matchmaking</h1>
              <p className="text-gray-600">Find eco-conscious friends near you</p>
            </div>
          </div>
          <button
            onClick={findMatches}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Finding...' : 'Find Matches'}
          </button>
        </div>

        {/* Setup Component */}
        {showSetup && (
          <div className="mb-6">
            <MatchmakingSetup onClose={() => setShowSetup(false)} />
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Max Distance: {maxDistance} km
            </label>
            <input
              type="range"
              min="10"
              max="200"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Heart className="w-4 h-4 inline mr-1" />
              Min Shared Interests: {minInterests}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={minInterests}
              onChange={(e) => setMinInterests(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(match => (
            <div key={match.match_id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={match.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.full_name)}&background=10b981&color=fff&size=48`}
                    alt={match.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.full_name)}&background=10b981&color=fff&size=48`;
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{match.full_name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{match.location || 'Location not set'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{match.match_score}</div>
                  <div className="text-xs text-gray-500">Match Score</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{match.bio || 'Environmental enthusiast ready to make a difference! 🌱'}</p>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-lg font-bold text-green-600">{match.shared_interests}</div>
                  <div className="text-xs text-gray-600">Interests</div>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-lg font-bold text-blue-600">{match.shared_goals}</div>
                  <div className="text-xs text-gray-600">Goals</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-lg font-bold text-purple-600">
                    {match.distance_km ? Math.round(match.distance_km) : '∞'}
                  </div>
                  <div className="text-xs text-gray-600">km away</div>
                </div>
              </div>

              <div className="flex gap-2">
                <FollowButton userId={match.match_id} size="sm" />
                {areFriends(match.match_id) && (
                  <button
                    onClick={() => handleMessage(match.match_id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {matches.length === 0 && !loading && !showSetup && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or update your profile</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={findMatches}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search Again
              </button>
              <button
                onClick={() => navigate('/app/profile/me/edit')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Update Profile
              </button>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Finding your perfect eco-matches...</p>
          </div>
        )}
        
        {/* Profile Summary */}
        {userProfile && !showSetup && (
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Your Profile Summary</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                {userProfile.interests?.length || 0} interests
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {userProfile.goals?.length || 0} skills/activities
              </span>
              {userProfile.location && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  📍 {userProfile.location}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GreenMatchmaking;