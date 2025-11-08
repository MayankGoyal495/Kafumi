import { NextResponse } from 'next/server';
import { readSheet } from '@/lib/google-api';
import { Cafe } from '@/lib/types';

function convertGoogleDriveUrl(url: string): string {
  if (!url || url.trim() === '') return '';
  
  const trimmedUrl = url.trim();
  
  // If it's already a direct image URL (not Google Drive), return it
  if (trimmedUrl.startsWith('http') && !trimmedUrl.includes('drive.google.com') && !trimmedUrl.includes('googleusercontent.com')) {
    return trimmedUrl;
  }
  
  // If it's already in the correct format, return it
  if (trimmedUrl.includes('drive.google.com/thumbnail?id=') ||
      trimmedUrl.includes('drive.google.com/uc?export=view&id=')) {
    return trimmedUrl;
  }
  
  // Extract file ID from various Google Drive URL formats
  let fileId = '';
  
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Format: https://drive.google.com/file/d/FILE_ID/view
  // Format: https://drive.google.com/file/d/FILE_ID
  const viewMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (viewMatch) {
    fileId = viewMatch[1];
  }
  
  // Format: https://drive.google.com/open?id=FILE_ID
  // Format: https://drive.google.com/file/d/FILE_ID?usp=sharing
  if (!fileId) {
    const openMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    fileId = openMatch[1];
    }
  }
  
  // Format: https://drive.google.com/uc?id=FILE_ID
  if (!fileId) {
    const ucMatch = trimmedUrl.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) {
    fileId = ucMatch[1];
    }
  }
  
  // Format: https://docs.google.com/uc?export=download&id=FILE_ID
  if (!fileId) {
    const docsMatch = trimmedUrl.match(/docs\.google\.com\/uc\?export=download[&?]id=([a-zA-Z0-9_-]+)/);
    if (docsMatch) {
      fileId = docsMatch[1];
    }
  }
  
  // Try a more general pattern as fallback
  if (!fileId) {
    // Match any 33-character alphanumeric string (Google Drive file IDs are typically 33 chars)
    const generalMatch = trimmedUrl.match(/([a-zA-Z0-9_-]{25,40})/);
    if (generalMatch && trimmedUrl.includes('drive.google.com')) {
      // Extract the longest match that looks like a file ID
      const matches = trimmedUrl.match(/([a-zA-Z0-9_-]{25,40})/g);
      if (matches && matches.length > 0) {
        // Use the first match that's likely a file ID (usually 33 chars)
        fileId = matches.find(m => m.length >= 25 && m.length <= 40) || matches[0];
      }
    }
  }
  
  // If we found a file ID, convert to direct view link
  if (fileId) {
    // Use thumbnail API which serves images directly (better for img tags)
    // sz=w1000 means width of 1000px (you can adjust: w200, w400, w800, w1000, w2000)
    // This format works better for embedding in img tags
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  // If no conversion possible and it's a Google Drive URL, return empty string
  // This will trigger the placeholder fallback
  if (trimmedUrl.includes('drive.google.com')) {
    console.warn('Could not extract file ID from Google Drive URL:', trimmedUrl);
    return '';
  }
  
  // Return original URL if it's not a Google Drive URL
  return trimmedUrl;
}

function parseCoordinatesFromGoogleMapsLink(link: string): { lat: number; lng: number } | null {
  try {
    // Try to extract coordinates from various Google Maps URL formats
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng format
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dlat!4dlng format
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng format
    ];

    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const rows = await readSheet('Sheet1!A2:AH'); // Skip header row, read up to AH
    
    const cafes: Cafe[] = rows
      .filter((row: any[]) => {
        // Only include approved cafés (column AF = index 31)
        const approved = row[31]?.toString().toLowerCase();
        return approved === 'yes' || approved === 'true' || approved === '1';
      })
      .map((row: any[], index: number) => {
        // Parse menu JSON from column V (index 21)
        const menuJson = row[21] || '[]';
        let menuCategories: any[] = [];
        
        try {
          const parsed = JSON.parse(menuJson);
          // Convert from form format to app format
          menuCategories = parsed.map((section: any) => ({
            name: section.sectionName || 'Menu',
            items: (section.items || []).map((item: any) => ({
              name: item.name || '',
              price: parseInt(item.price) || 0,
              description: '',
              dietaryType: item.type?.toLowerCase() === 'veg' ? 'veg' 
                : item.type?.toLowerCase() === 'non-veg' ? 'non-veg'
                : item.type?.toLowerCase() === 'egg' ? 'egg'
                : 'veg',
            })),
          }));
        } catch (e) {
          console.error('Error parsing menu JSON:', e);
          menuCategories = [];
        }

        // Parse photo links (column Y = index 24) - separated by ||
        const photoLinksRaw = row[24] || '';
        const photoLinks = photoLinksRaw ? photoLinksRaw.split('||').filter((link: string) => link.trim()).map(convertGoogleDriveUrl) : [];
        
        // Coordinates from Google Maps link (column F = index 5)
        const coords = parseCoordinatesFromGoogleMapsLink(row[5] || '') || { lat: 0, lng: 0 };

        // Parse best dishes (column W = index 22)
        const best3Dishes = row[22] || '';
        const bestDish = best3Dishes.split(',')[0]?.trim() || 'Special Dish';

        // Convert cover image URL (Column X = index 23 is Cover Image Link)
        const coverImageRaw = row[23] || '';
        const coverImage = convertGoogleDriveUrl(coverImageRaw);
        
        // Debug: Log first cafe's image conversion for troubleshooting
        if (index === 0) {
          console.log('=== First Cafe Image Debug ===');
          console.log('Raw cover image URL:', coverImageRaw);
          console.log('Converted cover image URL:', coverImage);
          console.log('Raw photo links:', photoLinksRaw);
          console.log('Converted photo links:', photoLinks);
        }
        
        // Ensure we always have a valid image URL
        const validCoverImage = (coverImage && coverImage.trim() !== '') ? coverImage : '/placeholder.jpg';
        const validPhotoLinks = photoLinks.filter((link: string) => link && link.trim() !== '');
        
        // Ensure images array always has at least the placeholder
        const allImages = validCoverImage !== '/placeholder.jpg' 
          ? [validCoverImage, ...validPhotoLinks]
          : (validPhotoLinks.length > 0 ? validPhotoLinks : ['/placeholder.jpg']);

        const cafe: Cafe = {
          id: `cafe_${index + 1}`,
          name: row[0] || 'Unknown Café', // Column A
          type: row[15] === 'Yes' ? 'Veg' : undefined, // Column P
          description: row[16] || '', // Column Q - Short Description
          shortDescription: row[16] || '',
          rating: parseFloat(row[28]) || 0, // Column AC
          reviewCount: parseInt(row[29]) || 0, // Column AD
          promoterRating: parseFloat(row[30]) || 0, // Column AE
          image: validCoverImage, // Always has a valid image URL
          images: allImages.length > 0 ? allImages : ['/placeholder.jpg'], // Always has at least one image
          vibe: row[18] ? row[18].split(',').map((v: string) => v.trim()) : [], // Column S - Ambience Type
          purpose: row[17] ? row[17].split(',').map((p: string) => p.trim()) : [], // Column R - Purpose
          amenities: row[19] ? row[19].split(',').map((a: string) => a.trim()) : [], // Column T - Amenities
          bestDish,
          priceRange: row[14] || 'Moderate', // Column O
          pricePerPerson: parseInt(row[13]) || 500, // Column N
          foodDrinkTypes: row[20] ? row[20].split(',').map((f: string) => f.trim()) : [], // Column U
          menuCategories,
          location: {
            address: `${row[4] || ''}, ${row[3] || ''}`.trim(), // Column E + D
            coordinates: coords,
          },
          contact: {
            phone: row[2] || row[1] || '', // Column C or B
            email: row[6] || undefined, // Column G
            website: row[9] || undefined, // Column J
            googleMapsLink: row[5] || undefined, // Column F - Google Maps Link
            social: {
              instagram: row[7] || undefined, // Column H
              facebook: row[8] || undefined, // Column I
            },
          },
          reviews: [], // Not used - replaced with photos
        };

        return cafe;
      });

    return NextResponse.json({ cafes, count: cafes.length });
  } catch (error) {
    console.error('Error fetching cafés:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch cafés',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Cache for 5 minutes
export const revalidate = 300;
