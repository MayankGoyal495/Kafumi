# Kafumi - Café Discovery Platform

A complete café submission and discovery platform that automatically saves submissions to Google Sheets and Google Drive.

## 🚀 Features

- **Café Submission Form**: Comprehensive form for café owners to submit their café details
- **Automatic Google Sheets Integration**: All submissions are saved to Google Sheets
- **Google Drive Storage**: Images and menu files are uploaded to Google Drive
- **Dynamic Menu Builder**: Café owners can add unlimited menu sections and dishes
- **Smart Matching System**: Updated matching algorithm with new weights
- **Real-time Data**: Website fetches café data from Google Sheets automatically

## 📋 Prerequisites

- Node.js 18+ installed
- Google Cloud Service Account with Sheets and Drive API enabled
- Google Sheet and Drive folder ready

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env` file is already configured with your credentials. Make sure it contains:

```env
GOOGLE_SHEET_ID=1aDLKZ3KjX-JFzP7kEZ3FcvFep8k2KJLRBJiAPn0tASU
GOOGLE_DRIVE_FOLDER_ID=1jdqq4q9BB9UwT__dG07XjYnB4e5KbqJS
GOOGLE_SERVICE_ACCOUNT_EMAIL=kafumi-495@kafumi-495.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="..."
```

### 3. Google Sheet Structure

Your Google Sheet should have these columns (in order):

| Column | Field Name | Description |
|--------|------------|-------------|
| A | Café Name | Name of the café |
| B | Contact Number (Kafumi) | Contact for admin |
| C | Contact Number (Users) | Public contact |
| D | City | City location |
| E | Address | Full address |
| F | Google Maps Link | Maps URL |
| G | Email | Email address |
| H | Instagram | Instagram handle |
| I | Facebook | Facebook page |
| J | Website | Website URL |
| K | Opening Hours | Opening time (24hr) |
| L | Closing Hours | Closing time (24hr) |
| M | Opening Days | Days open |
| N | Avg Price Per Person | Average price in ₹ |
| O | Price Range | Auto-calculated range |
| P | Pure Veg | Yes/No |
| Q | Short Description | Brief description |
| R | Purpose | Selected purposes (comma-separated) |
| S | Ambience Type | Selected ambience types |
| T | Amenities | Selected amenities |
| U | Food & Drink Types | Selected types |
| V | Menu | JSON string of menu data |
| W | Best 3 Dishes | Top dishes (comma-separated) |
| X | Cover Image Link | Drive link to cover image |
| Y | Photo Links | Drive links (|| separated) |
| Z | Menu File Link | Drive link to menu file |
| AA | Consent | Yes/No |
| AB | Submission Date | Auto-generated timestamp |
| AC | Rating | Admin fills (0-5) |
| AD | Review Count | Admin fills |
| AE | Promoter Rating | Admin fills (0-10) |
| AF | Approved | Admin fills (Yes/No) |
| AG | Date Added | Admin fills |
| AH | Last Updated | Admin fills |

### 4. Google Drive Permissions

Make sure your Google Drive folder has:
- Service account has edit access
- Folder ID is correctly set in `.env`

### 5. Run the Application

```bash
npm start
```

This will start the development server on http://localhost:3000

## 📝 Usage

### For Café Owners

1. Visit `/submit-cafe` to access the submission form
2. Fill in all required café details
3. Add menu sections and dishes dynamically
4. Upload cover image and 4-5 café photos
5. Submit the form

### For Admins

1. Check Google Sheets for new submissions
2. Review and edit the data
3. Add Rating, Review Count, Promoter Rating
4. Set "Approved" to "Yes" to make it visible on the website
5. Fill in Date Added and Last Updated

### For Users

- All approved cafés are automatically displayed on the website
- Data is fetched from Google Sheets every 5 minutes
- Matching system uses updated weights for better recommendations

## 🎯 Matching System Weights

The new matching algorithm uses these weights:

- **Mood**: 20%
- **Ambience**: 11%
- **Amenities**: 9%
- **Food & Drinks**: 12%
- **Price**: 12%
- **Dishes**: 12%
- **Rating**: 11%
- **Promoter Rating**: 13%

## 🔄 Data Flow

1. **Submission**: Form → API → Google Sheets + Drive
2. **Display**: Website → API → Google Sheets → User

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   ├── submit-cafe/route.ts    # Handles form submissions
│   │   └── get-cafes/route.ts      # Fetches cafés from Sheets
│   ├── submit-cafe/page.tsx        # Submission form page
│   └── ...
├── lib/
│   ├── google-api.ts               # Google Sheets & Drive integration
│   ├── cafe-data-service.ts        # Café data fetching service
│   ├── match.ts                    # Updated matching algorithm
│   └── types.ts                    # TypeScript interfaces
└── .env                            # Environment variables
```

## 🐛 Troubleshooting

### "Maximum update depth exceeded" Error

This error has been prevented by:
- Using proper state management
- Avoiding setState in componentDidUpdate
- Using memoization where needed
- Proper dependency arrays in useEffect

### Images Not Uploading

- Check Drive folder permissions
- Verify service account has access
- Check file size limits (Drive API limits)

### Coordinates Not Extracting

- Ensure Google Maps links are in proper format
- Link should contain coordinates like: `@lat,lng` or `!3dlat!4dlng`

## 📞 Support

For issues or questions, contact the Kafumi admin team.

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep service account credentials secure
- Regularly rotate API keys
- Monitor API usage quotas

## 📈 Future Enhancements

- Real-time data updates using webhooks
- Advanced filtering and search
- User reviews and ratings
- Photo gallery improvements
- Mobile app integration

---

Built with ❤️ for Kafumi
