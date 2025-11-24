import React, { useState, useEffect } from 'react';
import { Heart, Users, MapPin, MessageCircle, Search, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFollow } from '../contexts/FollowContext';
import { useMessaging } from '../contexts/MessagingContext';
import FollowButton from '../components/FollowButton';
import { useNavigate } from 'react-router-dom';

const GreenMatchmaking: React.FC = () => {
  const { user } = useAuth();
  const { areFriends } = useFollow();
  const { startDirectChat } = useMessaging();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);

  useEffect(() => {
    if (user) findMatches();
  }, [user]);

  const findMatches = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase.rpc('find_green_matches', {
        user_id: user.id,
        max_distance_km: maxDistance,
        min_shared_interests: 1,
        limit_count: 20
      });
      setMatches(data || []);
    } catch (error) {
      console.error('Error finding matches:', error);
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
              <p className="text-gray-600">Find environmental partners near you</p>
            </div>
          </div>
          <button
            onClick={findMatches}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Finding...' : 'Refresh Matches'}
          </button>
        </div>

        <div className="mb-6 bg-white p-4 rounded-lg border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(match => (
            <div key={match.match_id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={match.avatar_url || 'https://via.placeholder.com/48'}
                    alt={match.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{match.full_name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{match.location || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{match.match_score}</div>
                  <div className="text-xs text-gray-500">Match Score</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{match.bio || 'Environmental enthusiast'}</p>

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
                  <div className="text-lg font-bold text-purple-600">{match.distance_km ? Math.round(match.distance_km) : '?'}</div>
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

        {matches.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500">Update your profile interests and location to find matches</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GreenMatchmaking;