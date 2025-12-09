-- Fix campaigns table schema
-- Run this in Supabase SQL Editor to diagnose and fix

-- First, let's see what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add current_trees if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'current_trees'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN current_trees INTEGER DEFAULT 0;
    END IF;

    -- Add latitude if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN latitude DECIMAL(10, 8);
    END IF;

    -- Add longitude if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN longitude DECIMAL(11, 8);
    END IF;

    -- Add is_public if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;

    -- Add tags if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'tags'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN tags TEXT[];
    END IF;

    -- Add completion_photos if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'completion_photos'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN completion_photos TEXT[];
    END IF;

    -- Add is_completion_pending if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'is_completion_pending'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN is_completion_pending BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create campaign_updates table
CREATE TABLE IF NOT EXISTS campaign_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tree_submissions table
CREATE TABLE IF NOT EXISTS tree_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    trees_count INTEGER NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations" ON campaigns;
DROP POLICY IF EXISTS "Allow all operations on campaign_updates" ON campaign_updates;
DROP POLICY IF EXISTS "Allow all operations on tree_submissions" ON tree_submissions;

-- Create policies
CREATE POLICY "Allow all operations" ON campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on campaign_updates" ON campaign_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tree_submissions" ON tree_submissions FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign ON campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tree_submissions_campaign ON tree_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tree_submissions_user ON tree_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_tree_submissions_status ON tree_submissions(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_location ON campaigns(latitude, longitude);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Campaigns schema fixed! Please refresh your app.' as status;