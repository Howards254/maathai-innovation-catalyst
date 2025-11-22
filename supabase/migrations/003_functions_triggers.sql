-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update discussion vote counts
CREATE OR REPLACE FUNCTION update_discussion_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 1 THEN
            UPDATE discussions SET upvotes = upvotes + 1 WHERE id = NEW.discussion_id;
        ELSE
            UPDATE discussions SET downvotes = downvotes + 1 WHERE id = NEW.discussion_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Remove old vote
        IF OLD.vote_type = 1 THEN
            UPDATE discussions SET upvotes = upvotes - 1 WHERE id = OLD.discussion_id;
        ELSE
            UPDATE discussions SET downvotes = downvotes - 1 WHERE id = OLD.discussion_id;
        END IF;
        -- Add new vote
        IF NEW.vote_type = 1 THEN
            UPDATE discussions SET upvotes = upvotes + 1 WHERE id = NEW.discussion_id;
        ELSE
            UPDATE discussions SET downvotes = downvotes + 1 WHERE id = NEW.discussion_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 1 THEN
            UPDATE discussions SET upvotes = upvotes - 1 WHERE id = OLD.discussion_id;
        ELSE
            UPDATE discussions SET downvotes = downvotes - 1 WHERE id = OLD.discussion_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for discussion votes
CREATE TRIGGER discussion_votes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON discussion_votes
    FOR EACH ROW EXECUTE FUNCTION update_discussion_votes();

-- Function to award points and check badges
CREATE OR REPLACE FUNCTION award_points(
    user_id UUID,
    points INTEGER,
    action_type TEXT,
    entity_type TEXT DEFAULT NULL,
    entity_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    new_total INTEGER;
    badge_record RECORD;
BEGIN
    -- Update user points
    UPDATE profiles 
    SET impact_points = impact_points + points,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Get new total
    SELECT impact_points INTO new_total FROM profiles WHERE id = user_id;
    
    -- Log the activity
    INSERT INTO activity_log (user_id, action_type, entity_type, entity_id, points_earned)
    VALUES (user_id, action_type, entity_type, entity_id, points);
    
    -- Check for new badges
    FOR badge_record IN 
        SELECT b.id, b.name 
        FROM badges b
        LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = award_points.user_id
        WHERE b.points_required <= new_total 
        AND ub.id IS NULL
    LOOP
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (user_id, badge_record.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update campaign progress
CREATE OR REPLACE FUNCTION update_campaign_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE campaigns 
        SET planted_trees = (
            SELECT COALESCE(SUM(trees_planted), 0) 
            FROM campaign_participants 
            WHERE campaign_id = NEW.campaign_id
        ),
        updated_at = NOW()
        WHERE id = NEW.campaign_id;
        
        -- Award points for tree planting
        IF TG_OP = 'INSERT' THEN
            PERFORM award_points(NEW.user_id, NEW.trees_planted * 10, 'tree_planted', 'campaign', NEW.campaign_id);
        ELSIF TG_OP = 'UPDATE' AND NEW.trees_planted > OLD.trees_planted THEN
            PERFORM award_points(NEW.user_id, (NEW.trees_planted - OLD.trees_planted) * 10, 'tree_planted', 'campaign', NEW.campaign_id);
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for campaign progress updates
CREATE TRIGGER campaign_progress_trigger
    AFTER INSERT OR UPDATE ON campaign_participants
    FOR EACH ROW EXECUTE FUNCTION update_campaign_progress();

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    rank INTEGER,
    user_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    impact_points INTEGER,
    badges TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY p.impact_points DESC)::INTEGER as rank,
        p.id as user_id,
        p.username,
        p.full_name,
        p.avatar_url,
        p.impact_points,
        ARRAY_AGG(b.name) FILTER (WHERE b.name IS NOT NULL) as badges
    FROM profiles p
    LEFT JOIN user_badges ub ON p.id = ub.user_id
    LEFT JOIN badges b ON ub.badge_id = b.id
    GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.impact_points
    ORDER BY p.impact_points DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();