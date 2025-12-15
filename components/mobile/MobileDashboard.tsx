import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Plus, TrendingUp, Users, TreePine, MessageCircle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useDiscussions } from '../../contexts/DiscussionContext';

const MobileDashboard: React.FC = () => {
  const { user } = useUser();
  const { campaigns } = useCampaigns();
  const { discussions } = useDiscussions();
  const navigate = useNavigate();

  const stats = [
    { label: 'Trees Planted', value: user?.treesPlanted || 0, icon: TreePine, color: 'text-green-600' },
    { label: 'Impact Points', value: user?.impactPoints || 0, icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Campaigns', value: campaigns.length, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Welcome back!</h1>
            <p className="text-green-100">{user?.fullName || 'Environmental Champion'}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <img
              src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <Icon className="w-5 h-5 mx-auto mb-1 text-white" />
                <p className="text-lg font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-green-100">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Post Section */}
      <div className="bg-white mx-4 -mt-4 rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <input
            type="text"
            placeholder="Share your environmental impact..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
            onClick={() => navigate('/app/discussions')}
            readOnly
          />
          <button
            onClick={() => navigate('/app/stories')}
            className="p-2 bg-green-600 text-white rounded-full"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/app/campaigns/create"
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Start Campaign</h3>
            <p className="text-xs text-gray-600">Create a tree planting campaign</p>
          </Link>
          
          <Link
            to="/app/matchmaking"
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Find Friends</h3>
            <p className="text-xs text-gray-600">Connect with eco-warriors</p>
          </Link>
        </div>
      </div>

      {/* Featured Campaigns */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Featured Campaigns</h2>
          <Link to="/app/campaigns" className="text-sm text-green-600 font-medium">
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {campaigns.slice(0, 3).map((campaign) => (
            <Link
              key={campaign.id}
              to={`/app/campaigns/${campaign.id}`}
              className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 transition-colors"
            >
              <div className="flex">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-20 h-20 object-cover"
                />
                <div className="flex-1 p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                    {campaign.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">by {campaign.organizer}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-medium">
                      🌳 {campaign.plantedTrees.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {campaign.daysLeft}d left
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Discussions */}
      <div className="px-4 mb-20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Recent Discussions</h2>
          <Link to="/app/discussions" className="text-sm text-green-600 font-medium">
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {discussions.slice(0, 3).map((discussion) => (
            <Link
              key={discussion.id}
              to="/app/discussions"
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <img
                  src={discussion.author?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
                  alt="Author"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                    {discussion.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {discussion.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {discussion.commentsCount || 0}
                    </span>
                    <span>{discussion.postedAt}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;