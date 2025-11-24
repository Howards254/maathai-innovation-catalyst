import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Heart, MessageCircle, Share2, Bookmark, MoreVertical, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useStories } from '../contexts/StoriesContext';
import CreateStoryModal from '../components/CreateStoryModal';

const Stories: React.FC = () => {
  const { stories, loading } = useStories();
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trending'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-play current video
  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo && isPlaying) {
      currentVideo.play();
    }
  }, [currentIndex, isPlaying]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const itemHeight = window.innerHeight - 64; // minus header
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < stories.length) {
      // Pause previous video
      const prevVideo = videoRefs.current[currentIndex];
      if (prevVideo) prevVideo.pause();
      setCurrentIndex(newIndex);
    }
  };

  const toggleLike = (storyId: string) => {
    setLikes(prev => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  const toggleBookmark = (storyId: string) => {
    setBookmarks(prev => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  const togglePlayPause = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause();
      } else {
        currentVideo.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.muted = !isMuted;
      setIsMuted(!isMuted);
    }
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
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <Camera className="w-16 h-16 mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2">No Impact Stories Yet</h2>
        <p className="text-gray-400 mb-6 text-center">Be the first to share your environmental impact!</p>
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

  return (
    <>
      {/* TikTok/Reels Style Full Screen */}
      <div className="fixed inset-0 bg-black">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-white font-bold text-lg flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Impact Stories
              </h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Share
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex justify-center gap-6 px-4 pb-4">
            {['all', 'following', 'trending'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-sm font-medium transition-colors ${
                  activeTab === tab ? 'text-white border-b-2 border-white pb-1' : 'text-gray-400'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Container - Vertical Scroll */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="relative h-screen w-full snap-start snap-always flex items-center justify-center"
            >
              {/* Media */}
              {story.media_type === 'video' ? (
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={story.media_url}
                  className="absolute inset-0 w-full h-full object-contain"
                  loop
                  playsInline
                  muted={isMuted}
                  onClick={togglePlayPause}
                />
              ) : (
                <img
                  src={story.media_url}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-contain"
                  onClick={togglePlayPause}
                />
              )}

              {/* Play/Pause Overlay */}
              {!isPlaying && index === currentIndex && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
              )}

              {/* Right Side Actions */}
              <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-10">
                {/* Like */}
                <button
                  onClick={() => toggleLike(story.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    likes[story.id] ? 'bg-red-500' : 'bg-gray-800/50'
                  }`}>
                    <Heart className={`w-6 h-6 ${
                      likes[story.id] ? 'fill-white text-white' : 'text-white'
                    }`} />
                  </div>
                  <span className="text-white text-xs font-medium">{story.reactions?.length || 0}</span>
                </button>

                {/* Comment */}
                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">{story.comments?.length || 0}</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => handleShare(story)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">Share</span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={() => toggleBookmark(story.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center">
                    <Bookmark className={`w-6 h-6 ${
                      bookmarks[story.id] ? 'fill-white text-white' : 'text-white'
                    }`} />
                  </div>
                </button>

                {/* Mute/Unmute for videos */}
                {story.media_type === 'video' && (
                  <button
                    onClick={toggleMute}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center">
                      {isMuted ? (
                        <VolumeX className="w-6 h-6 text-white" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </button>
                )}
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                {/* User Info */}
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
                  <button className="px-4 py-1.5 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors">
                    Follow
                  </button>
                </div>

                {/* Caption */}
                <p className="text-white mb-2">{story.title}</p>
                {story.description && (
                  <p className="text-gray-300 text-sm mb-2">{story.description}</p>
                )}

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {story.tags.map((tag, i) => (
                      <span key={i} className="text-white text-sm">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Location */}
                {story.location && (
                  <p className="text-gray-300 text-sm flex items-center gap-1">
                    📍 {story.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  );
};

export default Stories;

// Hide scrollbar CSS
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);