import { GoogleGenAI, Type } from "@google/genai";
import { ISLANDS } from "../constants";
import { AIRecommendation } from "../types";

// @ts-ignore: Vite specific environment variable
const apiKey = import.meta.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy_key_to_prevent_crash" });

export const getIslandRecommendations = async (userPrompt: string): Promise<AIRecommendation[]> => {
  if (!apiKey) {
    console.error("API Key missing. Make sure VITE_API_KEY is set in Vercel Settings.");
    return [];
  }

  // Create a detailed representation of the data for the model including new filter fields
  const dataContext = ISLANDS.map(island => {
    let crowdNuance = "";
    // Explicitly mark these islands as spacious despite hotel count
    if (['dhigurah', 'dharavandhoo'].includes(island.id)) {
        crowdNuance = " (Note: Feels spacious and NOT crowded despite hotel count)";
    }

    return {
        id: island.id,
        name: island.name,
        atoll: island.atoll,
        desc: island.description,
        sizeDetails: island.dimensions, // Explicit dimensions for AI
        hotelCount: island.guestHouseCount + crowdNuance, // Explicit hotel count + nuance for crowds/availability
        features: [
            ...island.transferTypes, 
            island.size, 
            ...island.atmosphere, 
            island.jungle + " Jungle",
            island.nightlife + " Nightlife"
        ].join(', '),
        activities: island.marineActivities.join(', '),
        special: [
            island.hasSandbankAttached ? "Has Attached Sandbank" : "",
            island.hasFloatingBar ? "Has Floating Bar" : ""
        ].filter(Boolean).join(', ')
    };
  });

  const prompt = `
    You are a Maldives Travel Expert concierge.
    User Request: "${userPrompt}"
    
    Based on the following database of local islands, select the best matches.
    
    *** CRITICAL COMPLIANCE PROTOCOL (HIGHEST PRIORITY) ***
    You MUST adhere to the laws of the Maldives. 
    
    1. NUDITY & TOPLESS BAN (STRICT):
       - Public nudity and topless sunbathing are ILLEGAL and punishable by law on ALL local islands.
       - IF user asks for: "nude", "naked", "topless", "naturist", "no tan lines", "skinny dipping", or "clothing optional".
       - ACTION: Return an EMPTY array [] immediately. 
       - DO NOT suggest "Bikini Beaches" as an alternative. Stop completely.

    2. ALCOHOL/PORK BAN:
       - Alcohol is ILLEGAL on local islands (only allowed on floating bars/safari boats).
       - Pork is ILLEGAL.
       - IF user asks for "alcohol on the beach", "pork", "bars on the island" (unless referring to floating bars).
       - ACTION: Return an EMPTY array [].

    -------------------------------------------------------
    
    STRICT CONSTRAINTS:
    1. RELEVANCE: Return ALL islands that are truly good matches. Do not artificially limit the count. If 10 islands fit the criteria well, return all 10.
    2. SHORT REASONS: Keep the 'reason' extremely concise (Max 12 words).

    EXPERT PERSONA RULES:

    1. FAMILIES / KIDS (Especially with Small Children):
       - CRITICAL PRIORITY: Short transfer times (< 45 mins).
       - PREFER: Quiet atmosphere, shallow/safe beaches.
       - TOP RECOMMENDATIONS: Gulhi, Himmafushi, Dhiffushi, Fulidhoo.
       - AVOID: Maafushi (Crowded), Thulusdhoo (Surf), Fehendhoo (Isolated).

    2. SOLO TRAVELERS / SINGLES:
       - PREFER: Lively/Social vibe, Floating Bars, Hostels.
       - TOP RECOMMENDATIONS: Maafushi, Thulusdhoo, Ukulhas, Dhiffushi, Gulhi, Dhangethi.

    3. LONG BEACH / WALKING BEACH:
       - Keywords: "Long beach", "walk", "scenery".
       - TOP RECOMMENDATIONS: Dhigurah, Feridhoo, Fehendhoo, Thulusdhoo, Thinadhoo, Ukulhas, Dharavandhoo.
    
    SORTING:
    - Order results by RELEVANCE to the request.
    - For "smallest/largest", use 'sizeDetails' dimensions mathematically.
    - For "quiet/crowds", use 'hotelCount' (Low = Quiet, High = Lively).
    
    Database:
    ${JSON.stringify(dataContext)}
    
    Return a JSON array of objects with "islandId" and a short "reason".
    Return [] if no good matches found or query is irrelevant/illegal.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              islandId: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["islandId", "reason"]
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const result = JSON.parse(text) as AIRecommendation[];
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
