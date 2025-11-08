# Mappls API Debugging Guide

## 🐛 Issues Fixed

### Issue 1: No location suggestions showing
**Problem:** When typing in "Enter Location Manually", no suggestions appear.

**Root Cause:** API endpoint URLs or API key configuration issue.

**Fix Applied:**
- Updated `lib/mappls-api.ts` with correct Mappls API endpoints
- Autosuggest URL: `https://atlas.mappls.com/api/places/search/json`
- Geocode URL: `https://apis.mappls.com/advancedmaps/v1`
- Added proper error handling and logging

### Issue 2: Cafe detail page shows random/incorrect distance
**Problem:** Distance shown on cafe detail page doesn't match user's actual distance.

**Root Cause:** Distance calculation not using Mappls Distance Matrix API.

**Fix Applied:**
- Updated `lib/distance.ts` to use Mappls API
- Falls back to haversine if Mappls fails
- Added detailed console logging

---

## 🧪 How to Test

### Step 1: Test the API directly

1. **Open the test page:**
   ```
   http://localhost:3000/test-mappls
   ```

2. **Test Autosuggest:**
   - Type "Koramangala" in the search box
   - Click "Search"
   - Check browser console (F12) for logs
   - Should see: "🔍 Mappls Autosuggest: Koramangala"
   - Should see results appear

3. **Test Reverse Geocode:**
   - Use default coordinates (12.9352, 77.6245)
   - Click "Reverse Geocode"
   - Should show address: "Koramangala, Bangalore"

4. **Test GPS:**
   - Click "Use GPS Location"
   - Allow location access
   - Should detect your location

### Step 2: Test Location Page

1. **Go to location page:**
   ```
   http://localhost:3000/location
   ```

2. **Type in search box:**
   - Try: "Koramangala"
   - Try: "Connaught Place"
   - Try: "Marine Drive Mumbai"

3. **Check console logs:**
   - Open DevTools (F12) → Console tab
   - Should see: "🔍 Searching with Mappls: [your query]"
   - Should see: "📍 Found X Mappls results"

### Step 3: Test Distance Calculation

1. **Set a location** (e.g., Koramangala)

2. **Go to any cafe page:**
   ```
   http://localhost:3000/cafe/cafe_1
   ```

3. **Check console logs:**
   - Should see: "🚗 Calculating distance from..."
   - Should see: "✅ Mappls distance: X.XX km"
   - Distance should match Google Maps

---

## 🔍 Debugging Steps

### If No Suggestions Appear:

**Step 1: Check API Response**
1. Open DevTools (F12)
2. Go to Network tab
3. Type in location search
4. Look for request to `mappls.com`
5. Click on it → Preview tab
6. Check the response

**What to look for:**
```json
{
  "suggestedLocations": [
    {
      "placeName": "Koramangala",
      "placeAddress": "Koramangala, Bangalore",
      "latitude": 12.9352,
      "longitude": 77.6245,
      ...
    }
  ]
}
```

**Step 2: Check for Errors**
1. Console tab in DevTools
2. Look for red error messages
3. Common errors:
   - `CORS error` → API key or domain issue
   - `401 Unauthorized` → API key invalid
   - `404 Not Found` → Wrong API endpoint
   - `429 Too Many Requests` → Rate limit reached

**Step 3: Verify API Key**
```javascript
// In browser console, run:
console.log('API Key:', 'dbsomdpdvapmmxivbiaiebuehatqkylcivew')
```

---

### If Distance is Wrong:

**Step 1: Check User Coordinates**
```javascript
// In browser console:
console.log('User coords:', localStorage.getItem('userCoords'))
```

Should show:
```json
{"lat":12.9352,"lng":77.6245}
```

**Step 2: Check Cafe Coordinates**
```javascript
// In cafe page console:
console.log('Cafe coords:', cafe.location.coordinates)
```

**Step 3: Verify Distance Calculation**
1. Open cafe detail page
2. Check console logs
3. Should see:
   - "🚗 Calculating distance from X,Y to A,B"
   - "✅ Mappls distance: X.XX km"

**Step 4: Compare with Google Maps**
1. Copy user coordinates
2. Copy cafe coordinates
3. Open Google Maps
4. Get directions between the two points
5. Compare distances

---

## 🛠️ Common Fixes

### Fix 1: Clear Cache
```javascript
// In browser console:
localStorage.clear()
location.reload()
```

### Fix 2: Test with Known Locations

**User Location:**
- Koramangala, Bangalore: `12.9352, 77.6245`
- Connaught Place, Delhi: `28.6315, 77.2167`
- Gateway of India, Mumbai: `18.9220, 72.8347`

**Test these in the search:**
1. Type exact names
2. Should get results within 1 second
3. Results should show correct addresses

### Fix 3: Check API Rate Limits

If you're testing a lot:
1. Wait 60 seconds
2. Try again
3. API has rate limits (usually 60 requests/minute)

---

## 📋 Checklist

Before reporting an issue:

**Location Search:**
- [ ] Typed location in search box
- [ ] Waited 1-2 seconds
- [ ] Checked console for logs
- [ ] Checked Network tab for API calls
- [ ] Tried different location names
- [ ] Tested on /test-mappls page

**Distance Calculation:**
- [ ] Set user location properly
- [ ] Checked userCoords in localStorage
- [ ] Opened cafe detail page
- [ ] Checked console logs
- [ ] Distance shows on page
- [ ] Distance matches Google Maps (±0.5 km)

**API Issues:**
- [ ] Checked Network tab for errors
- [ ] Checked Console for error messages
- [ ] Verified API key is correct
- [ ] Tried after clearing cache
- [ ] Tested on /test-mappls page

---

## 📸 What Success Looks Like

### Location Search Working:
```
Console:
🔍 Searching with Mappls: Koramangala
📍 Found 8 Mappls results
✅ Selected location from Mappls: Koramangala, Bangalore

UI:
✓ Dropdown shows suggestions
✓ Can select a location
✓ Redirects to /discover
```

### Distance Calculation Working:
```
Console:
🚗 Calculating distance from 12.9352,77.6245 to 12.9400,77.6300
✅ Mappls distance: 2.34 km

UI:
✓ Shows "2.3 km away" on cafe card
✓ Shows distance in cafe header
✓ Matches Google Maps distance
```

---

## 🚨 If Still Not Working

### Emergency Fallback

If Mappls API is completely down or not responding:

**Option 1: Use Old Geocoding (Temporary)**
1. Location page will still work with Nominatim/BigDataCloud
2. Distance will use haversine (straight-line) instead of driving
3. Less accurate but functional

**Option 2: Contact Mappls Support**
1. Verify API key is active
2. Check if domain is whitelisted
3. Confirm API quota/limits

**Option 3: Test with Different Network**
1. Try on mobile data (not WiFi)
2. Try incognito/private mode
3. Try different browser
4. Could be firewall/network blocking API

---

## 📞 Support

**Test Page:** http://localhost:3000/test-mappls
**Expected Response Time:** < 1 second for autosuggest
**Expected Accuracy:** ±0.5 km for distances

**Console Logs to Check:**
- "🔍 Mappls Autosuggest: [query]"
- "📍 Found X Mappls results"
- "🚗 Calculating distance..."
- "✅ Mappls distance: X.XX km"

**If you see:**
- "❌" or error messages → Check Network tab
- No logs at all → Check if function is being called
- "⚠️" warnings → API might be slow but working

---

**Last Updated:** November 7, 2025
**Status:** Ready for Testing
