import React, { useState, useEffect } from 'react';
import { X, Award, TreePine, Users, Zap } from 'lucide-react';

interface Notification {
  id: string;
  type: 'achievement' | 'milestone' | 'friend' | 'campaign';
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(notification.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const getIcon = () => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'milestone':
        return <TreePine className="w-5 h-5 text-green-600" />;
      case 'friend':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'campaign':
        return <Zap className="w-5 h-5 text-purple-600" />;
      default:
        return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      case 'milestone':
        return 'bg-green-50 border-green-200';
      case 'friend':
        return 'bg-blue-50 border-blue-200';
      case 'campaign':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getBgColor()} border rounded-xl p-4 shadow-lg animate-slide-in-right`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {notification.message}
            </p>
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                {notification.action.label} →
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(notification.id), 300);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification manager component
export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock function to add notifications (in real app, this would be triggered by events)
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Example: Trigger notifications based on user actions
  useEffect(() => {
    // Mock achievement notification
    const timer = setTimeout(() => {
      addNotification({
        type: 'achievement',
        title: 'Tree Hugger Badge Earned! 🌱',
        message: 'You\'ve planted your first 10 trees! Keep up the great work.',
        action: {
          label: 'View Badge',
          onClick: () => console.log('Navigate to badges')
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
};