# Firebase Storage CORS Configuration Guide

## Problem
Avatar uploads fail on https://tradesnap-live.netlify.app due to CORS restrictions.
Firebase Storage blocks cross-origin requests by default.

## Solution: Configure CORS via Google Cloud Console

### Method 1: Google Cloud Console (Recommended - No CLI Required)

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/storage/browser
   - Select project: `tradesnap-542ce`

2. **Navigate to Storage Bucket**
   - Click on bucket: `tradesnap-542ce.firebasestorage.app`
   - Click "Permissions" tab
   - Click "CORS" configuration

3. **Add CORS Configuration**
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

4. **Save Changes**
   - Click "Save"
   - Changes take effect immediately

### Method 2: Using gcloud CLI (If Available)

```bash
# Install Google Cloud SDK first if not installed
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project tradesnap-542ce

# Apply CORS configuration
gsutil cors set cors.json gs://tradesnap-542ce.firebasestorage.app

# Verify CORS configuration
gsutil cors get gs://tradesnap-542ce.firebasestorage.app
```

### Method 3: Firebase Console UI

1. Go to: https://console.firebase.google.com/project/tradesnap-542ce/storage
2. Click on "Rules" tab
3. Update storage.rules (already done in this project)
4. Deploy rules: `firebase deploy --only storage:rules`

## CORS Configuration File

The `cors.json` file in this project root contains:

```json
[
  {
    "origin": ["https://tradesnap-live.netlify.app", "http://localhost:5173", "http://localhost:3000"],
    "method": ["GET", "POST", "PUT", "HEAD", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "x-goog-meta-*", "x-goog-acl"]
  }
]
```

## Storage Rules

The `storage.rules` file defines security rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /groups/{groupId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Deploy Storage Rules

```bash
firebase deploy --only storage:rules
```

## Testing

After CORS configuration:

1. **Upload Test**
   - Go to: https://tradesnap-live.netlify.app
   - Login
   - Navigate to Profile
   - Click avatar edit button
   - Upload an image
   - Progress should show > 0%
   - Upload should complete successfully

2. **Verify in Firestore**
   - Check `users/{uid}` document
   - Field `avatarUrl` should contain Firebase Storage URL
   - Example: `https://firebasestorage.googleapis.com/v0/b/tradesnap-542ce.firebasestorage.app/o/avatars%2Fusers%2F...`

3. **Persistence Test**
   - Refresh page
   - Avatar should persist
   - Logout and login
   - Avatar should still be there

## Troubleshooting

### CORS Error Still Appears
- Clear browser cache
- Wait 5-10 minutes for CORS changes to propagate
- Verify bucket name matches exactly
- Check browser console for specific CORS error

### Upload Stuck at 0%
- Check Firebase Storage rules allow write
- Verify user is authenticated
- Check network tab for 403/401 errors
- Ensure storage bucket exists and is accessible

### 403 Forbidden Error
- Update storage.rules
- Deploy rules: `firebase deploy --only storage:rules`
- Check user authentication status

## Current Status

- ✅ `cors.json` created
- ✅ `storage.rules` created
- ⏳ **MANUAL STEP REQUIRED**: Apply CORS via Google Cloud Console
- ⏳ Deploy storage rules: `firebase deploy --only storage:rules`

## Next Steps

1. **YOU MUST**: Go to Google Cloud Console and apply CORS configuration manually
2. Deploy storage rules (if firebase CLI is configured)
3. Test avatar upload on live site
4. Verify persistence

## Links

- Firebase Console: https://console.firebase.google.com/project/tradesnap-542ce
- Google Cloud Storage: https://console.cloud.google.com/storage/browser?project=tradesnap-542ce
- Netlify Site: https://tradesnap-live.netlify.app
