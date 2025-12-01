-- Minimal Stories Enhancement - Just add expiration
-- Run this if you want 24-hour expiration without complex functions

-- Add expiration to existing stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Simple story views table (optional)
CREATE TABLE IF NOT EXISTS story_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- RLS for story views
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their story views" ON story_views FOR ALL USING (auth.uid() = viewer_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);

SELECT 'Minimal stories enhancement added' as status;