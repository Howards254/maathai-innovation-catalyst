import React from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';

const EventsList: React.FC = () => {
  const { getApprovedEvents, loading, rsvpEvent, unrsvpEvent } = useEvents();
  const { user } = useAuth();
  const events = getApprovedEvents();

  const handleRSVP = (eventId: string) => {
    rsvpEvent(eventId);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                📅 Events
              </h1>
              <p className="text-gray-600 text-sm mt-1">Join environmental events and connect with the community</p>
            </div>
            <Link
              to="/app/events/create"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map(event => {
            const isRsvped = user && event.attendees.includes(user.id);
            const isFull = event.maxAttendees && event.attendees.length >= event.maxAttendees;
            
            return (
              <div key={event.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300 group">
                <div className="relative h-48">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                    🎨 {event.type}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <div className="text-green-600 font-bold text-sm flex items-center gap-1">
                        📅 {new Date(event.date).toLocaleDateString()} at {event.time}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      📍 <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      👥 <span>{event.attendees.length} attending{event.maxAttendees ? ` / ${event.maxAttendees} max` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      👤 <span>by {event.organizerName}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link
                      to={`/app/events/${event.id}`}
                      className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </Link>
                    {user && (
                      <button 
                        onClick={() => isRsvped ? unrsvpEvent(event.id) : rsvpEvent(event.id)}
                        disabled={!isRsvped && isFull}
                        className={`flex-1 px-4 py-2 font-medium rounded-lg transition-all duration-200 ${
                          isRsvped 
                            ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-105' 
                            : isFull
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        {isRsvped ? '❌ Cancel RSVP' : isFull ? '🚫 Event Full' : '✅ RSVP'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventsList;