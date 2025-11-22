import { getCampaignImage, getUserAvatar, getOrganizerAvatar } from './imageUtils';

export const migrateExistingData = () => {
  // Migrate users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const updatedUsers = users.map((user: any) => ({
    ...user,
    avatarUrl: getUserAvatar(user.id)
  }));
  localStorage.setItem('users', JSON.stringify(updatedUsers));

  // Migrate registered users
  const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
  const updatedRegisteredUsers = registeredUsers.map((user: any) => ({
    ...user,
    avatarUrl: getUserAvatar(user.id)
  }));
  localStorage.setItem('registered_users', JSON.stringify(updatedRegisteredUsers));

  // Migrate campaigns
  const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
  const updatedCampaigns = campaigns.map((campaign: any) => ({
    ...campaign,
    imageUrl: getCampaignImage(campaign.id),
    organizerAvatar: campaign.organizerId ? getOrganizerAvatar(campaign.organizerId) : getOrganizerAvatar('default')
  }));
  localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));

  // Migrate current user
  const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
  if (currentUser) {
    const updatedCurrentUser = {
      ...currentUser,
      avatarUrl: getUserAvatar(currentUser.id)
    };
    localStorage.setItem('auth_user', JSON.stringify(updatedCurrentUser));
  }

  console.log('Data migration completed - all images updated to consistent URLs');
};