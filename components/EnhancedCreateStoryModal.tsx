import React, { useState, useRef } from 'react';
import { X, Camera, Video, Upload, Music, Type, Sparkles, MapPin } from 'lucide-react';
import { useStories } from '../contexts/StoriesContext';
import { uploadMedia } from '../lib/uploadMedia';

interface EnhancedCreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedCreateStoryModal: React.FC<EnhancedCreateStoryModalProps> = ({ isOpen, onClose }) => {
  const { createStory } = useStories();
  const [step, setStep] = useState<'upload' | 'edit' | 'publish'>('upload');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    tags: [] as string[],
    storyType: 'general',
    musicTitle: '',
    textOverlays: [] as any[],
    filters: {}
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const storyTypes = [
    { id: 'tree_planting', label: '🌱 Tree Planting', color: 'bg-green-100 text-green-700' },
    { id: 'campaign_progress', label: '📈 Campaign Progress', color: 'bg-blue-100 text-blue-700' },
    { id: 'event', label: '📅 Event', color: 'bg-purple-100 text-purple-700' },
    { id: 'education', label: '🎓 Education', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'cleanup', label: '🧹 Cleanup', color: 'bg-orange-100 text-orange-700' },
    { id: 'general', label: '💚 General Impact', color: 'bg-gray-100 text-gray-700' }
  ];

  const filters = [
    { id: 'none', name: 'Original', preview: 'brightness(1)' },
    { id: 'bright', name: 'Bright', preview: 'brightness(1.2) contrast(1.1)' },
    { id: 'vintage', name: 'Vintage', preview: 'sepia(0.3) contrast(1.2)' },
    { id: 'cool', name: 'Cool', preview: 'hue-rotate(180deg) saturate(1.2)' },
    { id: 'warm', name: 'Warm', preview: 'hue-rotate(30deg) saturate(1.3)' }
  ];

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setMediaFile(file);
    
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setStep('edit');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handlePublish = async () => {
    if (!mediaFile) return;

    setLoading(true);
    try {
      // Use existing Cloudinary upload (same as regular story creation)
      const formDataUpload = new FormData();
      formDataUpload.append('file', mediaFile);
      formDataUpload.append('upload_preset', 'greenverse_stories');
      
      const cloudinaryUrl = mediaType === 'video' 
        ? 'https://api.cloudinary.com/v1_1/your-cloud-name/video/upload'
        : 'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload';
      
      // Use original working Cloudinary upload
      const mediaUrl = await uploadMedia(mediaFile, 'stories');
      
      await createStory({
        title: formData.title || 'My Impact Story',
        description: formData.description,
        media_url: mediaUrl,
        media_type: mediaType,
        story_type: formData.storyType as any,
        location: formData.location,
        tags: formData.tags,
        duration: mediaType === 'video' ? 15 : undefined,
        file_size: mediaFile.size
      });

      // Success notification and refresh
      alert('Story published successfully! 🎉');
      window.location.reload();
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating story:', error);
      alert('Failed to create story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('upload');
    setMediaFile(null);
    setMediaPreview('');
    setFormData({
      title: '',
      description: '',
      location: '',
      tags: [],
      storyType: 'general',
      musicTitle: '',
      textOverlays: [],
      filters: {}
    });
    setTagInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden story-modal-container">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'upload' && 'Create Story'}
            {step === 'edit' && 'Edit Story'}
            {step === 'publish' && 'Publish Story'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[600px] story-modal-content">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Impact</h3>
                <p className="text-gray-600">Upload a photo or video of your environmental action</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Upload File</span>
                </button>

                <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Take Photo</span>
                </button>

                <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
                  <Video className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Record Video</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Edit Step */}
          {step === 'edit' && (
            <>
              {/* Preview */}
              <div className="w-1/2 bg-black flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video
                    ref={videoRef}
                    src={mediaPreview}
                    className="max-w-full max-h-full object-contain"
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Edit Panel */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Story Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Story Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {storyTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setFormData(prev => ({ ...prev, storyType: type.id }))}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                            formData.storyType === type.id ? type.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="What's your impact story?"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell us more about your environmental action..."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Where did this happen?"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Add tags..."
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          #{tag}
                          <button onClick={() => handleRemoveTag(tag)} className="text-green-500 hover:text-green-700">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      Filters
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {filters.map(filter => (
                        <button
                          key={filter.id}
                          className="p-2 border border-gray-300 rounded-lg text-xs hover:border-green-500 transition-colors"
                        >
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep('upload')}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('publish')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Publish Step */}
          {step === 'publish' && (
            <div className="flex-1 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Share!</h3>
                <p className="text-gray-600">Your story will be visible for 24 hours</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Story Preview</h4>
                <div className="space-y-3 text-sm">
                  <div><span className="font-medium">Title:</span> {formData.title || 'My Impact Story'}</div>
                  {formData.description && <div><span className="font-medium">Description:</span> {formData.description}</div>}
                  {formData.location && <div><span className="font-medium">Location:</span> {formData.location}</div>}
                  <div><span className="font-medium">Type:</span> {storyTypes.find(t => t.id === formData.storyType)?.label}</div>
                  {formData.tags.length > 0 && (
                    <div><span className="font-medium">Tags:</span> {formData.tags.map(t => `#${t}`).join(', ')}</div>
                  )}
                  <div><span className="font-medium">Expires:</span> 24 hours from now</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('edit')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Story'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCreateStoryModal;