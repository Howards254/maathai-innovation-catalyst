-- Add missing column to existing discussions table
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;
