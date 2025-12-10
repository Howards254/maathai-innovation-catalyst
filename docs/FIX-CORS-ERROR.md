# 🔧 Fix CORS Error - Supabase Configuration

## ❌ Error
```
Access to fetch at 'https://ulpsuuxyudamsyndtrpu.supabase.co/rest/v1/discussions' 
from origin 'https://maathai-innovation-catalyst.vercel.app' has been blocked by CORS policy
```

## ✅ Solution: Add Vercel Domain to Supabase

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project: `ulpsuuxyudamsyndtrpu`

### Step 2: Add Vercel Domain
1. Click **Settings** (gear icon) in left sidebar
2. Click **API** section
3. Scroll to **CORS Configuration** or **Allowed Origins**
4. Add your Vercel domain:
   ```
   https://maathai-innovation-catalyst.vercel.app
   ```
5. Also add (for preview deployments):
   ```
   https://*.vercel.app
   ```
6. Click **Save**

### Alternative: Authentication Settings
If you don't see CORS settings in API:

1. Go to **Authentication** → **URL Configuration**
2. Add to **Site URL**:
   ```
   https://maathai-innovation-catalyst.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://maathai-innovation-catalyst.vercel.app/**
   https://*.vercel.app/**
   ```
4. Click **Save**

### Step 3: Verify Environment Variables in Vercel
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `maathai-innovation-catalyst`
3. Go to **Settings** → **Environment Variables**
4. Verify these exist:
   ```
   VITE_SUPABASE_URL=https://ulpsuuxyudamsyndtrpu.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=maathai_discussions
   ```
5. If missing, add them and **redeploy**

### Step 4: Redeploy on Vercel
After adding domain to Supabase:
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click **...** on latest deployment
4. Click **Redeploy**

## 🧪 Test
1. Wait 1-2 minutes after saving Supabase settings
2. Try creating a discussion again
3. Should work now!

## 🔍 Common Issues

### Still getting CORS error?
**Check:**
- Domain is exactly: `https://maathai-innovation-catalyst.vercel.app` (no trailing slash)
- Supabase settings saved properly
- Waited 1-2 minutes for changes to propagate

### "Failed to fetch" but no CORS error?
**Check:**
- Supabase project is not paused
- Database columns exist (run `database-add-media-columns.sql`)
- Internet connection is stable

### Works locally but not on Vercel?
**Fix:**
- Add `https://*.vercel.app` to Supabase allowed origins
- Check Vercel environment variables are set
- Redeploy after adding env vars

## 📝 Quick Checklist
- [ ] Added Vercel domain to Supabase CORS/Auth settings
- [ ] Added wildcard `https://*.vercel.app` for preview deployments
- [ ] Verified environment variables in Vercel
- [ ] Waited 1-2 minutes
- [ ] Redeployed on Vercel
- [ ] Tested creating discussion

---

**This is a configuration issue, not a code issue.**
**No code changes needed - just Supabase dashboard settings!**
