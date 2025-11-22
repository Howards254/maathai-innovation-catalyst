-- Insert initial badges
INSERT INTO badges (name, description, icon, points_required) VALUES
('Early Adopter', 'One of the first to join the platform', '🌱', 0),
('Tree Hugger', 'Planted your first 10 trees', '🌳', 100),
('Forest Guardian', 'Planted 50 trees', '🌲', 500),
('Eco Warrior', 'Planted 100 trees', '⚔️', 1000),
('Green Champion', 'Planted 500 trees', '🏆', 5000),
('Event Organizer', 'Organized your first event', '📅', 50),
('Community Builder', 'Started 5 discussions', '👥', 200),
('Mentor', 'Helped 10 people in discussions', '🎓', 300),
('Consistent Planter', 'Completed 30 daily challenges', '📈', 600),
('Impact Leader', 'Reached top 10 on leaderboard', '👑', 2000);

-- Insert sample daily challenges
INSERT INTO daily_challenges (title, description, target_value, points_reward, challenge_date) VALUES
('Plant Trees Today', 'Log 3 newly planted trees', 3, 50, CURRENT_DATE),
('Share Knowledge', 'Answer 2 questions in discussions', 2, 30, CURRENT_DATE),
('Spread Awareness', 'Share a campaign with friends', 1, 20, CURRENT_DATE);

-- Insert sample resources
INSERT INTO resources (title, type, category, url, description) VALUES
('Tree Planting Guide 101', 'pdf', 'Guides', 'https://example.com/guide.pdf', 'Complete beginner guide to tree planting'),
('Soil Health Analysis', 'video', 'Science', 'https://example.com/video', 'Understanding soil conditions for optimal growth'),
('Community Organizing Handbook', 'article', 'Community', 'https://example.com/article', 'How to organize successful environmental campaigns'),
('Indigenous Trees of Kenya', 'pdf', 'Science', 'https://example.com/kenya-trees.pdf', 'Comprehensive guide to native Kenyan tree species'),
('Agroforestry Basics', 'video', 'Guides', 'https://example.com/agroforestry', 'Introduction to sustainable farming with trees'),
('Climate Change Impact', 'article', 'Science', 'https://example.com/climate', 'How trees help combat climate change');