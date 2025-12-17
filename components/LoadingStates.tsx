import React from 'react';

// Skeleton loading components for better UX
export const CampaignCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-pulse">
    <div className="h-40 bg-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-2 bg-gray-200 rounded-full w-full"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
  </div>
);

export const DiscussionCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-2 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
    <div className="space-y-2 mb-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
      <div className="h-8 bg-gray-200 rounded w-16"></div>
      <div className="h-8 bg-gray-200 rounded w-12"></div>
      <div className="h-8 bg-gray-200 rounded w-12"></div>
    </div>
  </div>
);

export const UserCardSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    <div className="flex-1 space-y-1">
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded w-16"></div>
  </div>
);

// Enhanced loading spinner with environmental theme
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; message?: string }> = ({ 
  size = 'md', 
  message = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-green-200 border-t-green-600 rounded-full animate-spin`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-green-600 text-xs">🌱</span>
        </div>
      </div>
      <p className="text-gray-500 text-sm mt-2">{message}</p>
    </div>
  );
};

// Success animation component
export const SuccessAnimation: React.FC<{ message: string; onComplete?: () => void }> = ({ 
  message, 
  onComplete 
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
        <div className="text-6xl mb-4 animate-pulse">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Empty state component
export const EmptyState: React.FC<{ 
  icon: string; 
  title: string; 
  description: string; 
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4 max-w-sm mx-auto">{description}</p>
    {actionLabel && onAction && (
      <button 
        onClick={onAction}
        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);