# Google OAuth Setup Guide

## Overview
This project uses:
- **OAuth 2.0** for Google Drive file uploads (user context)
- **Service Account** for Google Sheets operations (server context)

## Setup Steps

### 1️⃣ Add OAuth credentials to `.env.local`

```bash
# Google OAuth2 Credentials (for Drive uploads)
GOOGLE_CLIENT_ID=662698599545-bg7fkre3itqd1c86sc2lrmjge75iijrr.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost

# Keep your existing service account credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-spreadsheet-id
```

### 2️⃣ Generate refresh token

Run the token generator script:

```bash
node scripts/getGoogleToken.js
```

This will:
1. Print an authorization URL
2. Open that URL in your browser
3. Sign in with your Google account
4. Authorize the app
5. Copy the authorization code from the redirect URL (after `code=`)
6. Paste the code into the terminal
7. The script will output your `GOOGLE_REFRESH_TOKEN`

### 3️⃣ Add refresh token to `.env.local`

Copy the refresh token from the script output and add it to `.env.local`:

```bash
GOOGLE_REFRESH_TOKEN=1//0abcdefg...
```

### 4️⃣ Ensure the folder is accessible

Make sure your Google account has access to the shared drive folder:
- Folder ID: `16jeLlKwSelSyhPq3KTFkXmBXOP6Ie0Jx`

### 5️⃣ Restart the dev server

```bash
npm run dev
```

## How It Works

- **Drive uploads**: Uses OAuth 2.0 with refresh token (user's Drive quota)
- **Sheets operations**: Uses service account (no quota issues)
- All file uploads go to folder: `16jeLlKwSelSyhPq3KTFkXmBXOP6Ie0Jx`

## Testing

Submit a cafe form with images at: http://localhost:3000/submit-cafe

Files will be uploaded to the shared drive and links saved to your Google Sheet.
