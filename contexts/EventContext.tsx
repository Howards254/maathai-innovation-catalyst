import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  type: string;
  image_url?: string;
  organizer_id: string;
  organizer?: { full_name: string; avatar_url: string };
  max_attendees?: number;
  status: string;
  attendees?: any[];
  created_at: string;
}

interface EventContextType {
  events: Event[];
  loading: boolean;
  createEvent: (data: any) => Promise<void>;
  rsvpEvent: (eventId: string) => Promise<void>;
  unrsvpEvent: (eventId: string) => Promise<void>;
  getEvent: (id: string) => Event | undefined;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvents must be used within EventProvider');
  return context;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!events_organizer_id_fkey(full_name, avatar_url),
          attendees:event_attendees(user_id)
        `)
        .order('event_date', { ascending: true });

      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: any) => {
    if (!user) return;

    try {
      await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.date,
          location: eventData.location,
          type: eventData.type,
          image_url: eventData.imageUrl,
          organizer_id: user.id,
          max_attendees: eventData.maxAttendees,
          status: 'approved'
        });

      await loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const rsvpEvent = async (eventId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: user.id, rsvp_status: 'going' });

      const { data: profile } = await supabase
        .from('profiles')
        .select('impact_points')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ impact_points: profile.impact_points + 15 })
          .eq('id', user.id);
      }

      await loadEvents();
    } catch (error) {
      console.error('Error RSVPing:', error);
    }
  };

  const unrsvpEvent = async (eventId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      await loadEvents();
    } catch (error) {
      console.error('Error un-RSVPing:', error);
    }
  };

  const getEvent = (id: string) => events.find(e => e.id === id);

  return (
    <EventContext.Provider value={{
      events,
      loading,
      createEvent,
      rsvpEvent,
      unrsvpEvent,
      getEvent
    }}>
      {children}
    </EventContext.Provider>
  );
};
