-- Green Matchmaking System Database Schema

-- Enhanced user profiles for matchmaking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'weekends' CHECK (availability IN ('weekdays', 'weekends', 'evenings', 'flexible'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_distance_km INTEGER DEFAULT 50;

-- User interests (environmental causes)
CREATE TABLE IF NOT EXISTS user_causes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    cause TEXT NOT NULL CHECK (cause IN ('climate_change', 'tree_planting', 'conservation', 'renewable_energy', 'waste_reduction', 'water_protection', 'biodiversity', 'sustainable_agriculture', 'green_technology', 'environmental_education')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    UNIQUE(user_id, cause)
);

-- User skills
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill TEXT NOT NULL CHECK (skill IN ('leadership', 'project_management', 'research', 'communication', 'fundraising', 'social_media', 'event_planning', 'technical_writing', 'data_analysis', 'photography', 'videography', 'web_development', 'graphic_design', 'teaching', 'networking')),
    proficiency TEXT DEFAULT 'beginner' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
    UNIQUE(user_id, skill)
);

-- Preferred activities
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity TEXT NOT NULL CHECK (activity IN ('tree_planting', 'beach_cleanup', 'community_gardens', 'workshops', 'protests', 'research', 'fundraising', 'awareness_campaigns', 'policy_advocacy', 'mentoring', 'volunteering', 'organizing_events')),
    UNIQUE(user_id, activity)
);

-- Matchmaking preferences
CREATE TABLE IF NOT EXISTS matchmaking_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    match_for TEXT[] DEFAULT '{}' CHECK (array_length(match_for, 1) IS NULL OR match_for <@ ARRAY['teammates', 'volunteers', 'mentors', 'mentees', 'collaborators', 'friends']),
    preferred_group_size TEXT DEFAULT 'small' CHECK (preferred_group_size IN ('individual', 'small', 'medium', 'large')),
    communication_style TEXT DEFAULT 'casual' CHECK (communication_style IN ('formal', 'casual', 'professional')),
    meeting_preference TEXT DEFAULT 'hybrid' CHECK (meeting_preference IN ('online', 'in_person', 'hybrid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match results
CREATE TABLE IF NOT EXISTS user_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    matched_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_type TEXT NOT NULL CHECK (match_type IN ('teammate', 'volunteer', 'mentor', 'mentee', 'collaborator', 'friend')),
    compatibility_score DECIMAL(3,2) CHECK (compatibility_score BETWEEN 0 AND 1),
    distance_km DECIMAL(8,2),
    common_causes TEXT[],
    common_skills TEXT[],
    common_activities TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, matched_user_id, match_type)
);

-- Match interactions
CREATE TABLE IF NOT EXISTS match_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES user_matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'message', 'connect')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team formation
CREATE TABLE IF NOT EXISTS green_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    team_type TEXT DEFAULT 'project' CHECK (team_type IN ('project', 'campaign', 'research', 'volunteer', 'social')),
    max_members INTEGER DEFAULT 10,
    current_members INTEGER DEFAULT 1,
    location_city TEXT,
    location_country TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    required_skills TEXT[],
    preferred_causes TEXT[],
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team memberships
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES green_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'co_leader', 'member', 'volunteer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_city, location_country);
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_causes_user ON user_causes(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id, proficiency);
CREATE INDEX IF NOT EXISTS idx_user_matches_user ON user_matches(user_id, status, compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_matches_matched ON user_matches(matched_user_id, status);
CREATE INDEX IF NOT EXISTS idx_green_teams_location ON green_teams(location_city, location_country, is_active);

-- RLS Policies
ALTER TABLE user_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- User data policies
CREATE POLICY "Users can manage their own causes" ON user_causes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills" ON user_skills
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activities" ON user_activities
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their matchmaking preferences" ON matchmaking_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Match policies
CREATE POLICY "Users can view their matches" ON user_matches
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "System can create matches" ON user_matches
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their match status" ON user_matches
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- Team policies
CREATE POLICY "Anyone can view active teams" ON green_teams
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create teams" ON green_teams
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Team creators can update their teams" ON green_teams
    FOR UPDATE USING (auth.uid() = creator_id);

-- Matchmaking algorithm function
CREATE OR REPLACE FUNCTION find_green_matches(
    target_user_id UUID,
    match_type_filter TEXT DEFAULT NULL,
    max_distance INTEGER DEFAULT 50,
    limit_results INTEGER DEFAULT 20
)
RETURNS TABLE (
    matched_user_id UUID,
    compatibility_score DECIMAL,
    distance_km DECIMAL,
    common_causes TEXT[],
    common_skills TEXT[],
    common_activities TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH user_data AS (
        SELECT 
            p.id,
            p.location_city,
            p.location_country,
            p.latitude,
            p.longitude,
            p.experience_level,
            array_agg(DISTINCT uc.cause) FILTER (WHERE uc.cause IS NOT NULL) as causes,
            array_agg(DISTINCT us.skill) FILTER (WHERE us.skill IS NOT NULL) as skills,
            array_agg(DISTINCT ua.activity) FILTER (WHERE ua.activity IS NOT NULL) as activities
        FROM profiles p
        LEFT JOIN user_causes uc ON p.id = uc.user_id
        LEFT JOIN user_skills us ON p.id = us.user_id
        LEFT JOIN user_activities ua ON p.id = ua.user_id
        WHERE p.id != target_user_id
        AND EXISTS (SELECT 1 FROM matchmaking_preferences mp WHERE mp.user_id = p.id AND mp.is_active = true)
        GROUP BY p.id, p.location_city, p.location_country, p.latitude, p.longitude, p.experience_level
    ),
    target_user AS (
        SELECT 
            p.id,
            p.latitude as target_lat,
            p.longitude as target_lng,
            array_agg(DISTINCT uc.cause) FILTER (WHERE uc.cause IS NOT NULL) as target_causes,
            array_agg(DISTINCT us.skill) FILTER (WHERE us.skill IS NOT NULL) as target_skills,
            array_agg(DISTINCT ua.activity) FILTER (WHERE ua.activity IS NOT NULL) as target_activities
        FROM profiles p
        LEFT JOIN user_causes uc ON p.id = uc.user_id
        LEFT JOIN user_skills us ON p.id = us.user_id
        LEFT JOIN user_activities ua ON p.id = ua.user_id
        WHERE p.id = target_user_id
        GROUP BY p.id, p.latitude, p.longitude
    )
    SELECT 
        ud.id,
        ROUND(
            (
                COALESCE(array_length(ud.causes & tu.target_causes, 1), 0) * 0.4 +
                COALESCE(array_length(ud.skills & tu.target_skills, 1), 0) * 0.3 +
                COALESCE(array_length(ud.activities & tu.target_activities, 1), 0) * 0.3
            ) / GREATEST(
                COALESCE(array_length(tu.target_causes, 1), 1) * 0.4 +
                COALESCE(array_length(tu.target_skills, 1), 1) * 0.3 +
                COALESCE(array_length(tu.target_activities, 1), 1) * 0.3,
                1
            ), 2
        ) as score,
        CASE 
            WHEN ud.latitude IS NOT NULL AND ud.longitude IS NOT NULL AND tu.target_lat IS NOT NULL AND tu.target_lng IS NOT NULL
            THEN ROUND(
                6371 * acos(
                    cos(radians(tu.target_lat)) * cos(radians(ud.latitude)) * 
                    cos(radians(ud.longitude) - radians(tu.target_lng)) + 
                    sin(radians(tu.target_lat)) * sin(radians(ud.latitude))
                ), 2
            )
            ELSE NULL
        END as distance,
        ud.causes & tu.target_causes as common_causes_result,
        ud.skills & tu.target_skills as common_skills_result,
        ud.activities & tu.target_activities as common_activities_result
    FROM user_data ud
    CROSS JOIN target_user tu
    WHERE (
        max_distance IS NULL OR 
        ud.latitude IS NULL OR ud.longitude IS NULL OR
        tu.target_lat IS NULL OR tu.target_lng IS NULL OR
        6371 * acos(
            cos(radians(tu.target_lat)) * cos(radians(ud.latitude)) * 
            cos(radians(ud.longitude) - radians(tu.target_lng)) + 
            sin(radians(tu.target_lat)) * sin(radians(ud.latitude))
        ) <= max_distance
    )
    AND NOT EXISTS (
        SELECT 1 FROM user_matches um 
        WHERE um.user_id = target_user_id 
        AND um.matched_user_id = ud.id
        AND um.status IN ('declined', 'blocked')
    )
    ORDER BY score DESC, distance ASC NULLS LAST
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;