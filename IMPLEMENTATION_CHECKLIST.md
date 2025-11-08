# Implementation Checklist - Mappls & 20km Filter

## ✅ Completed

- [x] Created `lib/mappls-api.ts` - Core Mappls API integration
- [x] Created `lib/cafe-filter-service.ts` - 20km radius filtering
- [x] Updated `lib/cafe-data-service.ts` - Added `getCafesFiltered()` function
- [x] Updated `app/location/page.tsx` - Mappls autosuggest and geocoding
- [x] Created `MAPPLS_INTEGRATION.md` - Complete documentation

---

## 🔄 To Do: Update Existing Pages

### 1. Browse Page (`app/browse/page.tsx`)

**Current Code:**
```typescript
const cafes = await getCafes();
```

**Update To:**
```typescript
const cafes = await getCafesFiltered();
```

**What This Does:**
- Automatically filters to 20km radius
- Shows distance labels on cafe cards
- Sorts by proximity (closest first)

**Additional Changes:**
- Update cafe card to show `cafe.distanceLabel`
- Add "X cafes within 20km" message
- Show "No cafes found within 20km" if empty

---

### 2. Discover Page (`app/discover/page.tsx`)

**Current Code:**
```typescript
const cafes = await getCafes();
```

**Update To:**
```typescript
const cafes = await getCafesFiltered();
```

**Additional Changes:**
- Show distance on each recommendation
- Update empty state: "No cafes within 20km"
- Add location badge showing user's current area

---

### 3. Home Page (`app/home/page.tsx`)

**Current Code:**
```typescript
const cafes = await getCafes();
const featured = cafes.slice(0, 6);
```

**Update To:**
```typescript
const allCafes = await getCafesFiltered();
const featured = allCafes.slice(0, 6); // Closest 6 cafes
```

**Additional Changes:**
- Show "Near You" section with closest cafes
- Add distance labels to featured cafes
- Update hero text: "Discover cafes within 20km"

---

### 4. Guided Search Results (`app/guided/results/page.tsx`)

**Current Code:**
```typescript
const cafes = await getCafes();
const matched = cafes.filter(/* preferences */);
```

**Update To:**
```typescript
const nearByCafes = await getCafesFiltered();
const matched = nearByCafes.filter(/* preferences */);
```

**What This Does:**
- First filters by 20km radius
- Then applies user preference filters
- User only sees nearby matches

---

### 5. Random Cafe (`app/random/page.tsx`)

**Option A: Keep All Cafes (Current)**
```typescript
const cafes = await getCafes();
const random = cafes[Math.floor(Math.random() * cafes.length)];
```

**Option B: Random from Nearby**
```typescript
const nearByCafes = await getCafesFiltered();
const random = nearByCafes[Math.floor(Math.random() * nearByCafes.length)];
```

**Recommendation:** Use Option B
- More relevant to user
- Ensures suggested cafe is reachable

---

### 6. Search Dish (`app/search-dish/page.tsx`)

**Current Code:**
```typescript
const cafes = await getCafes();
const matchingCafes = cafes.filter(/* has dish */);
```

**Option A: Keep All Cafes (Search globally)**
```typescript
const cafes = await getCafes();
const matchingCafes = cafes.filter(/* has dish */);
```

**Option B: Search within 20km only**
```typescript
const nearByCafes = await getCafesFiltered();
const matchingCafes = nearByCafes.filter(/* has dish */);
```

**Recommendation:** Use Option B
- More practical for users
- Can add "Search all cafes" toggle if needed

---

### 7. Favorites Page (`app/favorites/page.tsx`)

**Current Approach:**
```typescript
// Favorites stored as cafe IDs
const favoriteIds = getFavoriteIds();
const allCafes = await getCafes();
const favorites = allCafes.filter(c => favoriteIds.includes(c.id));
```

**Updated Approach:**
```typescript
const favoriteIds = getFavoriteIds();
const allCafes = await getCafes(); // Get ALL cafes (favorites might be far)
const favorites = allCafes.filter(c => favoriteIds.includes(c.id));

// Calculate distances for each favorite
const favoritesWithDistance = await Promise.all(
  favorites.map(async cafe => {
    const coords = localStorage.getItem('userCoords');
    if (coords) {
      const userLocation = JSON.parse(coords);
      const distance = await getCafeDistanceAccurate(cafe, userLocation);
      return { ...cafe, ...distance };
    }
    return { ...cafe, distanceKm: 0, distanceLabel: 'Unknown' };
  })
);
```

**Why Not Use getCafesFiltered()?**
- Favorites might be > 20km away
- User wants to see all favorites
- But still show distance to each

---

## 📋 Update Checklist

### Critical Pages (Must Update)
- [ ] `app/browse/page.tsx`
- [ ] `app/discover/page.tsx`
- [ ] `app/home/page.tsx`
- [ ] `app/guided/results/page.tsx`

### Optional Pages (Recommended)
- [ ] `app/random/page.tsx`
- [ ] `app/search-dish/page.tsx`

### Keep As-Is
- [ ] `app/favorites/page.tsx` (Show all favorites, but add distance)
- [ ] `app/cafe/[id]/page.tsx` (Individual cafe page)
- [ ] Admin pages (if any)

---

## 🎨 UI Component Updates

### Cafe Card Component

**Add Distance Display:**
```tsx
{cafe.distanceLabel && (
  <div className="flex items-center gap-1 text-sm text-muted-foreground">
    <MapPin className="h-3 w-3" />
    <span>{cafe.distanceLabel} away</span>
  </div>
)}
```

**Add Duration (Optional):**
```tsx
{cafe.durationMinutes && (
  <div className="flex items-center gap-1 text-sm text-muted-foreground">
    <Clock className="h-3 w-3" />
    <span>{Math.round(cafe.durationMinutes)} min drive</span>
  </div>
)}
```

### Empty State Component

**No Cafes Within 20km:**
```tsx
<div className="text-center py-12 space-y-4">
  <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
  <h3 className="text-xl font-semibold">No cafes within 20km</h3>
  <p className="text-muted-foreground">
    Try changing your location or expanding your search radius
  </p>
  <Button onClick={() => router.push('/location')}>
    Change Location
  </Button>
</div>
```

### Location Badge

**Show Current Location:**
```tsx
<div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
  <MapPin className="h-4 w-4" />
  <span className="text-sm">{userLocation}</span>
  <Button variant="ghost" size="sm" onClick={() => router.push('/location')}>
    Change
  </Button>
</div>
```

---

## 🧪 Testing Steps

### For Each Updated Page:

1. **Clear localStorage** (to test fresh state)
```javascript
localStorage.clear();
```

2. **Set test location**
```javascript
localStorage.setItem('userLocation', 'Koramangala, Bangalore');
localStorage.setItem('userCoords', JSON.stringify({
  lat: 12.9352,
  lng: 77.6245
}));
```

3. **Refresh page and verify:**
- [ ] Page loads without errors
- [ ] Cafes are filtered to ~20km radius
- [ ] Distance labels are shown
- [ ] Cafes sorted by distance
- [ ] Empty state works if no cafes

4. **Test different locations:**
- [ ] Central area (should have many cafes)
- [ ] Suburban area (fewer cafes)
- [ ] Rural area (possibly no cafes)

5. **Check console logs:**
- [ ] "Filtering cafes within 20km" message
- [ ] "Returning X cafes within 20km" message
- [ ] No errors

---

## 🐛 Common Issues & Fixes

### Issue: Page shows 0 cafes even though some exist

**Diagnosis:**
```typescript
console.log('User coords:', localStorage.getItem('userCoords'));
console.log('All cafes:', await getCafes());
console.log('Filtered cafes:', await getCafesFiltered());
```

**Possible Causes:**
1. No user coordinates set → Redirect to /location
2. All cafes are > 20km away → Show message
3. Cafe coordinates in DB are wrong → Fix in Google Sheets

**Fix:**
```typescript
const cafes = await getCafesFiltered();

if (cafes.length === 0) {
  // Check if user location is set
  const coords = localStorage.getItem('userCoords');
  if (!coords) {
    router.push('/location');
    return;
  }
  
  // Show "no cafes nearby" message
  return <NoCafesNearby />;
}
```

---

### Issue: Distances are wrong

**Diagnosis:**
```typescript
const cafe = cafes[0];
console.log('Cafe coordinates:', cafe.location.coordinates);
console.log('User coordinates:', JSON.parse(localStorage.getItem('userCoords')));
console.log('Calculated distance:', cafe.distanceKm);
```

**Compare with Google Maps:**
1. Open Google Maps
2. Enter user location as origin
3. Enter cafe address as destination
4. Compare distances

**Possible Causes:**
1. Cafe coordinates incorrect in DB
2. Mappls API failed, used haversine
3. Driving distance vs straight-line

**Fix:**
- Verify cafe coordinates in Google Sheets (Column F)
- Check Mappls API response in Network tab
- Ensure `MAPPLS_CONFIG.USE_MAPPLS_DISTANCE = true`

---

### Issue: Page is slow

**Diagnosis:**
```typescript
console.time('getCafesFiltered');
const cafes = await getCafesFiltered();
console.timeEnd('getCafesFiltered');
```

**Expected Times:**
- < 1 second for < 50 cafes
- < 2 seconds for < 100 cafes
- < 3 seconds for > 100 cafes

**Optimization:**
```typescript
// Ensure caching is working
console.log('Cache status:', cachedCafes !== null);

// Reduce batch size if needed (in cafe-filter-service.ts)
MAX_BATCH_SIZE: 15, // Instead of 25
```

---

## 📊 Validation Checklist

Before deploying to production:

### Data Validation
- [ ] All cafes have valid coordinates in Google Sheets
- [ ] Coordinates are within India bounds (6°N-35°N, 68°E-97°E)
- [ ] Google Maps links are correct

### API Testing
- [ ] Mappls API key is valid and active
- [ ] API calls return results within 2 seconds
- [ ] Error handling works (try with no internet)
- [ ] Caching reduces redundant API calls

### User Experience
- [ ] Location search is fast (< 1 second)
- [ ] Distance calculations are accurate (compare with Google Maps)
- [ ] Empty states are clear and helpful
- [ ] Loading states show during API calls

### Performance
- [ ] Page loads in < 3 seconds
- [ ] No memory leaks (check browser DevTools)
- [ ] Mobile performance is good (test on device)

---

## 🚀 Deployment Steps

1. **Test thoroughly on localhost**
   - All pages work
   - All tests pass
   - No console errors

2. **Update environment variables** (if any)
   ```
   NEXT_PUBLIC_MAPPLS_KEY=dbsomdpdvapmmxivbiaiebuehatqkylcivew
   ```

3. **Deploy to staging/production**
   ```bash
   npm run build
   npm start
   ```

4. **Verify on production:**
   - Test with real user locations
   - Check Mappls API usage dashboard
   - Monitor error rates

5. **Monitor for issues:**
   - API rate limits
   - Performance metrics
   - User feedback

---

## 📝 Code Snippets

### Import Statement
```typescript
import { getCafesFiltered } from '@/lib/cafe-data-service';
import { CafeWithDistance } from '@/lib/cafe-filter-service';
```

### Basic Usage
```typescript
const [cafes, setCafes] = useState<CafeWithDistance[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadCafes = async () => {
    try {
      const filtered = await getCafesFiltered();
      setCafes(filtered);
    } catch (error) {
      console.error('Error loading cafes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  loadCafes();
}, []);
```

### With Error Handling
```typescript
const loadCafes = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // Check if location is set
    const coords = localStorage.getItem('userCoords');
    if (!coords) {
      router.push('/location');
      return;
    }
    
    const filtered = await getCafesFiltered();
    
    if (filtered.length === 0) {
      setError('No cafes found within 20km. Try changing your location.');
    }
    
    setCafes(filtered);
  } catch (error) {
    console.error('Error loading cafes:', error);
    setError('Failed to load cafes. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ Final Checklist

### Before Marking Complete:
- [ ] All critical pages updated
- [ ] All pages tested locally
- [ ] Console has no errors
- [ ] Distance labels show correctly
- [ ] Empty states work
- [ ] Loading states work
- [ ] Mobile works
- [ ] Documentation reviewed
- [ ] Code is committed
- [ ] Ready for production

---

**Created:** November 7, 2025
**Status:** 🚧 In Progress
**Priority:** 🔴 High
