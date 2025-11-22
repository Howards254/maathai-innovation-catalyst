import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import EnvironmentalAssistant from '../EnvironmentalAssistant';

const AppLayout: React.FC = () => {
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <SidebarLeft />
        <main className="flex-1 min-w-0 bg-white lg:border-x border-gray-200 min-h-[calc(100vh-4rem)] relative">
          <Outlet />
          
          {/* Mobile Footer */}
          <footer className="lg:hidden bg-white border-t border-gray-200 p-6 mt-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">🌱</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">Maathai Catalyst</span>
              </div>
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                <a href="/about" className="hover:text-green-600 transition-colors">About</a>
                <a href="/privacy" className="hover:text-green-600 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-green-600 transition-colors">Terms</a>
              </div>
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Maathai Catalyst. Made with 💚 for the planet.
              </p>
            </div>
          </footer>
        </main>
        <SidebarRight />
      </div>
      
      {/* AI Assistant Floating Button */}
      <button
        onClick={() => setShowAI(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center z-40 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">🤖</span>
      </button>
      
      <EnvironmentalAssistant isOpen={showAI} onClose={() => setShowAI(false)} />
    </div>
  );
};

export default AppLayout;