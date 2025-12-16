import React, { useState } from 'react';
import { Play, Users, Clock, Calendar, Send, Heart, ThumbsUp, Flame, Smile } from 'lucide-react';
import { useLiveStream } from '../contexts/LiveStreamContext';
import { formatDistanceToNow } from 'date-fns';

const LiveStreams: React.FC = () => {
  const { streams, activeStream, chatMessages, isWatching, createStream, joinStream, leaveStream, sendChatMessage, sendReaction } = useLiveStream();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'environmental', 'education', 'campaign', 'workshop'];
  const reactions = ['🌱', '💚', '🔥', '👏', '❤️', '😍', '🎉', '💪'];

  const filteredStreams = selectedCategory === 'all' 
    ? streams 
    : streams.filter(stream => stream.category === selectedCategory);

  const liveStreams = filteredStreams.filter(stream => stream.is_live);
  const upcomingStreams = filteredStreams.filter(stream => !stream.is_live && stream.scheduled_for);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeStream) return;
    
    sendChatMessage(activeStream.id, chatMessage.trim());
    setChatMessage('');
  };

  const CreateStreamModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Create Live Stream</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          createStream({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as any,
            scheduled_for: formData.get('scheduled_for') as string
          });
          setShowCreateModal(false);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stream Title</label>
              <input
                name="title"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter stream title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe your stream"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="environmental">Environmental</option>
                <option value="education">Education</option>
                <option value="campaign">Campaign</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule For (Optional)</label>
              <input
                name="scheduled_for"
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Create Stream
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isWatching && activeStream) {
    return (
      <div className="min-h-screen bg-black flex">
        {/* Video Player */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-900 aspect-video flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Live Stream: {activeStream.title}</p>
              <p className="text-sm opacity-75">{activeStream.viewer_count} viewers</p>
            </div>
          </div>
          
          {/* Stream Info */}
          <div className="bg-white p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={activeStream.host?.avatar_url || `https://ui-avatars.com/api/?name=${activeStream.host?.full_name}&background=10b981&color=fff`}
                  alt={activeStream.host?.full_name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="font-semibold">{activeStream.title}</h2>
                  <p className="text-sm text-gray-600">{activeStream.host?.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => leaveStream(activeStream.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Leave Stream
              </button>
            </div>
          </div>

          {/* Reactions Bar */}
          <div className="bg-white p-2 border-b">
            <div className="flex space-x-2">
              {reactions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(activeStream.id, emoji)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Chat */}
        <div className="w-80 bg-white flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Live Chat</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map(message => (
              <div key={message.id} className="flex space-x-2">
                <img
                  src={message.user?.avatar_url || `https://ui-avatars.com/api/?name=${message.user?.full_name}&background=10b981&color=fff`}
                  alt={message.user?.full_name}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {message.user?.full_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{message.message}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Live Streams</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Create Stream
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Live Streams */}
        {liveStreams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map(stream => (
                <div key={stream.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="aspect-video bg-gray-900 relative">
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      LIVE
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {stream.viewer_count} viewers
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{stream.title}</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <img
                        src={stream.host?.avatar_url || `https://ui-avatars.com/api/?name=${stream.host?.full_name}&background=10b981&color=fff`}
                        alt={stream.host?.full_name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600">{stream.host?.full_name}</span>
                    </div>
                    <button
                      onClick={() => joinStream(stream.id)}
                      className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                    >
                      Join Stream
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Streams */}
        {upcomingStreams.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Streams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingStreams.map(stream => (
                <div key={stream.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{stream.title}</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <img
                        src={stream.host?.avatar_url || `https://ui-avatars.com/api/?name=${stream.host?.full_name}&background=10b981&color=fff`}
                        alt={stream.host?.full_name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600">{stream.host?.full_name}</span>
                    </div>
                    {stream.scheduled_for && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(stream.scheduled_for).toLocaleString()}</span>
                      </div>
                    )}
                    <button className="w-full px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50">
                      Set Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredStreams.length === 0 && (
          <div className="text-center py-12">
            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No streams available</h3>
            <p className="text-gray-500">Be the first to create a live stream!</p>
          </div>
        )}
      </div>

      {showCreateModal && <CreateStreamModal />}
    </div>
  );
};

export default LiveStreams;