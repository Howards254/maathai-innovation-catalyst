-- =====================================================
-- GREENVERSE COMPLETE DATABASE SCHEMA
-- Master schema consolidating all features
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Profiles table (Core user data)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    location TEXT,
    website TEXT,
    interests TEXT[],
    environmental_goals TEXT[],
    trees_planted INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    badge_level INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "activity_visibility": "friends"}',
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "in_app": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SOCIAL FEATURES
-- =====================================================

-- Follows table (Social connections)
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Stories table (24-hour content)
CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    background_color TEXT DEFAULT '#000000',
    text_color TEXT DEFAULT '#ffffff',
    font_size TEXT DEFAULT 'medium',
    view_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story views table
CREATE TABLE IF NOT EXISTS story_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, viewer_id)
);

-- Story reactions table
CREATE TABLE IF NOT EXISTS story_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- =====================================================
-- MESSAGING SYSTEM
-- =====================================================

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    is_group BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    media_urls TEXT[],
    media_type TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file')),
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMMUNITIES (GROUPS)
-- =====================================================

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    image_url TEXT,
    banner_image_url TEXT,
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    activity_level TEXT DEFAULT 'low',
    tags TEXT[],
    rules_text TEXT,
    location TEXT,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'secret')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Group posts
CREATE TABLE IF NOT EXISTS group_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'discussion',
    media_urls TEXT[],
    media_type TEXT,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group post likes
CREATE TABLE IF NOT EXISTS group_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Group post comments
CREATE TABLE IF NOT EXISTS group_post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES group_post_comments(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DISCUSSIONS (REDDIT-STYLE)
-- =====================================================

-- Discussion categories
CREATE TABLE IF NOT EXISTS discussion_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#10B981',
    icon TEXT DEFAULT 'MessageCircle',
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussions table
CREATE TABLE IF NOT EXISTS discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES discussion_categories(id) ON DELETE SET NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    media_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion votes
CREATE TABLE IF NOT EXISTS discussion_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id)
);

-- Discussion comments
CREATE TABLE IF NOT EXISTS discussion_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion comment votes
CREATE TABLE IF NOT EXISTS discussion_comment_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES discussion_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- =====================================================
-- CAMPAIGNS & EVENTS
-- =====================================================

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    goal_trees INTEGER NOT NULL,
    current_trees INTEGER DEFAULT 0,
    location TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    image_url TEXT,
    organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    participant_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign participants
CREATE TABLE IF NOT EXISTS campaign_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    trees_planted INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL,
    longitude DECIMAL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event attendees
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- GAMIFICATION
-- =====================================================

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_level INTEGER NOT NULL,
    points_required INTEGER NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_name, badge_level)
);

-- User activities (for points tracking)
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    points_earned INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MATCHMAKING & ACTIVITY
-- =====================================================

-- Matchmaking scores
CREATE TABLE IF NOT EXISTS matchmaking_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    potential_match_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, potential_match_id)
);

-- Activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    content TEXT,
    reference_id UUID,
    reference_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_trees_planted ON profiles(trees_planted DESC);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);

-- Messaging indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_groups_category ON groups(category);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group ON group_posts(group_id);

-- Discussions indexes
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category_id);
CREATE INDEX IF NOT EXISTS idx_discussions_author ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);

-- Campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_organizer ON campaigns(organizer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON campaign_participants(campaign_id);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (Allow all for development - tighten in production)
CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON follows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON story_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON story_reactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON conversation_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON group_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON group_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON group_post_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON group_post_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON discussion_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON discussions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON discussion_votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON discussion_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON discussion_comment_votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON campaign_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON event_attendees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON user_badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON user_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON matchmaking_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON activity_feed FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_posts_updated_at BEFORE UPDATE ON group_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired stories
CREATE OR REPLACE FUNCTION clean_expired_stories()
RETURNS void AS $$
BEGIN
    DELETE FROM stories WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert discussion categories
INSERT INTO discussion_categories (name, description, color, icon) VALUES
('Climate Change', 'Discussions about climate change and global warming', '#EF4444', 'Thermometer'),
('Tree Planting', 'Share your tree planting experiences and tips', '#10B981', 'TreePine'),
('Sustainability', 'Sustainable living practices and eco-friendly tips', '#3B82F6', 'Recycle'),
('Wildlife Conservation', 'Protecting wildlife and their habitats', '#8B5CF6', 'Bird'),
('Renewable Energy', 'Solar, wind, and other renewable energy sources', '#F59E0B', 'Zap'),
('Waste Management', 'Reducing, reusing, and recycling waste', '#6B7280', 'Trash2')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- REALTIME PUBLICATION
-- =====================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE follows;
ALTER PUBLICATION supabase_realtime ADD TABLE group_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE discussions;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'GreenVerse database schema setup completed successfully!' as status;