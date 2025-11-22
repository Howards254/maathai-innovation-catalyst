import { Campaign, Discussion, Event, User, Resource } from '../types';

export const MOCK_USER: User = {
  id: 'u1',
  username: 'eco_warrior',
  fullName: 'Wangari Doe',
  avatarUrl: 'https://picsum.photos/200',
  impactPoints: 1250,
  badges: ['Early Adopter', 'Tree Hugger', 'Event Organizer'],
};

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    title: 'Reforest the Rift Valley',
    description: 'Join us in planting 10,000 indigenous trees to restore the water catchment areas.',
    targetTrees: 10000,
    plantedTrees: 4500,
    imageUrl: 'https://picsum.photos/600/400?random=1',
    organizer: 'Green Belt Movement',
    location: 'Nakuru, Kenya',
    tags: ['Restoration', 'Water', 'Community'],
    daysLeft: 15,
  },
  {
    id: 'c2',
    title: 'Urban Canopy Project',
    description: 'Creating green corridors in the city center to reduce heat islands.',
    targetTrees: 500,
    plantedTrees: 120,
    imageUrl: 'https://picsum.photos/600/400?random=2',
    organizer: 'City Green',
    location: 'Nairobi, Kenya',
    tags: ['Urban', 'Shade'],
    daysLeft: 30,
  },
  {
    id: 'c3',
    title: 'School Fruit Forest',
    description: 'Planting fruit trees in 5 local primary schools for nutrition and education.',
    targetTrees: 200,
    plantedTrees: 200,
    imageUrl: 'https://picsum.photos/600/400?random=3',
    organizer: 'EdTech Eco',
    location: 'Mombasa, Kenya',
    tags: ['Education', 'Food Security'],
    daysLeft: 0,
  },
];

export const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 'd1',
    title: 'Best indigenous trees for dry areas?',
    content: 'I am looking to start a project in a semi-arid area. Any recommendations on species that require minimal water after establishment?',
    author: MOCK_USER,
    upvotes: 45,
    commentsCount: 12,
    postedAt: '2 hours ago',
    category: 'Help',
  },
  {
    id: 'd2',
    title: 'We just hit 50% of our goal!',
    content: 'Thanks to everyone who donated seedlings this weekend. The Rift Valley project is moving fast.',
    author: { ...MOCK_USER, username: 'project_lead', fullName: 'John Smith' },
    upvotes: 128,
    commentsCount: 34,
    postedAt: '5 hours ago',
    category: 'Success Story',
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Karura Forest Clean-up',
    date: 'Sat, Aug 24 • 09:00 AM',
    location: 'Gate C, Karura',
    attendees: 45,
    type: 'In-Person',
    imageUrl: 'https://picsum.photos/200/200?random=10',
  },
  {
    id: 'e2',
    title: 'Agroforestry Webinar',
    date: 'Tue, Aug 27 • 06:00 PM',
    location: 'Zoom',
    attendees: 120,
    type: 'Online',
    imageUrl: 'https://picsum.photos/200/200?random=11',
  },
];

export const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', title: 'Tree Planting Guide 101', type: 'PDF', category: 'Guides', url: '#' },
  { id: 'r2', title: 'Soil Health Analysis', type: 'Video', category: 'Science', url: '#' },
  { id: 'r3', title: 'Community Organizing Handbook', type: 'Article', category: 'Community', url: '#' },
];
