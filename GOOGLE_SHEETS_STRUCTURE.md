# Google Sheets Structure

## Required Columns (in exact order)

Your Google Sheet must have these columns in this exact order:

| Column | Field Name | Description | Example |
|--------|------------|-------------|---------|
| A | Café Name | Name of the café | "Cafe Sunrise" |
| B | Contact Number (Kafumi) | Private contact for Kafumi | "+91 9876543210" |
| C | Contact Number (Users) | Public contact | "+91 9876543211" |
| D | City | City name | "Bangalore" |
| E | Address | Full address | "123 MG Road, Indiranagar" |
| F | Google Maps Link | Full Google Maps URL | "https://maps.google.com/..." |
| G | Email | Email address | "info@cafe.com" |
| H | Instagram | Instagram handle | "@cafesunrise" |
| I | Facebook | Facebook page | "cafesunrise" |
| J | Website | Website URL | "https://cafe.com" |
| K | Opening Hours | 24hr format | "09:00" |
| L | Closing Hours | 24hr format | "22:00" |
| M | Opening Days | Days open | "Monday-Sunday" |
| N | Average Price Per Person | Numeric value | "500" |
| O | Price Range | Auto-filled from form | "Moderate – ₹300–₹600" |
| P | Pure Veg | Yes/No | "No" |
| Q | Short Description | Brief description | "Artisanal coffee and pastries" |
| R | Purpose | Comma-separated | "Hangout with Friends,Work / Study Alone" |
| S | Ambience Type | Comma-separated | "Modern/Trendy,Quiet & Peaceful" |
| T | Amenities | Comma-separated | "Free Wi-Fi,Charging Ports" |
| U | Food & Drink Types | Comma-separated | "Coffee & Beverages,Desserts & Bakery" |
| V | Menu (JSON) | JSON string of menu sections | See below |
| W | Best 3 Dishes | Comma-separated | "Pizza, Pasta, Tiramisu" |
| X | Cover Image Link | Google Drive link | "https://drive.google.com/..." |
| Y | Photo Links | Pipe-separated (||) | "link1||link2||link3" |
| Z | Menu File Link | Google Drive link | "https://drive.google.com/..." |
| AA | Consent | "yes" or blank | "yes" |
| AB | Submission Date | Auto-filled ISO date | "2024-01-15T10:30:00Z" |
| AC | Rating | **ADMIN FILLS** (0-5) | "4.5" |
| AD | Review Count | **ADMIN FILLS** | "127" |
| AE | Promoter Rating | **ADMIN FILLS** (0-10) | "8" |
| AF | Approved | **ADMIN FILLS** (Yes/No) | "Yes" |
| AG | Date Added | **ADMIN FILLS** | "2024-01-20" |
| AH | Last Updated | **ADMIN FILLS** | "2024-01-25" |

## Menu JSON Format

The menu in column V should be a JSON string in this format:

```json
[
  {
    "sectionName": "Chinese",
    "items": [
      {
        "name": "Fried Rice",
        "type": "Veg",
        "price": "250",
        "recommended": true
      },
      {
        "name": "Manchurian",
        "type": "Veg",
        "price": "180",
        "recommended": false
      }
    ]
  },
  {
    "sectionName": "Italian",
    "items": [
      {
        "name": "Margherita Pizza",
        "type": "Veg",
        "price": "350",
        "recommended": true
      }
    ]
  }
]
```

## Admin Workflow

1. Café owner submits form
2. Data appears in new row in Google Sheets
3. Files are uploaded to Google Drive
4. **ADMIN reviews and fills:**
   - Rating (AC)
   - Review Count (AD)
   - Promoter Rating (AE)
   - Approved = "Yes" (AF)
   - Date Added (AG)
   - Last Updated (AH)
5. Once Approved = "Yes", café appears on website

## Photo Links Format

Column Y (Photo Links) uses double pipes `||` as separator:
```
https://drive.google.com/file/d/xxx/view||https://drive.google.com/file/d/yyy/view||https://drive.google.com/file/d/zzz/view
```

## Important Notes

- **Header Row**: Your Sheet1 should have a header row. Data starts from row 2.
- **Approved Field**: Only cafés with "Yes", "yes", "true", "TRUE", or "1" in column AF will appear on website
- **Empty Fields**: Empty cells are okay for optional fields
- **Menu JSON**: Must be valid JSON. Use a JSON validator if unsure.
