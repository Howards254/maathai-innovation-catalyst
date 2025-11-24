-- Activity Feed for Friends - Safe Migration

-- 1. Add activity_type column if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='activity_feed') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_feed' AND column_name='activity_type') THEN
      ALTER TABLE activity_feed ADD COLUMN activity_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_feed' AND column_name='is_public') THEN
      ALTER TABLE activity_feed ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
    END IF;
  END IF;
END $$;

-- 2. Drop old function
DROP FUNCTION IF EXISTS get_friends_activity_feed(UUID, INTEGER) CASCADE;

-- 3. Create friends activity feed function
CREATE OR REPLACE FUNCTION get_friends_activity_feed(user_id UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  activity_id UUID,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  activity_type TEXT,
  title TEXT,
  description TEXT,
  metadata JSONB,
  points_earned INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Check if activity_feed table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='activity_feed') THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    af.id,
    af.user_id,
    p.full_name,
    p.avatar_url,
    COALESCE(af.activity_type, 'unknown'),
    COALESCE(af.title, ''),
    COALESCE(af.description, ''),
    COALESCE(af.metadata, '{}'::JSONB),
    COALESCE(af.points_earned, 0),
    af.created_at
  FROM activity_feed af
  INNER JOIN profiles p ON af.user_id = p.id
  WHERE af.user_id IN (
    SELECT f1.following_id 
    FROM follows f1
    INNER JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
    WHERE f1.follower_id = get_friends_activity_feed.user_id
  )
  AND COALESCE(af.is_public, true) = true
  ORDER BY af.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
