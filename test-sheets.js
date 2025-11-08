// Test script to verify Google Sheets API connection
const fs = require('fs');
const { google } = require('googleapis');

// Load .env manually
const envFile = fs.readFileSync('.env', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
});

async function testConnection() {
  console.log('=== Testing Google Sheets API Connection ===\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID ? '✓ Set' : '✗ Missing');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ Set' : '✗ Missing');
  console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✓ Set' : '✗ Missing');
  console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID ? '✓ Set' : '✗ Missing');
  console.log('');
  
  try {
    // Initialize auth
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Test 1: Read sheet to verify access
    console.log('Test 1: Reading sheet...');
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A1:A5',
    });
    console.log('✓ Successfully read sheet');
    console.log('  Rows found:', readResponse.data.values?.length || 0);
    console.log('');
    
    // Test 2: Write test data
    console.log('Test 2: Writing test data...');
    const testData = [['TEST', new Date().toISOString(), 'Auto-generated test entry']];
    const writeResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:Z',
      valueInputOption: 'RAW',
      requestBody: {
        values: testData,
      },
    });
    console.log('✓ Successfully wrote to sheet');
    console.log('  Updates:', writeResponse.data.updates);
    console.log('');
    
    console.log('=== All tests passed! ===');
    console.log('Your Google Sheets API is configured correctly.');
    
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error('Error:', error.message);
    
    if (error.code === 403) {
      console.error('\n❌ Permission Error:');
      console.error('   The service account does not have access to the Google Sheet.');
      console.error('   Please share the sheet with:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
      console.error('   Give it "Editor" permissions.');
    } else if (error.code === 404) {
      console.error('\n❌ Not Found Error:');
      console.error('   The Google Sheet was not found.');
      console.error('   Check that GOOGLE_SHEET_ID is correct.');
    } else {
      console.error('\nFull error details:', error);
    }
  }
}

testConnection();
