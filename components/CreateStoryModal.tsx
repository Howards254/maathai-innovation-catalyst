import { useState, useRef } from 'react';
import { X, Upload, Camera, Video, Image, MapPin, Hash } from 'lucide-react';
import { uploadMedia } from '../lib/uploadMedia';
import { useStories } from '../contexts/StoriesContext';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateStoryModal = ({ isOpen, onClose }: CreateStoryModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storyType, setStoryType] = useState<'tree_planting' | 'campaign_progress' | 'event' | 'education' | 'cleanup' | 'general'>('general');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createStory } = useStories();

  const storyTypes = [
    { value: 'tree_planting', label: '🌱 Tree Planting', color: 'bg-green-100 text-green-800' },
    { value: 'campaign_progress', label: '📈 Campaign Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'event', label: '🎉 Event', color: 'bg-purple-100 text-purple-800' },
    { value: 'education', label: '📚 Education', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'cleanup', label: '🧹 Cleanup', color: 'bg-orange-100 text-orange-800' },
    { value: 'general', label: '💚 General', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Only images (JPEG, PNG, WebP) and videos (MP4, WebM, MOV) are allowed');
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setUploading(true);
    setUploadProgress(20);

    try {
      // Upload to Cloudinary
      setUploadProgress(50);
      const mediaUrl = await uploadMedia(file, 'stories');
      
      setUploadProgress(80);
      
      // Create story in database
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      await createStory({
        title: title.trim(),
        description: description.trim() || undefined,
        media_url: mediaUrl,
        media_type: file.type.startsWith('video/') ? 'video' : 'image',
        duration: file.type.startsWith('video/') ? undefined : undefined,
        file_size: file.size,
        story_type: storyType,
        location: location.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined
      });

      setUploadProgress(100);
      
      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
      alert(error instanceof Error ? error.message : 'Failed to create story');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setTitle('');
    setDescription('');
    setStoryType('general');
    setLocation('');
    setTags('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-6 h-6 text-green-600" />
            Share Your Impact Story
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* File Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload Photo or Video (Max 10MB, 60 seconds for videos)
            </label>
            
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Image className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Click to upload your impact story</p>
                    <p className="text-sm text-gray-500">Images: JPEG, PNG, WebP • Videos: MP4, WebM, MOV</p>
                  </div>
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  {file.type.startsWith('video/') ? (
                    <video
                      src={preview || undefined}
                      controls
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <img
                      src={preview || undefined}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span>{file.name}</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Story Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Story Type</label>
            <div className="grid grid-cols-2 gap-2">
              {storyTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setStoryType(type.value as any)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    storyType === type.value
                      ? type.color + ' ring-2 ring-offset-2 ring-green-500'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your impact story about?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about your environmental impact..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where did this happen?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tree, environment, sustainability (comma separated)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">Separate tags with commas</p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-green-600 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !title.trim() || uploading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Share Story
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryModal;