-- Migration script to fix existing discussions database
-- Run this in Supabase SQL Editor

-- 1. First, check if discussions table exists and add missing columns
DO $$ 
BEGIN
    -- Add missing columns to discussions table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'upvotes') THEN
        ALTER TABLE discussions ADD COLUMN upvotes INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'downvotes') THEN
        ALTER TABLE discussions ADD COLUMN downvotes INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'comment_count') THEN
        ALTER TABLE discussions ADD COLUMN comment_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Check if comments table exists and add missing columns
DO $$ 
BEGIN
    -- Add missing columns to comments table if they don't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_comment_id') THEN
            ALTER TABLE comments ADD COLUMN parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'like_count') THEN
            ALTER TABLE comments ADD COLUMN like_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'reply_count') THEN
            ALTER TABLE comments ADD COLUMN reply_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'updated_at') THEN
            ALTER TABLE comments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- 3. Create missing tables
CREATE TABLE IF NOT EXISTS discussion_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id)
);

CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS discussion_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id, reaction_type)
);

-- 4. Enable RLS on all tables
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_reactions ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies and create new ones
DROP POLICY IF EXISTS "Allow all operations on discussions" ON discussions;
DROP POLICY IF EXISTS "Allow all operations on discussion_votes" ON discussion_votes;
DROP POLICY IF EXISTS "Allow all operations on comments" ON comments;
DROP POLICY IF EXISTS "Allow all operations on comment_likes" ON comment_likes;
DROP POLICY IF EXISTS "Allow all operations on discussion_reactions" ON discussion_reactions;

CREATE POLICY "Allow all operations on discussions" ON discussions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on discussion_votes" ON discussion_votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on comments" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on comment_likes" ON comment_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on discussion_reactions" ON discussion_reactions FOR ALL USING (true) WITH CHECK (true);

-- 6. Create functions
CREATE OR REPLACE FUNCTION update_discussion_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussions 
        SET 
            upvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = NEW.discussion_id AND vote_type = 'up'),
            downvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = NEW.discussion_id AND vote_type = 'down'),
            updated_at = NOW()
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussions 
        SET 
            upvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = OLD.discussion_id AND vote_type = 'up'),
            downvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = OLD.discussion_id AND vote_type = 'down'),
            updated_at = NOW()
        WHERE id = OLD.discussion_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE discussions 
        SET 
            upvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = NEW.discussion_id AND vote_type = 'up'),
            downvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = NEW.discussion_id AND vote_type = 'down'),
            updated_at = NOW()
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussions 
        SET 
            comment_count = (SELECT COUNT(*) FROM comments WHERE discussion_id = NEW.discussion_id),
            updated_at = NOW()
        WHERE id = NEW.discussion_id;
        
        IF NEW.parent_comment_id IS NOT NULL THEN
            UPDATE comments 
            SET 
                reply_count = (SELECT COUNT(*) FROM comments WHERE parent_comment_id = NEW.parent_comment_id),
                updated_at = NOW()
            WHERE id = NEW.parent_comment_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussions 
        SET 
            comment_count = (SELECT COUNT(*) FROM comments WHERE discussion_id = OLD.discussion_id),
            updated_at = NOW()
        WHERE id = OLD.discussion_id;
        
        IF OLD.parent_comment_id IS NOT NULL THEN
            UPDATE comments 
            SET 
                reply_count = (SELECT COUNT(*) FROM comments WHERE parent_comment_id = OLD.parent_comment_id),
                updated_at = NOW()
            WHERE id = OLD.parent_comment_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_comment_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments 
        SET 
            like_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = NEW.comment_id),
            updated_at = NOW()
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments 
        SET 
            like_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = OLD.comment_id),
            updated_at = NOW()
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers
DROP TRIGGER IF EXISTS discussion_vote_counts_trigger ON discussion_votes;
CREATE TRIGGER discussion_vote_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON discussion_votes
    FOR EACH ROW EXECUTE FUNCTION update_discussion_vote_counts();

DROP TRIGGER IF EXISTS comment_counts_trigger ON comments;
CREATE TRIGGER comment_counts_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_counts();

DROP TRIGGER IF EXISTS comment_like_counts_trigger ON comment_likes;
CREATE TRIGGER comment_like_counts_trigger
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_like_counts();

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_discussions_author_id ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_votes_discussion_id ON discussion_votes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_votes_user_id ON discussion_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_discussion_id ON comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_reactions_discussion_id ON discussion_reactions(discussion_id);

-- 9. Verification
SELECT 'Migration completed successfully' as status;
SELECT 'Discussions table columns:' as info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'discussions' 
ORDER BY ordinal_position;

SELECT 'Comments table columns:' as info, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comments' 
ORDER BY ordinal_position;