import React, { useState } from 'react';
import { Users, Plus, Search, Crown, Shield, User, MessageSquare, Calendar, Pin } from 'lucide-react';
import { useGroups } from '../contexts/GroupsContext';
import { formatDistanceToNow } from 'date-fns';

const Groups: React.FC = () => {
  const { groups, myGroups, groupPosts, loading, createGroup, joinGroup, leaveGroup, loadGroupPosts } = useGroups();
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups' | 'group-detail'>('discover');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Environmental Action', 'Tree Planting', 'Climate Change', 'Sustainability', 'Conservation', 'Education'];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGroupClick = (groupId: string) => {
    setSelectedGroup(groupId);
    setActiveTab('group-detail');
    loadGroupPosts(groupId);
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const CreateGroupModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          createGroup({
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            is_private: formData.get('is_private') === 'on'
          });
          setShowCreateGroup(false);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter group name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe your group"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                name="is_private"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Private Group</label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowCreateGroup(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-emerald-500" />
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'discover' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Discover Groups
          </button>
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-groups' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Groups ({myGroups.length})
          </button>
        </div>

        {activeTab === 'discover' && (
          <div>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gradient-to-r from-emerald-400 to-green-500 relative">
                    {group.cover_image_url && (
                      <img src={group.cover_image_url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                        {group.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{group.member_count} members</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGroupClick(group.id)}
                          className="px-3 py-1 text-emerald-600 border border-emerald-600 rounded-md text-sm hover:bg-emerald-50"
                        >
                          View
                        </button>
                        {group.is_member ? (
                          <button
                            onClick={() => leaveGroup(group.id)}
                            className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                          >
                            Leave
                          </button>
                        ) : (
                          <button
                            onClick={() => joinGroup(group.id)}
                            className="px-3 py-1 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my-groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-emerald-400 to-green-500 relative">
                  {group.cover_image_url && (
                    <img src={group.cover_image_url} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 right-2 flex items-center space-x-1">
                    {getRoleIcon(group.user_role)}
                    <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                      {group.user_role}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{group.member_count} members</span>
                    <button
                      onClick={() => handleGroupClick(group.id)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'group-detail' && selectedGroup && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('my-groups')}
                className="text-emerald-600 hover:text-emerald-700 mb-4"
              >
                ← Back to Groups
              </button>
              <h2 className="text-xl font-semibold text-gray-900">Group Posts</h2>
            </div>
            <div className="p-6">
              {groupPosts.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No posts yet. Be the first to start a discussion!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.full_name}&background=10b981&color=fff`}
                          alt={post.author?.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{post.author?.full_name}</span>
                            {post.is_pinned && <Pin className="w-4 h-4 text-emerald-500" />}
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{post.title}</h4>
                          <p className="text-gray-700 mb-3">{post.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{post.like_count} likes</span>
                            <span>{post.comment_count} comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateGroup && <CreateGroupModal />}
    </div>
  );
};

export default Groups;