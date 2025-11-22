import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';

const Badges: React.FC = () => {
  const { user } = useAuth();
  const { achievements, challenges, getStreakCount } = useGamification();
  const streakCount = getStreakCount();

  const allBadges = [
    { id: 'early-adopter', name: 'Early Adopter', description: 'One of the first to join', icon: '🌱', earned: user?.badges.includes('Early Adopter') },
    { id: 'tree-hugger', name: 'Tree Hugger', description: 'Planted 10+ trees', icon: '🌳', earned: user?.badges.includes('Tree Hugger') },
    { id: 'forest-guardian', name: 'Forest Guardian', description: 'Planted 50+ trees', icon: '🌲', earned: user?.badges.includes('Forest Guardian') },
    { id: 'eco-warrior', name: 'Eco Warrior', description: 'Planted 100+ trees', icon: '⚔️', earned: user?.badges.includes('Eco Warrior') },
    { id: 'community-builder', name: 'Community Builder', description: 'Created 5+ discussions', icon: '👥', earned: false },
    { id: 'event-organizer', name: 'Event Organizer', description: 'Organized an event', icon: '📅', earned: false },
  ];

  const completedChallenges = challenges.filter(c => c.completed);
  const activeChallenges = challenges.filter(c => !c.completed);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Badges & Achievements</h1>
          <p className="text-gray-600">Track your environmental impact and unlock rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-primary-600 mb-2">{user?.impactPoints || 0}</div>
            <div className="text-gray-600">Impact Points</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{allBadges.filter(b => b.earned).length}</div>
            <div className="text-gray-600">Badges Earned</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-orange-600 mb-2">{streakCount}</div>
            <div className="text-gray-600">Day Streak</div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Badge Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allBadges.map(badge => (
              <div 
                key={badge.id} 
                className={`bg-white rounded-lg p-4 text-center shadow-sm border-2 transition-all ${
                  badge.earned 
                    ? 'border-primary-200 bg-primary-50' 
                    : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-600">{badge.description}</p>
                {badge.earned && (
                  <div className="mt-2">
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">Earned</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Challenges */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Challenges</h2>
          <div className="space-y-4">
            {activeChallenges.map(challenge => (
              <div key={challenge.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                  <span className="text-sm font-medium text-primary-600">+{challenge.points} pts</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all" 
                    style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{challenge.progress}/{challenge.target} completed</span>
                  <span className="capitalize">{challenge.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
            <div className="space-y-3">
              {achievements.slice(0, 5).map(achievement => (
                <div key={achievement.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center gap-4">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                    <p className="text-gray-600 text-sm">{achievement.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Badges;