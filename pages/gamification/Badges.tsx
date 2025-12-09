import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  earned?: boolean;
  earned_at?: string;
}

const Badges: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBadges();
    }
  }, [user]);

  const loadBadges = async () => {
    if (!user) return;
    
    try {
      // Get user's current points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .single();
      
      setUserPoints(profile?.total_points || 0);

      // Get all badges with user's earned status
      const { data: allBadges, error } = await supabase
        .from('badges')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;

      // Get user's earned badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user.id);

      const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
      const earnedBadgesMap = new Map(userBadges?.map(ub => [ub.badge_id, ub.earned_at]) || []);

      const badgesWithStatus = allBadges?.map(badge => ({
        ...badge,
        earned: earnedBadgeIds.has(badge.id),
        earned_at: earnedBadgesMap.get(badge.id)
      })) || [];

      setBadges(badgesWithStatus);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Badges & Achievements</h1>
          <p className="text-gray-600">Track your environmental impact and unlock rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{userPoints.toLocaleString()}</div>
            <div className="text-gray-600">Total Points</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">{earnedBadges.length}/{badges.length}</div>
            <div className="text-gray-600">Badges Earned</div>
          </div>
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎖️ Earned Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {earnedBadges.map(badge => (
                <div 
                  key={badge.id} 
                  className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 text-center shadow-sm border-2 border-green-200 hover:shadow-md transition-all"
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full inline-block">
                    ✓ Earned
                  </div>
                  {badge.earned_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔒 Locked Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {lockedBadges.map(badge => (
                <div 
                  key={badge.id} 
                  className="bg-white rounded-lg p-4 text-center shadow-sm border-2 border-gray-200 opacity-60 hover:opacity-80 transition-all"
                >
                  <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full inline-block">
                    {badge.points_required} points needed
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (userPoints / badge.points_required) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {userPoints}/{badge.points_required}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {badges.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No badges available yet</h3>
            <p className="text-gray-500">Start earning points to unlock badges!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Badges;