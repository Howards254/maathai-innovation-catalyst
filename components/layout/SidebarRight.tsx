import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGamification } from '../../contexts/GamificationContext';
import { useEvents } from '../../contexts/EventContext';

const SidebarRight: React.FC = () => {
  const { getDailyChallenges, updateProgress } = useGamification();
  const { getApprovedEvents } = useEvents();
  const [currentQuote, setCurrentQuote] = useState(0);
  
  const dailyChallenges = getDailyChallenges();
  const activeChallenge = dailyChallenges.find(c => !c.completed) || dailyChallenges[0];
  const upcomingEvents = getApprovedEvents().slice(0, 2);
  
  const wangariQuotes = [
    "It's the little things citizens do. That's what will make the difference. My little thing is planting trees.",
    "We are called to assist the Earth to heal her wounds and in the process heal our own.",
    "Until you dig a hole, you plant a tree, you water it and make it survive, you haven't done a thing.",
    "The generation that destroys the environment is not the generation that pays the price.",
    "When we plant trees, we plant the seeds of peace and seeds of hope.",
    "You cannot protect the environment unless you empower people, you inform them, and you help them understand."
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % wangariQuotes.length);
    }, 15000); // Change quote every 15 seconds
    return () => clearInterval(interval);
  }, []);

  // Fallback mock events if no real events
  const mockEvents = [
    {
      id: 'mock-1',
      title: 'Karura Cleanup',
      date: 'Aug 24',
      location: 'Nairobi • 45 going'
    },
    {
      id: 'mock-2', 
      title: 'Agroforestry 101',
      date: 'Aug 27',
      location: 'Online • 120 going'
    }
  ];

  const displayEvents = upcomingEvents.length > 0 ? upcomingEvents.map(event => ({
    id: event.id,
    title: event.title,
    date: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    location: `${event.location} • ${event.attendees.length} going`
  })) : mockEvents;

  return (
    <aside className="hidden xl:block w-80 pb-20 p-4 space-y-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto no-scrollbar">
      
      {/* Widget: Daily Challenge */}
      {activeChallenge && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800">Daily Challenge</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              activeChallenge.completed 
                ? 'bg-green-100 text-green-700' 
                : 'bg-primary-100 text-primary-700'
            }`}>
              {activeChallenge.completed ? 'Complete' : 'Active'}
            </span>
          </div>
          <div className="mb-3">
            <p className="text-sm text-gray-600">{activeChallenge.description}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all" 
              style={{ width: `${(activeChallenge.progress / activeChallenge.target) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>{activeChallenge.progress}/{activeChallenge.target} completed</span>
            <span>+{activeChallenge.points} Points</span>
          </div>
          {!activeChallenge.completed && (
            <button 
              onClick={() => updateProgress(activeChallenge.id, 1)}
              className="w-full py-1.5 text-sm font-medium text-primary-600 border border-primary-200 rounded hover:bg-primary-50 transition-colors"
            >
              Mark Progress
            </button>
          )}
        </div>
      )}

      {/* Widget: Upcoming Events */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Upcoming Events</h3>
        <div className="space-y-3">
          {displayEvents.map(event => {
            const [month, day] = event.date.split(' ');
            return (
              <div key={event.id} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded flex flex-col items-center justify-center border border-gray-200">
                  <span className="text-[10px] uppercase text-gray-500 font-bold">{month}</span>
                  <span className="text-sm font-bold text-gray-800">{day}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 leading-tight">{event.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>
                </div>
              </div>
            );
          })}
        </div>
        <Link 
          to="/app/events"
          className="block w-full mt-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded transition-colors text-center"
        >
          View All Events
        </Link>
      </div>

      {/* Widget: Maathai Quote */}
      <div className="bg-gradient-to-br from-primary-900 to-secondary rounded-lg p-4 text-white shadow-md">
        <p className="text-sm italic opacity-90 mb-2">
          "{wangariQuotes[currentQuote]}"
        </p>
        <p className="text-xs font-bold text-right mb-2">— Wangari Maathai</p>
        <div className="flex justify-center gap-1">
          {wangariQuotes.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentQuote ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Our Partners</h3>
        <div className="grid grid-cols-2 gap-3">
          <a 
            href="https://wangarimaathai.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gray-50 rounded p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <img 
              src="https://wangarimaathai.org/wp-content/uploads/2020/06/WMF-Logo-Horizontal-Green.png" 
              alt="Wangari Maathai Foundation" 
              className="h-8 w-auto object-contain"
            />
          </a>
          <a 
            href="https://greenbeltmovement.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gray-50 rounded p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <img 
              src="https://greenbeltmovement.org/wp-content/uploads/2019/03/GBM-Logo-Green.png" 
              alt="Green Belt Movement" 
              className="h-8 w-auto object-contain"
            />
          </a>
          <a 
            href="https://antugrow.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gray-50 rounded p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <div className="text-xs font-bold text-purple-700">AntuGrow</div>
          </a>
          <a 
            href="https://adamur.co.ke" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gray-50 rounded p-3 hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <div className="text-xs font-bold text-orange-700">Adamur</div>
          </a>
        </div>
      </div>

      {/* Footer Links */}
      <div className="px-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
        </div>
        <p className="text-xs text-gray-400 mt-2">© {new Date().getFullYear()} GreenVerse.</p>
      </div>
    </aside>
  );
};

export default SidebarRight;