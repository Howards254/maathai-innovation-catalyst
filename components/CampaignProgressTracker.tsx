import React from 'react';
import { Trophy, Target, Users, Calendar, TrendingUp, CheckCircle } from 'lucide-react';

interface Milestone {
  id: string;
  trees: number;
  title: string;
  description: string;
  reward: string;
  achieved: boolean;
  achievedAt?: string;
}

interface CampaignProgressTrackerProps {
  campaign: {
    id: string;
    title: string;
    targetTrees: number;
    plantedTrees: number;
    daysLeft: number;
    participants: string[];
    startDate: string;
    endDate: string;
  };
  submissions?: Array<{
    id: string;
    treesCount: number;
    createdAt: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

const CampaignProgressTracker: React.FC<CampaignProgressTrackerProps> = ({ 
  campaign, 
  submissions = [] 
}) => {
  const progressPercentage = Math.min((campaign.plantedTrees / campaign.targetTrees) * 100, 100);
  
  // Generate milestones based on target
  const milestones: Milestone[] = [
    {
      id: '25',
      trees: Math.floor(campaign.targetTrees * 0.25),
      title: 'First Quarter',
      description: '25% of trees planted',
      reward: 'Early Adopter Badge',
      achieved: campaign.plantedTrees >= Math.floor(campaign.targetTrees * 0.25)
    },
    {
      id: '50',
      trees: Math.floor(campaign.targetTrees * 0.5),
      title: 'Halfway Point',
      description: '50% of trees planted',
      reward: 'Momentum Builder Badge',
      achieved: campaign.plantedTrees >= Math.floor(campaign.targetTrees * 0.5)
    },
    {
      id: '75',
      trees: Math.floor(campaign.targetTrees * 0.75),
      title: 'Final Stretch',
      description: '75% of trees planted',
      reward: 'Almost There Badge',
      achieved: campaign.plantedTrees >= Math.floor(campaign.targetTrees * 0.75)
    },
    {
      id: '100',
      trees: campaign.targetTrees,
      title: 'Campaign Complete',
      description: '100% of trees planted',
      reward: 'Campaign Champion Badge',
      achieved: campaign.plantedTrees >= campaign.targetTrees
    }
  ];

  // Calculate daily progress
  const totalDays = Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = totalDays - campaign.daysLeft;
  const dailyTarget = campaign.targetTrees / totalDays;
  const expectedTrees = Math.floor(dailyTarget * daysPassed);
  const isAheadOfSchedule = campaign.plantedTrees > expectedTrees;

  // Recent activity (last 7 days)
  const recentSubmissions = submissions
    .filter(sub => {
      const submissionDate = new Date(sub.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return submissionDate > weekAgo && sub.status === 'approved';
    })
    .reduce((sum, sub) => sum + sub.treesCount, 0);

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Campaign Progress</h3>
              <p className="text-green-100 text-sm">Track your environmental impact</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</div>
              <div className="text-green-100 text-sm">Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-1000 ease-out animate-progress"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>{campaign.plantedTrees.toLocaleString()} planted</span>
              <span>{campaign.targetTrees.toLocaleString()} target</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{campaign.daysLeft}</div>
              <div className="text-sm text-gray-600">Days Left</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{campaign.participants.length}</div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{recentSubmissions}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                isAheadOfSchedule ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Target className={`w-6 h-6 ${isAheadOfSchedule ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className={`text-2xl font-bold ${isAheadOfSchedule ? 'text-green-600' : 'text-red-600'}`}>
                {isAheadOfSchedule ? '+' : ''}{campaign.plantedTrees - expectedTrees}
              </div>
              <div className="text-sm text-gray-600">vs Target</div>
            </div>
          </div>

          {/* Schedule Status */}
          <div className={`mt-6 p-4 rounded-xl border-2 ${
            isAheadOfSchedule 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center gap-3">
              <TrendingUp className={`w-5 h-5 ${isAheadOfSchedule ? 'text-green-600' : 'text-orange-600'}`} />
              <div>
                <div className={`font-semibold ${isAheadOfSchedule ? 'text-green-800' : 'text-orange-800'}`}>
                  {isAheadOfSchedule ? 'Ahead of Schedule! 🎉' : 'Behind Schedule ⚡'}
                </div>
                <div className={`text-sm ${isAheadOfSchedule ? 'text-green-700' : 'text-orange-700'}`}>
                  Expected: {expectedTrees} trees by day {daysPassed}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-bold text-gray-900">Campaign Milestones</h3>
        </div>

        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-center gap-4">
              {/* Milestone Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                milestone.achieved 
                  ? 'bg-green-100 text-green-600' 
                  : campaign.plantedTrees >= milestone.trees * 0.8
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {milestone.achieved ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Trophy className="w-5 h-5" />
                )}
              </div>

              {/* Milestone Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold ${
                    milestone.achieved ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {milestone.title}
                  </h4>
                  <span className={`text-sm font-medium ${
                    milestone.achieved ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {milestone.trees.toLocaleString()} trees
                  </span>
                </div>
                <p className={`text-sm ${
                  milestone.achieved ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {milestone.description}
                </p>
                <div className={`text-xs mt-1 ${
                  milestone.achieved ? 'text-green-600' : 'text-gray-500'
                }`}>
                  🏆 Reward: {milestone.reward}
                </div>
              </div>

              {/* Progress to Milestone */}
              {!milestone.achieved && (
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900">
                    {Math.max(0, milestone.trees - campaign.plantedTrees)} to go
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (campaign.plantedTrees / milestone.trees) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {milestone.achieved && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Achieved
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Progress Chart Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Progress Timeline
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Progress Chart</h4>
          <p className="text-gray-600 text-sm">
            Visual progress tracking coming soon! Track daily tree planting progress over time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignProgressTracker;