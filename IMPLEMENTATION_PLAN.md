# Implementation Plan - Tradesnap Fixes

## Issues to Fix:

### 1. TraderLab Page
- [ ] Create topics.json with 30+ trading topics
- [ ] Each topic needs: title, description, category
- [ ] Fix topic rendering to show title, description, "Open" button
- [ ] Auto-generate AI image when topic opens
- [ ] Show short explanation section
- [ ] Add "Explain it to me" button

### 2. Group Invite Link Flow
- [ ] Create route handler for /join/:inviteCode
- [ ] Store inviteCode in localStorage before login
- [ ] After login/signup, check for pending inviteCode
- [ ] Add user to group's members array in Firestore
- [ ] Redirect to group page

### 3. News Page Fixes
- [ ] Fix NewsCard component image loading
- [ ] Add fallback image support
- [ ] Create news detail page
- [ ] Show: title, source, date, fulltext, image

### 4. Profile Avatar Fix
- [ ] Fix avatar visibility in top navigation
- [ ] Align avatar to right side
- [ ] Use avatar URL from Firestore
- [ ] Fallback to default avatar

### 5. Unified User Data Storage
- [ ] Update UserProfile type with all fields
- [ ] Ensure all pages read/write from single Firestore document
- [ ] Add: displayName, traderLabProgress, lastLogin

## Files to Modify:
- topics.json (create)
- pages.tsx (TraderLab, News, Community)
- App.tsx (routing, invite flow)
- types.ts (UserProfile)
- components.tsx (NewsCard, Navigation)
- services/firestoreService.ts (group join logic)

## Order of Implementation:
1. Create topics.json
2. Fix TraderLab page
3. Fix Profile Avatar
4. Fix News page
5. Add invite link flow
6. Unify user data storage
