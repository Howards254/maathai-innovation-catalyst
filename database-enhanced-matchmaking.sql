-- Enhanced Green Matchmaking

-- 1. Add location and interests to profiles if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location') THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='latitude') THEN
    ALTER TABLE profiles ADD COLUMN latitude DECIMAL(10, 8);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='longitude') THEN
    ALTER TABLE profiles ADD COLUMN longitude DECIMAL(11, 8);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='interests') THEN
    ALTER TABLE profiles ADD COLUMN interests TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='environmental_goals') THEN
    ALTER TABLE profiles ADD COLUMN environmental_goals TEXT[];
  END IF;
END $$;

-- 2. Function to find matches based on interests, location, and goals
CREATE OR REPLACE FUNCTION find_green_matches(
  user_id UUID,
  max_distance_km INTEGER DEFAULT 50,
  min_shared_interests INTEGER DEFAULT 1,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  match_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  shared_interests INTEGER,
  shared_goals INTEGER,
  distance_km DECIMAL,
  match_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_data AS (
    SELECT interests, environmental_goals, latitude, longitude
    FROM profiles
    WHERE id = user_id
  ),
  potential_matches AS (
    SELECT 
      p.id,
      p.full_name,
      p.avatar_url,
      p.bio,
      p.location,
      p.interests,
      p.environmental_goals,
      p.latitude,
      p.longitude,
      (
        SELECT COUNT(*)
        FROM unnest(p.interests) AS interest
        WHERE interest = ANY((SELECT interests FROM user_data))
      ) AS shared_interests_count,
      (
        SELECT COUNT(*)
        FROM unnest(p.environmental_goals) AS goal
        WHERE goal = ANY((SELECT environmental_goals FROM user_data))
      ) AS shared_goals_count,
      CASE 
        WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL 
          AND (SELECT latitude FROM user_data) IS NOT NULL 
          AND (SELECT longitude FROM user_data) IS NOT NULL
        THEN
          6371 * acos(
            cos(radians((SELECT latitude FROM user_data))) * 
            cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians((SELECT longitude FROM user_data))) + 
            sin(radians((SELECT latitude FROM user_data))) * 
            sin(radians(p.latitude))
          )
        ELSE NULL
      END AS distance
    FROM profiles p
    WHERE p.id != user_id
      AND p.id NOT IN (SELECT following_id FROM follows WHERE follower_id = user_id)
  )
  SELECT 
    pm.id,
    pm.full_name,
    pm.avatar_url,
    pm.bio,
    pm.location,
    pm.shared_interests_count::INTEGER,
    pm.shared_goals_count::INTEGER,
    pm.distance,
    (pm.shared_interests_count * 10 + pm.shared_goals_count * 15 + 
     CASE WHEN pm.distance IS NOT NULL AND pm.distance <= max_distance_km THEN 20 ELSE 0 END)::INTEGER AS score
  FROM potential_matches pm
  WHERE pm.shared_interests_count >= min_shared_interests
    OR pm.shared_goals_count > 0
    OR (pm.distance IS NOT NULL AND pm.distance <= max_distance_km)
  ORDER BY score DESC, pm.shared_interests_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
