import React, { useState } from 'react';
import { Camera, Plus } from 'lucide-react';
import { useStories } from '../contexts/StoriesContext';

const Stories: React.FC = () => {
  const { stories, loading } = useStories();
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trending'>('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Camera className="w-8 h-8 text-emerald-500" />
            <h1 className="text-2xl font-bold text-gray-900">Impact Stories</h1>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
            <Plus className="w-4 h-4" />
            <span>Share Story</span>
          </button>
        </div>

        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {['all', 'following', 'trending'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  {story.story_type === 'image' ? (
                    <img src={story.media_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <video src={story.media_url} className="w-full h-full object-cover" controls />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={story.user?.avatar_url || `https://ui-avatars.com/api/?name=${story.user?.full_name}&background=10b981&color=fff`}
                      alt={story.user?.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium text-gray-900">{story.user?.full_name}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{story.caption}</p>
                  {story.location && (
                    <p className="text-gray-500 text-xs mt-2">📍 {story.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;