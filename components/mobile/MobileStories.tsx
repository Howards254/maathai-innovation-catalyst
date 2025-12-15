import React, { useState } from 'react';
import { Plus, Play } from 'lucide-react';
import { useStories } from '../../contexts/StoriesContext';
import { useUser } from '../../contexts/UserContext';

const MobileStories: React.FC = () => {
  const { stories, loading } = useStories();
  const { user } = useUser();
  const [showCreateStory, setShowCreateStory] = useState(false);

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

          {/* Story Cards */}
          {stories.map((story) => (
            <div
              key={story.id}
              className="aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden relative group"
            >
              {story.media_type === 'video' ? (
                <video
                  src={story.media_url}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={story.media_url}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Play Button for Videos */}
              {story.media_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              )}
              
              {/* Story Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={story.author?.avatar_url || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
                    alt="Author"
                    className="w-6 h-6 rounded-full border-2 border-white"
                  />
                  <span className="text-white text-sm font-medium">
                    {story.author?.full_name || 'Anonymous'}
                  </span>
                </div>
                <h3 className="text-white text-sm font-semibold line-clamp-2">
                  {story.title}
                </h3>
              </div>
            </div>
          ))}
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