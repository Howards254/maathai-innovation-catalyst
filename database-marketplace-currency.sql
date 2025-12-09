-- Add currency column to marketplace_listings
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'KES', 'EUR', 'GBP', 'ZAR', 'NGN', 'GHS'));
