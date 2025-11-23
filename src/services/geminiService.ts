import { GoogleGenAI, Type } from "@google/genai";
import { ISLANDS } from "../constants";
import { AIRecommendation } from "../types";

const apiKey = import.meta.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

export const getIslandRecommendations = async (userPrompt: string): Promise<AIRecommendation[]> => {
  if (!apiKey) {
    console.error("API Key missing");
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
    
    EXPERT PERSONA RULES (Apply these strictly):

    1. FAMILIES / KIDS (Especially with Small Children):
       - CRITICAL PRIORITY: Short transfer times (< 45 mins) to minimize travel fatigue for toddlers.
       - PREFER: Quiet atmosphere, shallow/safe beaches, easy logistics.
       - TOP RECOMMENDATIONS: 
         * Gulhi (Only 30 mins, very calm shallow water, quiet - Perfect for toddlers).
         * Himmafushi (Only 20 mins, very quiet, easiest access).
         * Dhiffushi (45 mins, family amenities, calm lagoon).
         * Fulidhoo (1 hr, stingrays on beach are magical for kids, very safe/quiet).
       - SECONDARY (Great but further): Thoddoo (1.5h+ but amazing beach/farms), Thinadhoo (1.5h+ resort feel).
       - AVOID / DOWNRANK: 
         * Maafushi (Too crowded/urban).
         * Thulusdhoo (Surf focus, strong currents).
         * Fehendhoo (Too isolated/quiet, lack of family amenities/activities).

    2. SOLO TRAVELERS / SINGLES:
       - PREFER: Lively/Social vibe, Islands with Floating Bars, Hostels, or high guest house counts.
       - TOP RECOMMENDATIONS: Maafushi, Thulusdhoo, Ukulhas, Dhiffushi, Gulhi, Dhangethi.

    3. LONG BEACH / WALKING BEACH:
       - User Keyword: "Long beach", "walk", "long stretch", "scenery".
       - TOP RECOMMENDATIONS:
         * Dhigurah (Longest island, sandbank tip).
         * Feridhoo (Large island, long beach).
         * Fehendhoo (Long and narrow, scenic).
         * Thulusdhoo (Large island, long coastline).
         * Thinadhoo (Resort-like beach).
         * Ukulhas (Long bikini beach).
         * Dharavandhoo (Large beach area).
    
    CRITICAL SORTING INSTRUCTION: 
    - Order the results by RELEVANCE to the specific user request. 
    - Example: If user asks "closest island to airport", put the island with shortest transfer time FIRST.
    - Example: If user asks "swim with whale sharks", put South Ari Atoll islands FIRST.
    - SIZE LOGIC: If user asks for "smallest" or "largest" island, ignore the generic "Small/Medium/Large" labels. Instead, strictly sort using the "sizeDetails" (e.g., "300m x 300m") to provide the mathematically correct answer.
    - CROWD/HOTEL LOGIC: If user asks for "fewest tourists", "quietest", or "less people", strictly sort by "hotelCount" (ascending), BUT respect any notes about "Spacious feel" (e.g. Dhigurah/Dharavandhoo) which means they are exceptions to the high hotel count rule. If user asks for "most hotels", "lively", or "most options", sort by "hotelCount" (descending).
    
    CRITICAL WRITING INSTRUCTION:
    - The 'reason' MUST be relatable and explain WHY it is good for the specific user.
    - Do NOT just list features like "Short flight, spacious". 
    - DO say: "The short 20-minute boat ride is stress-free with toddlers" or "Kids will love seeing stingrays right on the beach".
    
    Database:
    ${JSON.stringify(dataContext)}
    
    Return a JSON array of objects with "islandId" and a short "reason" (max 15 words) explaining why it fits.
    Only return islands that genuinely fit. If none fit well, return an empty array.
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
