-- Campaigns and Events - Safe Migration

-- 1. Ensure campaigns table has all needed columns
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='campaigns') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='is_public') THEN
      ALTER TABLE campaigns ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='organizer') THEN
      ALTER TABLE campaigns ADD COLUMN organizer TEXT;
    END IF;
  END IF;
END $$;

-- 2. Ensure events table has status column
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='events') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='status') THEN
      ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
  END IF;
END $$;

-- 3. Create tree_submissions table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tree_submissions') THEN
    CREATE TABLE tree_submissions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      trees_count INTEGER NOT NULL,
      photo_url TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      approved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- 4. Create campaign_updates table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='campaign_updates') THEN
    CREATE TABLE campaign_updates (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_organizer ON campaigns(organizer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user ON campaign_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tree_submissions_campaign ON tree_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tree_submissions_user ON tree_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_tree_submissions_status ON tree_submissions(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);

-- 6. Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- 7. Drop old policies
DROP POLICY IF EXISTS "Anyone can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Organizers can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can view participants" ON campaign_participants;
DROP POLICY IF EXISTS "Users can join campaigns" ON campaign_participants;
DROP POLICY IF EXISTS "Anyone can view submissions" ON tree_submissions;
DROP POLICY IF EXISTS "Users can submit trees" ON tree_submissions;
DROP POLICY IF EXISTS "Organizers can approve submissions" ON tree_submissions;
DROP POLICY IF EXISTS "Anyone can view updates" ON campaign_updates;
DROP POLICY IF EXISTS "Organizers can add updates" ON campaign_updates;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Anyone can view attendees" ON event_attendees;
DROP POLICY IF EXISTS "Users can RSVP" ON event_attendees;

-- 8. Create policies
CREATE POLICY "Anyone can view campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Users can create campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update campaigns" ON campaigns FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Anyone can view participants" ON campaign_participants FOR SELECT USING (true);
CREATE POLICY "Users can join campaigns" ON campaign_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view submissions" ON tree_submissions FOR SELECT USING (true);
CREATE POLICY "Users can submit trees" ON tree_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organizers can approve submissions" ON tree_submissions FOR UPDATE 
  USING (auth.uid() IN (SELECT organizer_id FROM campaigns WHERE id = campaign_id));

CREATE POLICY "Anyone can view updates" ON campaign_updates FOR SELECT USING (true);
CREATE POLICY "Organizers can add updates" ON campaign_updates FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT organizer_id FROM campaigns WHERE id = campaign_id));

CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Anyone can view attendees" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can RSVP" ON event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update RSVP" ON event_attendees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete RSVP" ON event_attendees FOR DELETE USING (auth.uid() = user_id);
