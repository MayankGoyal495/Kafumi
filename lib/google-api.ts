import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// OAuth2 client for Drive uploads
function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  oauth2Client.setCredentials({ 
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN 
  });
  
  return oauth2Client;
}

// Service account client for Sheets
function getServiceAccountClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

export async function appendToSheet(values: any[][]) {
  try {
    console.log('=== appendToSheet called ===');
    console.log('Values to append:', values.length, 'rows');
    
    const auth = getServiceAccountClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('Attempting to append to spreadsheet:', process.env.GOOGLE_SHEET_ID);
    console.log('Range: Sheet1!A:Z');
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:Z', // Adjust based on your sheet structure
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log('=== Successfully appended to sheet ===');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== ERROR in appendToSheet ===');
    console.error('Error appending to sheet:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
    }
    throw error;
  }
}

export async function readSheet(range: string = 'Sheet1!A:Z') {
  try {
    const auth = getServiceAccountClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error reading sheet:', error);
    throw error;
  }
}

export async function uploadToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) {
  try {
    const auth = getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth });

    const folderId = '16jeLlKwSelSyhPq3KTFkXmBXOP6Ie0Jx';

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    // Get the direct link
    const file = await drive.files.get({
      fileId: response.data.id!,
      fields: 'webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    return {
      id: response.data.id,
      link: file.data.webViewLink || file.data.webContentLink,
    };
  } catch (error) {
    console.error('Error uploading to drive:', error);
    throw error;
  }
}
