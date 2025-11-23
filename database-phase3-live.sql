-- Phase 3: Live Features & Real-time Engagement Database Schema
-- Run this after Phase 2 schema

-- Live Streams
CREATE TABLE IF NOT EXISTS live_streams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    stream_key VARCHAR(100) UNIQUE NOT NULL,
    stream_url TEXT,
    thumbnail_url TEXT,
    category TEXT DEFAULT 'environmental' CHECK (category IN ('environmental', 'education', 'campaign', 'workshop')),
    is_live BOOLEAN DEFAULT FALSE,
    viewer_count INTEGER DEFAULT 0,
    max_viewers INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live Stream Viewers
CREATE TABLE IF NOT EXISTS stream_viewers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    watch_duration_seconds INTEGER DEFAULT 0,
    UNIQUE(stream_id, user_id)
);

-- Live Chat Messages
CREATE TABLE IF NOT EXISTS live_chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'reaction', 'system')),
    reaction_emoji TEXT,
    is_highlighted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Activity Feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('tree_planted', 'campaign_joined', 'story_posted', 'event_attended', 'discussion_created', 'achievement_earned', 'follow', 'group_joined')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    metadata JSONB, -- Additional data like campaign_id, story_id, etc.
    points_earned INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_public column if it doesn't exist (for existing activity_feed tables)
ALTER TABLE activity_feed ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Live Challenges
CREATE TABLE IF NOT EXISTS live_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    challenge_type TEXT DEFAULT 'daily' CHECK (challenge_type IN ('daily', 'weekly', 'flash', 'community')),
    target_value INTEGER NOT NULL,
    current_progress INTEGER DEFAULT 0,
    points_reward INTEGER NOT NULL,
    badge_reward TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    participant_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge Participants
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID REFERENCES live_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    points_earned INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Push Notification Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Notification Queue
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    icon_url TEXT,
    action_url TEXT,
    notification_type TEXT DEFAULT 'general' CHECK (notification_type IN ('general', 'live_stream', 'challenge', 'social', 'achievement')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live Reactions (for streams and activities)
CREATE TABLE IF NOT EXISTS live_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_type TEXT NOT NULL CHECK (target_type IN ('stream', 'activity', 'challenge')),
    target_id UUID NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('🌱', '💚', '🔥', '👏', '❤️', '😍', '🎉', '💪')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(target_type, target_id, user_id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(is_live, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_active ON stream_viewers(stream_id, left_at) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_live_chat_stream ON live_chat_messages(stream_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id, created_at DESC);

-- Only create is_public index if column exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_feed' AND column_name = 'is_public') THEN
        CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON activity_feed(is_public, created_at DESC) WHERE is_public = true;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_live_challenges_active ON live_challenges(is_active, end_time) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_pending ON notification_queue(scheduled_for, is_sent) WHERE is_sent = false;
CREATE INDEX IF NOT EXISTS idx_live_reactions_target ON live_reactions(target_type, target_id, created_at DESC);

-- RLS Policies
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_reactions ENABLE ROW LEVEL SECURITY;

-- Live Streams Policies
CREATE POLICY "Anyone can view public streams" ON live_streams
    FOR SELECT USING (true);

CREATE POLICY "Users can create streams" ON live_streams
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their streams" ON live_streams
    FOR UPDATE USING (auth.uid() = host_id);

-- Live Chat Policies
CREATE POLICY "Users can view chat for streams they're watching" ON live_chat_messages
    FOR SELECT USING (
        stream_id IN (
            SELECT id FROM live_streams WHERE is_live = true
        )
    );

CREATE POLICY "Users can send chat messages" ON live_chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activity Feed Policies
CREATE POLICY "Users can view public activities" ON activity_feed
    FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own activities" ON activity_feed
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Challenge Policies
CREATE POLICY "Anyone can view active challenges" ON live_challenges
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can participate in challenges" ON challenge_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their challenge progress" ON challenge_participants
    FOR SELECT USING (auth.uid() = user_id);

-- Notification Policies
CREATE POLICY "Users can manage their subscriptions" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their notifications" ON notification_queue
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for real-time updates
CREATE OR REPLACE FUNCTION update_stream_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE live_streams 
        SET viewer_count = viewer_count + 1,
            max_viewers = GREATEST(max_viewers, viewer_count + 1)
        WHERE id = NEW.stream_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD.left_at IS NULL AND NEW.left_at IS NOT NULL THEN
        UPDATE live_streams 
        SET viewer_count = viewer_count - 1
        WHERE id = NEW.stream_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stream_viewer_count_trigger
    AFTER INSERT OR UPDATE ON stream_viewers
    FOR EACH ROW
    EXECUTE FUNCTION update_stream_viewer_count();

-- Function to create activity feed entries
CREATE OR REPLACE FUNCTION create_activity_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Create activity for tree planting
    IF TG_TABLE_NAME = 'tree_submissions' AND TG_OP = 'INSERT' THEN
        INSERT INTO activity_feed (user_id, activity_type, title, description, metadata, points_earned)
        VALUES (
            NEW.user_id,
            'tree_planted',
            'Planted ' || NEW.trees_planted || ' trees',
            'Contributing to campaign: ' || (SELECT title FROM campaigns WHERE id = NEW.campaign_id),
            jsonb_build_object('campaign_id', NEW.campaign_id, 'trees_count', NEW.trees_planted),
            NEW.trees_planted * 10
        );
    END IF;
    
    -- Create activity for story posts
    IF TG_TABLE_NAME = 'stories' AND TG_OP = 'INSERT' THEN
        INSERT INTO activity_feed (user_id, activity_type, title, description, metadata, points_earned)
        VALUES (
            NEW.user_id,
            'story_posted',
            'Shared an impact story',
            NEW.caption,
            jsonb_build_object('story_id', NEW.id, 'story_type', NEW.story_type),
            25
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity feed (only if tables exist)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tree_submissions') THEN
        CREATE TRIGGER create_tree_activity_trigger
            AFTER INSERT ON tree_submissions
            FOR EACH ROW
            EXECUTE FUNCTION create_activity_entry();
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stories') THEN
        CREATE TRIGGER create_story_activity_trigger
            AFTER INSERT ON stories
            FOR EACH ROW
            EXECUTE FUNCTION create_activity_entry();
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;