# 🧪 Testing Guide

## How to Test the Complete System

### ✅ Step 1: Verify Environment Setup

1. Check `.env` file exists with correct values
2. Verify Google Service Account has access to:
   - Google Sheet: `1aDLKZ3KjX-JFzP7kEZ3FcvFep8k2KJLRBJiAPn0tASU`
   - Google Drive Folder: `1jdqq4q9BB9UwT__dG07XjYnB4e5KbqJS`

### ✅ Step 2: Start Development Server

```bash
npm start
```

Should start on `http://localhost:3000`

### ✅ Step 3: Test Form Submission

1. **Navigate to**: `http://localhost:3000/submit-cafe`

2. **Fill in the form**:
   - Café Name: "Test Café"
   - Contact Number for Kafumi: "9876543210"
   - City: "Bangalore"
   - Address: "123 Test Street"
   - Google Maps Link: "https://maps.google.com/?q=12.9716,77.5946"
   - Opening Hours: "09:00"
   - Closing Hours: "22:00"
   - Average Price: "500" (should auto-fill price range)
   - Pure Veg: Select one
   - Purpose: Select 1-2
   - Ambience: Select 1-3
   - Amenities: Select any
   - Food & Drinks: Select at least one
   
3. **Add Menu Section**:
   - Section Name: "Test Menu"
   - Add at least one dish with name, type, price
   - Click "Save Section"

4. **Upload Files**:
   - Cover Image: Upload any JPG/PNG
   - Photos: Upload 4-5 images
   - (Menu file is optional)

5. **Check Consent** and click "Submit Café"

6. **Expected Result**:
   - Success toast message appears
   - Form resets
   - No errors in browser console

### ✅ Step 4: Verify Google Sheets

1. Open: https://docs.google.com/spreadsheets/d/1aDLKZ3KjX-JFzP7kEZ3FcvFep8k2KJLRBJiAPn0tASU

2. Check last row has new data:
   - Column A: "Test Café"
   - Column N: "500"
   - Column O: Should show price range
   - Column V: Should have JSON string
   - Column X: Should have Google Drive link
   - Column Y: Should have photo links separated by ||
   - Column AB: Should have timestamp

3. **If data is missing**: Check API logs in terminal

### ✅ Step 5: Verify Google Drive

1. Open: https://drive.google.com/drive/folders/1jdqq4q9BB9UwT__dG07XjYnB4e5KbqJS

2. Check for uploaded files:
   - `cover_[timestamp]_[filename]`
   - `photo_[timestamp]_[filename]` (4-5 files)
   - `menu_[timestamp]_[filename]` (if uploaded)

3. Click a file → Should be publicly viewable

### ✅ Step 6: Admin Approval Process

1. In Google Sheets, for the test café row:
   - Column AC (Rating): Enter "4.5"
   - Column AD (Review Count): Enter "100"
   - Column AE (Promoter Rating): Enter "8"
   - Column AF (Approved): Enter "Yes"
   - Column AG (Date Added): Enter today's date
   - Column AH (Last Updated): Enter today's date

2. Save the sheet

### ✅ Step 7: Verify Website Display

1. **Wait 5 minutes** (or clear cache by restarting server)

2. **Navigate to**: `http://localhost:3000/browse`

3. **Expected Result**:
   - "Test Café" should appear in the list
   - Cover image should display
   - Rating: 4.5 stars
   - Price: ₹500/person

4. **Click on "Test Café"**:
   - Should open detail page
   - All tabs should work: Menu, Vibe, Photos, Contact
   - Photos tab should show all uploaded images
   - Menu should display with correct items
   - Contact info should be correct

### ✅ Step 8: Test Matching Algorithm

1. **Navigate to**: `http://localhost:3000/guided`

2. **Complete the guided search**:
   - Select preferences
   - Submit

3. **Expected Result**:
   - "Test Café" should appear if it matches
   - Match percentage should be calculated
   - Cafés should be sorted by match percentage

### ✅ Step 9: Test API Directly

**Get Cafés API:**
```bash
curl http://localhost:3000/api/get-cafes
```

Expected: JSON response with array of approved cafés

### ✅ Step 10: Test Edge Cases

1. **Unapproved Café**:
   - Set Approved (column AF) to "No"
   - Verify café doesn't appear on website

2. **Missing Photos**:
   - Leave column Y empty
   - Verify "No photos available" message in Photos tab

3. **Invalid Menu JSON**:
   - Put invalid JSON in column V
   - Verify website still loads (menu just empty)

4. **No Cover Image**:
   - Leave column X empty
   - Verify placeholder image or graceful fallback

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to submit café"
**Fix**: Check browser console for exact error. Usually authentication issue.

### Issue: Photos not showing
**Fix**: 
1. Verify Drive folder permissions are "Anyone with link"
2. Check column Y has links separated by ||
3. Try accessing one Drive link directly

### Issue: Menu not displaying
**Fix**:
1. Check column V has valid JSON
2. Use a JSON validator
3. Ensure format matches: `[{"sectionName":"...", "items":[...]}]`

### Issue: Café not appearing after approval
**Fix**:
1. Ensure column AF = "Yes" (exact, case-insensitive)
2. Wait 5 minutes or restart server
3. Check `/api/get-cafes` response

### Issue: Match percentage always 0%
**Fix**:
1. Ensure promoter rating is filled (column AE)
2. Check rating is between 0-5 (column AC)
3. Verify preferences match café attributes

---

## 📊 Test Data Template

Use this as a test submission:

```
Café Name: The Coffee Lab
Contact (Kafumi): 9876543210
Contact (Users): 9876543211
City: Bangalore
Address: 456 Indiranagar, 100 Feet Road
Google Maps: https://maps.google.com/?q=12.9716,77.5946
Email: info@coffeelab.com
Instagram: @thecoffeelab
Opening: 08:00
Closing: 23:00
Days: Monday-Sunday
Avg Price: 450
Pure Veg: No
Description: Modern café with artisanal coffee
Purpose: Work / Study Alone, Hangout with Friends
Ambience: Modern/Trendy, Quiet & Peaceful
Amenities: Free Wi-Fi, Charging Ports, Parking
Food Types: Coffee & Beverages, Desserts & Bakery
Menu Section: Beverages
  - Cappuccino, Veg, 180, Recommended
  - Latte, Veg, 200, Recommended
  - Cold Brew, Veg, 220
Best Dishes: Cappuccino, Latte, Tiramisu
```

Then as admin:
```
Rating: 4.7
Review Count: 245
Promoter Rating: 9
Approved: Yes
```

---

## ✨ Success Criteria

System is working correctly if:
- ✅ Form submits without errors
- ✅ Data appears in Google Sheets
- ✅ Files upload to Google Drive
- ✅ Approved cafés appear on website
- ✅ Photos display correctly
- ✅ Menu displays correctly
- ✅ Matching algorithm works
- ✅ No "Maximum update depth" errors
- ✅ Website is responsive and fast
