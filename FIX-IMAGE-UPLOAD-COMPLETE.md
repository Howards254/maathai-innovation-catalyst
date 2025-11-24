# 🖼️ Complete Image Upload Fix

## 🔍 Root Cause
Images were being converted to **base64 data URLs** (huge text strings) instead of being uploaded to actual storage. Base64 URLs:
- ❌ Are too large for database
- ❌ Don't persist properly
- ❌ Slow down page loads

## ✅ Solution: Use Supabase Storage

### Step 1: Set Up Supabase Storage Bucket

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Click **Storage** in left sidebar
3. Click **New bucket**
4. Name it: `media`
5. Make it **Public**
6. Click **Create bucket**

**Option B: Via SQL**
Run `database-setup-storage.sql` in SQL Editor

### Step 2: Add Database Columns
Run in Supabase SQL Editor:
```sql
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS media_urls TEXT[];
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS media_type TEXT;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS tags TEXT[];
```

### Step 3: Code Changes (Already Applied)
- ✅ Created `lib/uploadMedia.ts` - uploads files to Supabase Storage
- ✅ Updated `CreateDiscussionForm.tsx` - uses real upload instead of base64
- ✅ Updated `DiscussionContext.tsx` - saves/loads media URLs

### Step 4: Rebuild
```bash
npm run build
```

## 🧪 Test It

1. Create a new discussion
2. Upload an image
3. Submit the post
4. **Check Supabase Storage**: Storage → media bucket → discussions folder
5. Image should appear in the post!

## 📊 How It Works Now

**Before (Broken):**
```
User selects image → FileReader converts to base64 → 
Saves huge base64 string to DB → ❌ Fails/Slow
```

**After (Fixed):**
```
User selects image → Upload to Supabase Storage → 
Get public URL → Save URL to DB → ✅ Works!
```

## 🔧 Troubleshooting

### "Failed to create discussion"
**Check:** Is the `media` bucket created in Supabase Storage?
- Go to Supabase Dashboard → Storage
- Should see a bucket named `media`

### "Storage bucket not found"
**Fix:** Create the bucket manually:
1. Supabase Dashboard → Storage → New bucket
2. Name: `media`
3. Public: ✅ Yes
4. Create

### Images still not showing
**Check the database:**
```sql
SELECT id, title, media_urls FROM discussions ORDER BY created_at DESC LIMIT 5;
```
- Should see actual URLs like: `https://xxx.supabase.co/storage/v1/object/public/media/discussions/abc123.jpg`
- NOT base64 strings like: `data:image/jpeg;base64,/9j/4AAQ...`

### Storage policies error
Run this:
```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Then run database-setup-storage.sql
```

## 📝 File Structure

```
lib/
  uploadMedia.ts          ← New: Handles file uploads
  
components/
  CreateDiscussionForm.tsx ← Updated: Uses uploadMedia
  
contexts/
  DiscussionContext.tsx    ← Updated: Saves/loads URLs

database-setup-storage.sql ← New: Storage setup
database-add-media-columns.sql ← New: DB columns
```

## ✨ What You Get

- ✅ Fast image loading
- ✅ Persistent storage
- ✅ Multiple images per post (up to 4)
- ✅ Video support
- ✅ Automatic thumbnails
- ✅ CDN delivery via Supabase

---

**Status**: Complete solution provided
**Next**: Run Step 1 & 2, then rebuild
