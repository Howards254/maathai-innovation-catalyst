-- Marketplace Listings Table
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('seedlings', 'tools', 'services', 'eco-products', 'other')),
    condition TEXT CHECK (condition IN ('new', 'used', 'excellent', 'good', 'fair')),
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending')),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Messages (for buyer-seller communication)
CREATE TABLE IF NOT EXISTS marketplace_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_location ON marketplace_listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_marketplace_messages_listing ON marketplace_messages(listing_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view available listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can create listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Users can view their messages" ON marketplace_messages;
DROP POLICY IF EXISTS "Users can send messages" ON marketplace_messages;

-- RLS Policies
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can view available listings
CREATE POLICY "Anyone can view available listings" ON marketplace_listings
    FOR SELECT USING (status = 'available' OR seller_id = auth.uid());

-- Users can create their own listings
CREATE POLICY "Users can create listings" ON marketplace_listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings" ON marketplace_listings
    FOR UPDATE USING (auth.uid() = seller_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings" ON marketplace_listings
    FOR DELETE USING (auth.uid() = seller_id);

-- Users can view messages they're part of
CREATE POLICY "Users can view their messages" ON marketplace_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages" ON marketplace_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
