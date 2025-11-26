# TRADESNAP REFACTOR - EXECUTION PLAN

## FILES TO CREATE

### Shared Components
1. `src/pages/PageWrapper.tsx` - Shared wrapper component

### Page Components
2. `src/pages/HomePage.tsx` ✅ CREATED
3. `src/pages/MarketPage.tsx`
4. `src/pages/NewsPage.tsx`
5. `src/pages/AnalyzerPage.tsx`
6. `src/pages/TraderLabPage.tsx`
7. `src/pages/CommunityPage.tsx`
8. `src/pages/ProfilePage.tsx`
9. `src/pages/index.ts` - Export all pages

### Files to Modify
10. `App.tsx` - Update imports
11. `components/AnimatedLogin.tsx` - Remove guest button (STEP 4)
12. Delete `pages.tsx` - After all components extracted

## IMPLEMENTATION STATUS

✅ Step 1a: Created src/pages directory
✅ Step 1b: Created HomePage.tsx with STEP 3 fixes (no logo, static gradient)
⏳ Step 1c: Create remaining page files
⏳ Step 1d: Update App.tsx imports
⏳ Step 1e: Delete old pages.tsx

## NEXT ACTIONS

1. Create PageWrapper.tsx
2. Create MarketPage.tsx
3. Create NewsPage.tsx
4. Create AnalyzerPage.tsx
5. Create TraderLabPage.tsx
6. Create CommunityPage.tsx (with STEP 6 fixes)
7. Create ProfilePage.tsx (with STEP 5 fixes)
8. Create index.ts
9. Update App.tsx
10. Delete pages.tsx
11. Build and test
12. Deploy

## ESTIMATED TIME

- Page creation: 30 min
- Testing: 10 min
- Deployment: 5 min
**Total: 45 minutes**
