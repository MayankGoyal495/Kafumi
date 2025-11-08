# Image Debugging Guide

## Quick Steps to Fix Image Issues

### 1. Check Server Console
When you start your Next.js server, look for these logs:
```
=== First Cafe Image Debug ===
Raw cover image URL: [URL from spreadsheet]
Converted cover image URL: [Converted URL]
```

### 2. Check Browser Console
Open browser DevTools (F12) and check the Console tab. You should see:
```
Cafe Card Image Debug: { cafeName: "...", originalImage: "...", finalImageSrc: "..." }
```

### 3. Test API Directly
Visit: `http://localhost:3000/api/get-cafes`
- Check if cafes are returned
- Check the `image` field in the response
- Verify the URLs are in the format: `https://drive.google.com/uc?export=view&id=FILE_ID`

### 4. Verify Google Drive URLs
- Make sure images in Google Drive are set to **"Anyone with the link can view"**
- Test a converted URL directly in browser: `https://drive.google.com/uc?export=view&id=YOUR_FILE_ID`

### 5. Check Spreadsheet Columns
- **Column X (index 23)**: Cover Image Link
- **Column Y (index 24)**: Photo Links (separated by `||`)

### 6. Common Issues

#### White Space Instead of Images
- Check browser console for errors
- Verify placeholder.jpg exists in `/public` folder
- Check if image URLs are being converted correctly

#### Images Not Loading
- Google Drive files must be publicly shared
- URLs must be in correct format
- Check CORS errors in browser console

#### Placeholder Always Showing
- Check if Google Drive URLs are being converted
- Verify file IDs are extracted correctly
- Check server console for conversion warnings

## Testing the API

1. **Start your server**: `npm run dev`
2. **Visit**: `http://localhost:3000/api/get-cafes`
3. **Check the response**: Look for the `image` field in each cafe object
4. **Test an image URL**: Copy a converted URL and paste it in a new browser tab

## Expected Image URL Format

```
https://drive.google.com/uc?export=view&id=FILE_ID_HERE
```

If you see a different format, the conversion might have failed.


