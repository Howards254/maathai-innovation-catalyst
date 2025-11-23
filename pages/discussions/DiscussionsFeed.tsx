import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDiscussions } from '../../contexts/DiscussionContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import CreateDiscussionForm from '../../components/CreateDiscussionForm';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';

const DiscussionsFeed: React.FC = () => {
  const { discussions, loading, voteDiscussion, getUserVote } = useDiscussions();
  const { user: authUser } = useAuth();
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [reactions, setReactions] = useState<Record<string, string>>({});

  const reactionEmojis = ['💚', '🌱', '🔥', '👏', '🎉'];
  
  const categories = ['All', 'General', 'Help', 'Success Story', 'Tech'];
  const filteredDiscussions = categoryFilter === 'All' 
    ? discussions 
    : discussions.filter(d => d.category === categoryFilter);

  const handleVote = (discussionId: string, voteType: 'up' | 'down') => {
    voteDiscussion(discussionId, voteType);
  };
  
  const handleShare = (discussion: any) => {
    if (navigator.share) {
      navigator.share({
        title: discussion.title,
        text: discussion.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${discussion.title} - ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                💬 Discussions
              </h1>
              <p className="text-gray-600 text-sm mt-1">Share ideas and connect with the community</p>
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Post
            </button>
          </div>
        </div>
      </div>
      
      {showCreateForm && <CreateDiscussionForm onClose={() => setShowCreateForm(false)} />}
      
      {/* Category Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === category
                  ? 'bg-green-100 text-green-700 border-2 border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              {category === 'All' ? '🌍 All' : 
               category === 'General' ? '💬 General' :
               category === 'Help' ? '❓ Help' :
               category === 'Success Story' ? '🎆 Success Stories' :
               category === 'Tech' ? '💻 Technology' : category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Create Post Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <img src={user?.avatarUrl || 'https://picsum.photos/200'} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex-1 bg-gray-100 hover:bg-white border border-gray-200 hover:border-green-300 rounded-full px-4 py-3 text-sm text-left text-gray-500 transition-all cursor-pointer"
          >
            What's on your mind about the environment?
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No discussions yet</h3>
            <p className="text-gray-500 mb-4">Be the first to start a conversation!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Create First Post
            </button>
          </div>
        ) : (
          filteredDiscussions.map(post => (
           <div key={post.id} className="bg-white rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-md transition-all overflow-hidden">
             <div className="p-6">
               {/* Header */}
               <div className="flex items-start gap-3 mb-4">
                 <Link to={`/app/profile/${post.author?.username}`}>
                   <img 
                     src={post.author?.avatarUrl || 'https://picsum.photos/200'} 
                     alt={post.author?.username} 
                     className="w-12 h-12 rounded-full ring-2 ring-gray-100 hover:ring-green-300 transition-all" 
                   />
                 </Link>
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                     <Link to={`/app/profile/${post.author?.username}`} className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
                       {post.author?.fullName}
                     </Link>
                     <span className="text-gray-500 text-sm">@{post.author?.username}</span>
                     <span className="text-sm text-gray-400">• {post.postedAt}</span>
                   </div>
                   <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                     {post.category}
                   </span>
                 </div>
               </div>
               
               {/* Content */}
               <div className="mb-4">
                 <Link to={`/app/discussions/${post.id}`} className="block group">
                   <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                     {post.title}
                   </h3>
                   <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                 </Link>
                 
                 {/* Media Grid */}
                 {post.mediaUrls && post.mediaUrls.length > 0 && (
                   <div className={`grid gap-2 mb-4 ${
                     post.mediaUrls.length === 1 ? 'grid-cols-1' :
                     post.mediaUrls.length === 2 ? 'grid-cols-2' :
                     'grid-cols-2'
                   }`}>
                     {post.mediaUrls.map((url, index) => (
                       <div key={index} className="relative group cursor-pointer rounded-xl overflow-hidden">
                         {post.mediaType === 'video' ? (
                           <div className="relative">
                             <video src={url} className="w-full h-64 object-cover" />
                             <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                               <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                 <Play className="w-6 h-6 text-gray-800 ml-1" />
                               </div>
                             </div>
                           </div>
                         ) : (
                           <img src={url} alt="Post media" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
                         )}
                       </div>
                     ))}
                   </div>
                 )}
                 
                 {/* Tags */}
                 {post.tags && post.tags.length > 0 && (
                   <div className="flex flex-wrap gap-2 mb-4">
                     {post.tags.map((tag, index) => (
                       <span key={index} className="text-green-600 text-sm hover:text-green-700 cursor-pointer">
                         #{tag}
                       </span>
                     ))}
                   </div>
                 )}
               </div>
               
               {/* Reactions Bar */}
               <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                 {reactionEmojis.map((emoji, index) => (
                   <button
                     key={index}
                     onClick={() => setReactions({...reactions, [post.id]: emoji})}
                     className={`px-3 py-1.5 rounded-full text-lg transition-all ${
                       reactions[post.id] === emoji
                         ? 'bg-green-100 scale-110'
                         : 'hover:bg-gray-100'
                     }`}
                   >
                     {emoji}
                   </button>
                 ))}
               </div>
               
               {/* Actions */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={() => handleVote(post.id, 'up')}
                       className={`p-2 rounded-full transition-colors ${
                         getUserVote(post.id) === 'up' 
                           ? 'text-green-600 bg-green-50' 
                           : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                       }`}
                     >
                       <svg className="w-5 h-5" fill={getUserVote(post.id) === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                       </svg>
                     </button>
                     <span className="font-semibold text-gray-700">{post.upvotes}</span>
                     <button 
                       onClick={() => handleVote(post.id, 'down')}
                       className={`p-2 rounded-full transition-colors ${
                         getUserVote(post.id) === 'down' 
                           ? 'text-red-600 bg-red-50' 
                           : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                       }`}
                     >
                       <svg className="w-5 h-5" fill={getUserVote(post.id) === 'down' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </button>
                   </div>
                   
                   <Link 
                     to={`/app/discussions/${post.id}`}
                     className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                     </svg>
                     <span className="font-medium">{post.commentsCount} comments</span>
                   </Link>
                 </div>
                 
                 <button 
                   onClick={() => handleShare(post)}
                   className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-50"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                   </svg>
                   <span className="font-medium">Share</span>
                 </button>
               </div>
             </div>
           </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussionsFeed;