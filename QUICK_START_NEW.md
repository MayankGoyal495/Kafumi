# Kafumi Café Discovery - Quick Start Guide

## 🚀 One Command Setup

```bash
npm install && npm start
```

That's it! The server will start on `http://localhost:3000`

---

## 📱 Key Pages

### For Café Owners
- **Submit Café**: `/submit-cafe`
  - Fill out the comprehensive form
  - Upload cover image and photos
  - Add menu sections dynamically
  - Submissions go directly to Google Sheets

### For Users
- **Home**: `/` - Landing page
- **Browse**: `/browse` - View all cafés
- **Guided Search**: `/guided` - Smart café recommendations
- **Random**: `/random` - Get surprise café suggestions
- **Café Details**: `/cafe/[id]` - View detailed café information

---

## 🔧 Configuration

All configuration is in the `.env` file (already set up):

```env
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 📊 Google Sheet Setup

### Required Columns (in order):

1. **Café Name** (A)
2. **Contact Number (Kafumi)** (B)
3. **Contact Number (Users)** (C)
4. **City** (D)
5. **Address** (E)
6. **Google Maps Link** (F)
7. **Email** (G)
8. **Instagram** (H)
9. **Facebook** (I)
10. **Website** (J)
11. **Opening Hours** (K)
12. **Closing Hours** (L)
13. **Opening Days** (M)
14. **Avg Price Per Person** (N)
15. **Price Range** (O) - Auto-filled
16. **Pure Veg** (P)
17. **Short Description** (Q)
18. **Purpose** (R) - Comma-separated
19. **Ambience Type** (S) - Comma-separated
20. **Amenities** (T) - Comma-separated
21. **Food & Drink Types** (U) - Comma-separated
22. **Menu** (V) - JSON string
23. **Best 3 Dishes** (W) - Comma-separated
24. **Cover Image Link** (X) - Drive link
25. **Photo Links** (Y) - || separated
26. **Menu File Link** (Z) - Drive link
27. **Consent** (AA)
28. **Submission Date** (AB)
29. **Rating** (AC) - **Admin fills** (0-5)
30. **Review Count** (AD) - **Admin fills**
31. **Promoter Rating** (AE) - **Admin fills** (0-10)
32. **Approved** (AF) - **Admin fills** (Yes/No)
33. **Date Added** (AG) - **Admin fills**
34. **Last Updated** (AH) - **Admin fills**

### Admin Workflow

1. New submission appears in the sheet
2. Review the data
3. Add:
   - Rating (0-5)
   - Review Count
   - Promoter Rating (0-10)
   - Set "Approved" to "Yes"
   - Date Added
   - Last Updated

4. Café will automatically appear on the website within 5 minutes

---

## 🎯 Features

### Smart Matching System
The new algorithm uses these weights:
- Mood: 20%
- Ambience: 11%
- Amenities: 9%
- Food & Drinks: 12%
- Price: 12%
- Dishes: 12%
- Rating: 11%
- Promoter Rating: 13%

### Automatic Data Sync
- Submissions → Google Sheets + Drive
- Website ← Google Sheets (cached for 5 min)
- Only approved cafés are shown

### Dynamic Menu Builder
- Unlimited sections (Chinese, Italian, etc.)
- Unlimited dishes per section
- Veg/Non-Veg/Egg indicators
- Price and recommendations
- Recommended dishes (max 5 total)

---

## 🐛 Troubleshooting

### "Cannot connect to Google Sheets"
- Check service account has edit access to the sheet
- Verify `.env` file exists and is correctly formatted
- Ensure Google Sheets API is enabled in Google Cloud Console

### "Files not uploading to Drive"
- Check service account has access to Drive folder
- Verify Drive Folder ID is correct
- Check file size (should be under 10MB per file)

### "Maximum update depth exceeded"
- This has been fixed in the code
- If it occurs, clear browser cache and restart server

### "Cafés not showing on website"
- Check if "Approved" column is set to "Yes" in the sheet
- Wait 5 minutes for cache to refresh
- Try manually refreshing the page

---

## 📝 Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Start production server
npm run start:prod

# Lint code
npm run lint
```

---

## 🔐 Security Notes

- Never commit `.env` to version control (already in `.gitignore`)
- Keep service account credentials secure
- Regularly monitor API usage in Google Cloud Console
- Consider rotating credentials periodically

---

## 📞 Support

For issues or questions:
1. Check `SETUP_GUIDE.md` for detailed documentation
2. Review `TROUBLESHOOTING.md` for common issues
3. Contact Kafumi admin team

---

## 🎨 Customization

### Adding New Fields
1. Update form in `/app/submit-cafe/page.tsx`
2. Update API in `/app/api/submit-cafe/route.ts`
3. Update types in `/lib/types.ts`
4. Update sheet reading in `/app/api/get-cafes/route.ts`
5. Add column to Google Sheet

### Changing Match Weights
Edit weights in `/lib/match.ts` in the `computeCafeMatches` function.

---

Built with ❤️ for Kafumi
