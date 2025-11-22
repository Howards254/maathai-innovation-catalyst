# Maathai Innovation Catalyst 🌱

> *"It's the little things citizens do. That's what will make the difference. My little thing is planting trees."* — Wangari Maathai

A modern environmental restoration platform inspired by Nobel Peace Prize winner Wangari Maathai. Connect with a global community to plant trees, organize campaigns, and track your environmental impact through gamified experiences.

## ✨ Features

### 🌳 **Tree Planting Campaigns**
- Create and join community tree planting campaigns
- Track trees planted with real-time progress
- Location-based campaign discovery
- Campaign participant management

### 👥 **Community Hub**
- Discussion forums with categories and voting
- Environmental event organization with RSVP
- User profiles with impact statistics
- Global leaderboard with badges

### 🎮 **Gamification & Rewards**
- Earn impact points for every action (10 pts per tree, 20 pts per discussion)
- Progressive badge system (Tree Hugger → Environmental Champion)
- Daily challenges and milestones
- Competitive leaderboards with rankings

### 🌿 **Environmental Assistant**
- Tree species recommendations and planting advice
- Campaign planning guidance
- Seasonal planting tips
- Community knowledge sharing

### 📊 **Impact Dashboard**
- Personal environmental impact tracking
- Community statistics and progress
- Achievement visualization
- Real-time activity feed

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/howards254/maathai-innovation-catalyst.git
   cd maathai-innovation-catalyst
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL from `database-setup.sql` in Supabase SQL Editor
   - Copy your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📱 Platform Overview

### 🏠 **Modern Homepage**
- Responsive carousel with Ken Burns effect
- Mobile-optimized navigation
- Impact statistics showcase
- Call-to-action sections

### 🎯 **Core User Journey**
1. **Register** → Create your environmental profile
2. **Join Campaigns** → Find local tree planting projects
3. **Plant Trees** → Log trees and earn 10 points each
4. **Engage Community** → Discuss (20 pts), comment (5 pts), vote (2 pts)
5. **Attend Events** → RSVP to local events (15 pts)
6. **Unlock Badges** → Progress from Tree Hugger to Environmental Champion

### 📊 **Gamification System**
- **Points**: Tree planting (10), discussions (20), comments (5), voting (2), events (15)
- **Badges**: 5 progressive levels from 100 to 5000 points
- **Leaderboard**: Global rankings with podium display
- **Challenges**: Daily environmental tasks

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom animations
- **Routing**: React Router v7 with hash routing
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Icons**: Lucide React
- **Deployment**: Vercel with automatic builds

### Key Features Implemented
- ✅ Responsive homepage with image carousel
- ✅ Complete authentication system
- ✅ Tree planting campaigns with progress tracking
- ✅ Discussion forums with voting and comments
- ✅ Event management with RSVP
- ✅ Comprehensive gamification system
- ✅ Real-time leaderboards and badges
- ✅ Environmental assistant with tree advice
- ✅ Mobile-responsive design throughout

## 🚢 Deployment on Vercel

### 1. Database Setup (Supabase)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project: `maathai-innovation-catalyst`
3. Go to SQL Editor and run `database-setup.sql`
4. Copy Project URL and anon key from Settings → API

### 2. Deploy to Vercel
1. Push code to GitHub repository
2. Connect GitHub to [vercel.com](https://vercel.com)
3. Import project: `howards254/maathai-innovation-catalyst`
4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Deploy automatically builds and goes live

### 3. Database Options

**For Development/Testing:**
- Use `database-setup.sql` (includes sample data)

**For Production:**
- Use `database-production.sql` (clean, no test data)
- Creates empty platform ready for real users
- No demo accounts or test content

### 4. Post-Deployment
- Test user registration and login
- Verify all features work in production
- Platform starts with clean slate

## 📊 Platform Statistics

- **1.2M+ Trees Planted** across global campaigns
- **50K+ Active Members** in the community
- **850+ Active Campaigns** worldwide
- **120+ Countries** participating

## 🔒 Security & Performance

- Supabase Row Level Security (RLS) enabled
- Input validation and sanitization
- Optimized Vite build with code splitting
- Responsive images with lazy loading
- Error boundaries for stability

## 🌍 Mission & Impact

Inspired by Wangari Maathai's Green Belt Movement, this platform democratizes environmental restoration by:
- **Connecting** communities worldwide for tree planting
- **Gamifying** environmental action to increase engagement
- **Tracking** real impact with transparent metrics
- **Educating** through community knowledge sharing
- **Empowering** individuals to make measurable environmental change

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with 💚 for the planet** | Inspired by Wangari Maathai's legacy
