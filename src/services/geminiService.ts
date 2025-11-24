import { GoogleGenAI, Type } from "@google/genai";
import { ISLANDS } from "../constants";
import { AIRecommendation } from "../types";

// @ts-ignore: Vite specific environment variable
const apiKey = import.meta.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy_key" });

export const getIslandRecommendations = async (userPrompt: string): Promise<AIRecommendation[]> => {
  if (!apiKey) {
    console.error("API Key missing. Make sure VITE_API_KEY is set in Vercel.");
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
    
    STRICT CONSTRAINTS (READ CAREFULLY):
    1. SPEED OPTIMIZATION: Return a MAXIMUM of 5 recommendations. Do not return more.
    2. SHORT REASONS: Keep the 'reason' extremely concise (Max 12 words).
    3. ILLEGAL/IRRELEVANT QUERIES: 
       - Nudity/Nude Sunbathing is STRICTLY PROHIBITED in Maldives local islands.
       - Alcohol is PROHIBITED on local islands (except floating bars).
       - Pork is PROHIBITED.
       - Skiing/Snow/Mountains do not exist.
       - IF the user asks for these, return an EMPTY array []. Do not try to match.

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
