import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? '✓ Set' : '✗ Missing',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ Set' : '✗ Missing',
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? '✓ Set' : '✗ Missing',
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID ? '✓ Set' : '✗ Missing',
  });
}
