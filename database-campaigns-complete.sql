-- Complete Tree Planting Campaigns Database Schema
-- Run this in Supabase SQL Editor

-- Campaigns table (already exists in master schema, but adding missing fields)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS completion_photos TEXT[];
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_completion_pending BOOLEAN DEFAULT false;

-- Campaign updates table
CREATE TABLE IF NOT EXISTS campaign_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tree planting submissions table
CREATE TABLE IF NOT EXISTS tree_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    trees_count INTEGER NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all operations on campaign_updates" ON campaign_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tree_submissions" ON tree_submissions FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign ON campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tree_submissions_campaign ON tree_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tree_submissions_user ON tree_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_tree_submissions_status ON tree_submissions(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_location ON campaigns(latitude, longitude);

-- Function to update campaign tree count when submission is approved
CREATE OR REPLACE FUNCTION update_campaign_trees()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE campaigns 
    SET current_trees = current_trees + NEW.trees_count
    WHERE id = NEW.campaign_id;
  ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE campaigns 
    SET current_trees = GREATEST(0, current_trees - NEW.trees_count)
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating campaign tree count
DROP TRIGGER IF EXISTS trigger_update_campaign_trees ON tree_submissions;
CREATE TRIGGER trigger_update_campaign_trees
AFTER INSERT OR UPDATE ON tree_submissions
FOR EACH ROW
EXECUTE FUNCTION update_campaign_trees();

-- Function to get campaigns with stats
CREATE OR REPLACE FUNCTION get_campaigns_with_stats(
  user_id_param UUID DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  is_public_filter BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  goal_trees INTEGER,
  current_trees INTEGER,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  start_date DATE,
  end_date DATE,
  status TEXT,
  image_url TEXT,
  organizer_id UUID,
  participant_count INTEGER,
  is_public BOOLEAN,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  organizer_name TEXT,
  organizer_avatar TEXT,
  days_left INTEGER,
  is_participant BOOLEAN,
  is_organizer BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    c.goal_trees,
    c.current_trees,
    c.location,
    c.latitude,
    c.longitude,
    c.start_date,
    c.end_date,
    c.status,
    c.image_url,
    c.organizer_id,
    COALESCE(COUNT(DISTINCT cp.user_id), 0)::INTEGER as participant_count,
    c.is_public,
    c.tags,
    c.created_at,
    p.full_name as organizer_name,
    p.avatar_url as organizer_avatar,
    GREATEST(0, EXTRACT(DAY FROM c.end_date - CURRENT_DATE))::INTEGER as days_left,
    EXISTS(SELECT 1 FROM campaign_participants WHERE campaign_id = c.id AND user_id = user_id_param) as is_participant,
    (c.organizer_id = user_id_param) as is_organizer
  FROM campaigns c
  JOIN profiles p ON c.organizer_id = p.id
  LEFT JOIN campaign_participants cp ON c.id = cp.campaign_id
  WHERE 
    (status_filter IS NULL OR c.status = status_filter)
    AND (is_public_filter IS NULL OR c.is_public = is_public_filter)
  GROUP BY c.id, p.full_name, p.avatar_url
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE tree_submissions;

SELECT 'Campaigns database setup complete!' as status;