// ============================================================================
// GEMINI AI INTEGRATION FOR LOCATION INTELLIGENCE
// ============================================================================

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// ============================================================================
// TYPES
// ============================================================================

export type LocationSuggestion = {
  original: string;
  corrected: string;
  confidence: number;
  suggestions: string[];
  isAmbiguous: boolean;
};

export type SmartLocationResult = {
  query: string;
  interpretation: string;
  bestMatches: string[];
  alternativeSearches: string[];
  locationContext: string;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function callGeminiAPI(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API key not configured');
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      const content = data.candidates[0].content;
      if (content && content.parts && content.parts.length > 0) {
        return content.parts[0].text;
      }
    }

    return null;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

// ============================================================================
// SMART LOCATION INTERPRETATION
// ============================================================================

export async function interpretLocationQuery(query: string): Promise<SmartLocationResult | null> {
  const prompt = `You are a location search assistant for India. 

User searched for: "${query}"

Analyze this search query and provide:
1. What the user likely means (interpret typos, abbreviations, colloquial names)
2. Top 3 most likely actual locations they're looking for
3. Alternative ways to search if the original doesn't work
4. Brief context about the location (city, state, famous for)

Respond ONLY in this JSON format:
{
  "interpretation": "User is likely searching for...",
  "bestMatches": ["Full Location Name 1", "Full Location Name 2", "Full Location Name 3"],
  "alternativeSearches": ["alternative 1", "alternative 2", "alternative 3"],
  "locationContext": "Brief context about the area"
}

Examples:
- "mg road" → {"interpretation": "MG Road could be in Bangalore, Pune, or other cities", "bestMatches": ["MG Road Bangalore", "MG Road Pune", "MG Road Gurgaon"], ...}
- "cp" → {"interpretation": "CP likely means Connaught Place in Delhi", "bestMatches": ["Connaught Place Delhi", "Central Park Gurgaon"], ...}
- "bandra" → {"interpretation": "Bandra is a popular area in Mumbai", "bestMatches": ["Bandra West Mumbai", "Bandra East Mumbai"], ...}`;

  try {
    const response = await callGeminiAPI(prompt);
    if (!response) return null;

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      query,
      interpretation: parsed.interpretation || '',
      bestMatches: parsed.bestMatches || [],
      alternativeSearches: parsed.alternativeSearches || [],
      locationContext: parsed.locationContext || '',
    };
  } catch (error) {
    console.error('Error interpreting location query:', error);
    return null;
  }
}

// ============================================================================
// TYPO CORRECTION & SUGGESTIONS
// ============================================================================

export async function correctLocationTypo(query: string): Promise<LocationSuggestion | null> {
  const prompt = `You are a location name spell-checker for Indian locations.

User typed: "${query}"

Is this a typo or misspelling of a known Indian location? If yes, provide the correct spelling.
Also suggest related locations they might be looking for.

Respond ONLY in this JSON format:
{
  "original": "${query}",
  "corrected": "Correct spelling if typo, or same as original",
  "confidence": 0.0 to 1.0,
  "suggestions": ["Related location 1", "Related location 2", "Related location 3"],
  "isAmbiguous": true/false
}

Examples:
- "mumbia" → {"original": "mumbia", "corrected": "Mumbai", "confidence": 0.95, "suggestions": ["Mumbai", "Navi Mumbai", "Thane"], "isAmbiguous": false}
- "bangalor" → {"original": "bangalor", "corrected": "Bangalore", "confidence": 0.9, "suggestions": ["Bangalore", "Bengaluru", "Whitefield Bangalore"], "isAmbiguous": false}
- "mg road" → {"original": "mg road", "corrected": "MG Road", "confidence": 0.7, "suggestions": ["MG Road Bangalore", "MG Road Pune", "MG Road Gurgaon"], "isAmbiguous": true}`;

  try {
    const response = await callGeminiAPI(prompt);
    if (!response) return null;

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Error correcting location typo:', error);
    return null;
  }
}

// ============================================================================
// NATURAL LANGUAGE LOCATION SEARCH
// ============================================================================

export async function parseNaturalLanguageLocation(input: string): Promise<string[]> {
  const prompt = `Extract location names from this natural language query for cafe search in India:

"${input}"

Examples:
- "cafes near Marina Beach" → ["Marina Beach Chennai", "Chennai"]
- "coffee shops in koramangala" → ["Koramangala Bangalore", "Bangalore"]
- "best cafe around India Gate" → ["India Gate Delhi", "Delhi"]
- "find cafes in bandra west" → ["Bandra West Mumbai", "Mumbai"]

Extract all location references and return them as a JSON array of strings.
Return ONLY the JSON array, nothing else.

["Location 1", "Location 2", ...]`;

  try {
    const response = await callGeminiAPI(prompt);
    if (!response) return [];

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing natural language location:', error);
    return [];
  }
}

// ============================================================================
// SMART DISTANCE DESCRIPTION
// ============================================================================

export async function getSmartDistanceDescription(
  distanceKm: number,
  fromLocation: string,
  toLocation: string
): Promise<string> {
  const prompt = `Generate a natural, friendly description of the distance between two locations.

From: ${fromLocation}
To: ${toLocation}
Distance: ${distanceKm} km

Provide a single, concise sentence that describes:
- How far it is
- Approximate travel time (consider Indian traffic)
- Whether it's walkable, needs auto/cab, or is far

Examples:
- 0.5 km → "Just a 5-minute walk away"
- 2 km → "About 10 minutes by auto or bike"
- 5 km → "Around 20-25 minutes by cab, depending on traffic"
- 15 km → "Quite far - roughly 45 minutes to an hour by cab"

Return ONLY the description sentence, nothing else.`;

  try {
    const response = await callGeminiAPI(prompt);
    return response || `${distanceKm.toFixed(1)} km away`;
  } catch (error) {
    console.error('Error getting smart distance description:', error);
    return `${distanceKm.toFixed(1)} km away`;
  }
}

// ============================================================================
// LOCATION CONTEXT & RECOMMENDATIONS
// ============================================================================

export async function getLocationContext(locationName: string): Promise<string | null> {
  const prompt = `Provide a brief, helpful context about this location in India:

"${locationName}"

In 1-2 sentences, mention:
- What kind of area it is (commercial, residential, tourist spot)
- What it's known for
- Any relevant context for someone looking for cafes there

Examples:
- "Koramangala Bangalore" → "A vibrant tech hub with numerous startups, known for its cafe culture and young crowd. Great area for work-friendly cafes."
- "Connaught Place Delhi" → "The commercial heart of Delhi with colonial architecture, shopping, and dining. Expect bustling cafes with a mix of tourists and locals."
- "Bandra West Mumbai" → "Mumbai's trendy neighborhood known for its hip cafes, street art, and celebrity homes. Perfect for Instagram-worthy cafe visits."

Return ONLY the description, nothing else.`;

  try {
    const response = await callGeminiAPI(prompt);
    return response;
  } catch (error) {
    console.error('Error getting location context:', error);
    return null;
  }
}

// ============================================================================
// SMART SEARCH SUGGESTIONS
// ============================================================================

export async function generateSearchSuggestions(partialQuery: string): Promise<string[]> {
  if (partialQuery.length < 2) return [];

  const prompt = `User is typing a location search in India. They've typed: "${partialQuery}"

Suggest 5 likely completions based on popular locations, landmarks, and areas in India.
Return ONLY a JSON array of strings, nothing else.

Examples:
- "ban" → ["Bangalore", "Bandra Mumbai", "Banashankari Bangalore", "Banjara Hills Hyderabad", "Bandstand Mumbai"]
- "mum" → ["Mumbai", "Mumfordganj Allahabad", "Munirka Delhi"]
- "mg" → ["MG Road Bangalore", "MG Road Pune", "MG Road Gurgaon", "Mahatma Gandhi Road"]

Return format: ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]`;

  try {
    const response = await callGeminiAPI(prompt);
    if (!response) return [];

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return [];
  }
}

// ============================================================================
// CAFE DISTANCE INSIGHTS
// ============================================================================

export async function generateCafeDistanceInsight(
  cafeName: string,
  distanceKm: number,
  userLocation: string
): Promise<string> {
  const prompt = `Generate a helpful, natural insight about visiting this cafe:

Cafe: ${cafeName}
Distance from user: ${distanceKm} km
User location: ${userLocation}

Provide ONE short sentence with:
- Distance context (close/moderate/far)
- Travel suggestion
- Time estimate

Examples:
- 0.3 km → "Perfect for a quick coffee run - just 3 minutes away!"
- 2 km → "Nice and close - about 10 minutes by bike or auto"
- 8 km → "A bit of a journey, but worth it if you're in the mood - 30-40 minutes"
- 15 km → "Quite far from your location - consider cafes closer by"

Return ONLY the insight sentence.`;

  try {
    const response = await callGeminiAPI(prompt);
    return response || `${distanceKm.toFixed(1)} km from your location`;
  } catch (error) {
    console.error('Error generating cafe distance insight:', error);
    return `${distanceKm.toFixed(1)} km from your location`;
  }
}

// ============================================================================
// AMBIGUOUS LOCATION RESOLVER
// ============================================================================

export async function resolveAmbiguousLocation(
  query: string,
  userContext?: string
): Promise<{ clarification: string; options: string[] } | null> {
  const contextInfo = userContext ? `User is currently in/near: ${userContext}` : '';
  
  const prompt = `User searched for: "${query}"
${contextInfo}

Is this location name ambiguous (exists in multiple cities/areas)?
If yes, provide a clarification question and options.

Respond ONLY in JSON format:
{
  "clarification": "Question to ask user",
  "options": ["Option 1", "Option 2", "Option 3"]
}

Examples:
- "MG Road" → {"clarification": "Which MG Road are you looking for?", "options": ["MG Road Bangalore", "MG Road Pune", "MG Road Gurgaon"]}
- "Indiranagar" → {"clarification": "Did you mean?", "options": ["Indiranagar Bangalore", "Indiranagar Lucknow"]}
- "Mumbai" (unique) → null

If NOT ambiguous, return null.`;

  try {
    const response = await callGeminiAPI(prompt);
    if (!response || response.toLowerCase().includes('null')) return null;

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Error resolving ambiguous location:', error);
    return null;
  }
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export const GeminiLocationAI = {
  interpretLocationQuery,
  correctLocationTypo,
  parseNaturalLanguageLocation,
  getSmartDistanceDescription,
  getLocationContext,
  generateSearchSuggestions,
  generateCafeDistanceInsight,
  resolveAmbiguousLocation,
};
