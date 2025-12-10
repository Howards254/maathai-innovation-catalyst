-- Complete Events Schema for Luma/Eventbrite-like functionality
-- Run this in Supabase SQL Editor

-- Drop existing tables
DROP TABLE IF EXISTS event_reminders CASCADE;
DROP TABLE IF EXISTS event_updates CASCADE;
DROP TABLE IF EXISTS event_rsvps CASCADE;
DROP TABLE IF EXISTS recurring_events CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Enhanced events table
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    slug TEXT UNIQUE,
    date DATE NOT NULL,
    "time" TIME NOT NULL,
    end_time TIME,
    timezone TEXT DEFAULT 'UTC',
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    type TEXT CHECK (type IN ('Online', 'In-Person', 'Hybrid')) DEFAULT 'In-Person',
    meeting_url TEXT,
    status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'cancelled', 'completed')) DEFAULT 'pending',
    image_url TEXT,
    organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    max_attendees INTEGER,
    is_public BOOLEAN DEFAULT true,
    tags TEXT[],
    agenda JSONB,
    faqs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event RSVPs with waitlist support
CREATE TABLE event_rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('confirmed', 'waitlist', 'cancelled')) DEFAULT 'confirmed',
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    ticket_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Event updates/announcements
CREATE TABLE event_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event reminders
CREATE TABLE event_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reminder_type TEXT CHECK (reminder_type IN ('1_week', '1_day', '1_hour')) NOT NULL,
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Recurring events
CREATE TABLE recurring_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly')) NOT NULL,
    recurrence_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_events ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public read approved events" ON events;
DROP POLICY IF EXISTS "Organizers manage own events" ON events;
DROP POLICY IF EXISTS "Anyone can RSVP" ON event_rsvps;
DROP POLICY IF EXISTS "Users view own RSVPs" ON event_rsvps;
DROP POLICY IF EXISTS "Public read event updates" ON event_updates;
DROP POLICY IF EXISTS "Users manage own reminders" ON event_reminders;

CREATE POLICY "Public read approved events" ON events FOR SELECT USING (status = 'approved' OR organizer_id = auth.uid());
CREATE POLICY "Organizers manage own events" ON events FOR ALL USING (organizer_id = auth.uid()) WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Anyone can RSVP" ON event_rsvps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users view own RSVPs" ON event_rsvps FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Public read event updates" ON event_updates FOR SELECT USING (true);
CREATE POLICY "Users manage own reminders" ON event_reminders FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON event_rsvps(status);
CREATE INDEX IF NOT EXISTS idx_event_updates_event ON event_updates(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_event ON event_reminders(event_id);

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_event_slug(event_title TEXT, event_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := lower(regexp_replace(event_title, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM events WHERE slug = final_slug AND id != event_id) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to generate ticket code
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'TKT-' || upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
CREATE OR REPLACE FUNCTION set_event_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := generate_event_slug(NEW.title, NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_event_slug ON events;
CREATE TRIGGER trigger_set_event_slug
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION set_event_slug();

-- Trigger to auto-generate ticket code
CREATE OR REPLACE FUNCTION set_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_code IS NULL THEN
        NEW.ticket_code := generate_ticket_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_ticket_code ON event_rsvps;
CREATE TRIGGER trigger_set_ticket_code
    BEFORE INSERT ON event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_code();

-- Function to handle waitlist
CREATE OR REPLACE FUNCTION handle_event_rsvp()
RETURNS TRIGGER AS $$
DECLARE
    event_max INTEGER;
    current_count INTEGER;
BEGIN
    SELECT max_attendees INTO event_max FROM events WHERE id = NEW.event_id;
    
    IF event_max IS NOT NULL THEN
        SELECT COUNT(*) INTO current_count 
        FROM event_rsvps 
        WHERE event_id = NEW.event_id AND status = 'confirmed';
        
        IF current_count >= event_max THEN
            NEW.status := 'waitlist';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_event_rsvp ON event_rsvps;
CREATE TRIGGER trigger_handle_event_rsvp
    BEFORE INSERT ON event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION handle_event_rsvp();

-- Function to get events with stats
CREATE OR REPLACE FUNCTION get_events_with_stats()
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    slug TEXT,
    date DATE,
    "time" TIME,
    end_time TIME,
    timezone TEXT,
    location TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    type TEXT,
    meeting_url TEXT,
    status TEXT,
    image_url TEXT,
    organizer_id UUID,
    organizer_name TEXT,
    organizer_avatar TEXT,
    max_attendees INTEGER,
    confirmed_count BIGINT,
    waitlist_count BIGINT,
    is_public BOOLEAN,
    tags TEXT[],
    agenda JSONB,
    faqs JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.title,
        e.description,
        e.slug,
        e.date,
        e."time",
        e.end_time,
        e.timezone,
        e.location,
        e.latitude,
        e.longitude,
        e.type,
        e.meeting_url,
        e.status,
        e.image_url,
        e.organizer_id,
        p.full_name as organizer_name,
        p.avatar_url as organizer_avatar,
        e.max_attendees,
        COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'confirmed'), 0) as confirmed_count,
        COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'waitlist'), 0) as waitlist_count,
        e.is_public,
        e.tags,
        e.agenda,
        e.faqs,
        e.created_at,
        e.updated_at
    FROM events e
    LEFT JOIN profiles p ON e.organizer_id = p.id
    LEFT JOIN event_rsvps r ON e.id = r.event_id
    GROUP BY e.id, p.full_name, p.avatar_url
    ORDER BY e.date ASC, e."time" ASC;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_rsvps;
ALTER PUBLICATION supabase_realtime ADD TABLE event_updates;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

SELECT 'Events schema created successfully!' as status;
