-- Add offer_amount column to marketplace_messages
ALTER TABLE marketplace_messages 
ADD COLUMN IF NOT EXISTS offer_amount DECIMAL(10, 2);

-- Add index for faster message queries
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_sender ON marketplace_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_receiver ON marketplace_messages(receiver_id);
