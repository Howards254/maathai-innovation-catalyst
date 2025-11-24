-- Maathai Innovation Catalyst - Complete Database Migration
-- This file combines all migrations into a single organized script

-- ======================================
-- SECTION 1: SETUP AND EXTENSIONS
-- ======================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- SECTION 2: CUSTOM TYPES
-- ======================================

-- Create custom types
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
    CREATE TYPE resource_type AS ENUM ('pdf', 'video', 'article');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discussion_category AS ENUM ('general', 'help', 'success_story', 'tech');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_level AS ENUM ('seed', 'sprout', 'bud', 'sapling', 'young_tree', 'forest_guardian', 'earth_hero');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ======================================
-- SECTION 3: CORE TABLES
-- ======================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
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
    level user_level DEFAULT 'seed',
    level_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    points_required INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- ======================================
-- SECTION 4: CAMPAIGNS
-- ======================================

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Campaign tags table
CREATE TABLE IF NOT EXISTS campaign_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    tag TEXT NOT NULL
);

-- Campaign participants table
CREATE TABLE IF NOT EXISTS campaign_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    trees_planted INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

-- ======================================
-- SECTION 5: DISCUSSIONS
-- ======================================

-- Discussions table
CREATE TABLE IF NOT EXISTS discussions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category discussion_category DEFAULT 'general',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion votes table
CREATE TABLE IF NOT EXISTS discussion_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type INTEGER CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- SECTION 6: EVENTS
-- ======================================

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rsvp_status TEXT DEFAULT 'going' CHECK (rsvp_status IN ('going', 'maybe', 'not_going')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ======================================
-- SECTION 7: RESOURCES
-- ======================================

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    type resource_type NOT NULL,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- SECTION 8: GAMIFICATION
-- ======================================

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    points_reward INTEGER NOT NULL,
    challenge_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User challenge progress table
CREATE TABLE IF NOT EXISTS user_challenge_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, challenge_id)
);

-- Activity log table for tracking user actions
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    points_earned INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- SECTION 9: SOCIAL FEATURES
-- ======================================

-- Social tables
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Green Stories/Impact Reels table
CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    story_type TEXT DEFAULT 'image' CHECK (story_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    caption TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story reactions table
CREATE TABLE IF NOT EXISTS story_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('planted', 'love', 'inspiring', 'share', 'congrats')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id, reaction_type)
);

-- Story comments table
CREATE TABLE IF NOT EXISTS story_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
    mentions UUID[], -- Array of user IDs mentioned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced reactions for existing content
CREATE TABLE IF NOT EXISTS content_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('discussion', 'campaign', 'event', 'comment')),
    content_id UUID NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('planted', 'love', 'inspiring', 'share', 'congrats')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, user_id, reaction_type)
);

-- User activity feed (for personalized timeline)
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('story_posted', 'campaign_created', 'event_created', 'discussion_created', 'trees_planted', 'badge_earned', 'level_up', 'followed')),
    content_type TEXT CHECK (content_type IN ('story', 'campaign', 'event', 'discussion', 'badge', 'follow')),
    content_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- SECTION 10: TEAMS AND MATCHMAKING
-- ======================================

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

-- Matchmaking preferences
CREATE TABLE IF NOT EXISTS matchmaking_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    match_for TEXT[] DEFAULT '{}',
    preferred_group_size TEXT DEFAULT 'small',
    communication_style TEXT DEFAULT 'casual',
    meeting_preference TEXT DEFAULT 'hybrid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match interactions
CREATE TABLE IF NOT EXISTS match_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES user_matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- SECTION 11: MESSAGING AND GROUPS
-- ======================================

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

-- ======================================
-- SECTION 12: INDEXES
-- ======================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_city, location_country);
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON profiles(latitude, longitude);

-- Campaign indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_organizer ON campaigns(organizer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user ON campaign_participants(user_id);

-- Discussion indexes
CREATE INDEX IF NOT EXISTS idx_discussions_author ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_comments_discussion ON comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_reactions_story ON story_reactions(story_id);

-- Teams and matchmaking indexes
CREATE INDEX IF NOT EXISTS idx_green_teams_creator ON green_teams(creator_id);
CREATE INDEX IF NOT EXISTS idx_green_teams_location ON green_teams(location_city, location_country, is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_causes_user ON user_causes(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id, proficiency);
CREATE INDEX IF NOT EXISTS idx_user_matches_user ON user_matches(user_id, status, compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_matches_matched ON user_matches(matched_user_id, status);

-- Messaging and groups indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_id);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_created ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reactions_content ON content_reactions(content_type, content_id);

-- ======================================
-- SECTION 13: ROW LEVEL SECURITY
-- ======================================

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Badges policies (read-only for users)
CREATE POLICY "Badges are viewable by everyone" ON badges
    FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "User badges are viewable by everyone" ON user_badges
    FOR SELECT USING (true);

CREATE POLICY "Only system can insert user badges" ON user_badges
    FOR INSERT WITH CHECK (false); -- Will be handled by functions

-- Campaigns policies
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Campaign organizers can update their campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = organizer_id);

-- Campaign tags policies
CREATE POLICY "Campaign tags are viewable by everyone" ON campaign_tags
    FOR SELECT USING (true);

CREATE POLICY "Campaign organizers can manage tags" ON campaign_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_tags.campaign_id 
            AND campaigns.organizer_id = auth.uid()
        )
    );

-- Campaign participants policies
CREATE POLICY "Campaign participants are viewable by everyone" ON campaign_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join campaigns" ON campaign_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON campaign_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Discussions policies
CREATE POLICY "Discussions are viewable by everyone" ON discussions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON discussions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Authors can update their discussions" ON discussions
    FOR UPDATE USING (auth.uid() = author_id);

-- Discussion votes policies
CREATE POLICY "Discussion votes are viewable by everyone" ON discussion_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can vote on discussions" ON discussion_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes" ON discussion_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their votes" ON discussion_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Authors can update their comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = organizer_id);

CREATE POLICY "Event organizers can update their events" ON events
    FOR UPDATE USING (auth.uid() = organizer_id);

-- Event attendees policies
CREATE POLICY "Event attendees are viewable by everyone" ON event_attendees
    FOR SELECT USING (true);

CREATE POLICY "Users can RSVP to events" ON event_attendees
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their RSVP" ON event_attendees
    FOR UPDATE USING (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Resources are viewable by everyone" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Daily challenges policies
CREATE POLICY "Daily challenges are viewable by everyone" ON daily_challenges
    FOR SELECT USING (true);

-- User challenge progress policies
CREATE POLICY "Users can view all challenge progress" ON user_challenge_progress
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own progress" ON user_challenge_progress
    FOR ALL USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view their own activity" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Social policies
CREATE POLICY "Stories are viewable by everyone" ON stories
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own stories" ON stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" ON stories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Story reactions are viewable by everyone" ON story_reactions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can react to stories" ON story_reactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own reactions" ON story_reactions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Activity feed policies
CREATE POLICY "Users can view their own feed" ON activity_feed
    FOR SELECT USING (auth.uid() = user_id);

-- Teams and matchmaking policies
CREATE POLICY "Anyone can view active teams" ON green_teams
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create teams" ON green_teams
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Team creators can update their teams" ON green_teams
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can manage their own causes" ON user_causes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills" ON user_skills
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activities" ON user_activities
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their matches" ON user_matches
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can update their match status" ON user_matches
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- Messaging policies
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Groups policies
CREATE POLICY "Groups are viewable by everyone" ON groups
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create groups" ON groups
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = creator_id);

CREATE POLICY "Group creators can update their groups" ON groups
    FOR UPDATE USING (auth.uid() = creator_id);

-- ======================================
-- SECTION 14: FUNCTIONS AND TRIGGERS
-- ======================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update discussion vote counts
CREATE OR REPLACE FUNCTION update_discussion_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 1 THEN
            UPDATE discussions SET upvotes = upvotes + 1 WHERE id = NEW.discussion_id;
        ELSE
            UPDATE discussions SET downvotes = downvotes + 1 WHERE id = NEW.discussion_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Remove old vote
        IF OLD.vote_type = 1 THEN
            UPDATE discussions SET upvotes = upvotes - 1 WHERE id = OLD.discussion_id;
        ELSE
            UPDATE discussions SET downvotes = downvotes - 1 WHERE id = OLD.discussion_id;
        END IF;
        -- Add new vote
        IF NEW.vote_type = 1 THEN
            UPDATE discussions SET upvotes = upvotes + 1 WHERE id = NEW.discussion_id;
        ELSE
            UPDATE discussions SET downvotes = downvotes + 1 WHERE id = NEW.discussion_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 1 THEN
            UPDATE discussions SET upvotes = upvotes - 1 WHERE id = OLD.discussion_id;
        ELSE
            UPDATE discussions SET downvotes = downvotes - 1 WHERE id = OLD.discussion_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for discussion votes
DROP TRIGGER IF EXISTS discussion_votes_trigger ON discussion_votes;
CREATE TRIGGER discussion_votes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON discussion_votes
    FOR EACH ROW EXECUTE FUNCTION update_discussion_votes();

-- Function to award points and check badges
CREATE OR REPLACE FUNCTION award_points(
    user_id UUID,
    points INTEGER,
    action_type TEXT,
    entity_type TEXT DEFAULT NULL,
    entity_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    new_total INTEGER;
    badge_record RECORD;
BEGIN
    -- Update user points
    UPDATE profiles 
    SET impact_points = impact_points + points,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Get new total
    SELECT impact_points INTO new_total FROM profiles WHERE id = user_id;
    
    -- Log the activity
    INSERT INTO activity_log (user_id, action_type, entity_type, entity_id, points_earned)
    VALUES (user_id, action_type, entity_type, entity_id, points);
    
    -- Check for new badges
    FOR badge_record IN 
        SELECT b.id, b.name 
        FROM badges b
        LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = award_points.user_id
        WHERE b.points_required <= new_total 
        AND ub.id IS NULL
    LOOP
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (user_id, badge_record.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update campaign progress
CREATE OR REPLACE FUNCTION update_campaign_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE campaigns 
        SET planted_trees = (
            SELECT COALESCE(SUM(trees_planted), 0) 
            FROM campaign_participants 
            WHERE campaign_id = NEW.campaign_id
        ),
        updated_at = NOW()
        WHERE id = NEW.campaign_id;
        
        -- Award points for tree planting
        IF TG_OP = 'INSERT' THEN
            PERFORM award_points(NEW.user_id, NEW.trees_planted * 10, 'tree_planted', 'campaign', NEW.campaign_id);
        ELSIF TG_OP = 'UPDATE' AND NEW.trees_planted > OLD.trees_planted THEN
            PERFORM award_points(NEW.user_id, (NEW.trees_planted - OLD.trees_planted) * 10, 'tree_planted', 'campaign', NEW.campaign_id);
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for campaign progress updates
DROP TRIGGER IF EXISTS campaign_progress_trigger ON campaign_participants;
CREATE TRIGGER campaign_progress_trigger
    AFTER INSERT OR UPDATE ON campaign_participants
    FOR EACH ROW EXECUTE FUNCTION update_campaign_progress();

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    rank INTEGER,
    user_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    impact_points INTEGER,
    badges TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY p.impact_points DESC)::INTEGER as rank,
        p.id as user_id,
        p.username,
        p.full_name,
        p.avatar_url,
        p.impact_points,
        ARRAY_AGG(b.name) FILTER (WHERE b.name IS NOT NULL) as badges
    FROM profiles p
    LEFT JOIN user_badges ub ON p.id = ub.user_id
    LEFT JOIN badges b ON ub.badge_id = b.id
    GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.impact_points
    ORDER BY p.impact_points DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user level
CREATE OR REPLACE FUNCTION calculate_user_level(points INTEGER)
RETURNS user_level AS $$
BEGIN
    CASE 
        WHEN points >= 5000 THEN RETURN 'earth_hero';
        WHEN points >= 2000 THEN RETURN 'forest_guardian';
        WHEN points >= 1000 THEN RETURN 'young_tree';
        WHEN points >= 500 THEN RETURN 'sapling';
        WHEN points >= 100 THEN RETURN 'bud';
        WHEN points >= 50 THEN RETURN 'sprout';
        ELSE RETURN 'seed';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user level when points change
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level = calculate_user_level(NEW.impact_points);
    NEW.level_progress = NEW.impact_points;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_level ON profiles;
CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE OF impact_points ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discussions_updated_at ON discussions;
CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create activity feed entries
CREATE OR REPLACE FUNCTION create_activity_feed_entry(
    p_user_id UUID,
    p_actor_id UUID,
    p_activity_type TEXT,
    p_content_type TEXT DEFAULT NULL,
    p_content_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO activity_feed (user_id, actor_id, activity_type, content_type, content_id, metadata)
    VALUES (p_user_id, p_actor_id, p_activity_type, p_content_type, p_content_id, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- ======================================
-- SECTION 15: PASSWORD RESET FUNCTIONALITY
-- ======================================

-- Table to track password reset requests
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    UNIQUE(token)
);

-- Enable RLS on password reset tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for password reset tokens
DROP POLICY IF EXISTS "System can manage password reset tokens" ON password_reset_tokens;
CREATE POLICY "System can manage password reset tokens" ON password_reset_tokens
    FOR ALL USING (true);

-- Function to create password reset token
CREATE OR REPLACE FUNCTION create_password_reset_token(
    p_email TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_user_id UUID;
    v_token TEXT;
BEGIN
    -- Find the user by email
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    -- Return early if user not found (don't reveal that the email doesn't exist)
    IF v_user_id IS NULL THEN
        RETURN 'token_created';
    END IF;
    
    -- Generate a secure token
    v_token := encode(gen_random_bytes(32), 'hex');
    
    -- Delete any existing tokens for this user
    DELETE FROM password_reset_tokens WHERE user_id = v_user_id;
    
    -- Insert new token with 24-hour expiry
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (v_user_id, v_token, NOW() + INTERVAL '24 hours');
    
    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate password reset token
CREATE OR REPLACE FUNCTION validate_password_reset_token(
    p_token TEXT
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Find valid token
    SELECT user_id INTO v_user_id 
    FROM password_reset_tokens
    WHERE token = p_token
    AND expires_at > NOW()
    AND used = FALSE;
    
    -- Return null if token is invalid or expired
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset password using token
CREATE OR REPLACE FUNCTION reset_password_with_token(
    p_token TEXT,
    p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Validate token and get user ID
    v_user_id := validate_password_reset_token(p_token);
    
    -- Return false if token is invalid
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Mark token as used
    UPDATE password_reset_tokens
    SET used = TRUE
    WHERE token = p_token;
    
    -- Update user password (using Supabase auth.users table)
    -- Note: In production, you would use Supabase's auth.update_user function
    -- This is a placeholder for the actual implementation
    -- PERFORM auth.update_user(v_user_id, p_new_password);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================
-- SECTION 16: SEED DATA
-- ======================================

-- Insert initial badges
INSERT INTO badges (name, description, icon, points_required) VALUES
('Early Adopter', 'One of the first to join the platform', '🌱', 0),
('Tree Hugger', 'Planted your first 10 trees', '🌳', 100),
('Forest Guardian', 'Planted 50 trees', '🌲', 500),
('Eco Warrior', 'Planted 100 trees', '⚔️', 1000),
('Green Champion', 'Planted 500 trees', '🏆', 5000),
('Event Organizer', 'Organized your first event', '📅', 50),
('Community Builder', 'Started 5 discussions', '👥', 200),
('Mentor', 'Helped 10 people in discussions', '🎓', 300),
('Consistent Planter', 'Completed 30 daily challenges', '📈', 600),
('Impact Leader', 'Reached top 10 on leaderboard', '👑', 2000)
ON CONFLICT (name) DO NOTHING;

-- Insert sample daily challenges
INSERT INTO daily_challenges (title, description, target_value, points_reward, challenge_date) VALUES
('Plant Trees Today', 'Log 3 newly planted trees', 3, 50, CURRENT_DATE),
('Share Knowledge', 'Answer 2 questions in discussions', 2, 30, CURRENT_DATE),
('Spread Awareness', 'Share a campaign with friends', 1, 20, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (title, type, category, url, description) VALUES
('Tree Planting Guide 101', 'pdf', 'Guides', 'https://example.com/guide.pdf', 'Complete beginner guide to tree planting'),
('Soil Health Analysis', 'video', 'Science', 'https://example.com/video', 'Understanding soil conditions for optimal growth'),
('Community Organizing Handbook', 'article', 'Community', 'https://example.com/article', 'How to organize successful environmental campaigns'),
('Indigenous Trees of Kenya', 'pdf', 'Science', 'https://example.com/kenya-trees.pdf', 'Comprehensive guide to native Kenyan tree species'),
('Agroforestry Basics', 'video', 'Guides', 'https://example.com/agroforestry', 'Introduction to sustainable farming with trees'),
('Climate Change Impact', 'article', 'Science', 'https://example.com/climate', 'How trees help combat climate change')
ON CONFLICT DO NOTHING;
