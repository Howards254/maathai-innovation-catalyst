-- Populate usernames from email if missing

UPDATE profiles
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL AND email IS NOT NULL;

-- For profiles without email, generate from id
UPDATE profiles
SET username = 'user_' || SUBSTRING(id::text, 1, 8)
WHERE username IS NULL;

-- Verify
SELECT id, username, full_name, email FROM profiles LIMIT 10;
