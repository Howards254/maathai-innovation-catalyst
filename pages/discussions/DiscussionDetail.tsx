import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDiscussions } from '../../contexts/DiscussionContext';
import { useAuth } from '../../contexts/AuthContext';

const DiscussionDetail: React.FC = () => {
  const { id } = useParams();
  const { getDiscussion, getComments, voteDiscussion, getUserVote, addComment, likeComment, getUserCommentLike } = useDiscussions();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  
  const handleLikeComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      await likeComment(commentId);
      // Update local state for immediate feedback
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) {
          newSet.delete(commentId);
        } else {
          newSet.add(commentId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };
  
  const handleReply = async (commentId: string) => {
    if (!replyText.trim() || !user) return;
    
    try {
      await addComment(id!, replyText.trim(), commentId);
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const discussion = getDiscussion(id!);
  const comments = getComments(id!);

  if (!discussion) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Discussion Not Found</h1>
        <Link to="/app/discussions" className="text-primary-600 hover:underline">Back to Discussions</Link>
      </div>
    );
  }

  const handleVote = (voteType: 'up' | 'down') => {
    voteDiscussion(discussion.id, voteType);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(discussion.id, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
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

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-4">
          <Link to="/app/discussions" className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Discussions
          </Link>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Main Discussion Post */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6">
            {/* Author Header */}
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={discussion.author?.avatarUrl || 'https://picsum.photos/200'} 
                alt={discussion.author?.username} 
                className="w-12 h-12 rounded-full ring-2 ring-gray-100" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">@{discussion.author?.username}</span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {discussion.category}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{discussion.postedAt}</span>
              </div>
            </div>
            
            {/* Content */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{discussion.title}</h1>
            <div className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">{discussion.content}</div>
            
            {/* Media Display */}
            {discussion.mediaUrls && discussion.mediaUrls.length > 0 && (
              <div className="mb-6 rounded-xl overflow-hidden">
                {discussion.mediaUrls.length === 1 ? (
                  <img src={discussion.mediaUrls[0]} alt="Post media" className="w-full max-h-[600px] object-contain bg-gray-100" />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {discussion.mediaUrls.map((url, idx) => (
                      <img key={idx} src={url} alt={`Media ${idx + 1}`} className="w-full h-64 object-cover" />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Tags */}
            {discussion.tags && discussion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {discussion.tags.map((tag, idx) => (
                  <span key={idx} className="text-green-600 text-sm hover:text-green-700 cursor-pointer">#{tag}</span>
                ))}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleVote('up')}
                    className={`p-2 rounded-full transition-colors ${
                      getUserVote(discussion.id) === 'up' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={getUserVote(discussion.id) === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="font-semibold text-gray-700">{discussion.upvotes}</span>
                  <button 
                    onClick={() => handleVote('down')}
                    className={`p-2 rounded-full transition-colors ${
                      getUserVote(discussion.id) === 'down' 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={getUserVote(discussion.id) === 'down' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-medium">{discussion.commentsCount} comments</span>
                </div>
              </div>
              
              <button 
                onClick={handleShare}
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

        {/* Add Comment Form */}
        {user && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={user.avatarUrl || 'https://picsum.photos/200'} 
                alt={user.username} 
                className="w-10 h-10 rounded-full ring-2 ring-gray-100" 
              />
              <h3 className="font-semibold text-gray-900">Add a comment</h3>
            </div>
            <form onSubmit={handleAddComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this discussion..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-colors"
                rows={4}
                required
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              💬 Comments
            </h3>
            <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
              {comments.length}
            </span>
          </div>
          
          {comments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-500 mb-4">No comments yet. Be the first to share your thoughts!</p>
              {!user && (
                <p className="text-sm text-gray-400">Sign in to join the conversation</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <img 
                        src={comment.author?.avatarUrl || 'https://picsum.photos/200'} 
                        alt={comment.author?.username} 
                        className="w-10 h-10 rounded-full ring-2 ring-gray-100 flex-shrink-0" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">@{comment.author?.username}</span>
                          <span className="text-sm text-gray-500">
                            • {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {comment.content}
                        </div>
                        
                        {/* Comment Actions */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                          <button 
                            onClick={() => handleLikeComment(comment.id)}
                            className={`flex items-center gap-1 transition-colors text-sm ${
                              likedComments.has(comment.id)
                                ? 'text-red-600'
                                : 'text-gray-500 hover:text-red-600'
                            }`}
                          >
                            <svg className="w-4 h-4" fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{comment.likeCount || 0} {likedComments.has(comment.id) ? 'Liked' : 'Like'}</span>
                          </button>
                          <button 
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <span>{comment.replyCount || 0} Reply</span>
                          </button>
                        </div>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="flex items-start gap-3">
                                <img 
                                  src={reply.author?.avatarUrl || 'https://picsum.photos/200'} 
                                  alt={reply.author?.username} 
                                  className="w-8 h-8 rounded-full ring-2 ring-gray-100 flex-shrink-0" 
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">@{reply.author?.username}</span>
                                    <span className="text-xs text-gray-500">
                                      • {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="text-gray-700 text-sm leading-relaxed">
                                    {reply.content}
                                  </div>
                                  <div className="flex items-center gap-3 mt-2">
                                    <button 
                                      onClick={() => handleLikeComment(reply.id)}
                                      className={`flex items-center gap-1 transition-colors text-xs ${
                                        likedComments.has(reply.id)
                                          ? 'text-red-600'
                                          : 'text-gray-500 hover:text-red-600'
                                      }`}
                                    >
                                      <svg className="w-3 h-3" fill={likedComments.has(reply.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                      <span>{reply.likeCount || 0}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reply Form */}
                        {replyingTo === comment.id && user && (
                          <div className="mt-4 pl-4 border-l-2 border-blue-200">
                            <div className="flex gap-3">
                              <img 
                                src={user?.avatarUrl || 'https://picsum.photos/200'} 
                                alt={user?.username} 
                                className="w-8 h-8 rounded-full ring-2 ring-gray-100 flex-shrink-0" 
                              />
                              <div className="flex-1">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Reply to @${comment.author?.username}...`}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                  rows={2}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => setReplyingTo(null)}
                                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReply(comment.id)}
                                    disabled={!replyText.trim()}
                                    className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;