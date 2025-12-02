-- Quick fix for Communities - Run this first
-- This creates the essential tables needed for the Communities to work

-- Ensure groups table exists with new columns
ALTER TABLE groups ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'low';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE groups ADD COLUMN IF NOT EXISTS rules_text TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

-- Create group_posts table
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

-- Create group_post_likes table
CREATE TABLE IF NOT EXISTS group_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create group_post_comments table
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

-- Enable RLS
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
DROP POLICY IF EXISTS "Allow all operations on group_posts" ON group_posts;
DROP POLICY IF EXISTS "Allow all operations on group_post_likes" ON group_post_likes;
DROP POLICY IF EXISTS "Allow all operations on group_post_comments" ON group_post_comments;

CREATE POLICY "Allow all operations on group_posts" ON group_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_post_likes" ON group_post_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_post_comments" ON group_post_comments FOR ALL USING (true) WITH CHECK (true);

-- Insert sample groups if none exist
INSERT INTO groups (name, description, category, visibility, creator_id, member_count, tags) 
SELECT 
    'Tree Planting Warriors',
    'Join us in our mission to plant trees and restore forests worldwide. Share your planting experiences and learn from others!',
    'Environmental Action',
    'public',
    (SELECT id FROM profiles LIMIT 1),
    1,
    ARRAY['trees', 'planting', 'forest', 'restoration']
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Tree Planting Warriors')
AND EXISTS (SELECT 1 FROM profiles);

INSERT INTO groups (name, description, category, visibility, creator_id, member_count, tags) 
SELECT 
    'Climate Action Network',
    'Discuss climate change solutions, share research, and organize local climate action events.',
    'Climate Change',
    'public',
    (SELECT id FROM profiles LIMIT 1),
    1,
    ARRAY['climate', 'action', 'research', 'solutions']
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Climate Action Network')
AND EXISTS (SELECT 1 FROM profiles);

SELECT 'Communities quick fix applied successfully' as status;