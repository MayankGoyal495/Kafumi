import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet, uploadToDrive } from '@/lib/google-api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Submit Cafe API Called ===');
    const formData = await request.formData();

    // Extract form fields
    const cafeData = {
      cafeName: formData.get('cafeName') as string,
      contactNumberKafumi: formData.get('contactNumberKafumi') as string,
      contactNumberUsers: formData.get('contactNumberUsers') as string,
      city: formData.get('city') as string,
      address: formData.get('address') as string,
      googleMapsLink: formData.get('googleMapsLink') as string,
      email: formData.get('email') as string,
      instagram: formData.get('instagram') as string,
      facebook: formData.get('facebook') as string,
      website: formData.get('website') as string,
      openingHours: formData.get('openingHours') as string,
      closingHours: formData.get('closingHours') as string,
      openingDays: formData.get('openingDays') as string,
      avgPricePerPerson: formData.get('avgPricePerPerson') as string,
      priceRange: formData.get('priceRange') as string,
      pureVeg: formData.get('pureVeg') as string,
      shortDescription: formData.get('shortDescription') as string,
      purpose: formData.get('purpose') as string,
      ambienceType: formData.get('ambienceType') as string,
      amenities: formData.get('amenities') as string,
      foodDrinkTypes: formData.get('foodDrinkTypes') as string,
      menu: formData.get('menu') as string, // JSON string
      best3Dishes: formData.get('best3Dishes') as string,
      consent: formData.get('consent') as string,
    };

    // Handle file uploads
    const coverImage = formData.get('coverImage') as File;
    const photos = formData.getAll('photos') as File[];
    const menuFiles = formData.getAll('menuFile') as File[];

    let coverImageLink = '';
    const photoLinks: string[] = [];
    const menuFileLinks: string[] = [];

    // Upload cover image
    if (coverImage) {
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const result = await uploadToDrive(
        buffer,
        `cover_${Date.now()}_${coverImage.name}`,
        coverImage.type
      );
      coverImageLink = result.link || '';
    }

    // Upload photos
    for (const photo of photos) {
      if (photo && photo.size > 0) {
        const buffer = Buffer.from(await photo.arrayBuffer());
        const result = await uploadToDrive(
          buffer,
          `photo_${Date.now()}_${photo.name}`,
          photo.type
        );
        photoLinks.push(result.link || '');
      }
    }

    // Upload menu files if provided
    for (const menuFile of menuFiles) {
      if (menuFile && menuFile.size > 0) {
        const buffer = Buffer.from(await menuFile.arrayBuffer());
        const result = await uploadToDrive(
          buffer,
          `menu_${Date.now()}_${menuFile.name}`,
          menuFile.type
        );
        menuFileLinks.push(result.link || '');
      }
    }

    // Prepare row data for Google Sheets
    const rowData = [
      cafeData.cafeName,
      cafeData.contactNumberKafumi,
      cafeData.contactNumberUsers,
      cafeData.city,
      cafeData.address,
      cafeData.googleMapsLink,
      cafeData.email,
      cafeData.instagram,
      cafeData.facebook,
      cafeData.website,
      cafeData.openingHours,
      cafeData.closingHours,
      cafeData.openingDays,
      cafeData.avgPricePerPerson,
      cafeData.priceRange,
      cafeData.pureVeg,
      cafeData.shortDescription,
      cafeData.purpose,
      cafeData.ambienceType,
      cafeData.amenities,
      cafeData.foodDrinkTypes,
      cafeData.menu, // JSON string of menu
      cafeData.best3Dishes,
      coverImageLink,
      photoLinks.join('||'), // Separate links with ||
      menuFileLinks.join('||'),
      cafeData.consent,
      new Date().toISOString(), // Submission date
      '', // Rating (admin fills)
      '', // Review count (admin fills)
      '', // Promoter Rating (admin fills)
      '', // Approved (admin fills)
      '', // Date Added (admin fills)
      '', // Last Updated (admin fills)
    ];

    // Append to Google Sheet
    console.log('=== Attempting to append to Google Sheet ===');
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);
    console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('Row data length:', rowData.length);

    const sheetResult = await appendToSheet([rowData]);
    console.log('=== Successfully appended to sheet ===', sheetResult);

    return NextResponse.json({
      success: true,
      message: 'Café submitted successfully!',
    });
  } catch (error) {
    console.error('=== ERROR in Submit Cafe API ===');
    console.error('Error submitting cafe:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit café. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Next.js App Router automatically handles FormData
// No need for bodyParser config
