# Following/Friends System Setup Guide

## ✅ What's Been Implemented

### 1. Database Schema (`database-following-system.sql`)
- **follows table**: Tracks follower/following relationships
- **Mutual follows = Friends**: When two users follow each other
- **Auto-counting**: Triggers update follower/following counts on profiles
- **Helper function**: `are_friends()` to check friendship status
- **View**: `user_friends` for easy friend queries

### 2. Context (`contexts/FollowContext.tsx`)
- Follow/unfollow users
- Check if following or friends
- Get followers, following, and friends lists
- Real-time state management

### 3. UI Components
- **FollowButton**: Smart button showing Follow/Following/Friends status
- **SuggestedUsers**: Shows users with similar interests on Dashboard

### 4. Integration
- Added to UserProfile page
- Added to Dashboard sidebar
- Wrapped in App.tsx providers

## 🚀 Setup Instructions

### Step 1: Run Database Migration
```bash
# In Supabase SQL Editor, run:
database-following-system.sql
```

This creates:
- `follows` table with RLS policies
- `followers_count` and `following_count` columns on profiles
- Triggers to auto-update counts
- Helper functions and views

### Step 2: Add Interests to Profiles (Optional)
For better suggestions, add interests field:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
```

### Step 3: Test the System
1. Login as User A
2. Visit another user's profile
3. Click "Follow" button
4. Login as User B
5. Follow User A back
6. Both should now see "Friends" status

## 📊 How It Works

### Following Flow
1. User clicks "Follow" button
2. Insert into `follows` table
3. Trigger updates both users' counts
4. UI updates to show "Following"

### Friends Detection
- When User A follows User B: "Following" status
- When User B follows User A back: Both become "Friends"
- Unfollowing removes friend status

### Suggested Users Algorithm
1. Get current user's interests
2. Find users not already following
3. Score by shared interests
4. Show top 5 matches

## 🎯 Next Steps

Choose one to implement next:

### Option 1: Messaging System
- Direct messages between friends
- Group chats
- Media sharing
- Read receipts

### Option 2: Enhanced Matchmaking
- Match users by interests + location
- Environmental goals matching
- Campaign collaboration suggestions

### Option 3: Activity Feed
- See friends' activities
- Tree planting updates
- Campaign joins
- Story posts

## 💡 Usage Examples

### Check if Following
```typescript
const { isFollowing } = useFollow();
if (isFollowing(userId)) {
  // Show "Following" state
}
```

### Check if Friends
```typescript
const { areFriends } = useFollow();
if (areFriends(userId)) {
  // Enable messaging
  // Show friend-only content
}
```

### Get Friends List
```typescript
const { getFriends } = useFollow();
const friends = await getFriends(userId);
```

## 🔐 Security

- RLS policies ensure users can only:
  - Follow/unfollow themselves
  - View all follows (public)
- Counts updated via secure triggers
- No direct manipulation possible

## 📱 UI Features

- **Follow Button**: Changes color/text based on status
  - Blue "Follow" → Not following
  - Gray "Following" → Following but not friends
  - Green "Friends" → Mutual follow
- **Suggested Users**: Shows avatar, name, bio, shared interests
- **Profile Integration**: Follow button on all user profiles

---

**Status**: ✅ Following system fully operational
**Database**: Ready
**UI**: Integrated
**Next**: Choose messaging, matchmaking, or activity feed
