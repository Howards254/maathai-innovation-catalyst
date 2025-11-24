import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Heart, MessageCircle, Share2, Bookmark, Play, Volume2, VolumeX } from 'lucide-react';
import { useStories } from '../contexts/StoriesContext';
import CreateStoryModal from '../components/CreateStoryModal';

const Stories: React.FC = () => {
  const { stories, loading } = useStories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo && isPlaying && isFullScreen) {
      currentVideo.play();
    }
  }, [currentIndex, isPlaying, isFullScreen]);

  const toggleLike = (storyId: string) => {
    setLikes(prev => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  const handleShare = (story: any) => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Camera className="w-16 h-16 mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900">No Impact Stories Yet</h2>
        <p className="text-gray-600 mb-6">Be the first to share your environmental impact!</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Share Your Story
        </button>
      </div>
    );
  }

  // Normal layout with sidebar
  if (!isFullScreen) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Camera className="w-6 h-6 text-green-600" />
              Impact Stories
            </h1>
            <p className="text-gray-600 text-sm mt-1">Share and discover environmental impact</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullScreen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Full Screen
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Share Story
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative bg-black" style={{ aspectRatio: '9/16' }}>
                {story.media_type === 'video' ? (
                  <video src={story.media_url} className="w-full h-full object-cover" controls playsInline />
                ) : (
                  <img src={story.media_url} alt={story.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={story.author?.avatar_url || `https://ui-avatars.com/api/?name=${story.author?.full_name}&background=10b981&color=fff`}
                    alt={story.author?.full_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{story.author?.full_name}</p>
                    <p className="text-xs text-gray-500">@{story.author?.username}</p>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{story.title}</h3>
                {story.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{story.description}</p>
                )}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {story.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs text-green-600">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button onClick={() => toggleLike(story.id)} className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart className={`w-4 h-4 ${likes[story.id] ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{story.reactions?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{story.comments?.length || 0}</span>
                  </button>
                  <button onClick={() => handleShare(story)} className="flex items-center gap-1 hover:text-green-500 transition-colors ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <CreateStoryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      </div>
    );
  }

  // Full screen layout
  return (
    <>
      <div className="fixed inset-0 bg-black z-50">
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsFullScreen(false)}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        <div ref={containerRef} className="h-full overflow-y-scroll snap-y snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {stories.map((story, index) => (
            <div key={story.id} className="relative h-screen w-full snap-start flex items-center justify-center">
              {story.media_type === 'video' ? (
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={story.media_url}
                  className="w-full h-full object-contain"
                  style={{ maxWidth: '100vw', maxHeight: '100vh' }}
                  loop
                  playsInline
                  muted={isMuted}
                />
              ) : (
                <img src={story.media_url} alt={story.title} className="w-full h-full object-contain" style={{ maxWidth: '100vw', maxHeight: '100vh' }} />
              )}

              <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-10">
                <button onClick={() => toggleLike(story.id)} className="flex flex-col items-center gap-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${likes[story.id] ? 'bg-red-500' : 'bg-gray-800/50'}`}>
                    <Heart className={`w-6 h-6 ${likes[story.id] ? 'fill-white text-white' : 'text-white'}`} />
                  </div>
                  <span className="text-white text-xs">{story.reactions?.length || 0}</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs">{story.comments?.length || 0}</span>
                </button>
                <button onClick={() => handleShare(story)} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={story.author?.avatar_url || `https://ui-avatars.com/api/?name=${story.author?.full_name}&background=10b981&color=fff`}
                    alt={story.author?.full_name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">{story.author?.full_name}</p>
                    <p className="text-gray-300 text-sm">@{story.author?.username}</p>
                  </div>
                </div>
                <p className="text-white mb-2">{story.title}</p>
                {story.description && <p className="text-gray-300 text-sm mb-2">{story.description}</p>}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag, i) => (
                      <span key={i} className="text-white text-sm">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateStoryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  );
};

export default Stories;
