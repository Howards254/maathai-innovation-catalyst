import React from 'react';
import { User } from '../types';

interface ActivityFeedProps {
  user: User;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ user }) => {
  // Mock activity data - in real app this would come from backend
  const activities = [
    {
      id: 1,
      type: 'tree_planted',
      description: `Planted 5 trees in "Reforest the Rift Valley" campaign`,
      points: 50,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'badge_earned',
      description: 'Earned "Tree Hugger" badge',
      points: 0,
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'campaign_joined',
      description: 'Joined "Urban Canopy Project" campaign',
      points: 10,
      timestamp: '3 days ago'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tree_planted':
        return '🌱';
      case 'badge_earned':
        return '🏆';
      case 'campaign_joined':
        return '📋';
      default:
        return '📝';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
          <div className="flex-1">
            <p className="text-gray-900">{activity.description}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>{activity.timestamp}</span>
              {activity.points > 0 && (
                <span className="text-primary-600 font-medium">+{activity.points} points</span>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;