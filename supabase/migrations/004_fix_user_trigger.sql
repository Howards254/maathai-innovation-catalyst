-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Improved function to handle new user registration with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_value TEXT;
    full_name_value TEXT;
BEGIN
    -- Extract username from metadata, fallback to generated username
    username_value := COALESCE(
        NEW.raw_user_meta_data->>'username', 
        'user_' || substr(NEW.id::text, 1, 8)
    );
    
    -- Extract full name from metadata, fallback to 'New User'
    full_name_value := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        'New User'
    );
    
    -- Insert profile with ON CONFLICT handling
    INSERT INTO profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        username_value,
        full_name_value,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- If username conflict occurs, generate a unique one
    IF NOT FOUND THEN
        INSERT INTO profiles (id, username, full_name, avatar_url)
        VALUES (
            NEW.id,
            username_value || '_' || substr(md5(random()::text), 1, 4),
            full_name_value,
            NEW.raw_user_meta_data->>'avatar_url'
        )
        ON CONFLICT (username) DO UPDATE
        SET username = EXCLUDED.username || '_' || substr(md5(random()::text), 1, 4);
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth.users insert
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
