import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { TravelPreferences, RecommendationResponse } from "../types";

const API_KEY = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    Based on the following travel preferences, suggest exactly 3-4 ideal vacation destinations. Be concise but evocative.
    
    Preferences:
    - Traveling From: ${prefs.travelingFrom || 'Unknown'}
    - Budget: ${prefs.budget}
    - Preferred Climates: ${prefs.climate.join(", ")}
    - Activities: ${prefs.activities.join(", ")}
    - Duration: ${prefs.duration}
    - Travel Styles: ${prefs.travelStyle.join(", ")}
    - Companions: ${prefs.companions}
    - Max Travel Distance: ${prefs.maxTravelDistance}
    ${prefs.freeText ? `- Additional Context: ${prefs.freeText}` : ''}
    
    For each, provide the full structured details as requested.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
