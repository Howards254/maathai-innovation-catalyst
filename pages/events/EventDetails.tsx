import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../contexts/UserContext';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserById } = useUsers();
  const { getEvent, rsvpEvent, unrsvpEvent } = useEvents();

  const event = getEvent(id!);

  if (!event) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
        <button 
          onClick={() => navigate('/app/events')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  if (event.status !== 'approved') {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Available</h2>
        <p className="text-gray-600 mb-4">This event is not yet approved for public viewing.</p>
        <button 
          onClick={() => navigate('/app/events')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const isRsvped = user && event.attendees.includes(user.id);
  const isFull = event.maxAttendees && event.attendees.length >= event.maxAttendees;
  const isOrganizer = user?.id === event.organizerId;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="relative h-64">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className={`px-2 py-1 rounded ${
                event.type === 'Online' ? 'bg-blue-600' : 'bg-green-600'
              }`}>
                {event.type}
              </span>
              <span>📅 {new Date(event.date).toLocaleDateString()}</span>
              <span>🕐 {event.time}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>📍 {event.location}</span>
                <span>👤 Organized by {event.organizerName}</span>
                <span>👥 {event.attendees.length} attending{event.maxAttendees ? ` / ${event.maxAttendees} max` : ''}</span>
              </div>
            </div>
            
            <div className="flex gap-2 ml-6">
              {user && !isOrganizer && (
                <button
                  onClick={() => isRsvped ? unrsvpEvent(event.id) : rsvpEvent(event.id)}
                  disabled={!isRsvped && isFull}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isRsvped 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : isFull
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isRsvped ? 'Cancel RSVP' : isFull ? 'Event Full' : 'RSVP Now'}
                </button>
              )}
              
              {isOrganizer && (
                <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                  You're the organizer
                </span>
              )}
            </div>
          </div>

          {/* Event Status for User */}
          {isRsvped && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">✅ You're registered for this event!</p>
              <p className="text-green-600 text-sm mt-1">You'll receive updates about this event.</p>
            </div>
          )}

          {isFull && !isRsvped && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800 font-medium">⚠️ This event is at full capacity</p>
              <p className="text-orange-600 text-sm mt-1">Registration is currently closed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendees */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Attendees ({event.attendees.length})</h3>
        
        {event.attendees.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No one has RSVP'd yet. Be the first!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {event.attendees.map(attendeeId => {
              const attendee = getUserById(attendeeId);
              return attendee ? (
                <div key={attendeeId} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <img src={attendee.avatarUrl} alt={attendee.fullName} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium text-sm">{attendee.fullName}</p>
                    <p className="text-xs text-gray-500">@{attendee.username}</p>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;