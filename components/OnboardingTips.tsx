import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: {
    label: string;
    onClick: () => void;
  };
  completed?: boolean;
}

export const OnboardingTips: React.FC = () => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to GreenVerse! 🌱',
      description: 'Let\'s get you started on your environmental journey. Complete your profile first!',
      action: {
        label: 'Complete Profile',
        onClick: () => {
          // Navigate to profile edit
          window.location.href = `/app/profile/${user?.username}/edit`;
        }
      }
    },
    {
      id: 'first-campaign',
      title: 'Join Your First Campaign 🌳',
      description: 'Find a tree planting campaign near you and start making an impact!',
      action: {
        label: 'Browse Campaigns',
        onClick: () => {
          window.location.href = '/app/campaigns';
        }
      }
    },
    {
      id: 'connect',
      title: 'Connect with Others 👥',
      description: 'Follow other environmental enthusiasts and build your green network!',
      action: {
        label: 'Find Friends',
        onClick: () => {
          window.location.href = '/app/matchmaking';
        }
      }
    },
    {
      id: 'share-story',
      title: 'Share Your Journey 📸',
      description: 'Create your first story to inspire others and document your impact!',
      action: {
        label: 'Create Story',
        onClick: () => {
          // Trigger story creation modal
          document.dispatchEvent(new CustomEvent('openStoryModal'));
        }
      }
    }
  ];

  // Check if user is new (created within last 7 days)
  const isNewUser = () => {
    if (!user?.createdAt) return true;
    const createdDate = new Date(user.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdDate > weekAgo;
  };

  // Check completion status based on user data
  const checkStepCompletion = () => {
    const completed: string[] = [];
    
    if (user?.fullName && user?.bio) completed.push('welcome');
    if (user?.campaignsJoined && user.campaignsJoined > 0) completed.push('first-campaign');
    if (user?.friendsCount && user.friendsCount > 0) completed.push('connect');
    if (user?.storiesCount && user.storiesCount > 0) completed.push('share-story');
    
    setCompletedSteps(completed);
  };

  useEffect(() => {
    if (isNewUser()) {
      checkStepCompletion();
      
      // Show onboarding if there are incomplete steps
      const incompleteSteps = onboardingSteps.filter(step => !completedSteps.includes(step.id));
      if (incompleteSteps.length > 0) {
        setIsVisible(true);
      }
    }
  }, [user]);

  const currentStepData = onboardingSteps.find(step => !completedSteps.includes(step.id));
  const progress = (completedSteps.length / onboardingSteps.length) * 100;

  if (!isVisible || !currentStepData || !isNewUser()) return null;

  const handleNext = () => {
    currentStepData.action.onClick();
    setIsVisible(false);
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-slide-in-right">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 animate-progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">
                  {completedSteps.length + 1}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Step {completedSteps.length + 1} of {onboardingSteps.length}
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-sm text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleNext}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 micro-bounce"
            >
              {currentStepData.action.label}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Skip
            </button>
          </div>

          {/* Completed steps indicator */}
          {completedSteps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>{completedSteps.length} steps completed</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Completion celebration component
export const OnboardingComplete: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4 animate-celebrate">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to the Community!
        </h2>
        <p className="text-gray-600 mb-6">
          You've completed the onboarding! You're now ready to make a real environmental impact with GreenVerse.
        </p>
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Start My Journey! 🌱
          </button>
          <div className="text-sm text-gray-500">
            You've earned 50 bonus points! 🏆
          </div>
        </div>
      </div>
    </div>
  );
};