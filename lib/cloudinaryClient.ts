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

  // Use a simple base64 data URL as fallback since Cloudinary is not configured
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve({
        url: result,
        publicId: `story_${Date.now()}`,
        resourceType: file.type.startsWith('video/') ? 'video' : 'image'
      });
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
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