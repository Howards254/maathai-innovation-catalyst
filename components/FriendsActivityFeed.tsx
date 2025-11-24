import { useState, useEffect } from 'react';
import { Activity, TreePine, MessageSquare, Calendar, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ActivityItem {
  activity_id: string;
  activity_user_id: string;
  user_name: string;
  user_avatar: string;
  activity_type: string;
  title: string;
  description: string;
  metadata: any;
  points_earned: number;
  created_at: string;
}

export default function FriendsActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadActivities();
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;

    try {
      const { data } = await supabase.rpc('get_friends_activity_feed', {
        user_id: user.id,
        limit_count: 50
      });

      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tree_planted':
      case 'campaign_joined':
        return <TreePine className="w-5 h-5 text-green-600" />;
      case 'discussion_created':
      case 'comment_added':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'event_rsvp':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'badge_earned':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'story_posted':
        return <Activity className="w-5 h-5 text-pink-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-gray-900">Friends Activity</h3>
        </div>
      </div>
      <div className="divide-y max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No recent activity from friends</p>
          </div>
        ) : (
          activities.map(activity => (
            <div key={activity.activity_id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex gap-3">
                <Link to={`/app/profile/${activity.activity_user_id}`}>
                  <img
                    src={activity.user_avatar || 'https://via.placeholder.com/40'}
                    alt={activity.user_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Link
                        to={`/app/profile/${activity.activity_user_id}`}
                        className="font-semibold text-gray-900 hover:underline"
                      >
                        {activity.user_name}
                      </Link>
                      <p className="text-sm text-gray-600">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.activity_type)}
                      {activity.points_earned > 0 && (
                        <span className="text-xs font-medium text-green-600">
                          +{activity.points_earned}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
