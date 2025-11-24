-- Phase 1: Social Foundation Database Schema
-- Add to existing database after running database-production.sql

-- User levels system
CREATE TYPE user_level AS ENUM ('seed', 'sprout', 'bud', 'sapling', 'young_tree', 'forest_guardian', 'earth_hero');

-- Add level to profiles table
ALTER TABLE profiles ADD COLUMN level user_level DEFAULT 'seed';
ALTER TABLE profiles ADD COLUMN level_progress INTEGER DEFAULT 0;

-- Green Stories/Impact Reels table
CREATE TABLE stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT NOT NULL, -- Cloudinary URL
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    duration INTEGER, -- For videos (seconds)
    file_size INTEGER, -- In bytes (max 10MB)
    story_type TEXT DEFAULT 'general' CHECK (story_type IN ('tree_planting', 'campaign_progress', 'event', 'education', 'cleanup', 'general')),
    location TEXT,
    tags TEXT[], -- Array of hashtags
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story reactions table
CREATE TABLE story_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('planted', 'love', 'inspiring', 'share', 'congrats')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id, reaction_type)
);

-- Story comments table (enhanced from existing comments)
CREATE TABLE story_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
    mentions UUID[], -- Array of user IDs mentioned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow system
CREATE TABLE user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Enhanced reactions for existing content (discussions, campaigns, events)
CREATE TABLE content_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('discussion', 'campaign', 'event', 'comment')),
    content_id UUID NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('planted', 'love', 'inspiring', 'share', 'congrats')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, user_id, reaction_type)
);

-- User activity feed (for personalized timeline)
CREATE TABLE activity_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('story_posted', 'campaign_created', 'event_created', 'discussion_created', 'trees_planted', 'badge_earned', 'level_up', 'followed')),
    content_type TEXT CHECK (content_type IN ('story', 'campaign', 'event', 'discussion', 'badge', 'follow')),
    content_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_stories_author_created ON stories(author_id, created_at DESC);
CREATE INDEX idx_stories_created ON stories(created_at DESC);
CREATE INDEX idx_story_reactions_story ON story_reactions(story_id);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_activity_feed_user_created ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_content_reactions_content ON content_reactions(content_type, content_id);

-- RLS Policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Stories policies
CREATE POLICY "Stories are viewable by everyone" ON stories FOR SELECT USING (true);
CREATE POLICY "Users can create their own stories" ON stories FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own stories" ON stories FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own stories" ON stories FOR DELETE USING (auth.uid() = author_id);

-- Story reactions policies
CREATE POLICY "Story reactions are viewable by everyone" ON story_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react to stories" ON story_reactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own reactions" ON story_reactions FOR DELETE USING (auth.uid() = user_id);

-- Follow policies
CREATE POLICY "Follows are viewable by everyone" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Activity feed policies
CREATE POLICY "Users can view their own feed" ON activity_feed FOR SELECT USING (auth.uid() = user_id);

-- Functions for level progression
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

CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE OF impact_points ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

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