-- Simple Enhanced Stories System - No Cron Dependencies
-- Works with existing Cloudinary setup

-- Add expiration and enhanced features to stories
ALTER TABLE stories ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Story views tracking
CREATE TABLE IF NOT EXISTS story_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration INTEGER DEFAULT 0,
  UNIQUE(story_id, viewer_id)
);

-- Enhanced reactions
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE table_name = 'story_reactions' AND constraint_name = 'story_reactions_reaction_type_check') THEN
    ALTER TABLE story_reactions DROP CONSTRAINT story_reactions_reaction_type_check;
  END IF;
END $$;

ALTER TABLE story_reactions ADD CONSTRAINT story_reactions_reaction_type_check 
  CHECK (reaction_type IN ('love', 'fire', 'clap', 'laugh', 'wow', 'sad', 'angry', 'planted', 'inspiring'));

-- Function to get active stories
CREATE OR REPLACE FUNCTION get_active_stories(
  viewer_user_id UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  title TEXT,
  description TEXT,
  media_url TEXT,
  media_type TEXT,
  duration INTEGER,
  story_type TEXT,
  location TEXT,
  tags TEXT[],
  views_count BIGINT,
  reactions_count BIGINT,
  comments_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_username TEXT,
  author_avatar TEXT,
  has_viewed BOOLEAN,
  user_reaction TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.author_id,
    s.title,
    s.description,
    s.media_url,
    s.media_type,
    s.duration,
    s.story_type,
    s.location,
    s.tags,
    COALESCE(s.views_count, 0) as views_count,
    COALESCE(r.reaction_count, 0) as reactions_count,
    COALESCE(c.comment_count, 0) as comments_count,
    s.created_at,
    s.expires_at,
    p.full_name as author_name,
    p.username as author_username,
    p.avatar_url as author_avatar,
    CASE WHEN viewer_user_id IS NOT NULL THEN EXISTS(
      SELECT 1 FROM story_views sv WHERE sv.story_id = s.id AND sv.viewer_id = viewer_user_id
    ) ELSE FALSE END as has_viewed,
    CASE WHEN viewer_user_id IS NOT NULL THEN (
      SELECT sr.reaction_type FROM story_reactions sr 
      WHERE sr.story_id = s.id AND sr.user_id = viewer_user_id
    ) ELSE NULL END as user_reaction
  FROM stories s
  JOIN profiles p ON s.author_id = p.id
  LEFT JOIN (
    SELECT story_id, COUNT(*) as reaction_count 
    FROM story_reactions 
    GROUP BY story_id
  ) r ON s.id = r.story_id
  LEFT JOIN (
    SELECT story_id, COUNT(*) as comment_count 
    FROM story_comments 
    GROUP BY story_id
  ) c ON s.id = c.story_id
  WHERE s.expires_at > NOW() 
  AND (s.is_archived = FALSE OR s.is_archived IS NULL)
  ORDER BY s.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to record story view
CREATE OR REPLACE FUNCTION record_story_view(
  p_story_id UUID,
  p_viewer_id UUID,
  p_duration INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
  INSERT INTO story_views (story_id, viewer_id, view_duration)
  VALUES (p_story_id, p_viewer_id, p_duration)
  ON CONFLICT (story_id, viewer_id) 
  DO UPDATE SET 
    viewed_at = NOW(),
    view_duration = GREATEST(story_views.view_duration, p_duration);
    
  -- Update views count in stories table
  UPDATE stories 
  SET views_count = COALESCE(views_count, 0) + 1 
  WHERE id = p_story_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at) WHERE (is_archived = FALSE OR is_archived IS NULL);
CREATE INDEX IF NOT EXISTS idx_story_views_story_viewer ON story_views(story_id, viewer_id);

-- RLS for story views
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view story views" ON story_views FOR SELECT USING (true);
CREATE POLICY "Users can record their views" ON story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "Users can update their views" ON story_views FOR UPDATE USING (auth.uid() = viewer_id);

SELECT 'Simple enhanced stories system created (Cloudinary compatible)' as status;