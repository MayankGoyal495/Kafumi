# 📁 Project File Structure

```
3.Koffista copy 2/
│
├── 📄 README.md                        ← START HERE! Complete guide
├── 📄 COMPLETION_SUMMARY.md            ← Quick summary of what's done
├── 📄 PROJECT_STATUS.md                ← Detailed completion status
├── 📄 ADMIN_GUIDE.md                   ← For daily admin use
├── 📄 TESTING_GUIDE.md                 ← How to test everything
├── 📄 GOOGLE_SHEETS_STRUCTURE.md       ← Sheet column reference
│
├── 📄 .env                             ← Google credentials (configured)
├── 📄 package.json                     ← Dependencies (npm start)
├── 📄 tsconfig.json                    ← TypeScript config
├── 📄 next.config.mjs                  ← Next.js config
├── 📄 tailwind.config.ts               ← Tailwind config
│
├── 📂 app/                             ← Main application
│   ├── 📄 layout.tsx                   ← Root layout
│   ├── 📄 page.tsx                     ← Home page
│   ├── 📄 globals.css                  ← Global styles
│   │
│   ├── 📂 submit-cafe/                 ← 🎯 CAFÉ SUBMISSION FORM
│   │   └── 📄 page.tsx                 ← Form with all fields
│   │
│   ├── 📂 api/
│   │   ├── 📂 submit-cafe/             ← 🎯 SUBMISSION API
│   │   │   └── 📄 route.ts             ← Handles form + files
│   │   │
│   │   └── 📂 get-cafes/               ← 🎯 DATA FETCHING API
│   │       └── 📄 route.ts             ← Reads from Sheets
│   │
│   ├── 📂 browse/                      ← Browse all cafés
│   ├── 📂 cafe/[id]/                   ← Café detail page (Photos tab!)
│   ├── 📂 guided/                      ← Guided search
│   ├── 📂 random/                      ← Random discovery
│   └── 📂 ... (other pages)
│
├── 📂 lib/                             ← Core logic
│   ├── 📄 google-api.ts                ← 🎯 Google Sheets + Drive
│   ├── 📄 cafe-data-service.ts         ← 🎯 Data fetching + caching
│   ├── 📄 match.ts                     ← 🎯 Matching algorithm (NEW WEIGHTS)
│   ├── 📄 types.ts                     ← TypeScript interfaces
│   └── 📄 ... (other utilities)
│
├── 📂 components/                      ← Reusable UI components
│   ├── 📂 ui/                          ← shadcn/ui components
│   ├── 📄 header.tsx
│   ├── 📄 navigation.tsx
│   └── 📄 ... (other components)
│
├── 📂 public/                          ← Static assets
│   └── 📄 ... (images, icons)
│
└── 📂 node_modules/                    ← Dependencies (auto-installed)

```

---

## 🎯 Key Files You Need to Know

### **1. For Users/Café Owners**
- **`app/submit-cafe/page.tsx`** - The submission form
  - Visit: `http://localhost:3000/submit-cafe`

### **2. For Admins**
- **Google Sheets** - Review and approve submissions
  - Link: https://docs.google.com/spreadsheets/d/1aDLKZ3KjX-JFzP7kEZ3FcvFep8k2KJLRBJiAPn0tASU
- **Google Drive** - View uploaded files
  - Link: https://drive.google.com/drive/folders/1jdqq4q9BB9UwT__dG07XjYnB4e5KbqJS

### **3. For Developers**
- **`lib/google-api.ts`** - All Google integration code
- **`app/api/submit-cafe/route.ts`** - Form submission handler
- **`app/api/get-cafes/route.ts`** - Data fetching from Sheets
- **`lib/match.ts`** - Matching algorithm with new weights
- **`lib/cafe-data-service.ts`** - Data service with caching

### **4. Documentation**
- **`README.md`** - Complete project guide
- **`ADMIN_GUIDE.md`** - Quick admin reference
- **`TESTING_GUIDE.md`** - Testing instructions
- **`GOOGLE_SHEETS_STRUCTURE.md`** - Sheet column layout

---

## 🔧 Configuration Files

### `.env` (Environment Variables)
```env
GOOGLE_SHEET_ID=1aDLKZ3KjX-JFzP7kEZ3FcvFep8k2KJLRBJiAPn0tASU
GOOGLE_DRIVE_FOLDER_ID=1jdqq4q9BB9UwT__dG07XjYnB4e5KbqJS
GOOGLE_SERVICE_ACCOUNT_EMAIL=kafumi-495@kafumi-495.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="..." (already configured)
```

### `package.json` (Commands)
```json
{
  "scripts": {
    "start": "next dev",      ← Run this!
    "build": "next build",
    "dev": "next dev"
  }
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CAFÉ SUBMISSION FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. Café Owner
   └─► app/submit-cafe/page.tsx
       └─► Fills form with all details
           └─► Clicks "Submit"

2. Form Data
   └─► app/api/submit-cafe/route.ts
       ├─► Text Data ──────────► Google Sheets (appendToSheet)
       │                         ├─► Columns A-AB filled
       │                         └─► Columns AC-AH empty (admin)
       │
       └─► Files ──────────────► Google Drive (uploadToDrive)
           ├─► Cover image
           ├─► 4-5 photos
           └─► Menu file (optional)
           │
           └─► Links stored in Sheet columns X, Y, Z

3. Admin Reviews
   └─► Opens Google Sheets
       └─► Fills columns AC-AH
           ├─► AC: Rating
           ├─► AD: Review Count
           ├─► AE: Promoter Rating
           ├─► AF: Approved = "Yes" ← KEY!
           ├─► AG: Date Added
           └─► AH: Last Updated

4. Website Fetches
   └─► app/api/get-cafes/route.ts
       └─► readSheet() from Google Sheets
           └─► Filters: Approved = "Yes"
               └─► Returns JSON

5. Users See
   └─► app/browse/page.tsx or app/cafe/[id]/page.tsx
       └─► Displays café with all data
           ├─► Photos in Photos tab
           ├─► Menu from JSON
           └─► All details from Sheet
```

---

## 🎨 UI Components Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE FLOW                       │
└─────────────────────────────────────────────────────────────┘

Home Page (/)
├─► Guided Search (/guided)
│   └─► Match Results (uses lib/match.ts)
│       └─► Café Detail (/cafe/[id])
│
├─► Browse All (/browse)
│   └─► Filter & Search
│       └─► Café Detail (/cafe/[id])
│
└─► Random Discovery (/random)
    └─► Surprise Café
        └─► Café Detail (/cafe/[id])

Café Detail Page (/cafe/[id])
├─► Menu Tab (shows dynamic menu)
├─► Vibe Tab (shows ambience, purpose)
├─► Photos Tab (shows all uploaded photos) ← NEW!
└─► Contact Tab (shows contact info)

Submit Café (/submit-cafe)
└─► Form with all fields
    └─► Success → Redirects to home
```

---

## 🔑 Important Files Explained

### **lib/google-api.ts**
Contains 3 main functions:
- `appendToSheet(values)` - Adds row to Google Sheet
- `readSheet(range)` - Reads data from Google Sheet
- `uploadToDrive(file, name, type)` - Uploads file to Drive

### **lib/cafe-data-service.ts**
- `getCafes()` - Fetches all approved cafés
- `getCafeById(id)` - Gets single café
- `searchCafes(query)` - Searches cafés
- Includes 5-minute caching

### **lib/match.ts**
- `computeCafeMatches(preferences)` - Main matching function
- Uses new weights (Mood 20%, Ambience 11%, etc.)
- Returns sorted match results

### **app/api/submit-cafe/route.ts**
1. Receives form data
2. Uploads files to Drive
3. Prepares row data
4. Appends to Sheet
5. Returns success/error

### **app/api/get-cafes/route.ts**
1. Reads from Sheet
2. Filters approved cafés (column AF = "Yes")
3. Parses menu JSON
4. Parses photo links
5. Returns JSON with all cafés

---

## 📦 Dependencies (package.json)

### Key Packages
- **Next.js 14** - React framework
- **googleapis** - Google Sheets & Drive API
- **React Hook Form** - Form handling
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Zod** - Validation
- **TypeScript** - Type safety

---

## 🚀 Quick Commands

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm start

# Build for production
npm run build

# Lint code
npm run lint
```

---

## ✅ Everything is Connected

```
.env → lib/google-api.ts → APIs → Google Sheets/Drive
         ↓                          ↓
    Form submits              Admin approves
         ↓                          ↓
    Data stored              Website fetches
         ↓                          ↓
    Success message          Users see cafés
```

---

**This project is fully integrated and working!** 🎉

All files are in place, all connections are working, and everything is documented.

Ready to use with just `npm start`! 🚀
