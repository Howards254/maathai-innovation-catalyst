-- Enhanced Communities Database Schema
-- Facebook Groups + Reddit Communities inspired
-- Run this in Supabase SQL Editor

-- 1. Create group_posts table (main posts in groups)
CREATE TABLE IF NOT EXISTS group_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'announcement', 'event', 'poll', 'photo', 'video')),
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

-- 2. Create group_post_comments table
CREATE TABLE IF NOT EXISTS group_post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES group_post_comments(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create group_post_likes table
CREATE TABLE IF NOT EXISTS group_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 4. Create group_comment_likes table
CREATE TABLE IF NOT EXISTS group_comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES group_post_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 5. Create group_post_reactions table (Facebook-style reactions)
CREATE TABLE IF NOT EXISTS group_post_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry', 'tree', 'earth')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- 6. Create group_rules table
CREATE TABLE IF NOT EXISTS group_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rule_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create group_join_requests table (for private groups)
CREATE TABLE IF NOT EXISTS group_join_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- 8. Create group_events table (group-specific events)
CREATE TABLE IF NOT EXISTS group_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    max_attendees INTEGER,
    attendee_count INTEGER DEFAULT 0,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create group_event_attendees table
CREATE TABLE IF NOT EXISTS group_event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES group_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 10. Create group_polls table
CREATE TABLE IF NOT EXISTS group_polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of poll options with vote counts
    total_votes INTEGER DEFAULT 0,
    allows_multiple BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create group_poll_votes table
CREATE TABLE IF NOT EXISTS group_poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES group_polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id, option_index)
);

-- 12. Add new columns to existing groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'low';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE groups ADD COLUMN IF NOT EXISTS rules_text TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'secret'));

-- 13. Enable RLS on all new tables
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_poll_votes ENABLE ROW LEVEL SECURITY;

-- 14. Create permissive RLS policies for development
CREATE POLICY "Allow all operations on group_posts" ON group_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_post_comments" ON group_post_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_post_likes" ON group_post_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_comment_likes" ON group_comment_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_post_reactions" ON group_post_reactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_rules" ON group_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_join_requests" ON group_join_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_events" ON group_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_event_attendees" ON group_event_attendees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_polls" ON group_polls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_poll_votes" ON group_poll_votes FOR ALL USING (true) WITH CHECK (true);

-- 15. Create functions to update counts automatically

-- Function to update group post counts
CREATE OR REPLACE FUNCTION update_group_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update group post count
        UPDATE groups 
        SET 
            post_count = post_count + 1,
            updated_at = NOW()
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update group post count
        UPDATE groups 
        SET 
            post_count = GREATEST(post_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update post like counts
CREATE OR REPLACE FUNCTION update_group_post_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE group_posts 
        SET 
            like_count = like_count + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE group_posts 
        SET 
            like_count = GREATEST(like_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_group_post_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update post comment count
        UPDATE group_posts 
        SET 
            comment_count = comment_count + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        
        -- Update parent comment reply count if this is a reply
        IF NEW.parent_comment_id IS NOT NULL THEN
            UPDATE group_post_comments 
            SET 
                reply_count = reply_count + 1,
                updated_at = NOW()
            WHERE id = NEW.parent_comment_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update post comment count
        UPDATE group_posts 
        SET 
            comment_count = GREATEST(comment_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.post_id;
        
        -- Update parent comment reply count if this was a reply
        IF OLD.parent_comment_id IS NOT NULL THEN
            UPDATE group_post_comments 
            SET 
                reply_count = GREATEST(reply_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.parent_comment_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment like counts
CREATE OR REPLACE FUNCTION update_group_comment_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE group_post_comments 
        SET 
            like_count = like_count + 1,
            updated_at = NOW()
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE group_post_comments 
        SET 
            like_count = GREATEST(like_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update group member counts
CREATE OR REPLACE FUNCTION update_group_member_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE groups 
        SET 
            member_count = member_count + 1,
            updated_at = NOW()
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE groups 
        SET 
            member_count = GREATEST(member_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 16. Create triggers
DROP TRIGGER IF EXISTS group_post_counts_trigger ON group_posts;
CREATE TRIGGER group_post_counts_trigger
    AFTER INSERT OR DELETE ON group_posts
    FOR EACH ROW EXECUTE FUNCTION update_group_post_counts();

DROP TRIGGER IF EXISTS group_post_like_counts_trigger ON group_post_likes;
CREATE TRIGGER group_post_like_counts_trigger
    AFTER INSERT OR DELETE ON group_post_likes
    FOR EACH ROW EXECUTE FUNCTION update_group_post_like_counts();

DROP TRIGGER IF EXISTS group_post_comment_counts_trigger ON group_post_comments;
CREATE TRIGGER group_post_comment_counts_trigger
    AFTER INSERT OR DELETE ON group_post_comments
    FOR EACH ROW EXECUTE FUNCTION update_group_post_comment_counts();

DROP TRIGGER IF EXISTS group_comment_like_counts_trigger ON group_comment_likes;
CREATE TRIGGER group_comment_like_counts_trigger
    AFTER INSERT OR DELETE ON group_comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_group_comment_like_counts();

DROP TRIGGER IF EXISTS group_member_counts_trigger ON group_members;
CREATE TRIGGER group_member_counts_trigger
    AFTER INSERT OR DELETE ON group_members
    FOR EACH ROW EXECUTE FUNCTION update_group_member_counts();

-- 17. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_author_id ON group_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_created_at ON group_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_posts_is_pinned ON group_posts(is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_post_id ON group_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_parent_id ON group_post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_group_post_likes_post_id ON group_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_likes_user_id ON group_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_group_comment_likes_comment_id ON group_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_group_events_group_id ON group_events(group_id);
CREATE INDEX IF NOT EXISTS idx_group_events_event_date ON group_events(event_date);
CREATE INDEX IF NOT EXISTS idx_groups_category ON groups(category);
CREATE INDEX IF NOT EXISTS idx_groups_visibility ON groups(visibility);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);

-- 18. Insert sample data for testing
INSERT INTO groups (name, description, category, visibility, creator_id, tags) VALUES
('Tree Planting Warriors', 'Join us in our mission to plant trees and restore forests worldwide. Share your planting experiences and learn from others!', 'Environmental Action', 'public', (SELECT id FROM profiles LIMIT 1), ARRAY['trees', 'planting', 'forest', 'restoration']),
('Climate Action Network', 'Discuss climate change solutions, share research, and organize local climate action events.', 'Climate Change', 'public', (SELECT id FROM profiles LIMIT 1), ARRAY['climate', 'action', 'research', 'solutions']),
('Sustainable Living Tips', 'Share practical tips for sustainable living, from zero waste to renewable energy.', 'Sustainability', 'public', (SELECT id FROM profiles LIMIT 1), ARRAY['sustainable', 'tips', 'zero-waste', 'renewable']),
('Wildlife Conservation Heroes', 'Dedicated to protecting wildlife and their habitats. Share conservation success stories and organize protection efforts.', 'Conservation', 'public', (SELECT id FROM profiles LIMIT 1), ARRAY['wildlife', 'conservation', 'protection', 'habitats']),
('Green Tech Innovators', 'Explore and discuss the latest in green technology and environmental innovations.', 'Education', 'public', (SELECT id FROM profiles LIMIT 1), ARRAY['technology', 'innovation', 'green-tech', 'solutions'])
ON CONFLICT DO NOTHING;

-- Add sample group rules
INSERT INTO group_rules (group_id, title, description, rule_order) 
SELECT 
    g.id,
    'Be Respectful',
    'Treat all members with respect and kindness. No harassment, hate speech, or personal attacks.',
    1
FROM groups g
WHERE g.name = 'Tree Planting Warriors'
UNION ALL
SELECT 
    g.id,
    'Stay On Topic',
    'Keep discussions relevant to environmental action and tree planting.',
    2
FROM groups g
WHERE g.name = 'Tree Planting Warriors'
UNION ALL
SELECT 
    g.id,
    'Share Authentic Content',
    'Only share genuine experiences and verified information. No spam or promotional content.',
    3
FROM groups g
WHERE g.name = 'Tree Planting Warriors'
ON CONFLICT DO NOTHING;

-- Verification queries
SELECT 'Enhanced Communities Setup Complete' as status;
SELECT 'Groups created' as info, COUNT(*) as count FROM groups;
SELECT 'Group posts table ready' as info, COUNT(*) as count FROM group_posts;
SELECT 'Group rules created' as info, COUNT(*) as count FROM group_rules;