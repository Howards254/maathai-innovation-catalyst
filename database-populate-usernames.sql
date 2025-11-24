-- Populate usernames from full_name or id if missing

-- Generate username from full_name (lowercase, no spaces)
UPDATE profiles
SET username = LOWER(REPLACE(full_name, ' ', '_'))
WHERE username IS NULL AND full_name IS NOT NULL;

-- For profiles without full_name, generate from id
UPDATE profiles
SET username = 'user_' || SUBSTRING(id::text, 1, 8)
WHERE username IS NULL;

-- Verify
SELECT id, username, full_name FROM profiles LIMIT 10;
