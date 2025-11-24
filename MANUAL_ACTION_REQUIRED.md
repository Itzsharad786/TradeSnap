# 🔧 MANUAL ACTION REQUIRED: Firebase Storage CORS Configuration

## ⚠️ Critical Issue
Avatar uploads are currently **blocked by CORS** on the live Netlify site.

## 📋 What Was Done (Automated)
✅ Created `cors.json` with proper CORS configuration  
✅ Created `storage.rules` with security rules for avatar uploads  
✅ Created comprehensive setup guide (`FIREBASE_CORS_SETUP.md`)  
✅ Built and deployed code to GitHub  
✅ Netlify deployment triggered automatically  

## 🚨 What YOU Must Do Manually

### Step 1: Apply CORS Configuration (REQUIRED)

**Option A: Google Cloud Console (Easiest - No CLI needed)**

1. Open: https://console.cloud.google.com/storage/browser?project=tradesnap-542ce
2. Click on bucket: `tradesnap-542ce.firebasestorage.app`
3. Click the **3-dot menu** → **Edit bucket permissions** → **CORS** tab
4. Click **Add CORS configuration**
5. Paste this JSON:
   ```json
   [
     {
       "origin": ["https://tradesnap-live.netlify.app", "http://localhost:5173"],
       "method": ["GET", "POST", "PUT", "HEAD", "DELETE"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "x-goog-meta-*", "x-goog-acl"]
     }
   ]
   ```
6. Click **Save**

**Option B: Using gcloud CLI (If installed)**

```bash
# From project root
gcloud auth login
gcloud config set project tradesnap-542ce
gsutil cors set cors.json gs://tradesnap-542ce.firebasestorage.app
```

### Step 2: Deploy Storage Security Rules (Optional but Recommended)

If you have Firebase CLI configured:

```bash
firebase deploy --only storage:rules
```

This deploys the `storage.rules` file which ensures:
- Users can only upload to their own avatar folder
- All avatars are publicly readable
- Proper authentication checks

### Step 3: Test on Live Site

1. Go to: https://tradesnap-live.netlify.app
2. Login (or continue as guest)
3. Navigate to Profile page
4. Click the upload button on avatar
5. Select an image file
6. **Expected behavior:**
   - Upload progress shows (not stuck at 0%)
   - Upload completes successfully
   - Avatar updates instantly
   - Avatar persists after page refresh

### Step 4: Verify in Firebase Console

1. Open: https://console.firebase.google.com/project/tradesnap-542ce/firestore
2. Navigate to `users` collection
3. Find your user document
4. Check that `avatarUrl` field contains a Firebase Storage URL like:
   ```
   https://firebasestorage.googleapis.com/v0/b/tradesnap-542ce.firebasestorage.app/o/avatars%2Fusers%2F{uid}%2Favatar-{timestamp}.webp?alt=media&token=...
   ```

## 🔍 Troubleshooting

### Still Getting CORS Error?
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Wait 5-10 minutes for CORS changes to propagate globally
- Check browser console for exact error message
- Verify the bucket name in Google Cloud Console matches exactly

### Upload Stuck at 0%?
- Confirm CORS configuration was saved successfully
- Check that you're logged in (not guest mode for uploads)
- Verify Firebase Storage rules allow write access
- Check browser Network tab for 403/401 errors

### 403 Forbidden Error?
- Deploy storage rules: `firebase deploy --only storage:rules`
- Ensure user is authenticated
- Check that storage bucket exists and is accessible

## 📚 Additional Resources

- **Full Setup Guide**: See `FIREBASE_CORS_SETUP.md` in project root
- **Firebase Console**: https://console.firebase.google.com/project/tradesnap-542ce
- **Google Cloud Storage**: https://console.cloud.google.com/storage/browser?project=tradesnap-542ce
- **Live Site**: https://tradesnap-live.netlify.app

## ✅ Success Criteria

After completing the manual steps, you should be able to:
1. ✅ Upload custom avatar images without CORS errors
2. ✅ See upload progress (not stuck at 0%)
3. ✅ Avatar updates instantly in UI
4. ✅ Avatar persists after page refresh
5. ✅ Avatar persists after logout/login
6. ✅ Preset avatars work correctly
7. ✅ No console errors related to CORS or Firebase Storage

---

**Status**: ⏳ Waiting for manual CORS configuration in Google Cloud Console

**Next Action**: Follow Step 1 above to apply CORS configuration
