import { GoogleGenAI, Type } from "@google/genai";
import { TravelPreferences, RecommendationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getVacationRecommendations(prefs: TravelPreferences): Promise<RecommendationResponse> {
  const prompt = `
    Based on the following travel preferences, suggest 2 ideal vacation destinations.
    
    Preferences:
    - Traveling From: ${prefs.travelingFrom || 'Unknown'}
    - Budget: ${prefs.budget}
    - Preferred Climates: ${prefs.climate.join(", ")}
    - Activities: ${prefs.activities.join(", ")}
    - Duration: ${prefs.duration}
    - Travel Styles: ${prefs.travelStyle.join(", ")}
    - Companions: ${prefs.companions}
    - Max Travel Distance: ${prefs.maxTravelDistance} (Short = same continent, Medium = within 6-8 hours, Long = anywhere, Any = no preference)
    
    For each destination, provide:
    1. Name and Country
    2. A brief, enticing description.
    3. "Why it fits" - explaining how it matches their specific preferences.
    4. Top 3 experiences/activities there.
    5. A list of 6 "popularActivities". For each, include a name, description, and "type" ('solo' for things to do on their own, 'bookable' for things usually booked via a tour/site). If 'bookable', suggest a placeholder booking site name like "Viator" or "GetYourGuide" in a "bookingUrl" field (just the name of the service).
    6. A 3-day sample "itinerary". Each day should have a title and 3 specific activities.
    7. Best time to visit.
    8. Estimated daily cost (in USD).
    9. A keyword for a beautiful image of this place.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          destinations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                country: { type: Type.STRING },
                description: { type: Type.STRING },
                whyItFits: { type: Type.STRING },
                topExperiences: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                popularActivities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["solo", "bookable"] },
                      bookingUrl: { type: Type.STRING }
                    },
                    required: ["name", "description", "type"]
                  }
                },
                itinerary: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.NUMBER },
                      title: { type: Type.STRING },
                      activities: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["day", "title", "activities"]
                  }
                },
                bestTimeToVisit: { type: Type.STRING },
                estimatedDailyCost: { type: Type.STRING },
                imageUrl: { type: Type.STRING, description: "A keyword for a high-quality image search" }
              },
              required: ["name", "country", "description", "whyItFits", "topExperiences", "popularActivities", "itinerary", "bestTimeToVisit", "estimatedDailyCost", "imageUrl"]
            }
          },
          travelTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["destinations", "travelTips"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  
  // Enhance with real image URLs using the keywords
  result.destinations = result.destinations.map((d: any) => ({
    ...d,
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(d.imageUrl)}/800/600`
  }));

  return result as RecommendationResponse;
}
