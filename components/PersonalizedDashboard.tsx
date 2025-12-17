import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Calendar, TreePine, Users, Award, Plus, MessageCircle, Camera, Zap } from 'lucide-react';

// Personalized greeting component
export const PersonalizedGreeting: React.FC = () => {
  const { user } = useUser();
  
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good morning';
    if (hour < 17) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to make a difference today?",
      "Every small action creates big change!",
      "Your environmental impact matters!",
      "Let's grow a greener future together!",
      "Time to plant some positive change!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {getTimeBasedGreeting()}, {user?.fullName?.split(' ')[0] || 'Friend'}! 👋
          </h1>
          <p className="text-green-100 text-sm">{getMotivationalMessage()}</p>
        </div>
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    </div>
  );
};

// Quick actions dashboard
export const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: TreePine,
      label: 'Plant Trees',
      description: 'Join a campaign',
      href: '/app/campaigns',
      color: 'bg-green-500 hover:bg-green-600',
      count: '12 active'
    },
    {
      icon: Calendar,
      label: 'Events',
      description: 'Attend meetups',
      href: '/app/events',
      color: 'bg-blue-500 hover:bg-blue-600',
      count: '5 this week'
    },
    {
      icon: MessageCircle,
      label: 'Discuss',
      description: 'Share ideas',
      href: '/app/discussions',
      color: 'bg-purple-500 hover:bg-purple-600',
      count: '23 topics'
    },
    {
      icon: Camera,
      label: 'Stories',
      description: 'Share journey',
      href: '/app/stories',
      color: 'bg-pink-500 hover:bg-pink-600',
      count: 'New feature'
    }
  ];

  return (
    <div className="animate-fade-in-up animation-delay-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        ⚡ Quick Actions
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Link
            key={action.label}
            to={action.href}
            className={`${action.color} text-white p-4 rounded-xl transition-all card-hover animate-scale-in stagger-item group`}
          >
            <div className="flex flex-col items-center text-center">
              <action.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">{action.label}</span>
              <span className="text-xs opacity-90 mt-1">{action.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Activity summary cards
export const ActivitySummary: React.FC = () => {
  const { user } = useUser();
  
  // Mock data - in real app, this would come from user's actual activity
  const stats = [
    {
      icon: TreePine,
      label: 'Trees Planted',
      value: user?.treesPlanted || 0,
      change: '+3 this week',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Award,
      label: 'Points Earned',
      value: user?.totalPoints || 0,
      change: '+45 today',
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      icon: Users,
      label: 'Friends',
      value: user?.friendsCount || 0,
      change: '+2 new',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Zap,
      label: 'Impact Score',
      value: Math.floor((user?.totalPoints || 0) / 10),
      change: 'Rising',
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <div className="animate-fade-in-up animation-delay-200">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        📊 Your Impact
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all card-hover animate-fade-in-up stagger-item"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-xs text-green-600 font-medium">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Personalized recommendations
export const PersonalizedRecommendations: React.FC<{ campaigns: any[] }> = ({ campaigns }) => {
  // Simple recommendation algorithm based on user interests
  const getRecommendedCampaigns = () => {
    // In a real app, this would use user's past activity, location, interests
    return campaigns
      .filter(campaign => campaign.daysLeft > 0)
      .sort((a, b) => {
        // Prioritize campaigns with good progress but still need help
        const aScore = (a.plantedTrees / a.targetTrees) * 0.7 + (a.daysLeft / 30) * 0.3;
        const bScore = (b.plantedTrees / b.targetTrees) * 0.7 + (b.daysLeft / 30) * 0.3;
        return bScore - aScore;
      })
      .slice(0, 3);
  };

  const recommendedCampaigns = getRecommendedCampaigns();

  if (recommendedCampaigns.length === 0) return null;

  return (
    <div className="animate-fade-in-up animation-delay-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          🎯 Recommended for You
        </h2>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
          Smart picks
        </span>
      </div>
      <div className="space-y-3">
        {recommendedCampaigns.map((campaign, index) => (
          <Link
            key={campaign.id}
            to={`/app/campaigns/${campaign.id}`}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-md transition-all card-hover animate-fade-in-up stagger-item"
          >
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{campaign.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {campaign.organizer}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full animate-progress"
                    style={{ width: `${(campaign.plantedTrees / campaign.targetTrees) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round((campaign.plantedTrees / campaign.targetTrees) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {campaign.daysLeft}d left
              </div>
              <div className="text-xs text-gray-500">
                {campaign.plantedTrees.toLocaleString()} trees
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Achievement celebration component
export const AchievementCelebration: React.FC<{ achievement?: any }> = ({ achievement }) => {
  if (!achievement) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 animate-celebrate">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h3>
        <p className="text-gray-600 mb-4">{achievement.title}</p>
        <div className="text-sm text-gray-500 mb-6">{achievement.description}</div>
        <button
          onClick={() => {/* Handle close */}}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
};