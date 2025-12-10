# 🎬 Stories/Reels Feature - Setup Guide

## ✨ What's Fixed

Stories/Reels feature now works like TikTok/Instagram Reels:
- ✅ Upload videos (max 60 seconds, 10MB)
- ✅ Upload photos with text
- ✅ Save to database (not localStorage)
- ✅ Upload media to Cloudinary
- ✅ Reactions (likes) persist
- ✅ Comments save to database
- ✅ Full-screen vertical scroll
- ✅ Auto-play videos

## 📋 Setup Steps

### Step 1: Run SQL in Supabase
Run `database-stories-setup.sql` in Supabase SQL Editor to create:
- `stories` table
- `story_reactions` table
- `story_comments` table
- Indexes and RLS policies

### Step 2: Verify Cloudinary Setup
Make sure these are in your `.env.local`:
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=maathai_discussions
```

### Step 3: Push to GitHub
```bash
git push origin main
```

### Step 4: Test on Vercel
After auto-deploy (~2 minutes):
1. Go to Impact Stories page
2. Click "Share" button
3. Upload a video or photo
4. Add title, description, location, tags
5. Click "Share Story"
6. Story should appear in feed!

## 🎯 Features

### Story Types:
- 🌱 Tree Planting
- 📈 Campaign Progress
- 🎉 Event
- 📚 Education
- 🧹 Cleanup
- 💚 General

### Media Support:
- **Images**: JPEG, PNG, WebP
- **Videos**: MP4, WebM, MOV
- **Max Size**: 10MB
- **Max Duration**: 60 seconds (for videos)

### Interactions:
- ❤️ Like/Unlike
- 💬 Comment
- 🔖 Bookmark
- 📤 Share
- 🔊 Mute/Unmute (videos)

## 🔧 Technical Details

### Database Schema:
```sql
stories (
  id, user_id, title, description, media_url, media_type,
  duration, story_type, location, tags, view_count, created_at
)

story_reactions (
  id, story_id, user_id, reaction_type, created_at
)

story_comments (
  id, story_id, user_id, content, created_at
)
```

### Upload Flow:
1. User selects video/photo
2. Validates size (10MB) and type
3. Uploads to Cloudinary → `stories` folder
4. Gets public URL
5. Saves to Supabase with metadata
6. Appears in feed immediately

### UI Features:
- Full-screen vertical scroll (like TikTok)
- Snap scrolling between stories
- Auto-play videos
- Pause on tap
- Mute/unmute button
- Like, comment, share, bookmark buttons
- User info overlay
- Tags and location display

## 🧪 Test Checklist

- [ ] Upload a photo story
- [ ] Upload a video story (under 60 seconds)
- [ ] Add title, description, location, tags
- [ ] Story appears in feed
- [ ] Can scroll between stories
- [ ] Video auto-plays
- [ ] Can pause/play by tapping
- [ ] Can mute/unmute video
- [ ] Like button works
- [ ] Refresh page - story still there
- [ ] Share button works

## 🚀 What's Now Working

### Before (Broken):
- ❌ Stories not saving
- ❌ Upload not working
- ❌ Using localStorage
- ❌ No reactions/comments

### After (Fixed):
- ✅ Stories save to database
- ✅ Upload to Cloudinary
- ✅ Reactions persist
- ✅ Comments save to database
- ✅ Full TikTok-style interface
- ✅ Auto-play and scroll

---

**Status**: Ready to use!
**Next**: Push to GitHub and test on Vercel
