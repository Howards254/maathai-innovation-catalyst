import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Crown, Shield, User, MessageSquare, Calendar, Pin, ThumbsUp, Share2, MoreHorizontal, Image, FileText, MapPin, Eye, Lock, Filter, TrendingUp, Star } from 'lucide-react';
import { useGroups, Group } from '../contexts/GroupsContext';
import { formatDistanceToNow } from 'date-fns';

const Groups: React.FC = () => {
  const { groups, myGroups, groupPosts, loading, createGroup, joinGroup, leaveGroup, loadGroupPosts, createGroupPost, likePost, addComment, loadGroups, loadMyGroups } = useGroups();
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups' | 'group-detail'>('discover');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'members'>('recent');
  const [postContent, setPostContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postType, setPostType] = useState<'discussion' | 'announcement' | 'event' | 'poll'>('discussion');
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});

  const categories = ['Environmental Action', 'Tree Planting', 'Climate Change', 'Sustainability', 'Conservation', 'Education'];
  const allCategories = ['all', ...categories];

  // Load groups on component mount
  useEffect(() => {
    loadGroups().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'my-groups') {
      loadMyGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || group.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.member_count || 0) - (a.member_count || 0);
      case 'members':
        return (b.member_count || 0) - (a.member_count || 0);
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleGroupClick = (group: Group) => {
    if (!group || !group.id) {
      console.error('Invalid group data:', group);
      return;
    }
    setSelectedGroup(group);
    setActiveTab('group-detail');
    loadGroupPosts(group.id);
  };

  const handleCreatePost = async () => {
    if (!selectedGroup || !postTitle.trim() || !postContent.trim()) return;
    
    await createGroupPost(selectedGroup.id, {
      title: postTitle,
      content: postContent,
      post_type: postType
    });
    
    setPostTitle('');
    setPostContent('');
    setShowCreatePost(false);
  };

  const handleAddComment = async (postId: string) => {
    const comment = newComment[postId];
    if (!comment?.trim()) return;
    
    await addComment(postId, comment);
    setNewComment(prev => ({ ...prev, [postId]: '' }));
  };

  const getActivityBadge = (memberCount: number, postCount: number = 0) => {
    if (memberCount > 1000 || postCount > 100) return { text: 'Very Active', color: 'bg-green-100 text-green-800' };
    if (memberCount > 100 || postCount > 20) return { text: 'Active', color: 'bg-blue-100 text-blue-800' };
    return { text: 'Growing', color: 'bg-yellow-100 text-yellow-800' };
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
        <h3 className="text-lg font-semibold mb-4">Create New Community</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          createGroup({
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            visibility: formData.get('visibility') as 'public' | 'private' | 'secret',
            location: formData.get('location') as string,
            tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || []
          });
          setShowCreateGroup(false);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Community Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter community name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="What's this community about?"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
              <select
                name="visibility"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="public">🌍 Public - Anyone can see and join</option>
                <option value="private">🔒 Private - Members must be approved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
              <input
                name="location"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
              <input
                name="tags"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="trees, climate, sustainability (comma separated)"
              />
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
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const CreatePostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <h3 className="text-lg font-semibold mb-4">Create Post in {selectedGroup?.name}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
            <div className="flex space-x-2">
              {[
                { type: 'discussion', icon: MessageSquare, label: 'Discussion' },
                { type: 'announcement', icon: Pin, label: 'Announcement' },
                { type: 'photo', icon: Image, label: 'Photo' },
                { type: 'poll', icon: FileText, label: 'Poll' }
              ].map(({ type, icon: Icon, label }: { type: string; icon: React.ComponentType<{ className?: string }>; label: string }) => (
                <button
                  key={type}
                  onClick={() => setPostType(type as 'discussion' | 'announcement' | 'event' | 'poll')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    postType === type ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="What's your post about?"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              placeholder="Share your thoughts, experiences, or questions..."
              autoComplete="off"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowCreatePost(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePost}
            disabled={!postTitle.trim() || !postContent.trim()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
              <p className="text-gray-600">Connect with like-minded environmental enthusiasts</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Community</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'discover' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Discover Communities</span>
          </button>
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-groups' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>My Communities ({myGroups.length})</span>
          </button>
        </div>

        {activeTab === 'discover' && (
          <div>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading communities...</p>
              </div>
            )}
            
            {!loading && groups.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
                <p className="text-gray-500 mb-4">Be the first to create a community!</p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Create Community
                </button>
              </div>
            )}
            
            {!loading && groups.length > 0 && (
              <>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'members')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="members">Most Members</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-500">
                  {filteredGroups.length} communities found
                </div>
              </div>
            </div>

            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => {
                const activityBadge = getActivityBadge(group.member_count, group.post_count);
                return (
                  <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                    <div className="h-32 bg-gradient-to-r from-emerald-400 to-green-500 relative">
                      {group.cover_image_url ? (
                        <img src={group.cover_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center">
                          <Users className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col space-y-1">
                        <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                          {group.category}
                        </span>
                        {group.visibility === 'private' && (
                          <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Private</span>
                          </span>
                        )}
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${activityBadge.color}`}>
                          {activityBadge.text}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 flex-1">{group.name}</h3>
                        {group.is_member && (
                          <Star className="w-4 h-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{group.description}</p>
                      
                      {/* Tags */}
                      {group.tags && group.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {group.tags.slice(0, 3).map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                          {group.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{group.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{group.member_count}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{group.post_count || 0}</span>
                          </span>
                        </div>
                        {group.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{group.location}</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGroupClick(group)}
                          className="flex-1 px-3 py-2 text-emerald-600 border border-emerald-600 rounded-md text-sm hover:bg-emerald-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          View
                        </button>
                        {group.is_member ? (
                          <button
                            onClick={() => leaveGroup(group.id)}
                            className="px-3 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
                          >
                            Leave
                          </button>
                        ) : (
                          <button
                            onClick={() => joinGroup(group.id)}
                            className="px-3 py-2 bg-emerald-500 text-white rounded-md text-sm hover:bg-emerald-600 transition-colors"
                          >
                            {group.visibility === 'private' ? 'Request' : 'Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
              </>
            )}
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
                      onClick={() => handleGroupClick(group)}
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
          <div className="space-y-6">
            {/* Group Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-emerald-400 to-green-500 relative">
                {selectedGroup.banner_image_url ? (
                  <img src={selectedGroup.banner_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center">
                    <Users className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <button
                  onClick={() => setActiveTab('discover')}
                  className="absolute top-4 left-4 text-white hover:text-gray-200 flex items-center space-x-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg"
                >
                  <span>← Back to Communities</span>
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h1>
                      {selectedGroup.visibility === 'private' && (
                        <span className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{selectedGroup.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedGroup.member_count} members</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{selectedGroup.post_count || 0} posts</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatDistanceToNow(new Date(selectedGroup.created_at), { addSuffix: true })}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    {selectedGroup.is_member ? (
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Post</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => joinGroup(selectedGroup.id)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        {selectedGroup.visibility === 'private' ? 'Request to Join' : 'Join Community'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Tags */}
                {selectedGroup.tags && selectedGroup.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedGroup.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {groupPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-4">Be the first to start a discussion in this community!</p>
                    {selectedGroup.is_member && (
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Create First Post
                      </button>
                    )}
                  </div>
                ) : (
                  groupPosts.map((post) => (
                    <div key={post.id} className="p-6">
                      <div className="flex items-start space-x-3">
                        <img
                          src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.full_name}&background=10b981&color=fff`}
                          alt={post.author?.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{post.author?.full_name}</span>
                              {post.is_pinned && (
                                <span className="flex items-center space-x-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                  <Pin className="w-3 h-3" />
                                  <span>Pinned</span>
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'Recently'}
                              </span>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                          
                          {/* Post Actions */}
                          <div className="flex items-center space-x-6 text-sm">
                            <button
                              onClick={() => likePost && likePost(post.id)}
                              className="flex items-center space-x-2 text-gray-500 hover:text-emerald-600 transition-colors"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>{post.like_count} likes</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                              <span>{post.comment_count} comments</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                              <Share2 className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                          </div>
                          
                          {/* Comments Section */}
                          <div className="mt-4 space-y-3">
                            {/* Add Comment */}
                            <div className="flex items-start space-x-3">
                              <img
                                src={`https://ui-avatars.com/api/?name=You&background=10b981&color=fff`}
                                alt="You"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={newComment[post.id] || ''}
                                  onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddComment(post.id);
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateGroup && <CreateGroupModal />}
      {showCreatePost && <CreatePostModal />}
    </div>
  );
};

export default Groups;