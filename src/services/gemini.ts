import { GoogleGenAI, Type } from "@google/genai";
import { TravelPreferences, RecommendationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

function getItineraryLength(duration: string): number {
  switch (duration) {
    case 'Weekend': return 2;
    case '3–5 days': return 4;
    case '7–10 days': return 7;
    case '2+ weeks': return 10;
    default: return 3;
  }
}

export async function getVacationRecommendations(prefs: TravelPreferences): Promise<RecommendationResponse> {
  const itineraryDays = getItineraryLength(prefs.duration);
  const prompt = `
    Based on the following travel preferences, suggest between 3 and 10 ideal vacation destinations. The number of suggestions should depend on how specific or broad the preferences are, but always aim for at least 3.
    
    Preferences:
    - Traveling From: ${prefs.travelingFrom || 'Unknown'}
    - Budget: ${prefs.budget}
    - Preferred Climates: ${prefs.climate.join(", ")}
    - Activities: ${prefs.activities.join(", ")}
    - Duration: ${prefs.duration}
    - Travel Styles: ${prefs.travelStyle.join(", ")}
    - Companions: ${prefs.companions}
    - Max Travel Distance: ${prefs.maxTravelDistance} (Short = same continent, Medium = within 6-8 hours, Long = anywhere, Any = no preference)
    ${prefs.freeText ? `- Additional Context/Description: ${prefs.freeText}` : ''}
    
    For each destination, provide:
    1. Name and Country
    2. A brief, enticing description.
    3. "Why it fits" - explaining how it matches their specific preferences.
    4. Top 3 experiences/activities there.
    5. A list of 6 "popularActivities". For each, include a name, description, and "type" ('solo' for things to do on their own, 'bookable' for things usually booked via a tour/site). If 'bookable', suggest a placeholder booking site name like "Viator" or "GetYourGuide" in a "bookingUrl" field (just the name of the service).
    6. A ${itineraryDays}-day sample "itinerary". Each day should have a title and 3 specific activities.
    7. Best time to visit (e.g., "Spring (March - May)").
    8. Estimated daily cost (in USD).
    9. A keyword for a beautiful image of this place.
    10. travelDistanceCategory: 'short', 'medium', or 'long' based on their starting location.
    11. weather: avgTemp (e.g., "24°C") and rainfall (e.g., "Low").
    12. budgetBreakdown: low, med, high daily estimates.
    13. galleryImages: 3 keywords for additional beautiful images.
    14. similarDestinations: 2 other places (name and country) that have a similar vibe.
    15. packingList: A tailored packing list with 4 categories (e.g., "Essentials", "Clothing", "Gear", "Personal Care"). Each category should have 4-6 specific items based on the destination's climate and activities.
    16. flightEstimate: An object with "min" and "max" estimated round-trip flight costs (e.g., "$450", "$800") from their starting location to the destination.
    17. neighborhoods: A list of 2-4 recommended neighborhoods to stay in. For each, provide: name, vibe (array of tags like "trendy", "quiet", "beachfront"), avgNightlyPrice (e.g., "$120"), and a brief description.
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
                imageUrl: { type: Type.STRING, description: "A keyword for a high-quality image search" },
                travelDistanceCategory: { type: Type.STRING, enum: ["short", "medium", "long"] },
                weather: {
                  type: Type.OBJECT,
                  properties: {
                    avgTemp: { type: Type.STRING },
                    rainfall: { type: Type.STRING }
                  },
                  required: ["avgTemp", "rainfall"]
                },
                budgetBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    low: { type: Type.STRING },
                    med: { type: Type.STRING },
                    high: { type: Type.STRING }
                  },
                  required: ["low", "med", "high"]
                },
                galleryImages: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                similarDestinations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      country: { type: Type.STRING }
                    },
                    required: ["name", "country"]
                  }
                },
                packingList: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      items: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["category", "items"]
                  }
                },
                flightEstimate: {
                  type: Type.OBJECT,
                  properties: {
                    min: { type: Type.STRING },
                    max: { type: Type.STRING }
                  },
                  required: ["min", "max"]
                },
                neighborhoods: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      vibe: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      avgNightlyPrice: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["name", "vibe", "avgNightlyPrice", "description"]
                  }
                }
              },
              required: ["name", "country", "description", "whyItFits", "topExperiences", "popularActivities", "itinerary", "bestTimeToVisit", "estimatedDailyCost", "imageUrl", "travelDistanceCategory", "weather", "budgetBreakdown", "galleryImages", "similarDestinations", "packingList", "flightEstimate", "neighborhoods"]
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
    imageUrl: `https://loremflickr.com/1200/800/${encodeURIComponent(d.name)},${encodeURIComponent(d.country)},landmark`,
    galleryImages: d.galleryImages.map((kw: string) => `https://loremflickr.com/800/600/${encodeURIComponent(d.name)},${encodeURIComponent(kw)}`)
  }));

  return result as RecommendationResponse;
}

export async function getDestinationDetails(name: string, country: string, prefs: TravelPreferences): Promise<any> {
  const itineraryDays = getItineraryLength(prefs.duration);
  const prompt = `
    Provide full travel details for ${name}, ${country} based on these preferences:
    - Traveling From: ${prefs.travelingFrom || 'Unknown'}
    - Budget: ${prefs.budget}
    - Preferred Climates: ${prefs.climate.join(", ")}
    - Activities: ${prefs.activities.join(", ")}
    - Duration: ${prefs.duration}
    - Travel Styles: ${prefs.travelStyle.join(", ")}
    - Companions: ${prefs.companions}
    
    Return a single JSON object with these fields:
    1. name, country, description, whyItFits, topExperiences (array), popularActivities (array of objects with name, description, type, bookingUrl), itinerary (${itineraryDays}-day array), bestTimeToVisit, estimatedDailyCost, imageUrl (keyword), travelDistanceCategory, weather (avgTemp, rainfall), budgetBreakdown (low, med, high), galleryImages (3 keywords), similarDestinations (2 objects with name, country), packingList (4 categories with items), flightEstimate (min and max strings), neighborhoods (array of objects with name, vibe tags, avgNightlyPrice, description).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
          imageUrl: { type: Type.STRING },
          travelDistanceCategory: { type: Type.STRING, enum: ["short", "medium", "long"] },
          weather: {
            type: Type.OBJECT,
            properties: {
              avgTemp: { type: Type.STRING },
              rainfall: { type: Type.STRING }
            },
            required: ["avgTemp", "rainfall"]
          },
          budgetBreakdown: {
            type: Type.OBJECT,
            properties: {
              low: { type: Type.STRING },
              med: { type: Type.STRING },
              high: { type: Type.STRING }
            },
            required: ["low", "med", "high"]
          },
          galleryImages: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          similarDestinations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                country: { type: Type.STRING }
              },
              required: ["name", "country"]
            }
          },
          packingList: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["category", "items"]
            }
          },
          flightEstimate: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.STRING },
              max: { type: Type.STRING }
            },
            required: ["min", "max"]
          },
          neighborhoods: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                vibe: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                avgNightlyPrice: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "vibe", "avgNightlyPrice", "description"]
            }
          }
        },
        required: ["name", "country", "description", "whyItFits", "topExperiences", "popularActivities", "itinerary", "bestTimeToVisit", "estimatedDailyCost", "imageUrl", "travelDistanceCategory", "weather", "budgetBreakdown", "galleryImages", "similarDestinations", "packingList", "flightEstimate", "neighborhoods"]
      }
    }
  });

  const d = JSON.parse(response.text || "{}");
  return {
    ...d,
    imageUrl: `https://loremflickr.com/1200/800/${encodeURIComponent(d.name)},${encodeURIComponent(d.country)},landmark`,
    galleryImages: d.galleryImages.map((kw: string) => `https://loremflickr.com/800/600/${encodeURIComponent(d.name)},${encodeURIComponent(kw)}`)
  };
}

export async function chatConcierge(message: string, currentPrefs?: TravelPreferences): Promise<string> {
  const context = currentPrefs ? `
    Current User Context:
    - Traveling From: ${currentPrefs.travelingFrom || 'Unknown'}
    - Budget: ${currentPrefs.budget}
    - Preferred Climates: ${currentPrefs.climate.join(", ")}
    - Duration: ${currentPrefs.duration}
    - companions: ${currentPrefs.companions}
  ` : '';

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: {
      systemInstruction: `You are "Sia", the Mediterranean Travel Concierge for "Travel Sanctuary". 
      Your tone is elegant, helpful, and sophisticated. 
      Help users find their dream Mediterranean or coastal sanctuary.
      Focus on hidden gems, cultural authenticity, and tailored luxury/budget advice.
      Keep your responses relatively brief (max 3 sentences) unless asked for something complex.
      ${context}`,
    }
  });

  return response.text || "I'm sorry, I couldn't provide an answer right now. How else can I help you discover your sanctuary?";
}
