import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDiscussions } from '../contexts/DiscussionContext';
import { useUser } from '../contexts/UserContext';
import { 
  X, Image, Video, Smile, MapPin, Users, Hash, 
  Bold, Italic, Link as LinkIcon, List, Quote,
  Eye, EyeOff, Sparkles, Send, Camera, FileText
} from 'lucide-react';
import { uploadMedia } from '../lib/uploadMedia';

interface EnhancedCreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialContent?: string;
}

const EnhancedCreatePostModal: React.FC<EnhancedCreatePostModalProps> = ({ 
  isOpen, 
  onClose, 
  initialCategory = 'General',
  initialContent = ''
}) => {
  const { user } = useUser();
  const { createDiscussion } = useDiscussions();
  const [step, setStep] = useState<'compose' | 'preview'>('compose');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: initialContent,
    category: initialCategory as 'General' | 'Help' | 'Success Story' | 'Tech',
    tags: [] as string[],
    isAnonymous: false,
    location: '',
    mentionedUsers: [] as string[]
  });
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Rich text formatting
  const formatText = (type: 'bold' | 'italic' | 'link' | 'list' | 'quote') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement = '';
    switch (type) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`;
        break;
      case 'list':
        replacement = `\n- ${selectedText || 'list item'}`;
        break;
      case 'quote':
        replacement = `\n> ${selectedText || 'quoted text'}`;
        break;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      replacement + 
      textarea.value.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + replacement.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Emoji picker
  const emojis = [
    '🌱', '🌳', '🌿', '♻️', '🌍', '💚', '✨', '🎉', '👏', '💪', 
    '🔥', '❤️', '😊', '🤔', '👍', '🙌', '🌊', '🦋', '🐝', '🌺'
  ];

  const insertEmoji = (emoji: string) => {
    setFormData(prev => ({ ...prev, content: prev.content + emoji }));
    setShowEmojiPicker(false);
  };

  // Tag suggestions
  const suggestedTags = [
    'climate-change', 'tree-planting', 'sustainability', 'renewable-energy',
    'conservation', 'recycling', 'green-living', 'biodiversity', 'pollution',
    'carbon-footprint', 'eco-friendly', 'environmental-policy', 'wildlife'
  ];

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setCurrentTag('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  // Media handling
  const handleMediaSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + mediaFiles.length > 4) {
      toast.error('Maximum 4 media files allowed');
      return;
    }

    setMediaFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [mediaFiles.length]);

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Post templates
  const templates = [
    {
      icon: '🌱',
      title: 'Tree Planting Update',
      content: 'Just planted [number] trees in [location]! 🌳\n\nIt feels amazing to contribute to reforestation efforts. The area was previously [describe condition], and now it\'s going to become a thriving green space.\n\n#TreePlanting #Reforestation #ClimateAction'
    },
    {
      icon: '💡',
      title: 'Eco Tip',
      content: '💡 Eco Tip: [Your tip here]\n\nDid you know that [interesting fact]? Here\'s how you can make a difference:\n\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\nEvery small action counts! What eco-friendly practices do you follow?\n\n#EcoTips #Sustainability #GreenLiving'
    },
    {
      icon: '🎉',
      title: 'Success Story',
      content: '🎉 Success Story Alert!\n\nI\'m excited to share that [achievement/milestone]. This journey started [timeframe] ago when [initial situation].\n\nKey learnings:\n- [Learning 1]\n- [Learning 2]\n- [Learning 3]\n\nThank you to everyone who supported this initiative! Together, we\'re making a real difference.\n\n#SuccessStory #Environmental #Community'
    }
  ];

  const applyTemplate = (template: typeof templates[0]) => {
    setFormData(prev => ({
      ...prev,
      content: template.content,
      category: template.title.includes('Success') ? 'Success Story' : 'General'
    }));
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    setLoading(true);
    try {
      // Upload media files
      const uploadedUrls: string[] = [];
      for (const file of mediaFiles) {
        const url = await uploadMedia(file, 'discussions');
        uploadedUrls.push(url);
      }
      
      await createDiscussion({
        ...formData,
        mediaUrls: uploadedUrls,
        mediaType: mediaFiles[0]?.type.startsWith('video') ? 'video' : 'image'
      });
      
      toast.success('Post created successfully! 🎉');
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'General',
        tags: [],
        isAnonymous: false,
        location: '',
        mentionedUsers: []
      });
      setMediaFiles([]);
      setMediaPreviews([]);
      setStep('compose');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Create Post</h2>
              <p className="text-xs md:text-sm text-gray-500">Share your environmental story</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step === 'compose' && (
              <button
                onClick={() => setStep('preview')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            )}
            {step === 'preview' && (
              <button
                onClick={() => setStep('compose')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(95vh-80px)] md:h-[600px]">
          {step === 'compose' ? (
            <>
              {/* Main Content */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                {/* Post Templates */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Quick Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {templates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => applyTemplate(template)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left"
                      >
                        <div className="text-lg mb-1">{template.icon}</div>
                        <div className="text-xs font-medium text-gray-900">{template.title}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { value: 'General', emoji: '💬', label: 'General' },
                      { value: 'Help', emoji: '❓', label: 'Help' },
                      { value: 'Success Story', emoji: '🎆', label: 'Success' },
                      { value: 'Tech', emoji: '💻', label: 'Tech' }
                    ].map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.value as any }))}
                        className={`p-2 md:p-3 rounded-lg border-2 transition-all text-left ${
                          formData.category === cat.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-lg md:text-xl mb-1">{cat.emoji}</div>
                        <div className="font-medium text-xs md:text-sm">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-base md:text-lg"
                    placeholder="What's your environmental story?"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">{formData.title.length}/100</div>
                </div>

                {/* Rich Text Toolbar */}
                <div className="mb-2">
                  <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => formatText('bold')}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText('italic')}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText('link')}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                      title="Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText('list')}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                      title="List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => formatText('quote')}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                      title="Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4 relative">
                  <textarea
                    ref={contentRef}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Share your thoughts, experiences, or ask questions about environmental topics..."
                    maxLength={2000}
                  />
                  <div className="text-xs text-gray-500 mt-1">{formData.content.length}/2000</div>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-3 grid grid-cols-10 gap-1 z-10">
                      {emojis.map((emoji, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 p-4 md:p-6 bg-gray-50">
                {/* Media Upload */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Media
                  </h3>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors text-gray-600 hover:text-green-600 flex items-center justify-center gap-2"
                  >
                    <Image className="w-5 h-5" />
                    <span className="text-sm font-medium">Add Photos/Videos</span>
                  </button>
                  
                  {mediaPreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {mediaPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img src={preview} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeMedia(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Tags
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => {
                        setCurrentTag(e.target.value);
                        setShowTagSuggestions(e.target.value.length > 0);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && currentTag.trim()) {
                          e.preventDefault();
                          addTag(currentTag.trim());
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                      placeholder="Add tags..."
                      maxLength={20}
                    />
                    
                    {showTagSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
                        {suggestedTags
                          .filter(tag => tag.includes(currentTag.toLowerCase()) && !formData.tags.includes(tag))
                          .slice(0, 5)
                          .map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                            >
                              #{tag}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Anonymous Toggle */}
                <div className="mb-6">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="anonymous" className="font-semibold text-gray-900 cursor-pointer text-sm">
                        🕶️ Post Anonymously
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Your identity will be hidden from the public
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Preview Mode */
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
                
                {/* Post Preview */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <img 
                      src={user?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'} 
                      alt="User" 
                      className="w-10 h-10 rounded-full" 
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {formData.isAnonymous ? 'Anonymous User' : user?.fullName}
                      </div>
                      <div className="text-sm text-gray-500">Just now</div>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{formData.title || 'Your title here...'}</h4>
                  <div className="text-gray-700 whitespace-pre-wrap mb-4">
                    {formData.content || 'Your content here...'}
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.tags.map(tag => (
                        <span key={tag} className="text-green-600 text-sm">#{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  {mediaPreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {mediaPreviews.map((preview, index) => (
                        <img key={index} src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {formData.isAnonymous && (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  🕶️ Anonymous post
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCreatePostModal;