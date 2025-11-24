-- Create discussions table with required columns
CREATE TABLE IF NOT EXISTS discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id UUID NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Discussions are viewable by everyone" 
    ON discussions FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create discussions" 
    ON discussions FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_discussions_created ON discussions(created_at DESC);
