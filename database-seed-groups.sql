-- Seed Groups for Communities
-- Run this to add sample groups for testing

-- Insert sample groups with proper data
INSERT INTO groups (name, description, category, visibility, creator_id, member_count, tags, location) VALUES
('Tree Planting Warriors', 'Join us in our mission to plant trees and restore forests worldwide. Share your planting experiences and learn from others!', 'Environmental Action', 'public', (SELECT id FROM profiles LIMIT 1), 1, ARRAY['trees', 'planting', 'forest', 'restoration'], 'Global'),
('Climate Action Network', 'Discuss climate change solutions, share research, and organize local climate action events.', 'Climate Change', 'public', (SELECT id FROM profiles LIMIT 1), 1, ARRAY['climate', 'action', 'research', 'solutions'], 'Worldwide'),
('Sustainable Living Tips', 'Share practical tips for sustainable living, from zero waste to renewable energy.', 'Sustainability', 'public', (SELECT id FROM profiles LIMIT 1), 1, ARRAY['sustainable', 'tips', 'zero-waste', 'renewable'], 'Community'),
('Wildlife Conservation Heroes', 'Dedicated to protecting wildlife and their habitats. Share conservation success stories and organize protection efforts.', 'Conservation', 'public', (SELECT id FROM profiles LIMIT 1), 1, ARRAY['wildlife', 'conservation', 'protection', 'habitats'], 'Nature Reserves'),
('Green Tech Innovators', 'Explore and discuss the latest in green technology and environmental innovations.', 'Education', 'public', (SELECT id FROM profiles LIMIT 1), 1, ARRAY['technology', 'innovation', 'green-tech', 'solutions'], 'Tech Hubs')
ON CONFLICT (name) DO NOTHING;

-- Add sample posts to make groups more engaging
INSERT INTO group_posts (group_id, author_id, title, content, post_type) 
SELECT 
    g.id,
    (SELECT id FROM profiles LIMIT 1),
    'Welcome to ' || g.name || '!',
    'This is our community space for sharing ideas, experiences, and collaborating on ' || g.category || ' initiatives. Feel free to introduce yourself and share what brings you here!',
    'announcement'
FROM groups g
WHERE NOT EXISTS (
    SELECT 1 FROM group_posts gp WHERE gp.group_id = g.id
);

SELECT 'Sample groups and posts created successfully' as status;