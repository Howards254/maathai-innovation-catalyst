import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { getEventImage } from '../utils/imageUtils';

interface EventContextType {
  events: Event[];
  loading: boolean;
  createEvent: (event: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'status' | 'createdAt' | 'attendees'>) => Promise<void>;
  rsvpEvent: (eventId: string) => Promise<void>;
  unrsvpEvent: (eventId: string) => Promise<void>;
  approveEvent: (eventId: string) => Promise<void>;
  rejectEvent: (eventId: string) => Promise<void>;
  sendEventUpdate: (eventId: string, title: string, message: string) => Promise<void>;
  checkInAttendee: (rsvpId: string) => Promise<void>;
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

  useEffect(() => {
    if (user) {
      loadEvents();
      
      const eventsSubscription = supabase
        .channel('events_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
          loadEvents();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'event_rsvps' }, () => {
          loadEvents();
        })
        .subscribe();
      
      return () => {
        eventsSubscription.unsubscribe();
      };
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!events_organizer_id_fkey(id, full_name, username, avatar_url),
          rsvps:event_rsvps(id, user_id, status, ticket_code, checked_in)
        `)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      const formattedEvents = data?.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        slug: event.slug,
        date: event.date,
        time: event.time,
        endTime: event.end_time,
        timezone: event.timezone,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        type: event.type,
        meetingUrl: event.meeting_url,
        status: event.status,
        imageUrl: event.image_url,
        organizerId: event.organizer_id,
        organizerName: event.organizer?.full_name || 'Unknown',
        organizerAvatar: event.organizer?.avatar_url || '',
        maxAttendees: event.max_attendees,
        attendees: event.rsvps?.filter((r: any) => r.status === 'confirmed').map((r: any) => r.user_id) || [],
        waitlist: event.rsvps?.filter((r: any) => r.status === 'waitlist').map((r: any) => r.user_id) || [],
        isPublic: event.is_public,
        tags: event.tags || [],
        agenda: event.agenda,
        faqs: event.faqs,
        createdAt: event.created_at
      })) || [];
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'status' | 'createdAt' | 'attendees'>) => {
    if (!user) throw new Error('You must be logged in');

    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          end_time: eventData.endTime,
          timezone: eventData.timezone || 'UTC',
          location: eventData.location,
          latitude: eventData.latitude,
          longitude: eventData.longitude,
          type: eventData.type,
          meeting_url: eventData.meetingUrl,
          image_url: eventData.imageUrl || getEventImage(`e${Date.now()}`),
          organizer_id: user.id,
          max_attendees: eventData.maxAttendees,
          is_public: eventData.isPublic ?? true,
          tags: eventData.tags || [],
          agenda: eventData.agenda,
          faqs: eventData.faqs,
          status: 'pending'
        });
      
      if (error) throw error;
      await loadEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const rsvpEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'confirmed'
        });
      
      if (error) throw error;
      
      await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: 'event_rsvp',
        points_earned: 15,
        description: 'RSVP to event',
        reference_id: eventId
      });
      
      await loadEvents();
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      throw error;
    }
  };

  const unrsvpEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_rsvps')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      throw error;
    }
  };

  const approveEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'approved' })
        .eq('id', eventId);
      
      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Error approving event:', error);
      throw error;
    }
  };

  const rejectEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'rejected' })
        .eq('id', eventId);
      
      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Error rejecting event:', error);
      throw error;
    }
  };

  const sendEventUpdate = async (eventId: string, title: string, message: string) => {
    try {
      const { error } = await supabase
        .from('event_updates')
        .insert({
          event_id: eventId,
          title,
          message
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error sending event update:', error);
      throw error;
    }
  };

  const checkInAttendee = async (rsvpId: string) => {
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .update({ 
          checked_in: true,
          checked_in_at: new Date().toISOString()
        })
        .eq('id', rsvpId);
      
      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Error checking in attendee:', error);
      throw error;
    }
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
    sendEventUpdate,
    checkInAttendee,
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