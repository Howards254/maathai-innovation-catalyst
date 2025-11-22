-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Badges policies (read-only for users)
CREATE POLICY "Badges are viewable by everyone" ON badges
    FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "User badges are viewable by everyone" ON user_badges
    FOR SELECT USING (true);

CREATE POLICY "Only system can insert user badges" ON user_badges
    FOR INSERT WITH CHECK (false); -- Will be handled by functions

-- Campaigns policies
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Campaign organizers can update their campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = organizer_id);

-- Campaign tags policies
CREATE POLICY "Campaign tags are viewable by everyone" ON campaign_tags
    FOR SELECT USING (true);

CREATE POLICY "Campaign organizers can manage tags" ON campaign_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_tags.campaign_id 
            AND campaigns.organizer_id = auth.uid()
        )
    );

-- Campaign participants policies
CREATE POLICY "Campaign participants are viewable by everyone" ON campaign_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join campaigns" ON campaign_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON campaign_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Discussions policies
CREATE POLICY "Discussions are viewable by everyone" ON discussions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON discussions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Authors can update their discussions" ON discussions
    FOR UPDATE USING (auth.uid() = author_id);

-- Discussion votes policies
CREATE POLICY "Discussion votes are viewable by everyone" ON discussion_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can vote on discussions" ON discussion_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes" ON discussion_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their votes" ON discussion_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Authors can update their comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = organizer_id);

CREATE POLICY "Event organizers can update their events" ON events
    FOR UPDATE USING (auth.uid() = organizer_id);

-- Event attendees policies
CREATE POLICY "Event attendees are viewable by everyone" ON event_attendees
    FOR SELECT USING (true);

CREATE POLICY "Users can RSVP to events" ON event_attendees
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their RSVP" ON event_attendees
    FOR UPDATE USING (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Resources are viewable by everyone" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Daily challenges policies
CREATE POLICY "Daily challenges are viewable by everyone" ON daily_challenges
    FOR SELECT USING (true);

-- User challenge progress policies
CREATE POLICY "Users can view all challenge progress" ON user_challenge_progress
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own progress" ON user_challenge_progress
    FOR ALL USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view their own activity" ON activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);