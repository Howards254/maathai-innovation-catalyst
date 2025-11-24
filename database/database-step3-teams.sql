-- Step 3: Teams and Matchmaking Tables
-- Run this after Step 2

-- Green Teams
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

CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES green_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'co_leader', 'member', 'volunteer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Matchmaking tables
CREATE TABLE IF NOT EXISTS user_causes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    cause TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    UNIQUE(user_id, cause)
);

CREATE TABLE IF NOT EXISTS user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    proficiency TEXT DEFAULT 'beginner',
    UNIQUE(user_id, skill)
);

CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity TEXT NOT NULL,
    UNIQUE(user_id, activity)
);

CREATE TABLE IF NOT EXISTS user_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    matched_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_type TEXT NOT NULL,
    compatibility_score DECIMAL(3,2),
    distance_km DECIMAL(8,2),
    common_causes TEXT[],
    common_skills TEXT[],
    common_activities TEXT[],
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, matched_user_id, match_type)
);

-- Enable RLS
ALTER TABLE green_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on green_teams" ON green_teams;
DROP POLICY IF EXISTS "Allow all operations on team_members" ON team_members;
DROP POLICY IF EXISTS "Allow all operations on user_causes" ON user_causes;
DROP POLICY IF EXISTS "Allow all operations on user_skills" ON user_skills;
DROP POLICY IF EXISTS "Allow all operations on user_activities" ON user_activities;
DROP POLICY IF EXISTS "Allow all operations on user_matches" ON user_matches;

-- Create permissive policies
CREATE POLICY "Allow all operations on green_teams" ON green_teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_causes" ON user_causes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_skills" ON user_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_activities" ON user_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_matches" ON user_matches FOR ALL USING (true) WITH CHECK (true);