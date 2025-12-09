export interface User {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  impactPoints: number;
  badges: string[];
  role: 'user' | 'admin';
}

export interface InnovationHubSettings {
  isOpen: boolean;
  description: string;
  guidelines: string[];
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  targetTrees: number;
  plantedTrees: number;
  imageUrl: string;
  organizer: string;
  organizerId: string;
  organizerAvatar: string;
  location: string;
  tags: string[];
  daysLeft: number;
  isPublic: boolean;
  status: 'active' | 'completed' | 'cancelled';
  participants: string[];
  pendingParticipants: string[];
  updates: CampaignUpdate[];
  completionPhotos: string[];
  isCompletionPending: boolean;
  createdAt: string;
  startDate: string;
  endDate: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
}

export interface TreePlantingSubmission {
  id: string;
  campaignId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  photoUrl: string;
  description: string;
  location: string;
  treesCount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  author: User;
  upvotes: number;
  commentsCount: number;
  postedAt: string;
  category: 'General' | 'Help' | 'Success Story' | 'Tech';
  mediaUrls?: string[];
  mediaType?: 'image' | 'video';
  reactions?: {
    type: string;
    count: number;
    users: string[];
  }[];
  tags?: string[];
  isAnonymous?: boolean;
  realAuthorId?: string; // Stored for legal compliance, not displayed
}

export interface Event {
  id: string;
  title: string;
  description: string;
  slug?: string;
  date: string;
  time: string;
  endTime?: string;
  timezone?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  attendees: string[];
  waitlist?: string[];
  maxAttendees?: number;
  type: 'Online' | 'In-Person' | 'Hybrid';
  meetingUrl?: string;
  imageUrl: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  status: 'draft' | 'pending' | 'approved' | 'cancelled' | 'completed';
  isPublic?: boolean;
  tags?: string[];
  agenda?: any;
  faqs?: any;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Article';
  category: string;
  url: string;
}

export interface Innovation {
  id: string;
  title: string;
  description: string;
  category: 'Wood-Free Products' | 'DATs' | 'Other';
  fundingGoal: number;
  currentFunding: number;
  imageUrl: string;
  creatorId: string;
  creatorName: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  businessPlan?: string;
  contactEmail: string;
}
