-- Fix stories table schema mismatch
-- Run this in Supabase SQL Editor to fix story reactions

-- Update stories table to match the expected schema
ALTER TABLE stories ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_type TEXT DEFAULT 'general';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE stories ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Set author_id to a default if null (will be updated when stories are created)
-- UPDATE stories SET author_id = user_id WHERE author_id IS NULL;

-- Copy view_count to views_count if views_count is 0  
-- UPDATE stories SET views_count = view_count WHERE views_count = 0 OR views_count IS NULL;

-- Copy content to title if title is null
UPDATE stories SET title = COALESCE(content, 'Untitled Story') WHERE title IS NULL;

-- Add missing story_comments table
CREATE TABLE IF NOT EXISTS story_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on story_comments
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON story_comments FOR ALL USING (true) WITH CHECK (true);

-- Update the get_stories_with_stats function to handle both schemas
CREATE OR REPLACE FUNCTION get_stories_with_stats(
  current_user_id UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 30,
  offset_count INTEGER DEFAULT 0
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
  views_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_username TEXT,
  author_avatar TEXT,
  reactions_count BIGINT,
  comments_count BIGINT,
  user_reaction TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.author_id,
    COALESCE(s.title, s.content, 'Untitled') as title,
    s.description,
    s.media_url,
    s.media_type,
    s.duration,
    COALESCE(s.story_type, 'general') as story_type,
    s.location,
    s.tags,
    COALESCE(s.views_count, 0) as views_count,
    s.created_at,
    s.expires_at,
    p.full_name as author_name,
    p.username as author_username,
    p.avatar_url as author_avatar,
    COALESCE(r.reaction_count, 0) as reactions_count,
    COALESCE(c.comment_count, 0) as comments_count,
    ur.reaction_type as user_reaction
  FROM stories s
  JOIN profiles p ON s.author_id = p.id
  LEFT JOIN (
    SELECT 
      story_id, 
      COUNT(*) as reaction_count
    FROM story_reactions 
    GROUP BY story_id
  ) r ON s.id = r.story_id
  LEFT JOIN (
    SELECT 
      story_id, 
      COUNT(*) as comment_count
    FROM story_comments 
    GROUP BY story_id
  ) c ON s.id = c.story_id
  LEFT JOIN story_reactions ur ON s.id = ur.story_id AND ur.user_id = current_user_id
  WHERE s.expires_at > NOW()
  ORDER BY s.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_story_reactions_story_user ON story_reactions(story_id, user_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);

SELECT 'Stories schema fixed successfully!' as status;