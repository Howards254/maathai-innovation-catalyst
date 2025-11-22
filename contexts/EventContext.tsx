import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event } from '../types';
import { useAuth } from './AuthContext';
import { useUsers } from './UserContext';
import { getEventImage } from '../utils/imageUtils';

interface EventContextType {
  events: Event[];
  loading: boolean;
  createEvent: (event: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'status' | 'createdAt' | 'attendees'>) => Promise<void>;
  rsvpEvent: (eventId: string) => Promise<void>;
  unrsvpEvent: (eventId: string) => Promise<void>;
  approveEvent: (eventId: string) => Promise<void>;
  rejectEvent: (eventId: string) => Promise<void>;
  getEvent: (id: string) => Event | undefined;
  getApprovedEvents: () => Event[];
  getPendingEvents: () => Event[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within EventProvider');
  }
  return context;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { awardPoints } = useUsers();

  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: 'e1',
        title: 'Karura Forest Clean-up',
        description: 'Join us for a community clean-up event at Karura Forest to remove litter and plant new trees.',
        date: '2024-02-15',
        time: '09:00',
        location: 'Gate C, Karura Forest',
        attendees: ['user-2', 'user-3'],
        maxAttendees: 50,
        type: 'In-Person',
        imageUrl: getEventImage('e1'),
        organizerId: 'user-1',
        organizerName: 'Wangari Demo',
        status: 'approved',
        createdAt: '2024-01-20T10:00:00Z'
      },
      {
        id: 'e2',
        title: 'Agroforestry Webinar',
        description: 'Learn about sustainable farming practices that integrate trees and crops for better yields.',
        date: '2024-02-20',
        time: '18:00',
        location: 'Online via Zoom',
        attendees: ['user-1', 'user-3'],
        type: 'Online',
        imageUrl: getEventImage('e2'),
        organizerId: 'user-2',
        organizerName: 'John Planter',
        status: 'approved',
        createdAt: '2024-01-22T15:30:00Z'
      },
    ];

    const saved = localStorage.getItem('events');
    if (saved) {
      setEvents(JSON.parse(saved));
    } else {
      setEvents(mockEvents);
      localStorage.setItem('events', JSON.stringify(mockEvents));
    }
    setLoading(false);
  }, []);

  const saveEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    localStorage.setItem('events', JSON.stringify(newEvents));
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'status' | 'createdAt' | 'attendees'>) => {
    if (!user) return;

    const eventId = `e${Date.now()}`;
    const newEvent: Event = {
      ...eventData,
      id: eventId,
      imageUrl: eventData.imageUrl || getEventImage(eventId),
      organizerId: user.id,
      organizerName: user.fullName,
      status: 'pending',
      attendees: [],
      createdAt: new Date().toISOString()
    };

    const newEvents = [...events, newEvent];
    saveEvents(newEvents);
  };

  const rsvpEvent = async (eventId: string) => {
    if (!user) return;

    const newEvents = events.map(event => {
      if (event.id === eventId && !event.attendees.includes(user.id)) {
        return { ...event, attendees: [...event.attendees, user.id] };
      }
      return event;
    });
    
    saveEvents(newEvents);
    awardPoints(user.id, 15, 'event_rsvp');
  };

  const unrsvpEvent = async (eventId: string) => {
    if (!user) return;

    const newEvents = events.map(event => {
      if (event.id === eventId) {
        return { ...event, attendees: event.attendees.filter(id => id !== user.id) };
      }
      return event;
    });
    
    saveEvents(newEvents);
  };

  const approveEvent = async (eventId: string) => {
    const newEvents = events.map(event =>
      event.id === eventId
        ? { ...event, status: 'approved' as const }
        : event
    );
    saveEvents(newEvents);
  };

  const rejectEvent = async (eventId: string) => {
    const newEvents = events.map(event =>
      event.id === eventId
        ? { ...event, status: 'rejected' as const }
        : event
    );
    saveEvents(newEvents);
  };

  const getEvent = (id: string) => {
    return events.find(event => event.id === id);
  };

  const getApprovedEvents = () => {
    return events.filter(event => event.status === 'approved');
  };

  const getPendingEvents = () => {
    return events.filter(event => event.status === 'pending');
  };

  const value = {
    events,
    loading,
    createEvent,
    rsvpEvent,
    unrsvpEvent,
    approveEvent,
    rejectEvent,
    getEvent,
    getApprovedEvents,
    getPendingEvents
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};