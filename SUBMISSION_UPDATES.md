# Cafe Submission System Updates

## Changes Implemented

### 1. Get Directions Button Update
**Location:** Cafe Detail Page (`app/cafe/[id]/page.tsx`)

**Change:** The "Get Directions" button now uses the Google Maps link stored in the spreadsheet (Column F) instead of generating coordinates dynamically.

**Implementation:**
- Updated the button to use `cafe.contact.googleMapsLink` if available
- Falls back to coordinates-based URL if Google Maps link is not provided
- Added `googleMapsLink` field to the Contact type in `lib/types.ts`
- Updated API route (`app/api/get-cafes/route.ts`) to read Google Maps link from Column F

**Result:** Users will be redirected to the exact Google Maps location provided by the cafe owner.

---

### 2. Dish Descriptions in Submit Cafe
**Location:** Submit Cafe Page (`app/submit-cafe/page.tsx`)

**Change:** Added description field for each dish in the menu builder.

**Implementation:**
- Added `description: string` field to the `MenuItem` interface
- Added a Textarea input for each dish item in the menu builder
- Description is optional and allows cafe owners to add details about each dish
- Descriptions are saved in the menu JSON (Column V)

**Result:** Cafe owners can now add detailed descriptions for each dish if they want.

---

### 3. Editable Sections After Approval
**Location:** Submit Cafe Page (`app/submit-cafe/page.tsx`)

**Change:** Sections can now be edited after being saved, allowing users to fix mistakes.

**Implementation:**
- Added `editingSectionIndex` state to track which section is being edited
- Added "Edit" and "Delete" buttons for each saved section
- When editing, the section is loaded back into the form with all its data
- "Save Section" button changes to "Update Section" during editing
- Added "Cancel Edit" button to abort editing
- Smooth scroll to menu builder when editing a section

**Features:**
- ✅ Edit any saved section
- ✅ Delete any saved section
- ✅ Visual indication when editing (button changes to "Update Section")
- ✅ Cancel editing without losing changes
- ✅ All dish details (name, description, type, price, recommended) are preserved

**Result:** Users can now edit their menu sections if they made a mistake, without having to start over.

---

### 4. Best 3 Dishes Dropdown
**Location:** Submit Cafe Page (`app/submit-cafe/page.tsx`)

**Change:** Best 3 dishes are now selected from a dropdown populated with all dishes from the menu.

**Implementation:**
- Replaced text input with three separate dropdown Select components
- Added `getAllDishNames()` function to extract all dish names from menu sections
- Used shadcn/ui Select component for better UX
- Each of the 3 best dishes has its own labeled dropdown
- Dropdowns are automatically populated as menu sections are added

**Result:** Cafe owners can only select dishes they've already added to their menu, ensuring consistency.

---

### 5. Contact Tab - Show Only User Contact
**Location:** Cafe Detail Page (`app/cafe/[id]/page.tsx`)

**Status:** Already implemented correctly

**Current Behavior:**
- Contact tab displays "Contact Information" heading
- Shows the public phone number (contactNumberUsers - Column C)
- Email, website, and social media links are displayed
- The private Kafumi contact number (Column B) is NOT shown to users

**Note:** The contact section correctly shows only the user-facing contact information. The Kafumi-only contact number is stored in Column B but is never displayed on the website.

---

## File Changes Summary

### Modified Files:
1. **`app/cafe/[id]/page.tsx`**
   - Updated Get Directions button to use `cafe.contact.googleMapsLink`

2. **`lib/types.ts`**
   - Added `googleMapsLink?: string` to Contact interface

3. **`app/api/get-cafes/route.ts`**
   - Added mapping for Google Maps link from Column F to contact object

4. **`app/submit-cafe/page.tsx`** (Complete rewrite)
   - Added dish description field (Textarea)
   - Implemented section editing functionality
   - Replaced best dishes text input with 3 Select dropdowns
   - Added Edit/Delete buttons for saved sections
   - Added getAllDishNames() function
   - Improved UI with better labels and helper text
   - Added visual feedback for editing state

### No Changes Needed:
- Contact display is already correct (shows only user contact, not Kafumi contact)

---

## Google Sheets Column Mapping

| Column | Field | Usage |
|--------|-------|-------|
| B | Contact Number (Kafumi) | Private - Only for Kafumi team |
| C | Contact Number (Users) | Public - Shown on cafe page |
| F | Google Maps Link | Used for "Get Directions" button |
| V | Menu (JSON) | Includes dish descriptions |
| W | Best 3 Dishes | Comma-separated, selected from dropdowns |

---

## Testing Checklist

### Get Directions:
- [ ] Click "Get Directions" on cafe page
- [ ] Verify it opens the Google Maps link from the spreadsheet
- [ ] Test with cafe that has no Google Maps link (should use coordinates)

### Dish Descriptions:
- [ ] Add a menu section with dishes
- [ ] Add descriptions to some dishes
- [ ] Verify descriptions are optional
- [ ] Submit form and check if descriptions appear in JSON

### Editable Sections:
- [ ] Add a menu section
- [ ] Click "Edit" on the saved section
- [ ] Verify all fields are populated correctly
- [ ] Make changes and click "Update Section"
- [ ] Verify changes are saved
- [ ] Test "Delete" button

### Best Dishes Dropdown:
- [ ] Add menu sections with dishes
- [ ] Verify dropdowns populate with dish names
- [ ] Select 3 dishes from dropdowns
- [ ] Submit form and verify best dishes are saved

### Contact Display:
- [ ] Open any cafe page
- [ ] Go to Contact tab
- [ ] Verify only public phone number is shown
- [ ] Verify Kafumi contact is NOT visible

---

## User Experience Improvements

1. **Clearer Labels:** Added helper text explaining which contact number is for Kafumi and which is public
2. **Better Error Messages:** Validation messages guide users to fix issues
3. **Visual Feedback:** Editing state is clearly indicated with different button text
4. **Smooth Navigation:** Auto-scroll to menu builder when editing
5. **Data Consistency:** Best dishes can only be selected from menu items
6. **Optional Fields:** Descriptions are clearly marked as optional

---

## Developer Notes

### Dish Descriptions
- Descriptions are stored in the menu JSON (Column V)
- Format: `{ name, type, price, description, recommended }`
- Currently not displayed on frontend (would need to update cafe display page)
- To show descriptions, update the menu display in `app/cafe/[id]/page.tsx`

### Section Editing
- Uses React state to track editing mode
- Deep copies section data to avoid mutations
- Validates all fields before saving
- Smooth UX with clear visual indicators

### Best Dishes
- Uses shadcn/ui Select component
- Dynamically populated from menu sections
- Stored as comma-separated string in Column W
- Currently shows first dish as "Best Dish" in cafe card

---

## Future Enhancements

1. **Display Dish Descriptions:** Update cafe page to show dish descriptions in menu tab
2. **Image Previews:** Show image previews before upload
3. **Drag & Drop:** Allow reordering menu sections
4. **Bulk Import:** Import menu from CSV/Excel file
5. **Real-time Validation:** Show validation errors as user types
