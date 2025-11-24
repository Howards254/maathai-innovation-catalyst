import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, Image, Users, X } from 'lucide-react';
import { useMessaging } from '../contexts/MessagingContext';
import { useAuth } from '../contexts/AuthContext';
import { useFollow } from '../contexts/FollowContext';
import { uploadMedia } from '../lib/uploadMedia';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { conversations, messages, activeConversation, loading, sendMessage, loadConversation, startDirectChat } = useMessaging();
  const { getFriends } = useFollow();
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadFriends();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadFriends = async () => {
    if (!user) return;
    const data = await getFriends(user.id);
    setFriends(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    await sendMessage(activeConversation, newMessage.trim());
    setNewMessage('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !activeConversation) return;

    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map(file => uploadMedia(file, 'messages'))
      );
      await sendMessage(activeConversation, '', urls);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleStartChat = async (friendId: string) => {
    setShowNewChat(false);
    const convId = await startDirectChat(friendId);
    if (!convId) {
      alert('Failed to start chat. Please try again.');
    }
  };

  const getConvName = (conv: any) => {
    if (!conv) return 'User';
    if (conv.is_group) return conv.name || 'Group Chat';
    const otherUser = conv.participants?.find((p: any) => p.user_id !== user?.id);
    return otherUser?.profiles?.full_name || 'User';
  };

  const getConvAvatar = (conv: any) => {
    if (!conv) return 'https://via.placeholder.com/48';
    if (conv.is_group) return conv.avatar_url || 'https://via.placeholder.com/48';
    const otherUser = conv.participants?.find((p: any) => p.user_id !== user?.id);
    return otherUser?.profiles?.avatar_url || 'https://via.placeholder.com/48';
  };

  const filteredConversations = conversations.filter(conv => {
    const name = getConvName(conv);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations Sidebar */}
      <div className={`${
        activeConversation ? 'hidden md:flex' : 'flex'
      } w-full md:w-80 bg-white border-r border-gray-200 flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => loadConversation(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeConversation === conversation.id ? 'bg-green-50 border-green-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={getConvAvatar(conversation)}
                    alt={getConvName(conversation)}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {getConvName(conversation)}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.last_message?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${
        activeConversation ? 'flex' : 'hidden md:flex'
      } flex-1 flex-col`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => loadConversation(null)}
                  className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {(() => {
                  const activeConv = conversations.find(c => c.id === activeConversation);
                  return (
                    <>
                      <img
                        src={getConvAvatar(activeConv)}
                        alt={getConvName(activeConv)}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {getConvName(activeConv)}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {activeConv?.is_group 
                            ? `${activeConv?.participants?.length || 0} members`
                            : 'Active now'}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  const activeConv = conversations.find(c => c.id === activeConversation);
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && (
                        <img
                          src={getConvAvatar(activeConv)}
                          alt=""
                          className="w-7 h-7 rounded-full mr-2 flex-shrink-0 md:hidden"
                        />
                      )}
                      <div className={`max-w-[75%] md:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-2xl ${
                        isOwn ? 'bg-green-500 text-white rounded-br-sm' : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                      }`}>
                        {message.content && <p className="text-sm md:text-base break-words">{message.content}</p>}
                        {message.media_urls?.length > 0 && (
                          <div className="grid grid-cols-2 gap-1 mt-2">
                            {message.media_urls.map((url, i) => (
                              <img key={i} src={url} alt="" className="rounded max-w-full" />
                            ))}
                          </div>
                        )}
                        <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-3 md:p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <label className="cursor-pointer p-2 text-gray-500 hover:text-gray-700">
                  <Image className="w-5 h-5" />
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message..."
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || uploading}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Start New Chat</h3>
              <button onClick={() => setShowNewChat(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {friends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => handleStartChat(friend.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <img src={friend.avatar_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full" />
                  <span className="font-medium">{friend.full_name}</span>
                </button>
              ))}
              {friends.length === 0 && (
                <p className="text-center text-gray-500 py-4">No friends yet. Follow users to start chatting!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
