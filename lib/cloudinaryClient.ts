// Cloudinary configuration (simplified)
const getCloudinaryUrl = (cloudName: string) => `https://res.cloudinary.com/${cloudName}`;

// Upload function for stories (images and videos)
export const uploadStoryMedia = async (file: File): Promise<{url: string, publicId: string, resourceType: string}> => {
  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only images (JPEG, PNG, WebP) and videos (MP4, WebM, MOV) are allowed');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'maathai_stories');
  
  // Determine resource type
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  formData.append('resource_type', resourceType);
  
  // Add transformation for videos (limit duration to 60 seconds)
  if (resourceType === 'video') {
    formData.append('transformation', 'du_60,q_auto,f_auto');
  } else {
    formData.append('transformation', 'q_auto,f_auto,w_800,h_800,c_limit');
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload media. Please try again.');
  }
};

// Generate optimized URLs for different use cases
export const getOptimizedUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: string;
} = {}) => {
  const {
    width = 400,
    height = 400,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};

// Generate video thumbnail
export const getVideoThumbnail = (publicId: string, options: {
  width?: number;
  height?: number;
} = {}) => {
  const { width = 400, height = 400 } = options;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
  return `https://res.cloudinary.com/${cloudName}/video/upload/w_${width},h_${height},c_fill,q_auto,f_jpg/${publicId}`;
};

export default { getOptimizedUrl, getVideoThumbnail };