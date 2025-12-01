-- Simple Green Matchmaking System
-- Minimal approach using existing profiles table

-- Add matchmaking fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Simple matchmaking function
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
        SELECT interests, goals, latitude, longitude
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
            p.goals,
            p.latitude,
            p.longitude,
            -- Calculate shared interests
            COALESCE(array_length(p.interests & u.interests, 1), 0) as shared_interests_count,
            -- Calculate shared goals  
            COALESCE(array_length(p.goals & u.goals, 1), 0) as shared_goals_count,
            -- Calculate distance if coordinates available
            CASE 
                WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL 
                     AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL
                THEN 6371 * acos(
                    cos(radians(u.latitude)) * cos(radians(p.latitude)) * 
                    cos(radians(p.longitude) - radians(u.longitude)) + 
                    sin(radians(u.latitude)) * sin(radians(p.latitude))
                )
                ELSE NULL
            END as distance
        FROM profiles p
        CROSS JOIN user_data u
        WHERE p.id != user_id
        AND p.id NOT IN (
            SELECT following_id FROM follows WHERE follower_id = user_id
        )
    )
    SELECT 
        pm.id,
        pm.full_name,
        pm.avatar_url,
        pm.bio,
        pm.location,
        pm.shared_interests_count,
        pm.shared_goals_count,
        ROUND(pm.distance, 1),
        -- Match score: interests × 10 + goals × 15 + proximity × 20
        (pm.shared_interests_count * 10 + 
         pm.shared_goals_count * 15 + 
         CASE 
            WHEN pm.distance IS NULL THEN 10
            WHEN pm.distance <= 10 THEN 20
            WHEN pm.distance <= 25 THEN 15
            WHEN pm.distance <= 50 THEN 10
            ELSE 5
         END) as score
    FROM potential_matches pm
    WHERE pm.shared_interests_count >= min_shared_interests
    AND (pm.distance IS NULL OR pm.distance <= max_distance_km)
    ORDER BY score DESC, pm.distance ASC NULLS LAST
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

SELECT 'Simple matchmaking system created' as status;