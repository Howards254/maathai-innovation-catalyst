-- Step 1: Core Tables Only
-- Run this first to avoid deadlocks

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Core profiles table with all needed columns
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    cover_image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    impact_points INTEGER DEFAULT 0,
    role user_role DEFAULT 'user',
    location_city TEXT,
    location_country TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    experience_level TEXT DEFAULT 'beginner',
    availability TEXT DEFAULT 'weekends',
    looking_for TEXT[] DEFAULT '{}',
    max_distance_km INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist (for existing profiles table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'beginner';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'weekends';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_distance_km INTEGER DEFAULT 50;

-- Enable RLS and create permissive policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create permissive policy for development
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);