import React, { useState } from 'react';
import { Share2, MessageCircle, Twitter, Facebook, Instagram, Linkedin, Copy, X } from 'lucide-react';
import { socialShare } from '../lib/socialShare';

interface ShareButtonProps {
  type: 'campaign' | 'story' | 'badge' | 'event' | 'achievement';
  data: any;
  userName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  type, 
  data, 
  userName = '', 
  className = '', 
  size = 'md' 
}) => {
  const [showModal, setShowModal] = useState(false);

  const getShareData = () => {
    switch (type) {
      case 'campaign':
        return socialShare.shareCampaign(data);
      case 'story':
        return socialShare.shareStory(data);
      case 'badge':
        return socialShare.shareBadge(data, userName);
      case 'event':
        return socialShare.shareEvent(data);
      case 'achievement':
        return socialShare.shareTreePlanting(data.treesPlanted, data.campaignTitle);
      default:
        return null;
    }
  };

  const shareData = getShareData();
  if (!shareData) return null;

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };

  const platforms = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => socialShare.shareToWhatsApp(shareData)
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-blue-400 hover:bg-blue-500',
      action: () => socialShare.shareToTwitter(shareData)
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => socialShare.shareToFacebook(shareData)
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-pink-500 hover:bg-pink-600',
      action: () => socialShare.shareToInstagram(shareData)
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => socialShare.shareToLinkedIn(shareData)
    },
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => {
        navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
        setShowModal(false);
      }
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      await socialShare.shareNative(shareData);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleNativeShare}
        className={`inline-flex items-center justify-center ${sizeClasses[size]} text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors ${className}`}
        title="Share"
      >
        <Share2 className="w-full h-full" />
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-1">{shareData.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{shareData.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <button
                    key={platform.name}
                    onClick={() => {
                      platform.action();
                      if (platform.name !== 'Instagram') {
                        setShowModal(false);
                      }
                    }}
                    className={`flex flex-col items-center p-3 rounded-lg text-white transition-colors ${platform.color}`}
                  >
                    <IconComponent className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{platform.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Share URL:</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareData.url}
                  readOnly
                  className="flex-1 text-xs bg-white border border-gray-300 rounded px-2 py-1"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareData.url);
                    alert('Link copied!');
                  }}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;