# 🔧 Troubleshooting Guide - Location System

## Quick Diagnosis

Run through this checklist to identify your issue:

### 1. Is the search working at all?
- [ ] YES → Go to "Slow Search Issues"
- [ ] NO → Go to "Search Not Working"

### 2. Are you getting any results?
- [ ] YES → Go to "Wrong Results"
- [ ] NO → Go to "No Results Found"

### 3. Is the app loading?
- [ ] YES → Continue
- [ ] NO → Go to "App Won't Start"

---

## 🚫 Search Not Working

### Symptom
Search button doesn't do anything, or page freezes

### Diagnosis
```bash
# Open browser console (F12) and check for errors
# Look for red error messages
```

### Solutions

#### Solution 1: Check API Keys
```bash
# Verify .env.local exists
cat /Users/mayankgoyal/Desktop/Kafumi/3.Kafumi/.env.local

# Should show:
NEXT_PUBLIC_LOCATIONIQ_KEY=pk.cf96657abd995a24465b0c5de034a904
NEXT_PUBLIC_OPENCAGE_KEY=323e8db1b0154a0e84d421ad3ce79299
```

#### Solution 2: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart
cd /Users/mayankgoyal/Desktop/Kafumi/3.Kafumi
npm run dev
```

#### Solution 3: Clear Node Modules
```bash
rm -rf node_modules
rm -rf .next
npm install
npm run dev
```

#### Solution 4: Check Internet Connection
```bash
# Test if APIs are reachable
curl "https://photon.komoot.io/api/?q=Mumbai&limit=1"

# Should return JSON data
```

---

## 🐌 Slow Search Issues

### Symptom
Search takes 10+ seconds or times out

### Diagnosis
Check console logs:
```
🔄 [1/7] Trying LocationIQ...
⏱️ LocationIQ timed out after 15000ms
🔄 [2/7] Trying OpenCage...
```

### Solutions

#### Solution 1: Check Internet Speed
```bash
# Run speed test
# If < 1 Mbps, increase timeout:
```

Edit `lib/geocoding.ts`:
```typescript
const CONFIG = {
  API_TIMEOUT: 25000, // Increase from 15000 to 25000
  // ...
}
```

#### Solution 2: API Key Issues
```javascript
// Check if your API keys are valid
// Visit these dashboards:

LocationIQ: https://locationiq.com/dashboard
OpenCage: https://opencagedata.com/dashboard

// Look for:
// - Key status: Active
// - Quota remaining: > 0
// - No errors or warnings
```

#### Solution 3: Use Faster APIs First
Edit `lib/geocoding.ts` - reorder the APIs:
```typescript
const apiOrder = [
  // Put Photon first (it's usually fastest)
  {
    name: 'Photon',
    enabled: true,
    fetch: () => geocodeWithPhoton(trimmedQuery),
    priority: 1,
  },
  {
    name: 'LocationIQ',
    enabled: !!API_KEYS.LOCATIONIQ,
    fetch: () => geocodeWithLocationIQ(trimmedQuery),
    priority: 2,
  },
  // ...
];
```

---

## 🔍 No Results Found

### Symptom
Search completes but shows "No locations found"

### Diagnosis
```
Console shows:
🔍 Starting enhanced location search for: "xyz"
📡 Will try 7 APIs...
✅ LocationIQ SUCCESS: 0 results
⚠️ OpenCage returned no results
🚫 All geocoding services failed
```

### Solutions

#### Solution 1: Use Better Search Terms
```
❌ Bad: "that place", "near my house", "cafe"
✅ Good: "Koramangala Bangalore", "Connaught Place", "Mumbai"

Tips:
- Include city name
- Use well-known landmarks
- Be specific with area names
- Use English names
```

#### Solution 2: Check If APIs Are Working
```bash
# Test each API manually:

# Test Photon
curl "https://photon.komoot.io/api/?q=Mumbai&limit=1"

# Test LocationIQ (use your key)
curl "https://us1.locationiq.com/v1/search?key=YOUR_KEY&q=Mumbai&format=json&limit=1"

# Test Nominatim
curl "https://nominatim.openstreetmap.org/search?q=Mumbai&format=json&limit=1"
```

If any return empty arrays `[]`, that API doesn't know your location.

#### Solution 3: Try Different Query Formats
```
If "Koramangala" doesn't work, try:
- "Koramangala Bangalore"
- "Koramangala, Bangalore, India"
- "Bangalore Koramangala"
- Just "Bangalore" then select area from dropdown
```

---

## ❌ Wrong Results

### Symptom
Search returns locations but they're in the wrong city/country

### Diagnosis
```
Console shows:
✅ LocationIQ SUCCESS: 10 results
But results show places in USA instead of India
```

### Solutions

#### Solution 1: Add Country Code to APIs
Edit `lib/geocoding.ts`:

```typescript
// In geocodeWithLocationIQ
const url = `https://us1.locationiq.com/v1/search?key=${API_KEYS.LOCATIONIQ}&q=${encodeURIComponent(query)}&format=json&limit=10&countrycode=in&addressdetails=1`;
//                                                                                                                    ^^^^^^^^^^^^^^^^^ Add this

// In geocodeWithMapbox
const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${API_KEYS.MAPBOX}&limit=10&country=IN`;
//                                                                                                                                  ^^^^^^^^^^^^ Add this

// In geocodeWithOpenCage
const url = `https://api.opencagedata.com/geocode/v1/json?key=${API_KEYS.OPENCAGE}&q=${encodeURIComponent(query)}&limit=10&countrycode=in&no_annotations=1`;
//                                                                                                                        ^^^^^^^^^^^^^^^^^ Add this
```

#### Solution 2: Filter Results by Country
Add this to each geocoding function:
```typescript
return data.results
  .filter((result: any) => {
    const country = result.components?.country || result.address?.country || '';
    return country.toLowerCase() === 'india' || country.toLowerCase() === 'in';
  })
  .map((result: any) => {
    // ... existing mapping code
  });
```

---

## 🔐 API Key Errors

### Symptom
Console shows:
```
❌ LocationIQ API key invalid
⚠️ OpenCage rate limit reached
```

### Solutions

#### Invalid API Key
```bash
# 1. Check if key is correct in .env.local
cat .env.local | grep LOCATIONIQ

# 2. Verify on dashboard
# Visit: https://locationiq.com/dashboard
# Check: Key status is "Active"

# 3. Regenerate key if needed
# On dashboard → API Keys → Regenerate

# 4. Update .env.local with new key
nano .env.local
# Update the key, save, restart server
```

#### Rate Limit Reached
```
Option 1: Wait
- LocationIQ: Wait until daily reset (midnight UTC)
- OpenCage: Wait until daily reset (midnight UTC)
- System will automatically skip rate-limited APIs

Option 2: Add More API Keys
- Add Mapbox key (100,000 req/month free)
- Add MapMyIndia key (good for India)

Option 3: Increase Cache Duration
Edit lib/geocoding.ts:
const CONFIG = {
  CACHE_DURATION: 60 * 60 * 1000, // 1 hour instead of 30 min
}
```

---

## 📱 Device Location Not Working

### Symptom
"Use Device Location" button doesn't work or asks for permission repeatedly

### Solutions

#### Solution 1: Check Browser Permissions
```
Chrome:
1. Click lock icon in address bar
2. Check Location permission
3. Set to "Allow"
4. Reload page

Firefox:
1. Click shield icon in address bar
2. Click "Permissions"
3. Enable Location
4. Reload page

Safari:
1. Safari → Preferences → Websites
2. Find Location
3. Set to "Allow" for your site
```

#### Solution 2: Use HTTPS
```bash
# Location API requires HTTPS in production
# In development, localhost works fine

# If deploying, make sure you have HTTPS enabled
```

#### Solution 3: Increase Timeout
Edit `app/location/page.tsx`:
```typescript
navigator.geolocation.getCurrentPosition(
  async (position) => { /* ... */ },
  (error) => { /* ... */ },
  { 
    enableHighAccuracy: true, 
    timeout: 30000, // Increase from 20000 to 30000
    maximumAge: 0 
  }
);
```

---

## 🔄 Caching Issues

### Symptom
Old search results keep showing up, or changes don't appear

### Solutions

#### Solution 1: Clear Browser Cache
```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### Solution 2: Clear Application Cache
```
Chrome:
1. F12 → Application tab
2. Clear storage
3. Check all options
4. Click "Clear site data"

Firefox:
1. F12 → Storage tab
2. Right-click on domain
3. "Delete All"
```

#### Solution 3: Disable Cache During Development
Edit `lib/geocoding.ts`:
```typescript
const CONFIG = {
  CACHE_DURATION: 0, // Disable cache temporarily
  // ... change back to 30 * 60 * 1000 when done testing
}
```

---

## 🌐 Network Issues

### Symptom
Intermittent failures, works sometimes but not others

### Solutions

#### Solution 1: Check Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Try search
4. Look for failed requests (red)
5. Click on failed request
6. Check "Response" tab for error message
```

#### Solution 2: Test API Connectivity
```bash
# Test if you can reach APIs
ping photon.komoot.io
ping nominatim.openstreetmap.org
ping api.bigdatacloud.net

# Test with curl
curl -I https://photon.komoot.io/api/
# Should return: HTTP/1.1 200 OK
```

#### Solution 3: Check Firewall/Proxy
```
If behind corporate firewall:
1. Check if geocoding APIs are blocked
2. Ask IT to whitelist:
   - photon.komoot.io
   - nominatim.openstreetmap.org
   - api.bigdatacloud.net
   - locationiq.com
   - opencagedata.com
```

---

## 💻 App Won't Start

### Symptom
`npm run dev` fails or page shows error

### Solutions

#### Solution 1: Check Node Version
```bash
node --version
# Should be v18 or higher

# If lower, update Node.js
# Visit: https://nodejs.org/
```

#### Solution 2: Clean Install
```bash
# Remove everything and reinstall
rm -rf node_modules
rm -rf .next
rm package-lock.json

npm install
npm run dev
```

#### Solution 3: Check for Port Conflicts
```bash
# If port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### Solution 4: Check for Syntax Errors
```bash
# Validate TypeScript
npm run build

# If errors, check the files mentioned
# Common issues:
# - Missing imports
# - Type errors
# - Missing semicolons
```

---

## 🐛 Advanced Debugging

### Enable Verbose Logging

Edit `lib/geocoding.ts`:
```typescript
// Add at the top of searchLocationsEnhanced function
const DEBUG = true;

// Add throughout the function
if (DEBUG) {
  console.log('🔍 Query:', trimmedQuery);
  console.log('📦 Cache check:', getCachedResults(trimmedQuery));
  console.log('🔑 API keys:', {
    LocationIQ: !!API_KEYS.LOCATIONIQ,
    OpenCage: !!API_KEYS.OPENCAGE,
    Mapbox: !!API_KEYS.MAPBOX,
    MapMyIndia: !!API_KEYS.MAPMYINDIA,
  });
}
```

### Test Individual APIs

```javascript
// In browser console
import { geocodeWithPhoton } from '/lib/geocoding';

// Test each API individually
geocodeWithPhoton('Mumbai').then(results => {
  console.log('Photon results:', results);
});
```

### Monitor API Response Times

```javascript
// Add to each API function
const startTime = performance.now();
const results = await fetch(url);
const endTime = performance.now();
console.log(`⏱️ ${apiName} took ${endTime - startTime}ms`);
```

---

## 📞 Still Need Help?

### Gather This Info

1. **Console Logs**
   - Open F12 → Console
   - Copy all messages (especially errors in red)

2. **Network Requests**
   - Open F12 → Network
   - Filter by "Fetch/XHR"
   - Screenshot failed requests

3. **Environment**
   - Node version: `node --version`
   - Browser: Chrome/Firefox/Safari
   - OS: Mac/Windows/Linux

4. **Search Query**
   - What exactly did you search for?
   - Expected result vs actual result

5. **Config**
   - Which API keys do you have?
   - Any custom modifications to code?

### Common Error Messages Explained

```
"All geocoding services failed"
→ All 7 APIs returned no results
→ Try more specific search term

"Rate limited"
→ Too many requests to that API
→ Wait 1 minute or use different API

"Invalid API key"
→ Check .env.local file
→ Verify key on API dashboard

"Network error"
→ Check internet connection
→ Test API with curl

"Timeout"
→ API took too long to respond
→ Try again or increase timeout
```

---

## ✅ Prevention Tips

1. **Monitor API Usage**
   - Check dashboards weekly
   - Set up usage alerts
   - Track which APIs are used most

2. **Test Regularly**
   - Run test searches daily
   - Check console for warnings
   - Monitor response times

3. **Keep Cache Healthy**
   - Don't set cache duration too high
   - Clear cache if stale data appears
   - Monitor cache hit rate

4. **Update Dependencies**
   ```bash
   npm outdated
   npm update
   ```

5. **Backup API Keys**
   - Save keys in secure location
   - Have backup keys ready
   - Document where they're used

---

**Last Updated:** October 25, 2024  
**Version:** 1.0
