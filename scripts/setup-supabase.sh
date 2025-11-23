#!/bin/bash

# GreenVerse - Supabase Setup Script
echo "🌱 Setting up Supabase for GreenVerse..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Initialize Supabase project
echo "📦 Initializing Supabase project..."
supabase init

# Start local Supabase
echo "🚀 Starting local Supabase..."
supabase start

# Run migrations
echo "🗄️ Running database migrations..."
supabase db reset

echo "✅ Supabase setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Your local Supabase is running at: http://localhost:54323"
echo "2. API URL: http://localhost:54321"
echo "3. Update your .env.local with the correct keys if needed"
echo "4. Run 'npm run dev' to start the application"
echo ""
echo "🔑 Default credentials for local development:"
echo "Email: admin@example.com"
echo "Password: password"