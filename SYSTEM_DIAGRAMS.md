# System Flow Diagram - Cafe Submission Updates

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      CAFE OWNER                                  │
│  Opens /submit-cafe page → Fills form → Submits                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUBMIT CAFE PAGE (NEW FEATURES)                     │
├─────────────────────────────────────────────────────────────────┤
│  📝 Section 1: Cafe Details                                     │
│     • Name, Contact (Kafumi), Contact (User)                    │
│     • Google Maps Link ← NEW! Used for directions              │
│                                                                  │
│  📝 Section 2: General Details                                  │
│     • Hours, Price, Veg/Non-Veg                                 │
│                                                                  │
│  📝 Section 3: Ambience & Amenities                             │
│     • Purpose, Ambience, Amenities                              │
│                                                                  │
│  📝 Section 4: Food & Drinks (ENHANCED)                         │
│     ┌────────────────────────────────────┐                     │
│     │  Menu Builder                       │                     │
│     │  ├─ Section Name                    │                     │
│     │  └─ Dishes:                         │                     │
│     │     ├─ Name                          │                     │
│     │     ├─ Description ← NEW!           │                     │
│     │     ├─ Type                          │                     │
│     │     ├─ Price                         │                     │
│     │     └─ Recommended                   │                     │
│     │                                      │                     │
│     │  [+ Add Dish] [Save Section]        │                     │
│     └────────────────────────────────────┘                     │
│                                                                  │
│     Saved Sections: ← NEW! Editable                             │
│     ┌─────────────────────────────────┐                        │
│     │ Chinese (5 dishes)              │                        │
│     │            [Edit] [Delete] ←NEW!│                        │
│     └─────────────────────────────────┘                        │
│                                                                  │
│     Best 3 Dishes: ← NEW! Dropdowns                             │
│     [Dropdown 1 ▼] [Dropdown 2 ▼] [Dropdown 3 ▼]               │
│                                                                  │
│  📝 Section 5: Photos & Consent                                 │
│     • Cover, Photos, Menu File                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Form Submit
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTE                                     │
│                  /api/submit-cafe                                │
├─────────────────────────────────────────────────────────────────┤
│  1. Receive FormData                                             │
│  2. Extract all fields                                           │
│  3. Upload files to Google Drive                                 │
│     • Cover image                                                │
│     • 4-5 photos                                                 │
│     • Menu file (optional)                                       │
│  4. Prepare row data                                             │
│  5. Append to Google Sheets                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GOOGLE SHEETS                                  │
├─────────────────────────────────────────────────────────────────┤
│  Column A: Cafe Name                                             │
│  Column B: Contact (Kafumi) ← Private                           │
│  Column C: Contact (User) ← Public                              │
│  Column F: Google Maps Link ← NEW! Used for directions         │
│  Column V: Menu JSON ← Includes descriptions                    │
│  Column W: Best 3 Dishes ← From dropdowns                       │
│  Column AF: Approved ← Admin sets to "Yes"                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Admin Approves
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTE                                     │
│                  /api/get-cafes                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. Read Sheet1 (rows 2+)                                        │
│  2. Filter where Approved = "Yes"                                │
│  3. Map columns to Cafe type                                     │
│  4. Add googleMapsLink to contact ← NEW!                        │
│  5. Parse menu JSON (with descriptions)                          │
│  6. Return cafe data                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAFE PAGE                                     │
│              /cafe/[id]/page.tsx                                 │
├─────────────────────────────────────────────────────────────────┤
│  Header: Name, Rating, Location                                 │
│                                                                  │
│  Tabs:                                                           │
│  ├─ Menu: Shows all dishes (descriptions ready but hidden)      │
│  ├─ Vibe: Purpose, Ambience, Amenities                          │
│  ├─ Photos: Gallery                                             │
│  └─ Contact:                                                     │
│      ├─ Location & Directions                                    │
│      │   [Get Directions] ← NEW! Uses googleMapsLink           │
│      ├─ Contact Information                                      │
│      │   Phone: Contact (User) only ← Column C                  │
│      │   Email, Website                                          │
│      └─ Social Media                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Interaction Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                  MENU BUILDER WORKFLOW                         │
└───────────────────────────────────────────────────────────────┘

START
  │
  ├─ Enter Section Name ("Chinese")
  │
  ├─ Click [+ Add Dish]
  │   │
  │   ├─ Fill Dish 1
  │   │   ├─ Name: "Fried Rice"
  │   │   ├─ Description: "Traditional fried rice" ← NEW!
  │   │   ├─ Type: Veg
  │   │   ├─ Price: 180
  │   │   └─ Recommended: Yes
  │   │
  │   ├─ Click [+ Add Dish]
  │   │
  │   └─ Fill Dish 2, 3, etc.
  │
  ├─ Click [Save Section]
  │   │
  │   └─ Section saved to menuSections array
  │       │
  │       └─ Displayed in "Added Sections" with [Edit] [Delete]
  │
  ├─ OPTION A: Continue adding sections
  │   │
  │   └─ Repeat process for "Italian", "Beverages", etc.
  │
  └─ OPTION B: Edit existing section ← NEW!
      │
      ├─ Click [Edit] on "Chinese" section
      │   │
      │   ├─ Form loads with all data
      │   ├─ editingSectionIndex = 0
      │   └─ Button changes to [Update Section]
      │
      ├─ Modify data
      │   ├─ Change price
      │   ├─ Add/edit descriptions
      │   └─ Add/remove dishes
      │
      └─ Click [Update Section]
          │
          └─ Changes saved, form clears

AFTER ALL SECTIONS ADDED:
  │
  ├─ Best Dishes Dropdowns appear ← NEW!
  │   │
  │   ├─ Dropdown 1: Lists all dishes
  │   ├─ Dropdown 2: Lists all dishes
  │   └─ Dropdown 3: Lists all dishes
  │
  └─ Select 3 dishes → Save in state → Submit form
```

---

## State Management Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT STATE                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  menuSections: MenuSection[] ← Saved sections               │
│    ├─ [0] { sectionName: "Chinese", items: [...] }         │
│    ├─ [1] { sectionName: "Italian", items: [...] }         │
│    └─ [2] { sectionName: "Beverages", items: [...] }       │
│                                                              │
│  currentSection: MenuSection ← Being edited                 │
│    ├─ sectionName: "Chinese"                                │
│    └─ items: [                                              │
│          { name: "Fried Rice", description: "...", ... },   │
│          { name: "Manchurian", description: "...", ... }    │
│        ]                                                     │
│                                                              │
│  editingSectionIndex: number | null ← Tracking edits        │
│    ├─ null: Adding new section                              │
│    └─ 0, 1, 2: Editing section at index                     │
│                                                              │
│  bestDish1/2/3: string ← Dropdown selections                │
│    ├─ bestDish1: "Fried Rice"                               │
│    ├─ bestDish2: "Margherita Pizza"                         │
│    └─ bestDish3: "Cappuccino"                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘

OPERATIONS:

addOrUpdateSection():
  if editingSectionIndex === null:
    menuSections.push(currentSection)  // Add new
  else:
    menuSections[editingSectionIndex] = currentSection  // Update
  
  currentSection = { sectionName: '', items: [] }  // Clear
  editingSectionIndex = null  // Reset

editSection(index):
  currentSection = menuSections[index]  // Load data
  editingSectionIndex = index  // Mark as editing
  scroll to menu builder  // UX

deleteSection(index):
  menuSections.splice(index, 1)  // Remove

getAllDishNames():
  return menuSections
    .flatMap(section => section.items)
    .map(item => item.name)
    .filter(name => name.trim())
```

---

## Data Transformation Flow

```
USER INPUT → REACT STATE → API → GOOGLE SHEETS → API → FRONTEND

┌─────────────────┐
│  USER ENTERS:   │
│  Name: "Pizza"  │
│  Desc: "Yummy"  │
│  Type: Veg      │
│  Price: 350     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  REACT STATE:               │
│  {                          │
│    name: "Pizza",           │
│    description: "Yummy",    │
│    type: "Veg",             │
│    price: "350",            │
│    recommended: false       │
│  }                          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  JSON STRINGIFIED (Column V):       │
│  [{                                  │
│    "sectionName": "Italian",        │
│    "items": [{                       │
│      "name": "Pizza",                │
│      "description": "Yummy",         │
│      "type": "Veg",                  │
│      "price": "350",                 │
│      "recommended": false            │
│    }]                                │
│  }]                                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  API READS & PARSES:                │
│  menuCategories = [{                │
│    name: "Italian",                  │
│    items: [{                         │
│      name: "Pizza",                  │
│      price: 350,                     │
│      description: "",  ← Not mapped │
│      dietaryType: "veg"              │
│    }]                                │
│  }]                                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  DISPLAYED ON CAFE PAGE:    │
│  Italian                     │
│  ├─ Pizza          ₹350     │
│  │   [Veg]                  │
│  └─ (description hidden)    │
└─────────────────────────────┘

NOTE: To show descriptions, update cafe page parsing
```

---

## Contact Data Flow

```
SUBMIT FORM:
  ├─ contactNumberKafumi → Column B (Private)
  └─ contactNumberUsers  → Column C (Public)

API READS:
  contact: {
    phone: row[2] || row[1],  // Column C or B as fallback
    googleMapsLink: row[5],    // Column F ← NEW!
    email: row[6],
    website: row[9],
    social: {
      instagram: row[7],
      facebook: row[8]
    }
  }

CAFE PAGE DISPLAYS:
  Contact Tab:
    └─ Phone: contact.phone (Column C - User number)
    └─ Get Directions: Uses googleMapsLink (Column F)
    
    ❌ Kafumi number (Column B) never exposed
```

---

## Error Handling Flow

```
USER ACTION → VALIDATION → RESULT

Add Section without name:
  │
  ├─ Check: sectionName === ""
  │
  └─ ❌ Toast: "Please add section name"

Add Section without dishes:
  │
  ├─ Check: items.length === 0
  │
  └─ ❌ Toast: "Add at least one dish"

Add Section with incomplete dish:
  │
  ├─ Check: items.some(i => !i.name || !i.price)
  │
  └─ ❌ Toast: "All dishes must have name and price"

Mark 6th dish as recommended:
  │
  ├─ Check: recommendedCount > 5
  │
  └─ ❌ Toast: "Maximum 5 dishes can be recommended"

Valid section:
  │
  ├─ All checks pass
  │
  └─ ✅ Toast: "Section added!"
```

---

## Component Hierarchy

```
SubmitCafePage
│
├─ Card
│  ├─ CardHeader
│  │  └─ Title, Description
│  │
│  └─ CardContent
│     ├─ Form
│     │  ├─ Section 1: Cafe Details
│     │  │  └─ Inputs...
│     │  │
│     │  ├─ Section 2: General Details
│     │  │  └─ Inputs...
│     │  │
│     │  ├─ Section 3: Ambience
│     │  │  └─ Checkboxes...
│     │  │
│     │  ├─ Section 4: Menu Builder ← ENHANCED
│     │  │  ├─ Current Section Form
│     │  │  │  ├─ Input: sectionName
│     │  │  │  ├─ MenuItem Cards[]
│     │  │  │  │  ├─ Input: name
│     │  │  │  │  ├─ Textarea: description ← NEW!
│     │  │  │  │  ├─ Select: type
│     │  │  │  │  ├─ Input: price
│     │  │  │  │  └─ Checkbox: recommended
│     │  │  │  └─ Buttons
│     │  │  │     ├─ [+ Add Dish]
│     │  │  │     └─ [Save/Update Section]
│     │  │  │
│     │  │  ├─ Saved Sections Display ← NEW!
│     │  │  │  └─ Section Cards[]
│     │  │  │     ├─ Name, Count
│     │  │  │     └─ [Edit] [Delete] ← NEW!
│     │  │  │
│     │  │  └─ Best Dishes Selectors ← NEW!
│     │  │     ├─ Select: bestDish1
│     │  │     ├─ Select: bestDish2
│     │  │     └─ Select: bestDish3
│     │  │
│     │  ├─ Section 5: Photos
│     │  │  └─ File Inputs...
│     │  │
│     │  └─ Submit Button
│     │
│     └─ Toast Notifications
│
└─ State Management
   ├─ menuSections
   ├─ currentSection
   ├─ editingSectionIndex ← NEW!
   ├─ bestDish1/2/3 ← NEW!
   └─ Other states...
```

---

**Legend:**
- `←` Arrow: Points to new features
- `├─` Tree: Shows hierarchy
- `✅` Check: Success case
- `❌` Cross: Error case
- `→` Arrow: Data flow direction
