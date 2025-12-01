import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Heart, MapPin, Users } from 'lucide-react';

interface MatchmakingSetupProps {
  onClose?: () => void;
}

const MatchmakingSetup: React.FC<MatchmakingSetupProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleSetupProfile = () => {
    navigate('/app/profile/edit');
    onClose?.();
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Complete Your Profile for Better Matches
          </h3>
          <p className="text-gray-600 mb-4">
            Add your environmental interests, location, and goals to find like-minded eco-warriors near you.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Heart className="w-4 h-4 text-green-500" />
              <span>Environmental interests</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Location & distance</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Skills & activities</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSetupProfile}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              Complete Profile
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingSetup;