import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Camera, Users, TreePine, ShoppingBag } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/app/dashboard',
      icon: Home,
      label: 'Home',
      activeColor: 'text-green-600'
    },
    {
      path: '/app/campaigns',
      icon: TreePine,
      label: 'Campaigns',
      activeColor: 'text-green-600'
    },
    {
      path: '/app/stories',
      icon: Camera,
      label: 'Stories',
      activeColor: 'text-purple-600'
    },
    {
      path: '/app/messages',
      icon: MessageCircle,
      label: 'Messages',
      activeColor: 'text-blue-600'
    },
    {
      path: '/app/marketplace',
      icon: ShoppingBag,
      label: 'Market',
      activeColor: 'text-orange-600'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/app/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                active 
                  ? `${item.activeColor} bg-gray-50` 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;