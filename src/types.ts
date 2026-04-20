export interface TravelPreferences {
  travelingFrom: string;
  budget: 'budget' | 'moderate' | 'luxury';
  climate: string[];
  activities: string[];
  duration: string;
  travelStyle: string[];
  companions: 'solo' | 'couple' | 'family' | 'friends';
  maxTravelDistance: 'short' | 'medium' | 'long' | 'any';
  freeText?: string;
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

export interface PackingCategory {
  category: string;
  items: string[];
}

export interface Neighborhood {
  name: string;
  vibe: string[];
  avgNightlyPrice: string;
  description: string;
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
  travelDistanceCategory: 'short' | 'medium' | 'long';
  weather: {
    avgTemp: string;
    rainfall: string;
  };
  budgetBreakdown: {
    low: string;
    med: string;
    high: string;
  };
  galleryImages: string[];
  similarDestinations: {
    name: string;
    country: string;
  }[];
  packingList: PackingCategory[];
  flightEstimate: {
    min: string;
    max: string;
  };
  neighborhoods: Neighborhood[];
}

export interface RecommendationResponse {
  destinations: Destination[];
  travelTips: string[];
}
