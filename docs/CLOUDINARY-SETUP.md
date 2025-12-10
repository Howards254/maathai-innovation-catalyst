# ☁️ Cloudinary Setup for Images

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Cloudinary Account (Free)
1. Go to https://cloudinary.com/users/register_free
2. Sign up (free tier: 25GB storage, 25GB bandwidth/month)
3. Verify your email

### Step 2: Get Your Credentials
1. Go to Dashboard: https://console.cloudinary.com/
2. Copy your **Cloud Name** (e.g., `dxyz123abc`)

### Step 3: Create Upload Preset
1. In Cloudinary Dashboard → Settings (gear icon)
2. Click **Upload** tab
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. Settings:
   - **Preset name**: `maathai_discussions`
   - **Signing mode**: **Unsigned** ⚠️ Important!
   - **Folder**: `discussions`
   - Click **Save**

### Step 4: Add to .env.local
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
VITE_CLOUDINARY_UPLOAD_PRESET=maathai_discussions
```

### Step 5: Add Database Columns
Run in Supabase SQL Editor:
```sql
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS media_urls TEXT[];
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS media_type TEXT;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS tags TEXT[];
```

### Step 6: Rebuild
```bash
npm run build
```

## ✅ Test It
1. Create a new discussion
2. Upload an image
3. Submit
4. Image should appear!
5. Check Cloudinary Dashboard → Media Library → discussions folder

## 🎯 Why Cloudinary?
- ✅ **25GB free storage** (vs Supabase 1GB)
- ✅ **25GB bandwidth/month** free
- ✅ Automatic image optimization
- ✅ CDN delivery worldwide
- ✅ Automatic format conversion (WebP, AVIF)
- ✅ Video support with thumbnails
- ✅ Image transformations on-the-fly

## 🔧 Troubleshooting

### "Cloudinary not configured"
**Fix**: Add `VITE_CLOUDINARY_CLOUD_NAME` to `.env.local`

### "Upload failed"
**Check**: 
1. Upload preset is **Unsigned**
2. Preset name matches in .env: `maathai_discussions`

### "Invalid upload preset"
**Fix**: Create the preset in Cloudinary Dashboard (Step 3 above)

## 📊 Free Tier Limits
- Storage: 25GB
- Bandwidth: 25GB/month
- Transformations: 25 credits/month
- Perfect for small-medium apps!

---

**Status**: Ready to use Cloudinary!
