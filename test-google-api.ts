/**
 * Test script for Google Sheets and Drive API connection
 * Run with: node --loader ts-node/esm test-google-api.ts
 */

import { readSheet, appendToSheet } from './lib/google-api';

async function testConnection() {
  console.log('🧪 Testing Google API Connection...\n');

  try {
    // Test 1: Read from sheet
    console.log('📖 Test 1: Reading from Google Sheets...');
    const data = await readSheet('Sheet1!A1:C2');
    console.log('✅ Successfully read data:');
    console.log(data);
    console.log();

    // Test 2: Check environment variables
    console.log('🔍 Test 2: Checking environment variables...');
    console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID ? '✅ Set' : '❌ Missing');
    console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID ? '✅ Set' : '❌ Missing');
    console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
    console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
    console.log();

    console.log('✨ All tests passed! API connection is working.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure .env file exists and contains all required variables');
    console.log('2. Verify service account email has access to the Sheet and Drive folder');
    console.log('3. Check that Sheet ID and Drive Folder ID are correct');
    console.log('4. Ensure Google Sheets API and Drive API are enabled in Google Cloud Console');
  }
}

testConnection();
