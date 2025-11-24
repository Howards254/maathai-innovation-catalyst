import React, { useState, useRef } from 'react';
import { useDiscussions } from '../contexts/DiscussionContext';
import { Image, Video, Smile, X } from 'lucide-react';
import { showToast } from '../utils/toast';

interface CreateDiscussionFormProps {
  onClose: () => void;
}

const CreateDiscussionForm: React.FC<CreateDiscussionFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General' as 'General' | 'Help' | 'Success Story' | 'Tech',
    tags: '',
    isAnonymous: false
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createDiscussion } = useDiscussions();

  const emojis = ['🌱', '🌳', '🌿', '♻️', '🌍', '💚', '✨', '🎉', '👏', '💪', '🔥', '❤️', '😊', '🤔', '👍', '🙌'];

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + mediaFiles.length > 4) {
      showToast.warning('Maximum 4 media files allowed');
      return;
    }

    setMediaFiles([...mediaFiles, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    setFormData({...formData, content: formData.content + emoji});
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      await createDiscussion({
        ...formData,
        tags: tagsArray,
        mediaUrls: mediaPreviews,
        mediaType: mediaFiles[0]?.type.startsWith('video') ? 'video' : 'image'
      });
      showToast.success('Discussion post created successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to create discussion:', error);
      showToast.error(error?.message || 'Failed to create discussion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ✨ Create New Discussion
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'General', emoji: '💬', label: 'General' },
                  { value: 'Help', emoji: '❓', label: 'Help & Support' },
                  { value: 'Success Story', emoji: '🎆', label: 'Success Story' },
                  { value: 'Tech', emoji: '💻', label: 'Technology' }
                ].map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat.value as any})}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.category === cat.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="font-medium text-sm">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-lg"
                placeholder="What's your question or topic?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Content</label>
              <div className="relative">
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Share your thoughts, ask questions, or tell your story..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-14 right-3 bg-white border border-gray-200 rounded-xl shadow-lg p-3 grid grid-cols-8 gap-2 z-10">
                    {emojis.map((emoji, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Media (Optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaSelect}
                className="hidden"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors text-gray-600 hover:text-green-600"
                >
                  <Image className="w-5 h-5" />
                  <span className="font-medium">Add Photos/Videos</span>
                </button>
                <span className="text-sm text-gray-500 self-center">Up to 4 files</span>
              </div>
              
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tags (Optional)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="e.g., reforestation, climate-action, sustainability"
              />
              <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
            </div>

            {/* Anonymous Posting */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <label htmlFor="anonymous" className="font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                    🕶️ Post Anonymously
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Your identity will be hidden from the public. This helps protect whistleblowers reporting environmental violations.
                  </p>
                  <p className="text-xs text-amber-700 mt-2 font-medium">
                    ⚠️ Note: Your identity is stored securely for legal compliance and can be accessed by administrators if required by law.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Posting...' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDiscussionForm;