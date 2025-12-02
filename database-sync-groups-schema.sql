-- Sync groups table with enhanced schema
-- Run this to add missing columns to existing groups table

-- Add missing columns to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'low';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE groups ADD COLUMN IF NOT EXISTS rules_text TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';

-- Ensure group_members table exists (from complete setup)
CREATE TABLE IF NOT EXISTS group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Ensure group_posts table exists
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

-- Enable RLS on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they exist
DROP POLICY IF EXISTS "Allow all operations on groups" ON groups;
DROP POLICY IF EXISTS "Allow all operations on group_members" ON group_members;
DROP POLICY IF EXISTS "Allow all operations on group_posts" ON group_posts;

CREATE POLICY "Allow all operations on groups" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_members" ON group_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_posts" ON group_posts FOR ALL USING (true) WITH CHECK (true);

-- Update existing groups to have proper visibility
UPDATE groups SET visibility = 'public' WHERE visibility IS NULL;
UPDATE groups SET post_count = 0 WHERE post_count IS NULL;
UPDATE groups SET activity_level = 'low' WHERE activity_level IS NULL;

SELECT 'Groups schema synchronized successfully' as status;