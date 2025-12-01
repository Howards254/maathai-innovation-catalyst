-- Simple fix for discussions system to work with existing structure
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to existing tables
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- 2. Add missing columns to comments table  
ALTER TABLE comments ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- 3. Create discussion_votes table (for upvote/downvote tracking)
CREATE TABLE IF NOT EXISTS discussion_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id)
);

-- 4. Create comment_likes table (separate from comment_reactions)
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 5. Enable RLS
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Anyone can view discussion votes" ON discussion_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on discussions" ON discussion_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their votes" ON discussion_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their votes" ON discussion_votes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can like comments" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike comments" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- 7. Create functions to update counts
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
        -- Update discussion comment count
        UPDATE discussions 
        SET 
            comment_count = (SELECT COUNT(*) FROM comments WHERE discussion_id = NEW.discussion_id),
            updated_at = NOW()
        WHERE id = NEW.discussion_id;
        
        -- Update parent comment reply count (using existing parent_id column)
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET 
                reply_count = (SELECT COUNT(*) FROM comments WHERE parent_id = NEW.parent_id),
                updated_at = NOW()
            WHERE id = NEW.parent_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update discussion comment count
        UPDATE discussions 
        SET 
            comment_count = (SELECT COUNT(*) FROM comments WHERE discussion_id = OLD.discussion_id),
            updated_at = NOW()
        WHERE id = OLD.discussion_id;
        
        -- Update parent comment reply count
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET 
                reply_count = (SELECT COUNT(*) FROM comments WHERE parent_id = OLD.parent_id),
                updated_at = NOW()
            WHERE id = OLD.parent_id;
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

-- 8. Create triggers
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

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_discussion_votes_discussion_id ON discussion_votes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_votes_user_id ON discussion_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Verification
SELECT 'Simple fix applied successfully' as status;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('discussions', 'comments', 'discussion_votes', 'comment_likes')
ORDER BY table_name, ordinal_position;