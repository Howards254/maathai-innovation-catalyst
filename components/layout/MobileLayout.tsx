import React from 'react';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import MobileTopBar from './MobileTopBar';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Pages that should have full screen layout (no bottom nav)
  const fullScreenPages = ['/login', '/register', '/'];
  const isFullScreen = fullScreenPages.some(page => location.pathname.startsWith(page));
  
  // Pages that need custom top bar
  const customTopBarPages = ['/app/messages', '/app/stories'];
  const hasCustomTopBar = customTopBarPages.some(page => location.pathname.startsWith(page));

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white">
      {/* Mobile Top Bar */}
      {!isFullScreen && !hasCustomTopBar && (
        <div className="md:hidden">
          <MobileTopBar />
        </div>
      )}
      
      {/* Main Content */}
      <main className={`${!isFullScreen ? 'pb-16 md:pb-0' : ''} ${!isFullScreen && !hasCustomTopBar ? 'pt-14' : ''}`}>
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {!isFullScreen && (
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
};

export default MobileLayout;