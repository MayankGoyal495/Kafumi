import { NextResponse } from 'next/server';
import { readSheet } from '@/lib/google-api';

export async function GET() {
  try {
    const rows = await readSheet('Sheet1!A2:AH'); // Skip header, read all columns
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data found' });
    }
    
    // Find first approved cafe (column AF = index 31)
    const approvedRow = rows.find((row: any[]) => {
      const approved = row[31]?.toString().toLowerCase();
      return approved === 'yes' || approved === 'true' || approved === '1';
    });
    
    if (!approvedRow) {
      return NextResponse.json({ error: 'No approved cafes found', totalRows: rows.length });
    }
    
    // Log all relevant columns
    const debug = {
      cafeName: approvedRow[0], // Column A
      phone: approvedRow[1], // Column B
      altPhone: approvedRow[2], // Column C
      area: approvedRow[3], // Column D
      address: approvedRow[4], // Column E
      googleMapsLink: approvedRow[5], // Column F
      email: approvedRow[6], // Column G
      instagram: approvedRow[7], // Column H
      facebook: approvedRow[8], // Column I
      website: approvedRow[9], // Column J
      columnK: approvedRow[10], // Column K
      columnL: approvedRow[11], // Column L
      columnM: approvedRow[12], // Column M
      approved: approvedRow[31], // Column AF
      totalColumns: approvedRow.length,
      allColumns: approvedRow.map((val, idx) => ({
        index: idx,
        letter: String.fromCharCode(65 + idx),
        value: val ? val.toString().substring(0, 150) : null,
      })),
    };
    
    return NextResponse.json(debug, { status: 200 });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
