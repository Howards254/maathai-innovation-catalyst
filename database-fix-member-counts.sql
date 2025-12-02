-- Fix member count management with triggers
-- Run this to properly handle member counts

-- Function to update group member counts
CREATE OR REPLACE FUNCTION update_group_member_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increase member count
        UPDATE groups 
        SET member_count = (
            SELECT COUNT(*) FROM group_members WHERE group_id = NEW.group_id
        )
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease member count
        UPDATE groups 
        SET member_count = (
            SELECT COUNT(*) FROM group_members WHERE group_id = OLD.group_id
        )
        WHERE id = OLD.group_id;
        
        -- Delete group if no members left
        DELETE FROM groups 
        WHERE id = OLD.group_id 
        AND NOT EXISTS (
            SELECT 1 FROM group_members WHERE group_id = OLD.group_id
        );
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for member count updates
DROP TRIGGER IF EXISTS group_member_count_trigger ON group_members;
CREATE TRIGGER group_member_count_trigger
    AFTER INSERT OR DELETE ON group_members
    FOR EACH ROW EXECUTE FUNCTION update_group_member_counts();

-- Fix existing member counts
UPDATE groups SET member_count = (
    SELECT COUNT(*) FROM group_members WHERE group_id = groups.id
);

SELECT 'Member count triggers created successfully' as status;