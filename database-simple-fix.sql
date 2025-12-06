-- Simple fix for story reactions
-- Run this in Supabase SQL Editor

-- Add missing story_comments table
CREATE TABLE IF NOT EXISTS story_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on story_comments
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on story_comments" ON story_comments FOR ALL USING (true) WITH CHECK (true);

-- Ensure story_reactions table exists with correct structure
CREATE TABLE IF NOT EXISTS story_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Enable RLS on story_reactions
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on story_reactions" ON story_reactions FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_reactions_story_user ON story_reactions(story_id, user_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);

SELECT 'Story reactions fixed!' as status;