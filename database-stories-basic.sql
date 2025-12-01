-- Basic Stories Enhancement - Just expiration, no extra tables
-- Run this to avoid conflicts

-- Add expiration to existing stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);

SELECT 'Basic stories enhancement added - no conflicts' as status;