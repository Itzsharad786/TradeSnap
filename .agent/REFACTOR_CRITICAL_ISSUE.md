# TRADESNAP REFACTOR - CRITICAL PATH ISSUE

## ❌ PROBLEM: Import Paths Incorrect

The page files were created in `src/pages/` but the imports use `../` which assumes:
- `src/pages/HomePage.tsx` trying to import from `../components` (would be `src/components`)
- But components are actually at `./components` (root level)

## ✅ SOLUTION: Fix Directory Structure

**Option 1: Move pages to root level** (RECOMMENDED)
```
pages/
  HomePage.tsx
  MarketPage.tsx
  etc.
```

**Option 2: Keep in src/ and fix all imports**
Change all `../` to `../../` in page files

## 🔧 IMMEDIATE FIX

Since the project doesn't use a `src/` directory structure, let's move the pages to root level:

```bash
# Move pages from src/pages to pages/
mv src/pages pages
rm -rf src
```

Then update App.tsx:
```typescript
import { HomePage, ... } from './pages';
```

## 📋 CURRENT STATUS

✅ Created:
- HomePage.tsx (with logo fix)
- MarketPage.tsx
- NewsPage.tsx
- AnalyzerPage.tsx
- TraderLabPage.tsx
- CommunityPage.tsx (placeholder)
- ProfilePage.tsx (placeholder)
- PageWrapper.tsx

❌ Issues:
- Files in wrong directory (`src/pages` instead of `pages`)
- Import paths incorrect
- CommunityPage and ProfilePage are placeholders

## 🎯 NEXT STEPS

1. Move files to correct location
2. Fix import paths
3. Extract full CommunityPage from pages.tsx
4. Extract full ProfilePage from pages.tsx
5. Delete old pages.tsx
6. Build and test
