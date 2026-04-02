export interface TravelPreferences {
  travelingFrom: string;
  budget: 'budget' | 'moderate' | 'luxury';
  climate: string[];
  activities: string[];
  duration: string;
  travelStyle: string[];
  companions: 'solo' | 'couple' | 'family' | 'friends';
  maxTravelDistance: 'short' | 'medium' | 'long' | 'any';
}

export interface Activity {
  name: string;
  description: string;
  type: 'solo' | 'bookable';
  bookingUrl?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface Destination {
  name: string;
  country: string;
  description: string;
  whyItFits: string;
  topExperiences: string[];
  popularActivities: Activity[];
  itinerary: ItineraryDay[];
  bestTimeToVisit: string;
  estimatedDailyCost: string;
  imageUrl: string;
}

export interface RecommendationResponse {
  destinations: Destination[];
  travelTips: string[];
}
