-- Stories Performance Optimization
-- Run this in Supabase SQL Editor to optimize stories loading

-- Create optimized function for loading stories with all stats in one query
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
    s.title,
    s.description,
    s.media_url,
    s.media_type,
    s.duration,
    s.story_type,
    s.location,
    s.tags,
    s.views_count,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_expires_at_created_at ON stories(expires_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_reactions_story_user ON story_reactions(story_id, user_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);

-- Create materialized view for story stats (optional - for very high traffic)
CREATE MATERIALIZED VIEW IF NOT EXISTS story_stats AS
SELECT 
  s.id as story_id,
  COUNT(DISTINCT sr.id) as reactions_count,
  COUNT(DISTINCT sc.id) as comments_count,
  s.views_count
FROM stories s
LEFT JOIN story_reactions sr ON s.id = sr.story_id
LEFT JOIN story_comments sc ON s.id = sc.story_id
WHERE s.expires_at > NOW()
GROUP BY s.id, s.views_count;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_story_stats_story_id ON story_stats(story_id);

-- Function to refresh story stats (call periodically)
CREATE OR REPLACE FUNCTION refresh_story_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY story_stats;
END;
$$;

-- Optimized function using materialized view (for high traffic scenarios)
CREATE OR REPLACE FUNCTION get_stories_with_cached_stats(
  current_user_id UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 30
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
    s.title,
    s.description,
    s.media_url,
    s.media_type,
    s.duration,
    s.story_type,
    s.location,
    s.tags,
    s.views_count,
    s.created_at,
    s.expires_at,
    p.full_name as author_name,
    p.username as author_username,
    p.avatar_url as author_avatar,
    COALESCE(ss.reactions_count, 0) as reactions_count,
    COALESCE(ss.comments_count, 0) as comments_count,
    ur.reaction_type as user_reaction
  FROM stories s
  JOIN profiles p ON s.author_id = p.id
  LEFT JOIN story_stats ss ON s.id = ss.story_id
  LEFT JOIN story_reactions ur ON s.id = ur.story_id AND ur.user_id = current_user_id
  WHERE s.expires_at > NOW()
  ORDER BY s.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Clean up expired stories function (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

SELECT 'Stories optimization functions created successfully!' as status;