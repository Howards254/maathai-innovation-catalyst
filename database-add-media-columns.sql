-- Add media columns to discussions table
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS media_urls TEXT[];
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS media_type TEXT;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS tags TEXT[];
