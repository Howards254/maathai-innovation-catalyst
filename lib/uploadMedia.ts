export const uploadMedia = async (file: File, folder: string = 'discussions'): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'maathai_discussions';

  if (!cloudName) {
    throw new Error('Cloudinary not configured. Add VITE_CLOUDINARY_CLOUD_NAME to .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${file.type.startsWith('video') ? 'video' : 'image'}/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};

export const uploadDiscussionMedia = (file: File) => uploadMedia(file, 'discussions');
