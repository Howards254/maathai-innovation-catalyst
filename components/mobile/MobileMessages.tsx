import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, ArrowLeft } from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../contexts/AuthContext';

const MobileMessages: React.FC = () => {
  const { conversations, activeConversation, loadConversation } = useMessaging();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const name = conv.is_group ? conv.name : conv.participants?.find(p => p.user_id !== user?.id)?.profiles?.full_name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <Link to="/app/messages/new" className="p-2 bg-green-600 text-white rounded-full">
            <Edit className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="pb-20">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-600">Start messaging with your eco-friends!</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = conversation.participants?.find(p => p.user_id !== user?.id);
            const name = conversation.is_group ? conversation.name : otherUser?.profiles?.full_name;
            const avatar = conversation.is_group ? conversation.avatar_url : otherUser?.profiles?.avatar_url;
            
            return (
              <div
                key={conversation.id}
                onClick={() => loadConversation(conversation.id)}
                className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="relative">
                  <img
                    src={avatar || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
                    alt={name}
                    className="w-12 h-12 rounded-full"
                  />
                  {conversation.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                    <span className="text-xs text-gray-500">2m</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileMessages;