// Social Sharing Service for Viral Growth
interface ShareData {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  hashtags?: string[];
}

class SocialShareService {
  private baseUrl = window.location.origin;

  // WhatsApp sharing
  shareToWhatsApp(data: ShareData) {
    const text = `${data.title}\n\n${data.description}\n\n${data.url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }

  // Twitter sharing
  shareToTwitter(data: ShareData) {
    const hashtags = data.hashtags?.join(',') || 'environment,sustainability,climateaction';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}&hashtags=${hashtags}`;
    window.open(twitterUrl, '_blank');
  }

  // Facebook sharing
  shareToFacebook(data: ShareData) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title + ' - ' + data.description)}`;
    window.open(facebookUrl, '_blank');
  }

  // Instagram (copy to clipboard with instructions)
  shareToInstagram(data: ShareData) {
    const instagramText = `${data.title}\n\n${data.description}\n\n🔗 Link in bio: ${data.url}\n\n${data.hashtags?.map(tag => `#${tag}`).join(' ') || '#environment #sustainability #climateaction'}`;
    
    navigator.clipboard.writeText(instagramText).then(() => {
      alert('Caption copied to clipboard! Open Instagram and paste it with your post.');
      // Optionally open Instagram web
      window.open('https://www.instagram.com/', '_blank');
    });
  }

  // LinkedIn sharing
  shareToLinkedIn(data: ShareData) {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
    window.open(linkedinUrl, '_blank');
  }

  // Generic Web Share API (for mobile)
  async shareNative(data: ShareData) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url
        });
      } catch (error) {
        console.log('Native sharing cancelled');
      }
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(data.url);
      alert('Link copied to clipboard!');
    }
  }

  // Campaign sharing
  shareCampaign(campaign: any) {
    const shareData: ShareData = {
      title: `🌱 Join "${campaign.title}" Campaign`,
      description: `Help us plant ${campaign.target_trees} trees! ${campaign.trees_planted} already planted. Every tree counts in fighting climate change.`,
      url: `${this.baseUrl}/app/campaigns/${campaign.id}`,
      imageUrl: campaign.image_url,
      hashtags: ['treeplanting', 'climateaction', 'environment', 'sustainability']
    };
    return shareData;
  }

  // Story sharing
  shareStory(story: any) {
    const shareData: ShareData = {
      title: `🌍 Environmental Impact Story`,
      description: `${story.caption} - Making a difference one action at a time!`,
      url: `${this.baseUrl}/app/stories`,
      imageUrl: story.media_url,
      hashtags: ['impactstory', 'environment', 'sustainability', 'climateaction']
    };
    return shareData;
  }

  // Badge/Achievement sharing
  shareBadge(badge: any, userName: string) {
    const shareData: ShareData = {
      title: `🏆 ${userName} earned "${badge.name}" badge!`,
      description: `${badge.description} Join the environmental movement and earn your own badges!`,
      url: `${this.baseUrl}/app/leaderboard`,
      hashtags: ['achievement', 'environment', 'sustainability', 'badges']
    };
    return shareData;
  }

  // Event sharing
  shareEvent(event: any) {
    const shareData: ShareData = {
      title: `🌿 Join "${event.title}" Event`,
      description: `${event.description} Date: ${new Date(event.date).toLocaleDateString()}. Let's make an impact together!`,
      url: `${this.baseUrl}/app/events/${event.id}`,
      imageUrl: event.image_url,
      hashtags: ['environmentalevent', 'sustainability', 'climateaction', 'community']
    };
    return shareData;
  }

  // Tree planting achievement sharing
  shareTreePlanting(treesPlanted: number, campaignTitle: string) {
    const shareData: ShareData = {
      title: `🌳 I just planted ${treesPlanted} trees!`,
      description: `Contributing to "${campaignTitle}" campaign. Join me in fighting climate change, one tree at a time!`,
      url: `${this.baseUrl}/app/campaigns`,
      hashtags: ['treeplanting', 'climateaction', 'environment', 'sustainability']
    };
    return shareData;
  }

  // Discussion sharing
  shareDiscussion(discussion: any) {
    const shareData: ShareData = {
      title: `💬 "${discussion.title}"`,
      description: `${discussion.content.substring(0, 150)}${discussion.content.length > 150 ? '...' : ''} Join the environmental discussion!`,
      url: `${this.baseUrl}/app/discussions/${discussion.id}`,
      imageUrl: discussion.mediaUrls?.[0],
      hashtags: ['discussion', 'environment', 'sustainability', 'climateaction', 'community']
    };
    return shareData;
  }
}

export const socialShare = new SocialShareService();