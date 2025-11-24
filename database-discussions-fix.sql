-- Fix discussions table
-- Add missing column
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Change category from enum to text to accept any value
ALTER TABLE discussions ALTER COLUMN category TYPE TEXT;
