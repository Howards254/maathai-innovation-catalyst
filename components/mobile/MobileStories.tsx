import React, { useState } from 'react';
import { Plus, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MobileStories: React.FC = () => {
  const { user } = useAuth();
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [stories] = useState([]);
  const [loading] = useState(false);

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h1 className="text-xl font-bold">Stories</h1>
        <button
          onClick={() => setShowCreateStory(true)}
          className="p-2 bg-green-600 rounded-full"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Stories Grid */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 gap-3">
          {/* Create Story Card */}
          <button
            onClick={() => setShowCreateStory(true)}
            className="aspect-[9/16] bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Create Story</p>
            </div>
          </button>

          {/* Placeholder for now */}
          {stories.length === 0 && !loading && (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-400">No stories yet. Create your first story!</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading stories...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileStories;