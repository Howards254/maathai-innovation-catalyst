// Curated image collections for consistent random generation

const CAMPAIGN_IMAGES = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09', 
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
  'https://images.unsplash.com/photo-1574687234516-f1675ac8df13',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
];

const USER_AVATARS = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', // Woman 1
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', // Man 1
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', // Man 2
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', // Woman 2
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', // Man 3
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', // Woman 3
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', // Man 4
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', // Woman 4
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face', // Man 5
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face', // Woman 5
];

const ORGANIZER_AVATARS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', // Professional 1
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face', // Professional 2
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face', // Professional 3
];

// Generate consistent random image based on seed (ID)
const hashCode = (str: string): number => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const getCampaignImage = (campaignId: string): string => {
  const index = hashCode(campaignId) % CAMPAIGN_IMAGES.length;
  return CAMPAIGN_IMAGES[index];
};

export const getUserAvatar = (userId: string): string => {
  const index = hashCode(userId) % USER_AVATARS.length;
  return USER_AVATARS[index];
};

export const getOrganizerAvatar = (organizerId: string): string => {
  if (!organizerId) return ORGANIZER_AVATARS[0];
  const index = hashCode(organizerId) % ORGANIZER_AVATARS.length;
  return ORGANIZER_AVATARS[index];
};

export const getEventImage = (eventId: string): string => {
  // Events use same images as campaigns
  return getCampaignImage(eventId);
};