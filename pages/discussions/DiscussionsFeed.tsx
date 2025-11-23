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
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  const reactionEmojis = [
    { emoji: '👍', label: 'Like' },
    { emoji: '💚', label: 'Love' },
    { emoji: '🌱', label: 'Growth' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '👏', label: 'Applause' },
    { emoji: '🎉', label: 'Celebrate' }
  ];

  const handleReaction = (postId: string, emoji: string) => {
    setReactions(prev => ({
      ...prev,
      [postId]: prev[postId] === emoji ? '' : emoji
    }));
    setShowReactionPicker(null);
  };

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
                 {post.isAnonymous ? (
                   <div className="w-12 h-12 rounded-full ring-2 ring-gray-300 bg-gray-100 flex items-center justify-center">
                     <span className="text-2xl">🕶️</span>
                   </div>
                 ) : (
                   <Link to={`/app/profile/${post.author?.username}`}>
                     <img 
                       src={post.author?.avatarUrl || 'https://picsum.photos/200'} 
                       alt={post.author?.username} 
                       className="w-12 h-12 rounded-full ring-2 ring-gray-100 hover:ring-green-300 transition-all" 
                     />
                   </Link>
                 )}
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                     {post.isAnonymous ? (
                       <>
                         <span className="font-semibold text-gray-700">Anonymous User</span>
                         <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                           🔒 Anonymous
                         </span>
                       </>
                     ) : (
                       <>
                         <Link to={`/app/profile/${post.author?.username}`} className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
                           {post.author?.fullName}
                         </Link>
                         <span className="text-gray-500 text-sm">@{post.author?.username}</span>
                       </>
                     )}
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
                   <div className="mb-4 -mx-6">
                     {post.mediaUrls.length === 1 ? (
                       // Single image - full width, max height
                       <div className="relative group cursor-pointer bg-gray-100">
                         {post.mediaType === 'video' ? (
                           <div className="relative">
                             <video src={post.mediaUrls[0]} className="w-full max-h-[600px] object-contain" />
                             <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                               <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                 <Play className="w-8 h-8 text-gray-800 ml-1" />
                               </div>
                             </div>
                           </div>
                         ) : (
                           <img 
                             src={post.mediaUrls[0]} 
                             alt="Post media" 
                             className="w-full max-h-[600px] object-contain"
                           />
                         )}
                       </div>
                     ) : post.mediaUrls.length === 2 ? (
                       // Two images - side by side
                       <div className="grid grid-cols-2 gap-0.5">
                         {post.mediaUrls.map((url, index) => (
                           <div key={index} className="relative group cursor-pointer bg-gray-100 aspect-square overflow-hidden">
                             {post.mediaType === 'video' ? (
                               <div className="relative h-full">
                                 <video src={url} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                                   <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                     <Play className="w-6 h-6 text-gray-800 ml-1" />
                                   </div>
                                 </div>
                               </div>
                             ) : (
                               <img 
                                 src={url} 
                                 alt={`Post media ${index + 1}`} 
                                 className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                               />
                             )}
                           </div>
                         ))}
                       </div>
                     ) : post.mediaUrls.length === 3 ? (
                       // Three images - one large, two small
                       <div className="grid grid-cols-2 gap-0.5">
                         <div className="row-span-2 relative group cursor-pointer bg-gray-100 overflow-hidden">
                           <img 
                             src={post.mediaUrls[0]} 
                             alt="Post media 1" 
                             className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                           />
                         </div>
                         {post.mediaUrls.slice(1).map((url, index) => (
                           <div key={index} className="relative group cursor-pointer bg-gray-100 aspect-square overflow-hidden">
                             <img 
                               src={url} 
                               alt={`Post media ${index + 2}`} 
                               className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                             />
                           </div>
                         ))}
                       </div>
                     ) : (
                       // Four images - 2x2 grid
                       <div className="grid grid-cols-2 gap-0.5">
                         {post.mediaUrls.slice(0, 4).map((url, index) => (
                           <div key={index} className="relative group cursor-pointer bg-gray-100 aspect-square overflow-hidden">
                             <img 
                               src={url} 
                               alt={`Post media ${index + 1}`} 
                               className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                             />
                             {index === 3 && post.mediaUrls.length > 4 && (
                               <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                 <span className="text-white text-3xl font-bold">+{post.mediaUrls.length - 4}</span>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
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
               
               {/* Actions */}
               <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                 {/* Like/Reaction Button */}
                 <div className="relative">
                   <button
                     onClick={(e) => {
                       e.preventDefault();
                       if (!reactions[post.id]) {
                         handleReaction(post.id, '👍');
                       } else {
                         setShowReactionPicker(showReactionPicker === post.id ? null : post.id);
                       }
                     }}
                     onMouseEnter={() => setShowReactionPicker(post.id)}
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                       reactions[post.id]
                         ? 'text-green-600 bg-green-50'
                         : 'text-gray-600 hover:bg-gray-100'
                     }`}
                   >
                     {reactions[post.id] ? (
                       <span className="text-base">{reactions[post.id]}</span>
                     ) : (
                       <Heart className="w-4 h-4" />
                     )}
                     <span>{reactions[post.id] ? 'Reacted' : 'Like'}</span>
                   </button>
                   
                   {/* Reaction Picker */}
                   {showReactionPicker === post.id && (
                     <div 
                       className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-2 flex gap-1 z-10"
                       onMouseLeave={() => setShowReactionPicker(null)}
                     >
                       {reactionEmojis.map((reaction, index) => (
                         <button
                           key={index}
                           onClick={(e) => {
                             e.preventDefault();
                             handleReaction(post.id, reaction.emoji);
                           }}
                           className="text-2xl hover:scale-125 transition-transform p-1"
                           title={reaction.label}
                         >
                           {reaction.emoji}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
                 <Link 
                   to={`/app/discussions/${post.id}`}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                 >
                   <MessageCircle className="w-4 h-4" />
                   <span>{post.commentsCount || 0}</span>
                 </Link>
                 
                 <button 
                   onClick={() => handleShare(post)}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors ml-auto"
                 >
                   <Share2 className="w-4 h-4" />
                   <span>Share</span>
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