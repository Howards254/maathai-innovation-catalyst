import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, Image, Users, X, Phone, Video, Info, Plus, Smile } from 'lucide-react';
import { useMessaging } from '../contexts/MessagingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { uploadMedia } from '../lib/uploadMedia';

interface User {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  is_online?: boolean;
  last_seen?: string;
}

const EnhancedMessages: React.FC = () => {
  const { user } = useAuth();
  const { conversations, messages, activeConversation, loading, sendMessage, loadConversation, startDirectChat } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadAllUsers();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (userSearchTerm.trim()) {
      const filtered = allUsers.filter(u => 
        u.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setSearchUsers(filtered);
    } else {
      setSearchUsers(allUsers.slice(0, 20)); // Show first 20 users
    }
  }, [userSearchTerm, allUsers]);

  const loadAllUsers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, is_online, last_seen')
        .neq('id', user.id)
        .order('is_online', { ascending: false })
        .order('full_name', { ascending: true })
        .limit(100);
      
      if (!error && data) {
        setAllUsers(data);
        setSearchUsers(data.slice(0, 20));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
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

  const handleStartChat = async (userId: string) => {
    setShowNewChat(false);
    const convId = await startDirectChat(userId);
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
    if (!conv) return `https://ui-avatars.com/api/?name=User&background=10b981&color=fff`;
    if (conv.is_group) return conv.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name || 'Group')}&background=10b981&color=fff`;
    const otherUser = conv.participants?.find((p: any) => p.user_id !== user?.id);
    const name = otherUser?.profiles?.full_name || 'User';
    return otherUser?.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`;
  };

  const getLastMessageTime = (timestamp: string) => {
    const now = new Date();
    const msgTime = new Date(timestamp);
    const diffMs = now.getTime() - msgTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return msgTime.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    const name = getConvName(conv);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <div className="flex h-screen bg-white">
      {/* Conversations Sidebar - Instagram/Facebook style */}
      <div className={`${
        activeConversation ? 'hidden lg:flex' : 'flex'
      } w-full lg:w-80 xl:w-96 bg-white border-r border-gray-200 flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Messenger"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-2 text-blue-500 hover:text-blue-600 font-medium"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => loadConversation(conversation.id)}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeConversation === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={getConvAvatar(conversation)}
                      alt={getConvName(conversation)}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    {conversation.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {getConvName(conversation)}
                      </p>
                      {conversation.last_message && (
                        <span className="text-xs text-gray-500">
                          {getLastMessageTime(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${
                      conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {conversation.last_message?.content || 'Start a conversation'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Instagram/Facebook style */}
      <div className={`${
        activeConversation ? 'flex' : 'hidden lg:flex'
      } flex-1 flex-col h-full`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => loadConversation(null)}
                  className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
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
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
                  <Video className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowUserInfo(!showUserInfo)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
                  const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.sender_id !== message.sender_id;
                  
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                      isLastInGroup ? 'mb-3' : 'mb-1'
                    }`}>
                      {!isOwn && (
                        <div className="w-8 mr-2 flex-shrink-0">
                          {showAvatar && (
                            <img
                              src={getConvAvatar(activeConv)}
                              alt=""
                              className="w-7 h-7 rounded-full"
                            />
                          )}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isOwn 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-900 border border-gray-200'
                      } ${
                        isOwn 
                          ? (isLastInGroup ? 'rounded-br-md' : 'rounded-br-lg')
                          : (isLastInGroup ? 'rounded-bl-md' : 'rounded-bl-lg')
                      }`}>
                        {message.content && <p className="break-words">{message.content}</p>}
                        {message.media_urls?.length > 0 && (
                          <div className="grid grid-cols-2 gap-1 mt-2">
                            {message.media_urls.map((url, i) => (
                              <img key={i} src={url} alt="" className="rounded-lg max-w-full" />
                            ))}
                          </div>
                        )}
                        {isLastInGroup && (
                          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <label className="cursor-pointer p-2 text-blue-500 hover:bg-blue-50 rounded-full">
                  <Image className="w-5 h-5" />
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Aa"
                    disabled={uploading}
                    className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || uploading}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
              <p className="text-gray-500 mb-4">Send private messages to friends and connections</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">New Message</h3>
              <button onClick={() => setShowNewChat(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Search users */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search people..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Users list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {searchUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleStartChat(user.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <img 
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=10b981&color=fff`} 
                      alt="" 
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                    {user.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </button>
              ))}
              {searchUsers.length === 0 && (
                <p className="text-center text-gray-500 py-8">No users found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMessages;