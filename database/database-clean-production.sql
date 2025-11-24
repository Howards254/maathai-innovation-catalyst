-- GreenVerse - Clean Production Database Setup
-- This script sets up the database without any mock data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location_city TEXT,
  location_country TEXT,
  experience_level TEXT DEFAULT 'beginner',
  impact_points INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organizer_name TEXT NOT NULL,
  target_trees INTEGER NOT NULL,
  planted_trees INTEGER DEFAULT 0,
  location TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  is_public BOOLEAN DEFAULT true,
  participants UUID[] DEFAULT '{}',
  pending_participants UUID[] DEFAULT '{}',
  is_completion_pending BOOLEAN DEFAULT false,
  completion_photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'General',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organizer_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  type TEXT DEFAULT 'In-Person' CHECK (type IN ('In-Person', 'Online')),
  max_attendees INTEGER,
  attendees UUID[] DEFAULT '{}',
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  trees_count INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create innovations table
CREATE TABLE IF NOT EXISTS innovations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  category TEXT NOT NULL,
  funding_goal INTEGER NOT NULL,
  current_funding INTEGER DEFAULT 0,
  contact_email TEXT NOT NULL,
  business_plan TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for campaigns
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Campaign organizers can update their campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Create RLS policies for discussions
CREATE POLICY "Discussions are viewable by everyone" ON discussions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON discussions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Discussion authors can update their discussions" ON discussions
  FOR UPDATE USING (auth.uid() = author_id);

-- Create RLS policies for comments
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for events
CREATE POLICY "Approved events are viewable by everyone" ON events
  FOR SELECT USING (status = 'approved' OR auth.uid() = organizer_id);

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Event organizers can update their events" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Create RLS policies for submissions
CREATE POLICY "Submissions are viewable by campaign organizers and submitters" ON submissions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT organizer_id FROM campaigns WHERE id = campaign_id)
  );

CREATE POLICY "Authenticated users can create submissions" ON submissions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for innovations
CREATE POLICY "Approved innovations are viewable by everyone" ON innovations
  FOR SELECT USING (status = 'approved' OR auth.uid() = creator_id);

CREATE POLICY "Authenticated users can create innovations" ON innovations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Innovation creators can update their innovations" ON innovations
  FOR UPDATE USING (auth.uid() = creator_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_campaigns_organizer ON campaigns(organizer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_discussions_author ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_comments_discussion ON comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_submissions_campaign ON submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_innovations_creator ON innovations(creator_id);
CREATE INDEX IF NOT EXISTS idx_innovations_status ON innovations(status);