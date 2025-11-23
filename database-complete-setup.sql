-- Complete Database Setup for GreenVerse
-- Run this single script to set up everything

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('online', 'in_person');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discussion_category AS ENUM ('general', 'help', 'success_story', 'tech');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Core tables
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    cover_image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    impact_points INTEGER DEFAULT 0,
    role user_role DEFAULT 'user',
    location_city TEXT,
    location_country TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    experience_level TEXT DEFAULT 'beginner',
    availability TEXT DEFAULT 'weekends',
    looking_for TEXT[] DEFAULT '{}',
    max_distance_km INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social tables
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    story_type TEXT DEFAULT 'image' CHECK (story_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    caption TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messaging tables
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
    participant_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
    last_message_id UUID REFERENCES messages(id),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1, participant_2)
);

-- Groups tables
CREATE TABLE IF NOT EXISTS groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    category TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Green Teams (renamed from groups to avoid confusion)
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

-- Campaigns and events (simplified)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_trees INTEGER NOT NULL,
    planted_trees INTEGER DEFAULT 0,
    image_url TEXT,
    organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    status campaign_status DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    type event_type NOT NULL,
    image_url TEXT,
    organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    max_attendees INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Permissive RLS policies for development
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on follows" ON follows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stories" ON stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on groups" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_members" ON group_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on green_teams" ON green_teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_causes" ON user_causes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_skills" ON user_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_activities" ON user_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_matches" ON user_matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true) WITH CHECK (true);