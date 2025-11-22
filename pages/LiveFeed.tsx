import React, { useState } from 'react';
import { Activity, Trophy, Clock, Users, Target, CheckCircle, Zap } from 'lucide-react';
import { useActivityFeed } from '../contexts/ActivityFeedContext';
import { formatDistanceToNow } from 'date-fns';

const LiveFeed: React.FC = () => {
  const { activities, challenges, joinChallenge, updateChallengeProgress } = useActivityFeed();
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges'>('feed');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tree_planted': return '🌱';
      case 'campaign_joined': return '🤝';
      case 'story_posted': return '📸';
      case 'event_attended': return '📅';
      case 'discussion_created': return '💬';
      case 'achievement_earned': return '🏆';
      case 'follow': return '👥';
      case 'group_joined': return '🏘️';
      default: return '⭐';
    }
  };

  const getChallengeProgress = (challenge: any) => {
    const userProgress = challenge.user_progress || 0;
    const percentage = Math.min((userProgress / challenge.target_value) * 100, 100);
    return { userProgress, percentage };
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Activity className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900">Live Activity</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'feed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'challenges' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Live Challenges ({challenges.length})
          </button>
        </div>

        {activeTab === 'feed' && (
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-500">Start participating to see live updates!</p>
              </div>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <img
                        src={activity.user?.avatar_url || `https://ui-avatars.com/api/?name=${activity.user?.full_name}&background=10b981&color=fff`}
                        alt={activity.user?.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xl">{getActivityIcon(activity.activity_type)}</span>
                        <span className="font-medium text-gray-900">{activity.user?.full_name}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                      {activity.description && (
                        <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                      )}
                      {activity.points_earned > 0 && (
                        <div className="flex items-center space-x-1 text-emerald-600 text-sm">
                          <Trophy className="w-4 h-4" />
                          <span>+{activity.points_earned} points</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {challenges.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active challenges</h3>
                <p className="text-gray-500">Check back later for new challenges!</p>
              </div>
            ) : (
              challenges.map(challenge => {
                const { userProgress, percentage } = getChallengeProgress(challenge);
                const timeRemaining = getTimeRemaining(challenge.end_time);
                const isExpired = timeRemaining === 'Expired';
                
                return (
                  <div key={challenge.id} className="bg-white rounded-lg border overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                            {challenge.challenge_type === 'flash' && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full flex items-center">
                                <Zap className="w-3 h-3 mr-1" />
                                Flash
                              </span>
                            )}
                            {challenge.user_completed && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{challenge.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span className={isExpired ? 'text-red-500' : ''}>{timeRemaining}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{challenge.participant_count} participants</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Trophy className="w-4 h-4" />
                              <span>{challenge.points_reward} points</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress: {userProgress} / {challenge.target_value}</span>
                          <span>{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              challenge.user_completed ? 'bg-green-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        {!challenge.user_progress && !isExpired && (
                          <button
                            onClick={() => joinChallenge(challenge.id)}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            Join Challenge
                          </button>
                        )}
                        
                        {challenge.user_progress > 0 && !challenge.user_completed && !isExpired && (
                          <button
                            onClick={() => {
                              const increment = challenge.challenge_type === 'daily' ? 1 : 5;
                              updateChallengeProgress(challenge.id, userProgress + increment);
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Update Progress
                          </button>
                        )}
                        
                        {challenge.user_completed && (
                          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                            ✅ Completed!
                          </div>
                        )}
                        
                        {isExpired && (
                          <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                            Challenge Expired
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Challenge Stats Footer */}
                    <div className="bg-gray-50 px-6 py-3 border-t">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{challenge.completion_count} completed</span>
                        <span>Global progress: {Math.round((challenge.current_progress / (challenge.target_value * challenge.participant_count)) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;