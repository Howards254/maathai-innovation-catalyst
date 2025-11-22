import { useState } from 'react';
import { Plus, TrendingUp, Users, Globe } from 'lucide-react';
import StoriesFeed from '../components/StoriesFeed';
import CreateStoryModal from '../components/CreateStoryModal';

const Stories = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trending'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabs = [
    { id: 'all', label: 'All Stories', icon: Globe, description: 'Discover impact stories from everyone' },
    { id: 'following', label: 'Following', icon: Users, description: 'Stories from people you follow' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, description: 'Most popular stories today' }
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🎬 Impact Stories
              </h1>
              <p className="text-gray-600 text-sm mt-1">Share and discover environmental impact stories</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Share Your Story
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Description */}
          <div className="mt-3">
            <p className="text-sm text-gray-500">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <StoriesFeed feedType={activeTab} />
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default Stories;