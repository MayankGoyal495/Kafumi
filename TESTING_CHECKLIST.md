# Testing Guide for Cafe Submission Updates

## Prerequisites
- Development server running (`npm run dev`)
- Access to Google Sheets with cafe data
- Browser with developer tools open (F12)

---

## Test 1: Get Directions with Google Maps Link

### Setup:
1. Ensure at least one cafe in Google Sheets has a Google Maps link in Column F
2. Example: `https://maps.google.com/maps?q=12.9715987,77.5945627`

### Steps:
1. Navigate to any cafe page (e.g., `/cafe/cafe_1`)
2. Click on "Contact" tab
3. Look for "Get Directions" link under location
4. Click the link

### Expected Results:
✅ Opens the Google Maps link from Column F (not a generated URL)
✅ Shows the exact location from the spreadsheet
✅ If no Google Maps link exists, falls back to coordinates

### Debug:
```javascript
// Check in browser console:
console.log(cafe.contact.googleMapsLink);
// Should show: "https://maps.google.com/..."
```

---

## Test 2: Adding Dish Descriptions

### Steps:
1. Go to Submit Cafe page (`/submit-cafe`)
2. Scroll to "4️⃣ Food & Drinks"
3. Enter section name: "Test Menu"
4. Click "+ Add Dish"
5. Fill in:
   - Dish Name: "Test Dish"
   - Description: "This is a test description for the dish"
   - Type: Veg
   - Price: 100
6. Click "Save Section"

### Expected Results:
✅ Description field is visible and optional
✅ Description can be left empty
✅ Description is saved with the menu item
✅ Section appears in "Added Sections"

### Verify in Console:
```javascript
// Before submitting, check the menu structure:
console.log(JSON.stringify(menuSections));
// Should show:
// [{"sectionName":"Test Menu","items":[{"name":"Test Dish","description":"This is a test description for the dish","type":"Veg","price":"100","recommended":false}]}]
```

---

## Test 3: Editing Saved Sections

### Steps:
1. On Submit Cafe page, add a menu section with 2-3 dishes
2. Click "Save Section"
3. Verify section appears in "Added Sections" list
4. Click the [Edit] button on the section

### Expected Results:
✅ Page scrolls to menu builder
✅ Section name is populated
✅ All dishes are loaded with their details
✅ Button text changes to "Update Section"
✅ "Cancel Edit" button appears

### Continue Testing:
5. Change a dish name
6. Add a description to a dish
7. Change a price
8. Click "Update Section"

### Expected Results:
✅ Changes are saved
✅ Section updates in "Added Sections" list
✅ Form clears and returns to normal state
✅ Button text returns to "Save Section"

### Test Cancel:
9. Click [Edit] again
10. Make some changes
11. Click "Cancel Edit"

### Expected Results:
✅ Changes are discarded
✅ Form clears
✅ Section remains unchanged in "Added Sections"

---

## Test 4: Deleting Sections

### Steps:
1. Add 2-3 menu sections
2. Click [Delete] on the second section
3. Verify section is removed

### Expected Results:
✅ Section is immediately removed from list
✅ Other sections remain intact
✅ Toast notification shows "Section deleted"

---

## Test 5: Best Dishes Dropdown

### Steps:
1. Add menu sections with dishes:
   - Section 1: "Pizza", "Pasta", "Salad"
   - Section 2: "Coffee", "Tea", "Juice"
2. Scroll to "Best 3 Dishes" section
3. Click the first dropdown

### Expected Results:
✅ Dropdown shows all 6 dishes: Pizza, Pasta, Salad, Coffee, Tea, Juice
✅ Dishes are in the order they were added

### Continue:
4. Select "Pizza" from dropdown 1
5. Select "Coffee" from dropdown 2
6. Select "Pasta" from dropdown 3

### Expected Results:
✅ Each dropdown can select different dishes
✅ Same dish can be selected multiple times
✅ Selections are retained

### Edge Case Testing:
7. Delete a section that contains a selected dish
8. Check the dropdowns

### Expected Results:
✅ Dropdowns update to show only remaining dishes
✅ If selected dish was deleted, selection is cleared

---

## Test 6: Contact Display Verification

### Steps:
1. Open any cafe page
2. Go to "Contact" tab
3. Check the phone number displayed

### Expected Results:
✅ Shows contact number from Column C (contactNumberUsers)
✅ Does NOT show Column B (contactNumberKafumi)
✅ Email, website, social links are visible

### Verify in DevTools:
```javascript
// Open browser console on cafe page:
console.log(cafe.contact);
// Should show:
// {
//   phone: "+91 9876543211",  // Column C (User)
//   email: "...",
//   website: "...",
//   googleMapsLink: "...",
//   social: {...}
// }
// Should NOT contain contactNumberKafumi
```

---

## Test 7: Full Form Submission

### Complete Flow:
1. Fill all required fields in sections 1-2
2. Select Purpose, Ambience, Amenities
3. Select Food & Drink Types
4. Add 2-3 menu sections with multiple dishes
5. Select 3 best dishes from dropdowns
6. Upload cover image and photos
7. Check consent checkbox
8. Click "Submit Café"

### Expected Results:
✅ Form submits successfully
✅ Success toast appears
✅ Data is saved to Google Sheets
✅ Menu JSON in Column V includes descriptions
✅ Best dishes in Column W match dropdown selections
✅ Form resets after submission

### Verify in Google Sheets:
- Column V (Menu JSON) should contain descriptions
- Column W (Best 3 Dishes) should show comma-separated values
- Column F (Google Maps Link) should be populated

---

## Test 8: Validation & Error Handling

### Test Empty Section:
1. Enter section name but don't add any dishes
2. Click "Save Section"

**Expected:** ❌ Error: "Please add section name and at least one dish"

### Test Incomplete Dish:
1. Add section name
2. Add dish with name but no price
3. Click "Save Section"

**Expected:** ❌ Error: "All dishes must have a name and price"

### Test Too Many Recommended:
1. Add 6 dishes
2. Mark all as recommended
3. Try to mark 7th as recommended

**Expected:** ❌ Error: "Maximum 5 dishes can be recommended"

### Test Empty Form Submission:
1. Try to submit form with only cafe name
2. Leave other required fields empty

**Expected:** ❌ Browser validation prevents submission

---

## Test 9: Data Persistence

### Steps:
1. Add several menu sections
2. Fill best dishes dropdowns
3. DON'T submit the form
4. Refresh the page

### Expected Results:
❌ Form data is lost (expected behavior - no local storage)
✅ User is aware they need to complete in one session

**Note:** This is intentional to prevent outdated data

---

## Test 10: Mobile Responsiveness

### Steps:
1. Open Submit Cafe page on mobile (or use DevTools responsive mode)
2. Test all interactions:
   - Adding dishes
   - Editing sections
   - Using dropdowns
   - Clicking Edit/Delete buttons

### Expected Results:
✅ All buttons are easily tappable (minimum 44x44px)
✅ Dropdowns work properly
✅ Form scrolls smoothly
✅ Text is readable
✅ No horizontal scroll

---

## Regression Testing

### Ensure Nothing Broke:

**Browse Page:**
- [ ] Cafes still load correctly
- [ ] Images display properly
- [ ] Filters work

**Cafe Detail Page:**
- [ ] All tabs work (Menu, Vibe, Photos, Contact)
- [ ] Menu displays correctly
- [ ] Amenities and vibe tags show
- [ ] Images load

**Search:**
- [ ] Search functionality works
- [ ] Results display correctly

**Other Pages:**
- [ ] Home page loads
- [ ] Guided search works
- [ ] Random cafe works

---

## Performance Testing

### Check Load Times:
1. Open cafe page with network throttling (DevTools → Network → Slow 3G)
2. Measure time to interactive

**Expected:** < 5 seconds on slow connection

### Check Console:
- No errors
- No warnings
- No failed network requests

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Accessibility Testing

### Keyboard Navigation:
1. Tab through the form
2. Use Enter/Space to interact

**Expected:** All interactive elements are keyboard accessible

### Screen Reader:
1. Use screen reader (NVDA/JAWS/VoiceOver)
2. Navigate the form

**Expected:** All labels are announced correctly

---

## Common Issues & Solutions

### Issue: Dropdowns not populating
**Solution:** Ensure menu sections are added first

### Issue: Edit button not working
**Solution:** Check browser console for errors, ensure React state is updating

### Issue: Get Directions goes to coordinates
**Solution:** Verify Column F in Google Sheets has the Maps link

### Issue: Descriptions not saving
**Solution:** Check menu JSON in Column V after submission

### Issue: Best dishes showing deleted items
**Solution:** This is a known limitation - dropdowns don't update when sections are deleted after selection

---

## Final Checklist

Before marking as complete:
- [ ] All 10 tests pass
- [ ] No console errors
- [ ] Data saves to Google Sheets correctly
- [ ] Mobile works properly
- [ ] Regression tests pass
- [ ] Documentation is updated
- [ ] Code is committed with clear messages

---

## Bug Reporting Template

If you find issues:

```
**Bug:** Brief description
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** What should happen
**Actual:** What actually happens
**Browser:** Chrome 120
**Device:** Desktop/Mobile
**Screenshots:** (if applicable)
```
