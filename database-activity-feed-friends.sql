-- Activity Feed for Friends

-- 1. Function to get friends' activity feed
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
  RETURN QUERY
  SELECT 
    af.id,
    af.user_id,
    p.full_name,
    p.avatar_url,
    af.activity_type,
    af.title,
    af.description,
    af.metadata,
    af.points_earned,
    af.created_at
  FROM activity_feed af
  INNER JOIN profiles p ON af.user_id = p.id
  WHERE af.user_id IN (
    SELECT f1.following_id 
    FROM follows f1
    INNER JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
    WHERE f1.follower_id = get_friends_activity_feed.user_id
  )
  AND af.is_public = true
  ORDER BY af.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Add activity types if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_feed' AND column_name='activity_type') THEN
    ALTER TABLE activity_feed ADD COLUMN activity_type TEXT;
  END IF;
END $$;
