-- Simple Green Matchmaking System
-- Minimal approach using existing profiles table

-- Add matchmaking fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add social preferences field
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_preferences TEXT[] DEFAULT '{}';

-- Enhanced matchmaking function emphasizing social + interests
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
        SELECT interests, goals, social_preferences, latitude, longitude
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
            p.social_preferences,
            p.latitude,
            p.longitude,
            -- Calculate shared interests (PRIMARY)
            COALESCE(array_length(p.interests & u.interests, 1), 0) as shared_interests_count,
            -- Calculate shared social preferences (PRIMARY)
            COALESCE(array_length(p.social_preferences & u.social_preferences, 1), 0) as shared_social_count,
            -- Calculate shared goals (SECONDARY)
            COALESCE(array_length(p.goals & u.goals, 1), 0) as shared_goals_count,
            -- Calculate distance (TERTIARY)
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
        -- NEW SCORING: Social × 25 + Interests × 20 + Goals × 10 + Location × 5
        (pm.shared_social_count * 25 + 
         pm.shared_interests_count * 20 + 
         pm.shared_goals_count * 10 + 
         CASE 
            WHEN pm.distance IS NULL THEN 3
            WHEN pm.distance <= 10 THEN 5
            WHEN pm.distance <= 25 THEN 4
            WHEN pm.distance <= 50 THEN 3
            ELSE 1
         END) as score
    FROM potential_matches pm
    WHERE pm.shared_interests_count >= min_shared_interests
    AND (pm.distance IS NULL OR pm.distance <= max_distance_km)
    ORDER BY score DESC, pm.shared_social_count DESC, pm.shared_interests_count DESC, pm.distance ASC NULLS LAST
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

SELECT 'Simple matchmaking system created' as status;