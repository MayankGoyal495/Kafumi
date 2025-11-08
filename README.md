# ☕ Kafumi - Café Discovery Platform

Kafumi is an intelligent café discovery platform that helps users find their perfect café match based on mood, ambience, amenities, and more.

## 🎯 Project Purpose

Kafumi automates the café submission process by:
- Collecting café details through a web form
- Automatically saving submissions to **Google Sheets** and **Google Drive**
- Allowing admins to review and approve cafés manually
- Displaying approved cafés dynamically on the website

**No more manual data entry!** Café owners submit, admins approve, and the website updates automatically.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Cloud Service Account (already configured)
- Access to the Google Sheet and Drive folder

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Verify `.env` file exists** (already configured):
   ```env
   GOOGLE_SHEET_ID=1aDLKZ3KjX-JFzP7kEZ3FcvFep8k2KJLRBJiAPn0tASU
   GOOGLE_DRIVE_FOLDER_ID=1jdqq4q9BB9UwT__dG07XjYnB4e5KbqJS
   GOOGLE_SERVICE_ACCOUNT_EMAIL=kafumi-495@kafumi-495.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="..."
   ```

3. **Run the development server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 📋 Features

### For Café Owners
- **Submit Café Form** at `/submit-cafe`
- Upload cover image + 4-5 photos
- Dynamic menu builder with unlimited sections
- Automatic photo and menu file upload to Google Drive
- Instant submission confirmation

### For Users
- **Guided Search**: Answer questions to find your perfect café match
- **Browse All Cafés**: Filter by vibe, amenities, price, rating
- **Random Discovery**: Get surprise café recommendations
- **Café Details**: View menu, photos, contact info, and location
- **Favorites**: Save your favorite cafés

### For Admins
- Review submissions in Google Sheets
- Add ratings, review counts, and promoter ratings
- Approve/reject cafés
- Manual data entry no longer needed!

---

## 🏗️ How It Works

### Submission Flow

```
Café Owner Submits Form
        ↓
Data → Google Sheets (new row)
Files → Google Drive (public links)
        ↓
Admin Reviews & Approves in Sheet
        ↓
Website Automatically Fetches & Displays
```

### Data Structure

See **[GOOGLE_SHEETS_STRUCTURE.md](./GOOGLE_SHEETS_STRUCTURE.md)** for complete column layout.

Key points:
- Form submits to Google Sheets (columns A-AB)
- Admin manually fills columns AC-AH (Rating, Approved, etc.)
- Only cafés with `Approved = "Yes"` appear on website
- Website fetches data every 5 minutes (cached)

---

## 🔧 Project Structure

```
3.Koffista copy 2/
├── app/
│   ├── api/
│   │   ├── submit-cafe/route.ts   # Handles form submissions
│   │   └── get-cafes/route.ts     # Fetches approved cafés
│   ├── submit-cafe/page.tsx       # Café submission form
│   ├── cafe/[id]/page.tsx         # Café detail page
│   ├── guided/                    # Guided search flow
│   ├── browse/                    # Browse all cafés
│   └── random/                    # Random café discovery
├── lib/
│   ├── google-api.ts              # Google Sheets & Drive integration
│   ├── cafe-data-service.ts       # Café data fetching & caching
│   ├── match.ts                   # Matching algorithm (NEW WEIGHTS)
│   └── types.ts                   # TypeScript interfaces
├── components/                    # Reusable UI components
├── .env                          # Environment variables
└── package.json
```

---

## 🧮 Matching Algorithm

Kafumi uses an intelligent matching algorithm with updated weights:

| Category | Weight |
|----------|--------|
| Mood (Purpose) | 20% |
| Ambience | 11% |
| Amenities | 9% |
| Food & Drinks | 12% |
| Price Range | 12% |
| Best Dishes | 12% |
| Rating (0-5) | 11% |
| Promoter Rating (0-10) | 13% |

**Total: 100%**

---

## 📝 Admin Workflow

1. **Café owner submits form** → Data appears in Google Sheets
2. **Admin opens Google Sheets** → Reviews submission
3. **Admin fills:**
   - Rating (column AC): 0-5 stars
   - Review Count (column AD): Number of reviews
   - Promoter Rating (column AE): 0-10 scale
   - Approved (column AF): "Yes" to publish
   - Date Added (column AG)
   - Last Updated (column AH)
4. **Website automatically shows** approved cafés within 5 minutes

---

## 🔗 Important Links

- **Google Sheet**: [View Sheet](https://docs.google.com/spreadsheets/d/1aDLKZ3KjX-JFzP7kEZ3FcvFep8k2KJLRBJiAPn0tASU)
- **Google Drive Folder**: [View Folder](https://drive.google.com/drive/folders/1jdqq4q9BB9UwT__dG07XjYnB4e5KbqJS)
- **Submit Café Form**: `http://localhost:3000/submit-cafe`

---

## 🐛 Troubleshooting

### Form submission fails
- Check Google Service Account has edit access to Sheet
- Verify Drive folder permissions
- Check browser console for errors

### Cafés not appearing on website
- Ensure "Approved" column (AF) = "Yes" (case-insensitive)
- Wait 5 minutes for cache to refresh
- Check API at `/api/get-cafes`

### Photos not showing
- Verify Drive folder permissions are "Anyone with link can view"
- Check photo links in Sheet column Y (separated by ||)

### "Maximum update depth exceeded" error
- Ensure no `useEffect` loops in components
- Check for setState calls in render functions
- Already fixed in current codebase

---

## 🎨 Form Fields

### 1️⃣ Café Details (Mandatory*)
- Café Name*
- Contact Number for Kafumi*
- Contact Number for Users
- City*
- Address*
- Google Maps Link*
- Email, Instagram, Facebook, Website

### 2️⃣ General Details
- Opening & Closing Hours* (24hr)
- Opening Days
- Average Price Per Person*
- Price Range (auto-calculated)
- Pure Veg?* (Yes/No)
- Short Description

### 3️⃣ Ambience & Amenities
- Purpose (max 2)
- Ambience Type (max 3)
- Amenities (any)

### 4️⃣ Food & Drinks
- Type of Food & Drinks*
- **Dynamic Menu Builder**:
  - Add unlimited sections
  - Dishes with name, type (Veg/Non-Veg/Egg), price
  - Mark up to 5 as recommended
- Best 3 Dishes
- Optional menu file upload

### 5️⃣ Extras
- Cover Image* (for café card)
- 4-5 Photos* (ambience/food)
- Consent Checkbox*

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Backend**: Google Sheets API + Google Drive API
- **Forms**: React Hook Form + Zod
- **State**: React Hooks + localStorage

---

## 🔐 Security Notes

- Service account key is in `.env` (never commit to public repos)
- Google Drive files are made publicly viewable
- Form submissions are rate-limited by Google APIs
- No authentication required for café submissions

---

## 📄 License

Private project for Kafumi.

---

## 🙏 Credits

Built for automating café discovery and submission workflow.

For issues or questions, check the codebase or contact the development team.
