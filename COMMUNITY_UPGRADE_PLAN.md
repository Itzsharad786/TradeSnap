# Tradesnap Community System Upgrade - Implementation Plan

## Overview
This document outlines the implementation of 10 major features to upgrade the Tradesnap community system.

## Features to Implement

### ✅ 1. Group Banner/Image System
- **Storage**: Firebase Storage at `/groups/{groupId}/banner.png`
- **Upload**: Allow group owners to upload/update banner
- **Display**: Show in group page header and group cards
- **Max Size**: 5MB
- **Formats**: PNG, JPG, WEBP

### ✅ 2. Invite Code System
- **Format**: `TRD-XXXXXX` (e.g., TRD-58K2Q9)
- **Generation**: Random 6-character alphanumeric
- **Storage**: Firestore `groups/{groupId}.inviteCode`
- **Display**: Show in group Info tab
- **Security**: Hashed password stored separately

### ✅ 3. Join via Invite Code Flow
- **UI**: Modal with invite code + password fields
- **Validation**: Check code exists and password matches
- **Action**: Add user to group members
- **Feedback**: Success/error messages

### ✅ 4. Share Button
- **Copy Format**:
  ```
  Join my Tradesnap group!
  Group: [Name]
  Code: TRD-XXXXXX
  Password: [if private]
  Link: https://tradesnap.pages.dev/join?code=XXXXXX
  ```
- **Location**: Group Info tab
- **Functionality**: Copy to clipboard

### ✅ 5. Improved Group Info Tab
**Display**:
- Group banner image
- Group name and description
- Type (Public/Private)
- Created date
- Owner name
- Member count
- Invite code
- Share button

### ✅ 6. Public Group Search
- **Search Fields**: Name, description
- **Display**: Group cards with banner, name, members count
- **Filter**: Real-time search
- **UI**: Search bar at top of Explore tab

### ✅ 7. Enhanced Member List
**Show for each member**:
- Avatar
- Username
- Online/Offline status
- Joined date
- Owner badge (if applicable)

### ✅ 8. Chat Improvements
- **Timestamps**: Show time for each message
- **Seen Indicator**: Blue checkmark when seen
- **Emoji Support**: Native emoji picker
- **Image Upload**: Upload images in chat
- **Delete Message**: Owner can delete any message
- **Pin Messages**: Owner can pin important messages
- **Pinned Display**: Show pinned messages at top

### ✅ 9. Group Limits (Maintained)
- 2 Public groups per user
- 3 Private groups per user
- Client-side and server-side enforcement

### ✅ 10. Deployment
- Commit all changes
- Push to GitHub main
- Trigger Cloudflare Pages deployment

---

## Implementation Order

1. **Types & Interfaces** - Update TypeScript types
2. **Firestore Service** - Add new functions
3. **Storage Service** - Banner upload functions
4. **Components** - New UI components
5. **Pages** - Update group pages
6. **Testing** - Test all features
7. **Deployment** - Git commit and push

---

## File Changes Required

### Core Files:
- `types.ts` - ✅ Updated
- `services/firestoreService.ts` - Update
- `services/storageService.ts` - Create/Update
- `pages.tsx` - Major updates
- `components.tsx` - Add new components

### New Components Needed:
- `JoinGroupModal` - Join via invite code
- `GroupBannerUpload` - Upload group banner
- `EmojiPicker` - Emoji selection
- `PinnedMessages` - Display pinned messages
- `MemberListItem` - Enhanced member display

---

## Technical Details

### Invite Code Generation:
```typescript
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TRD-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
```

### Banner Upload Path:
```
/groups/{groupId}/banner_{timestamp}.{ext}
```

### Message Seen Tracking:
```typescript
// Add current user to seenBy array
await updateDoc(messageRef, {
  seenBy: arrayUnion(currentUserId)
});
```

### Pin Message:
```typescript
await updateDoc(messageRef, {
  isPinned: true
});
```

---

## Security Considerations

1. **Banner Upload**: Validate file type and size
2. **Invite Codes**: Unique per group
3. **Password**: Always hashed, never plain text
4. **Delete Messages**: Only owner can delete
5. **Pin Messages**: Only owner can pin
6. **Group Limits**: Enforced client + server side

---

## UI/UX Improvements

1. **Group Cards**: Show banner as background
2. **Search**: Instant filter, no delay
3. **Member List**: Sort by online status, then join date
4. **Chat**: Smooth scroll to pinned messages
5. **Share**: One-click copy with feedback
6. **Timestamps**: Relative time (e.g., "2 min ago")

---

## Testing Checklist

- [ ] Upload group banner
- [ ] Generate invite code
- [ ] Join group via invite code
- [ ] Share group info
- [ ] Search public groups
- [ ] View enhanced member list
- [ ] Send message with emoji
- [ ] Upload image in chat
- [ ] Pin/unpin message
- [ ] Delete message (owner only)
- [ ] Mark messages as seen
- [ ] Verify group limits

---

**Status**: Ready for Implementation  
**Estimated Time**: 2-3 hours  
**Complexity**: High  
**Impact**: Major UX improvement
