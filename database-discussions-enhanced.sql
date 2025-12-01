-- Enhanced Discussion System Database Structure
-- Run this in Supabase SQL Editor

-- 1. Create discussions table (if not exists)
CREATE TABLE IF NOT EXISTS discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'general',
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT false,
    media_urls TEXT[],
    media_type TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create discussion_votes table for tracking user votes
CREATE TABLE IF NOT EXISTS discussion_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id)
);

-- 3. Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create comment_likes table for tracking comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 5. Create discussion_reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS discussion_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL, -- emoji like '👍', '💚', '🌱', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discussion_id, user_id, reaction_type)
);

-- 6. Enable RLS on all tables
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_reactions ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies (permissive for development)
CREATE POLICY "Allow all operations on discussions" ON discussions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on discussion_votes" ON discussion_votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on comments" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on comment_likes" ON comment_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on discussion_reactions" ON discussion_reactions FOR ALL USING (true) WITH CHECK (true);

-- 8. Create functions to update counts automatically

-- Function to update discussion upvote/downvote counts
CREATE OR REPLACE FUNCTION update_discussion_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update counts when vote is added
        UPDATE discussions 
        SET 
            upvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = NEW.discussion_id AND vote_type = 'up'),
            downvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = NEW.discussion_id AND vote_type = 'down'),
            updated_at = NOW()
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update counts when vote is removed
        UPDATE discussions 
        SET 
            upvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = OLD.discussion_id AND vote_type = 'up'),
            downvotes = (SELECT COUNT(*) FROM discussion_votes WHERE discussion_id = OLD.discussion_id AND vote_type = 'down'),
            updated_at = NOW()
        WHERE id = OLD.discussion_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update counts when vote is changed
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

-- Function to update comment counts
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
        
        -- Update parent comment reply count if this is a reply
        IF NEW.parent_comment_id IS NOT NULL THEN
            UPDATE comments 
            SET 
                reply_count = (SELECT COUNT(*) FROM comments WHERE parent_comment_id = NEW.parent_comment_id),
                updated_at = NOW()
            WHERE id = NEW.parent_comment_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update discussion comment count
        UPDATE discussions 
        SET 
            comment_count = (SELECT COUNT(*) FROM comments WHERE discussion_id = OLD.discussion_id),
            updated_at = NOW()
        WHERE id = OLD.discussion_id;
        
        -- Update parent comment reply count if this was a reply
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

-- Function to update comment like counts
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

-- 9. Create triggers
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

-- 10. Create indexes for better performance
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

-- 11. Insert sample data (optional - for testing)
-- You can uncomment this section if you want sample data

/*
-- Sample discussions
INSERT INTO discussions (title, content, author_id, category, tags) VALUES
('Welcome to GreenVerse Discussions!', 'This is our first discussion post. Share your environmental ideas here!', 
 (SELECT id FROM profiles LIMIT 1), 'general', ARRAY['welcome', 'community']),
('Best Trees for Urban Planting', 'What are the best tree species for urban environments? Looking for recommendations.', 
 (SELECT id FROM profiles LIMIT 1), 'help', ARRAY['trees', 'urban', 'planting']);

-- Sample comments
INSERT INTO comments (discussion_id, author_id, content) VALUES
((SELECT id FROM discussions WHERE title = 'Welcome to GreenVerse Discussions!' LIMIT 1), 
 (SELECT id FROM profiles LIMIT 1), 'Great to see this community growing! 🌱'),
((SELECT id FROM discussions WHERE title = 'Best Trees for Urban Planting' LIMIT 1), 
 (SELECT id FROM profiles LIMIT 1), 'I recommend native species like oak and maple for most climates.');
*/

-- Verification queries
SELECT 'Discussions table created' as status, COUNT(*) as count FROM discussions;
SELECT 'Comments table created' as status, COUNT(*) as count FROM comments;
SELECT 'Discussion votes table created' as status, COUNT(*) as count FROM discussion_votes;
SELECT 'Comment likes table created' as status, COUNT(*) as count FROM comment_likes;
SELECT 'Discussion reactions table created' as status, COUNT(*) as count FROM discussion_reactions;