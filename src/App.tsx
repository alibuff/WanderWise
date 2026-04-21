/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Plane, 
  Palmtree, 
  Snowflake, 
  Sun, 
  Cloud, 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Info,
  MessageSquare,
  LayoutGrid,
  Heart,
  Thermometer,
  CloudRain,
  Layers,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Check,
  Home,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { TravelPreferences, Destination, RecommendationResponse } from './types';
import { getVacationRecommendations, getDestinationDetails } from './services/gemini';
import { ConciergeChat } from './components/ConciergeChat';

const CLIMATES = [
  { id: 'tropical', label: 'Tropical', icon: Palmtree, color: 'text-orange-500' },
  { id: 'cold', label: 'Cold', icon: Snowflake, color: 'text-blue-400' },
  { id: 'temperate', label: 'Temperate', icon: Cloud, color: 'text-emerald-500' },
  { id: 'desert', label: 'Desert', icon: Sun, color: 'text-yellow-600' },
];

const BUDGETS = [
  { id: 'budget', label: 'Budget', desc: 'Backpacker style' },
  { id: 'moderate', label: 'Moderate', desc: 'Comfortable mid-range' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium experiences' },
];

const STYLES = [
  { id: 'adventurous', label: 'Adventurous' },
  { id: 'relaxing', label: 'Relaxing' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'family-friendly', label: 'Family Friendly' },
];

const COMPANIONS = [
  { id: 'solo', label: 'Solo', icon: Users },
  { id: 'couple', label: 'Couple', icon: Users },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'friends', label: 'Friends', icon: Users },
];

const DISTANCES = [
  { id: 'short', label: 'Short Haul', desc: 'Same continent' },
  { id: 'medium', label: 'Medium Haul', desc: '6-8 hours away' },
  { id: 'long', label: 'Long Haul', desc: 'Across the globe' },
  { id: 'any', label: 'Anywhere', desc: 'Distance is no object' },
];

const COMMON_CITIES = [
  "New York, USA", "London, UK", "Paris, France", "Tokyo, Japan", "Dubai, UAE",
  "Singapore", "Bangkok, Thailand", "Seoul, South Korea", "Hong Kong", "Barcelona, Spain",
  "Amsterdam, Netherlands", "Rome, Italy", "Prague, Czech Republic", "Vienna, Austria",
  "Sydney, Australia", "Melbourne, Australia", "Toronto, Canada", "Vancouver, Canada",
  "Berlin, Germany", "Munich, Germany", "Madrid, Spain", "Lisbon, Portugal",
  "Istanbul, Turkey", "Mumbai, India", "Delhi, India", "Shanghai, China", "Beijing, China",
  "Sao Paulo, Brazil", "Mexico City, Mexico", "Buenos Aires, Argentina", "Cairo, Egypt",
  "Cape Town, South Africa", "Nairobi, Kenya", "Casablanca, Morocco", "Tel Aviv, Israel",
  "Moscow, Russia", "Kyiv, Ukraine", "Warsaw, Poland", "Budapest, Hungary", "Stockholm, Sweden",
  "Oslo, Norway", "Copenhagen, Denmark", "Helsinki, Finland", "Zurich, Switzerland", "Geneva, Switzerland",
  "Brussels, Belgium", "Dublin, Ireland", "Edinburgh, UK", "Manchester, UK", "Birmingham, UK",
  "Glasgow, UK", "Liverpool, UK", "Bristol, UK", "Leeds, UK", "Sheffield, UK",
  "Los Angeles, USA", "San Francisco, USA", "Chicago, USA", "Miami, USA", "Las Vegas, USA",
  "Seattle, USA", "Boston, USA", "Washington DC, USA", "Austin, USA", "Denver, USA",
  "Philadelphia, USA", "Atlanta, USA", "Dallas, USA", "Houston, USA", "Phoenix, USA",
  "Portland, USA", "San Diego, USA", "Nashville, USA", "New Orleans, USA", "Minneapolis, USA",
  "Salt Lake City, USA", "Charlotte, USA", "Detroit, USA", "Orlando, USA", "San Antonio, USA",
  "Rio de Janeiro, Brazil", "Santiago, Chile", "Lima, Peru", "Bogota, Colombia",
  "Athens, Greece", "Venice, Italy", "Florence, Italy", "Milan, Italy", "Naples, Italy",
  "Nice, France", "Lyon, France", "Marseille, France", "Bordeaux, France",
  "Frankfurt, Germany", "Hamburg, Germany", "Cologne, Germany", "Stuttgart, Germany",
  "Antwerp, Belgium", "Ghent, Belgium", "Bruges, Belgium",
  "Luxembourg City", "Monaco", "San Marino", "Vatican City"
];

const SUGGESTED_ACTIVITIES = [
  "Beach Relaxing", "Scuba Diving", "Snorkeling", "Surfing", "Sailing", 
  "Hiking", "Mountain Biking", "Skiing", "Snowboarding", "Rock Climbing",
  "Wine Tasting", "Cooking Classes", "Local Food Tour", "Street Food Exploration", "Fine Dining",
  "Art Galleries", "Museum Hopping", "Historic Site Tours", "Architectural Tours", "Opera & Theater",
  "Nightlife", "Shopping", "Spa & Wellness", "Yoga Retreat", "Meditation",
  "Photography", "Wildlife Safari", "Bird Watching", "Stargazing", "Hot Air Ballooning",
  "Canyoning", "Kayaking", "White Water Rafting", "Zip Lining", "Bungee Jumping"
];

const LOADING_QUOTES = [
  "Finding secluded bays and sun-drenched shores...",
  "Consulting the local winds for the perfect breeze...",
  "Mapping out your personal slice of paradise...",
  "Checking the availability of the best sunset views...",
  "Curating an itinerary that resonates with your spirit...",
  "Gathering the scents of lemon groves and salt air...",
  "Discovering hidden gems away from the crowds..."
];

const SafeImage = ({ src, alt, className, ...props }: any) => {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-med-sand animate-pulse flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-med-terracotta/20 animate-spin" />
        </div>
      )}
      <motion.img
        {...props}
        src={error ? `https://picsum.photos/seed/${encodeURIComponent(alt)}/1200/800` : src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        onLoad={() => setLoading(false)}
        onError={() => {
          if (!error) setError(true);
          setLoading(false);
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<'hero' | 'form' | 'loading' | 'results'>('hero');
  const [formStep, setFormStep] = useState(1);
  const [formMode, setFormMode] = useState<'guided' | 'free'>('guided');
  const [prefs, setPrefs] = useState<TravelPreferences>({
    travelingFrom: '',
    budget: 'moderate',
    climate: ['temperate'],
    activities: [],
    duration: '3–5 days',
    travelStyle: ['cultural'],
    companions: 'couple',
    maxTravelDistance: 'any',
    freeText: '',
  });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [activityInput, setActivityInput] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(0);
  const [wishlist, setWishlist] = useState<Destination[]>(() => {
    try {
      const saved = localStorage.getItem('wanderwise_wishlist_data');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showWishlist, setShowWishlist] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const [showActivitySuggestions, setShowActivitySuggestions] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState<string[]>([]);
  const activitySuggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'loading') {
      interval = setInterval(() => {
        setLoadingQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length);
      }, 3000);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (activitySuggestionRef.current && !activitySuggestionRef.current.contains(event.target as Node)) {
        setShowActivitySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [step]);

  const handleCityChange = (value: string) => {
    setPrefs({ ...prefs, travelingFrom: value });
    if (value.trim().length > 0) {
      const filtered = COMMON_CITIES.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCities(COMMON_CITIES);
      setShowSuggestions(true);
    }
  };

  const selectCity = (city: string) => {
    setPrefs({ ...prefs, travelingFrom: city });
    setShowSuggestions(false);
  };

  const handleSimilarClick = async (name: string, country: string) => {
    // Check if we already have this destination in our current results
    const existing = results?.destinations.find(d => 
      d.name.toLowerCase() === name.toLowerCase() && 
      d.country.toLowerCase() === country.toLowerCase()
    );

    if (existing) {
      setSelectedDestination(existing);
      setGalleryIndex(0);
      const modalContent = document.getElementById('modal-content');
      if (modalContent) modalContent.scrollTop = 0;
      return;
    }

    setLoadingSimilar(true);
    try {
      const details = await getDestinationDetails(name, country, prefs);
      setSelectedDestination(details);
      setGalleryIndex(0);
      // Scroll modal to top
      const modalContent = document.getElementById('modal-content');
      if (modalContent) modalContent.scrollTop = 0;
    } catch (error) {
      console.error("Failed to fetch similar destination details:", error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const toggleWishlist = (e: React.MouseEvent, dest: Destination) => {
    e.stopPropagation();
    setWishlist(prev => {
      const isBookmarked = prev.some(d => d.name === dest.name);
      const next = isBookmarked
        ? prev.filter(d => d.name !== dest.name)
        : [...prev, dest];
      localStorage.setItem('wanderwise_wishlist_data', JSON.stringify(next));
      return next;
    });
  };

  const handleStart = () => setStep('form');

  const toggleMultiSelect = (field: 'climate' | 'travelStyle', value: string) => {
    setPrefs(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        if (current.length === 1) return prev; // Keep at least one
        return { ...prev, [field]: current.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('loading');
    setFormStep(3);
    
    const startTime = Date.now();
    try {
      const data = await getVacationRecommendations(prefs);
      
      // Ensure loading screen is visible for at least 2.5 seconds for UX
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 2500) {
        await new Promise(resolve => setTimeout(resolve, 2500 - elapsedTime));
      }
      
      setResults(data);
      setStep('results');
    } catch (err: any) {
      console.error("Failed to get recommendations:", err);
      // Even on error, wait a bit so the transition isn't jarring
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 1500) {
        await new Promise(resolve => setTimeout(resolve, 1500 - elapsedTime));
      }
      
      setStep('form');
      setFormStep(2);
      
      let message = "We encountered a cosmic drift. Please ensure your search preferences are clear or try again in a moment.";
      if (err.message) {
        if (err.message.includes("API_KEY_INVALID")) {
          message = "Your celestial key (API Key) is invalid. Please check your configuration.";
        } else if (err.message.includes("quota")) {
          message = "Our star-charts are busy! The daily travel quota has been reached. Please try again tomorrow.";
        } else {
          message = `Connection issue: ${err.message}`;
        }
      }
      setError(message);
    }
  };

  const handleActivityInputChange = (value: string) => {
    setActivityInput(value);
    if (value.trim().length > 0) {
      const filtered = SUGGESTED_ACTIVITIES.filter(act => 
        act.toLowerCase().includes(value.toLowerCase()) && !prefs.activities.includes(act)
      );
      setFilteredActivities(filtered);
      setShowActivitySuggestions(true);
    } else {
      const filtered = SUGGESTED_ACTIVITIES.filter(act => !prefs.activities.includes(act));
      setFilteredActivities(filtered);
      setShowActivitySuggestions(true);
    }
  };

  const addActivity = (activity?: string) => {
    const activityToAdd = activity || activityInput.trim();
    if (activityToAdd && !prefs.activities.includes(activityToAdd)) {
      setPrefs({ ...prefs, activities: [...prefs.activities, activityToAdd] });
      setActivityInput('');
      setShowActivitySuggestions(false);
    }
  };

  const removeActivity = (act: string) => {
    setPrefs({ ...prefs, activities: prefs.activities.filter(a => a !== act) });
  };

  return (
    <div className="min-h-screen bg-med-cream font-sans text-med-blue selection:bg-med-terracotta/20 selection:text-med-terracotta">
      <AnimatePresence mode="wait">
        {step === 'hero' && (
          <motion.div 
            ref={heroRef}
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative h-screen flex items-center justify-center overflow-hidden"
          >
            <motion.div 
              style={{ y: heroY, scale: heroScale }}
              className="absolute inset-0 z-0"
            >
              <SafeImage 
                src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=2070" 
                alt="Mediterranean Coast" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-med-blue/80 via-med-blue/40 to-med-cream" />
            </motion.div>
            <motion.div 
              style={{ opacity: heroOpacity }}
              className="relative z-10 text-center px-4 max-w-5xl"
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex justify-center mb-10">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1, boxShadow: '0 0 40px rgba(255,255,255,0.4)' }}
                    className="bg-white/10 backdrop-blur-md p-6 rounded-full border border-white/30 shadow-2xl"
                  >
                    <Compass className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                <h1 className="text-7xl md:text-9xl font-serif italic text-white mb-8 tracking-tight leading-none drop-shadow-2xl">
                  Discover Your <br />
                  <span className="font-serif not-italic text-med-cream">Sanctuary</span>
                </h1>
                <p className="text-xl md:text-2xl text-white mb-12 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-xl">
                  Beyond the map lies a feeling. Let our AI curate the journey that resonates with your spirit.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#C05E41', color: '#FEFAE0', boxShadow: '0 0 30px rgba(192, 94, 65, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="group bg-white text-med-blue px-12 py-6 rounded-full text-xl font-bold transition-all flex items-center gap-4 mx-auto shadow-2xl border border-white/20"
                >
                  Begin Exploration
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto py-20 px-6"
          >
            {/* Progress Bar */}
            <div className="mb-20 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4 relative">
                {[
                  { step: 1, label: 'Preferences' },
                  { step: 2, label: 'Logistics' },
                  { step: 3, label: 'Suggestions' }
                ].map((s, i) => (
                  <div key={s.step} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 border-2 ${
                      formStep >= s.step 
                      ? 'bg-med-blue border-med-blue text-white shadow-lg glow-blue' 
                      : 'bg-white border-med-sand text-med-olive'
                    }`}>
                      {formStep > s.step ? <Check className="w-5 h-5" /> : s.step}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-3 transition-colors duration-500 ${
                      formStep >= s.step ? 'text-med-blue' : 'text-med-olive opacity-40'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                ))}
                {/* Connector Lines */}
                <div className="absolute left-0 right-0 top-5 h-[2px] bg-med-sand -z-0 mx-auto max-w-[80%]" />
                <motion.div 
                  initial={false}
                  animate={{ width: formStep === 1 ? '0%' : formStep === 2 ? '50%' : '100%' }}
                  className="absolute left-[10%] right-0 top-5 h-[2px] bg-med-blue -z-0 max-w-[80%] origin-left"
                />
              </div>
            </div>

            <div className="mb-20 text-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-med-terracotta font-bold uppercase tracking-[0.3em] text-xs mb-6 block"
              >
                {formStep === 1 ? "The Wanderer's Questionnaire" : "Finalizing the Journey"}
              </motion.span>
              <h2 className="text-6xl font-serif italic mb-10 tracking-tight text-med-blue">
                {formStep === 1 ? "Design Your Escape" : "Travel Logistics"}
              </h2>
              
              {formStep === 1 && (
                <div className="flex justify-center mb-12">
                  <div className="bg-white/40 backdrop-blur-md p-2 rounded-full border border-white/60 flex items-center gap-2 shadow-xl shadow-med-blue/5">
                    <button
                      onClick={() => setFormMode('guided')}
                      className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold transition-all ${
                        formMode === 'guided' 
                        ? 'bg-med-blue text-white shadow-lg' 
                        : 'text-med-blue hover:bg-white/50'
                      }`}
                    >
                      <LayoutGrid className="w-5 h-5" />
                      Guided Selection
                    </button>
                    <button
                      onClick={() => setFormMode('free')}
                      className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold transition-all ${
                        formMode === 'free' 
                        ? 'bg-med-blue text-white shadow-lg' 
                        : 'text-med-blue hover:bg-white/50'
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />
                      Describe Your Dream
                    </button>
                  </div>
                </div>
              )}
              
              <p className="text-med-olive text-xl font-medium italic opacity-80">
                {formStep === 1 
                  ? (formMode === 'guided' ? "We'll handle the logistics, you handle the dreaming." : "Tell us about your ideal vacation in your own words.")
                  : "Just a few more details to find your perfect match."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-24">
              <AnimatePresence mode="wait">
                {formStep === 1 ? (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-24"
                  >
                    {formMode === 'guided' ? (
                      <div className="space-y-24">
                        {/* Climate - Multi Select */}
                        <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                          <div className="flex items-center gap-4 mb-12">
                            <div className="p-3 bg-med-sand rounded-2xl">
                              <Sun className="w-6 h-6 text-med-terracotta" />
                            </div>
                            <h3 className="text-2xl font-serif text-med-blue">Preferred Climates</h3>
                            <span className="text-[10px] font-bold text-med-olive uppercase ml-auto bg-med-sand px-3 py-1.5 rounded-full tracking-widest">Multi-select</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {CLIMATES.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => toggleMultiSelect('climate', c.id)}
                                className={`group relative flex flex-col items-center p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
                                  prefs.climate.includes(c.id) 
                                  ? 'border-med-terracotta bg-white shadow-xl ring-8 ring-med-terracotta/5' 
                                  : 'border-transparent bg-white/50 hover:bg-white hover:shadow-lg'
                                }`}
                              >
                                <c.icon className={`w-12 h-12 mb-4 transition-transform group-hover:scale-110 ${
                                  prefs.climate.includes(c.id) ? 'text-med-terracotta' : 'text-med-olive'
                                }`} />
                                <span className="font-bold text-med-blue tracking-tight">{c.label}</span>
                                {prefs.climate.includes(c.id) && (
                                  <div className="absolute top-4 right-4">
                                    <CheckCircle2 className="w-6 h-6 text-med-terracotta" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </section>

                        {/* Budget & Style */}
                        <div className="grid md:grid-cols-2 gap-12">
                          <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                            <div className="flex items-center gap-4 mb-12">
                              <div className="p-3 bg-med-sand rounded-2xl">
                                <Wallet className="w-6 h-6 text-med-terracotta" />
                              </div>
                              <h3 className="text-2xl font-serif text-med-blue">Budget Range</h3>
                            </div>
                            <div className="space-y-6">
                              {BUDGETS.map((b) => (
                                <motion.button
                                  whileHover={{ x: 10, backgroundColor: '#fff' }}
                                  whileTap={{ scale: 0.98 }}
                                  key={b.id}
                                  type="button"
                                  onClick={() => setPrefs({ ...prefs, budget: b.id as any })}
                                  className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 ${
                                    prefs.budget === b.id 
                                    ? 'border-med-terracotta bg-white shadow-lg' 
                                    : 'border-transparent bg-white/50 hover:bg-white'
                                  }`}
                                >
                                  <div className="text-left">
                                    <div className="font-bold text-med-blue text-lg">{b.label}</div>
                                    <div className="text-sm text-med-olive font-medium opacity-70">{b.desc}</div>
                                  </div>
                                  {prefs.budget === b.id && <div className="w-4 h-4 rounded-full bg-med-terracotta" />}
                                </motion.button>
                              ))}
                            </div>
                          </section>

                          <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                            <div className="flex items-center gap-4 mb-12">
                              <div className="p-3 bg-med-sand rounded-2xl">
                                <Sparkles className="w-6 h-6 text-med-terracotta" />
                              </div>
                              <h3 className="text-2xl font-serif text-med-blue">Travel Styles</h3>
                              <span className="text-[10px] font-bold text-med-olive uppercase ml-auto bg-med-sand px-3 py-1.5 rounded-full tracking-widest">Multi-select</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              {STYLES.map((s) => (
                                <motion.button
                                  whileHover={{ x: 10, backgroundColor: '#fff' }}
                                  whileTap={{ scale: 0.98 }}
                                  key={s.id}
                                  type="button"
                                  onClick={() => toggleMultiSelect('travelStyle', s.id)}
                                  className={`w-full p-6 rounded-3xl border-2 text-left transition-all duration-300 ${
                                    prefs.travelStyle.includes(s.id) 
                                    ? 'border-med-terracotta bg-white shadow-lg' 
                                    : 'border-transparent bg-white/50 hover:bg-white'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-med-blue text-lg">{s.label}</span>
                                    {prefs.travelStyle.includes(s.id) && <CheckCircle2 className="w-5 h-5 text-med-terracotta" />}
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </section>
                        </div>

                        {/* Activities */}
                        <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                          <div className="flex items-center gap-4 mb-12">
                            <div className="p-3 bg-med-sand rounded-2xl">
                              <Palmtree className="w-6 h-6 text-med-terracotta" />
                            </div>
                            <h3 className="text-2xl font-serif text-med-blue">Must-Have Activities</h3>
                          </div>
                          <div className="relative mb-8" ref={activitySuggestionRef}>
                            <div className="flex gap-4">
                              <input
                                type="text"
                                value={activityInput}
                                onChange={(e) => handleActivityInputChange(e.target.value)}
                                onFocus={() => {
                                  if (activityInput.trim().length === 0) {
                                    setFilteredActivities(SUGGESTED_ACTIVITIES.filter(act => !prefs.activities.includes(act)));
                                  } else {
                                    const filtered = SUGGESTED_ACTIVITIES.filter(act => 
                                      act.toLowerCase().includes(activityInput.toLowerCase()) && !prefs.activities.includes(act)
                                    );
                                    setFilteredActivities(filtered);
                                  }
                                  setShowActivitySuggestions(true);
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
                                placeholder="e.g. Scuba diving, Art galleries, Local food tour..."
                                className="flex-1 px-8 py-6 rounded-3xl border-2 border-transparent bg-white/50 focus:bg-white focus:border-med-terracotta focus:ring-8 focus:ring-med-terracotta/5 outline-none transition-all text-lg font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => addActivity()}
                                className="bg-med-blue text-white px-10 py-6 rounded-3xl font-bold hover:bg-med-terracotta transition-all shadow-xl"
                              >
                                Add
                              </button>
                            </div>

                            <AnimatePresence>
                              {showActivitySuggestions && filteredActivities.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-med-sand overflow-hidden max-h-64 overflow-y-auto custom-scrollbar"
                                >
                                  {filteredActivities.map((act, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => addActivity(act)}
                                      className="w-full px-8 py-4 text-left hover:bg-med-cream transition-colors text-med-blue font-medium border-b border-med-sand last:border-0 flex items-center gap-3"
                                    >
                                      <Sparkles className="w-4 h-4 text-med-terracotta opacity-50" />
                                      {act}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {prefs.activities.map((act) => (
                              <motion.span 
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                key={act} 
                                className="bg-white border border-med-sand text-med-blue px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-4 shadow-sm"
                              >
                                {act}
                                <button type="button" onClick={() => removeActivity(act)} className="text-med-olive hover:text-med-terracotta transition-colors">
                                  <RefreshCw className="w-4 h-4 rotate-45" />
                                </button>
                              </motion.span>
                            ))}
                          </div>
                        </section>

                        {/* Duration & Companions */}
                        <div className="grid md:grid-cols-2 gap-12">
                          <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                            <div className="flex items-center gap-4 mb-12">
                              <div className="p-3 bg-med-sand rounded-2xl">
                                <Users className="w-6 h-6 text-med-terracotta" />
                              </div>
                              <h3 className="text-2xl font-serif text-med-blue">Companions</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              {COMPANIONS.map((c) => (
                                <motion.button
                                  whileHover={{ scale: 1.02, backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(30, 58, 95, 0.05)' }}
                                  whileTap={{ scale: 0.98 }}
                                  key={c.id}
                                  type="button"
                                  onClick={() => setPrefs({ ...prefs, companions: c.id as any })}
                                  className={`p-6 rounded-3xl border-2 text-center transition-all duration-300 ${
                                    prefs.companions === c.id 
                                    ? 'border-med-terracotta bg-white shadow-lg' 
                                    : 'border-transparent bg-white/50 hover:bg-white'
                                  }`}
                                >
                                  <span className="font-bold text-med-blue text-lg">{c.label}</span>
                                </motion.button>
                              ))}
                            </div>
                          </section>
                          <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                            <div className="flex items-center gap-4 mb-12">
                              <div className="p-3 bg-med-sand rounded-2xl">
                                <Calendar className="w-6 h-6 text-med-terracotta" />
                              </div>
                              <h3 className="text-2xl font-serif text-med-blue">Trip Duration</h3>
                            </div>
                            <div className="relative">
                              <select
                                value={prefs.duration}
                                onChange={(e) => setPrefs({ ...prefs, duration: e.target.value })}
                                className="w-full px-8 py-6 rounded-3xl border-2 border-transparent bg-white/50 focus:bg-white focus:border-med-terracotta outline-none transition-all appearance-none font-bold text-lg text-med-blue"
                              >
                                <option>Weekend</option>
                                <option>3–5 days</option>
                                <option>7–10 days</option>
                                <option>2+ weeks</option>
                              </select>
                              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ArrowRight className="w-6 h-6 rotate-90 text-med-olive opacity-50" />
                              </div>
                            </div>
                          </section>
                        </div>
                      </div>
                    ) : (
                      <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                        <div className="flex items-center gap-4 mb-12">
                          <div className="p-3 bg-med-sand rounded-2xl">
                            <MessageSquare className="w-6 h-6 text-med-terracotta" />
                          </div>
                          <h3 className="text-2xl font-serif text-med-blue">Describe Your Dream Vacation</h3>
                        </div>
                        <textarea
                          value={prefs.freeText}
                          onChange={(e) => setPrefs({ ...prefs, freeText: e.target.value })}
                          placeholder="e.g. I'm looking for a secluded beach destination with crystal clear water, where I can go snorkeling but also have access to high-end dining. I love Mediterranean vibes and want somewhere quiet but luxurious..."
                          className="w-full h-64 px-8 py-8 rounded-[2.5rem] border-2 border-transparent bg-white/50 focus:bg-white focus:border-med-terracotta focus:ring-8 focus:ring-med-terracotta/5 outline-none transition-all text-xl font-medium italic leading-relaxed custom-scrollbar"
                        />
                      </section>
                    )}
                    
                    <div className="flex justify-end">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(30, 58, 95, 0.2)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormStep(2)}
                        className="bg-med-blue text-white px-12 py-6 rounded-full text-xl font-bold flex items-center gap-4 shadow-xl"
                      >
                        Next Step
                        <ArrowRight className="w-6 h-6" />
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-24"
                  >
                    {/* Distance Preference */}
                    <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                      <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-med-sand rounded-2xl">
                          <Compass className="w-6 h-6 text-med-terracotta" />
                        </div>
                        <h3 className="text-2xl font-serif text-med-blue">How far are you willing to go?</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {DISTANCES.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setPrefs({ ...prefs, maxTravelDistance: d.id as any })}
                            className={`flex flex-col p-8 rounded-[2.5rem] border-2 text-left transition-all duration-500 ${
                              prefs.maxTravelDistance === d.id 
                              ? 'border-med-terracotta bg-white shadow-xl ring-8 ring-med-terracotta/5' 
                              : 'border-transparent bg-white/50 hover:bg-white hover:shadow-lg'
                            }`}
                          >
                            <span className="font-bold text-med-blue mb-2 text-lg">{d.label}</span>
                            <span className="text-sm text-med-olive font-medium opacity-70">{d.desc}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Traveling From */}
                    <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                      <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-med-sand rounded-2xl">
                          <MapPin className="w-6 h-6 text-med-terracotta" />
                        </div>
                        <h3 className="text-2xl font-serif text-med-blue">Where are you traveling from?</h3>
                      </div>
                      <div className="relative" ref={suggestionRef}>
                        <input
                          type="text"
                          required
                          value={prefs.travelingFrom}
                          onChange={(e) => handleCityChange(e.target.value)}
                          onFocus={() => {
                            if (prefs.travelingFrom.trim().length === 0) {
                              setFilteredCities(COMMON_CITIES);
                            } else {
                              const filtered = COMMON_CITIES.filter(city => 
                                city.toLowerCase().includes(prefs.travelingFrom.toLowerCase())
                              );
                              setFilteredCities(filtered);
                            }
                            setShowSuggestions(true);
                          }}
                          placeholder="Enter your city (e.g. London, UK)"
                          className="w-full px-8 py-6 rounded-3xl border-2 border-transparent bg-white/50 focus:bg-white focus:border-med-terracotta focus:ring-8 focus:ring-med-terracotta/5 outline-none transition-all text-lg font-medium"
                        />
                        <AnimatePresence>
                          {showSuggestions && filteredCities.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-med-sand overflow-hidden max-h-80 overflow-y-auto custom-scrollbar"
                            >
                              {filteredCities.map((city, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setPrefs({ ...prefs, travelingFrom: city });
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full px-8 py-4 text-left hover:bg-med-cream transition-colors text-med-blue font-medium border-b border-med-sand last:border-0 flex items-center gap-3"
                                >
                                  <MapPin className="w-4 h-4 text-med-terracotta opacity-50" />
                                  {city}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </section>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-8 p-6 bg-red-50 border border-red-200 rounded-3xl flex items-start gap-4 text-red-800"
                        >
                          <Info className="w-6 h-6 shrink-0 mt-1" />
                          <div className="flex-1">
                            <p className="font-bold mb-1">Navigation Error</p>
                            <p className="text-sm opacity-90">{error}</p>
                            <p className="text-xs mt-3 opacity-60 font-medium">Tip: If you've published this to GitHub, ensure your API keys are configured in the environment settings.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="text-med-blue font-bold flex items-center gap-3 hover:text-med-terracotta transition-colors"
                      >
                        <ArrowLeft className="w-6 h-6" />
                        Back to Preferences
                      </button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(192, 94, 65, 0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-med-terracotta text-white px-16 py-6 rounded-full text-2xl font-bold shadow-2xl flex items-center gap-4 glow-terracotta"
                      >
                        Find My Sanctuary
                        <Sparkles className="w-6 h-6" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col items-center justify-center text-center px-4 bg-med-cream relative overflow-hidden"
          >
            {/* Elegant Background Accents */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-40 -right-40 w-96 h-96 bg-med-sand/30 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [180, 90, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-40 -left-40 w-96 h-96 bg-med-terracotta/10 rounded-full blur-3xl" 
            />

            <div className="relative mb-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 border-[1px] border-med-blue/10 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-[1px] border-dashed border-med-terracotta/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-10 border-[3px] border-transparent border-t-med-terracotta rounded-full shadow-lg shadow-med-terracotta/20"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Compass className="w-24 h-24 text-med-blue" />
              </motion.div>
            </div>

            <div className="max-w-2xl">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-med-terracotta font-bold uppercase tracking-[0.5em] text-xs mb-8 block"
              >
                Generating Your Sanctuary
              </motion.span>
              
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={loadingQuoteIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl md:text-5xl font-serif italic mb-12 tracking-tight text-med-blue h-32 flex items-center justify-center leading-relaxed"
                >
                  {LOADING_QUOTES[loadingQuoteIndex]}
                </motion.h2>
              </AnimatePresence>

              <div className="flex flex-col items-center gap-6">
                <div className="w-64 h-1 bg-med-sand rounded-full overflow-hidden relative">
                  <motion.div 
                    animate={{ 
                      x: [-256, 256],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-med-terracotta to-transparent"
                  />
                </div>
                <p className="text-med-olive text-sm font-bold uppercase tracking-[0.2em] opacity-40">
                  Refined Travel Intelligence
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto py-32 px-6"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
              <div className="max-w-3xl">
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-med-terracotta font-bold uppercase tracking-[0.4em] text-xs mb-6 block"
                >
                  Your Curated Journey
                </motion.span>
                <h2 className="text-5xl md:text-8xl font-serif italic mb-6 tracking-tight leading-none text-med-blue">
                  Your Personal <br /> <span className="not-italic text-med-terracotta">Sanctuaries</span>
                </h2>
                <p className="text-med-olive text-2xl font-medium italic opacity-80 leading-relaxed">
                  Hand-picked destinations that resonate with your unique travel spirit.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A5F', color: '#FEFAE0' }}
                onClick={() => setStep('form')}
                className="flex items-center gap-4 bg-white px-10 py-5 rounded-full text-med-blue font-bold shadow-2xl border border-med-sand hover:shadow-med-blue/10 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Refine Search
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16 mb-32">
              {results.destinations.map((dest, idx) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelectedDestination(dest)}
                  whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
                  className="group cursor-pointer relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-3xl hover:shadow-med-blue/20 transition-all duration-700 perspective-1000"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <SafeImage 
                      src={dest.imageUrl} 
                      alt={dest.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-med-blue/90 via-med-blue/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  
                  {/* Wishlist Heart */}
                  <button
                    onClick={(e) => toggleWishlist(e, dest)}
                    className="absolute top-10 right-10 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Heart 
                      className={`w-6 h-6 transition-colors ${wishlist.some(d => d.name === dest.name) ? 'fill-med-terracotta text-med-terracotta' : 'text-white'}`} 
                    />
                  </button>

                  <div className="absolute inset-0 p-12 flex flex-col justify-end">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-med-sand uppercase tracking-widest whitespace-nowrap">
                        {dest.bestTimeToVisit.split(' ')[0]}
                      </span>
                      <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-med-sand uppercase tracking-widest whitespace-nowrap">
                        {dest.estimatedDailyCost}
                      </span>
                      <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-med-sand uppercase tracking-widest whitespace-nowrap">
                        {dest.travelDistanceCategory} Haul
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-med-sand mb-4">
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-[0.3em]">{dest.country}</span>
                    </div>
                    <h3 className={`font-serif italic text-white mb-6 leading-tight ${
                      dest.name.length > 15 ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'
                    }`}>{dest.name}</h3>
                    
                    <div className="max-h-0 group-hover:max-h-64 overflow-hidden transition-all duration-700 ease-in-out">
                      <p className="text-med-cream/80 text-lg mb-8 leading-relaxed font-medium line-clamp-3 italic">
                        {dest.description}
                      </p>
                      <div className="flex items-center gap-6 text-white font-bold">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-med-terracotta" />
                          <span className="text-sm">{dest.bestTimeToVisit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-med-terracotta" />
                          <span className="text-sm">{dest.estimatedDailyCost}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-white/20 flex items-center justify-between">
                      <span className="text-med-sand font-bold text-sm tracking-widest uppercase">Explore Details</span>
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-med-terracotta transition-colors">
                        <ArrowRight className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-med-blue text-white p-20 rounded-[5rem] relative overflow-hidden shadow-3xl"
            >
              <div className="relative z-10 grid lg:grid-cols-2 gap-24 items-center">
                <div>
                  <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full text-med-sand font-bold text-xs mb-10 tracking-widest uppercase">
                    <Info className="w-4 h-4" />
                    Travel Intelligence
                  </div>
                  <h3 className="text-4xl sm:text-6xl font-serif italic mb-12 tracking-tight leading-tight">Pro Tips for <br /> Your Journey</h3>
                  <div className="space-y-6 sm:space-y-8">
                    {results.travelTips.map((tip, i) => (
                      <motion.div 
                        whileHover={{ x: 15 }}
                        key={i} 
                        className="flex items-start gap-4 sm:gap-8 p-6 sm:p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-med-terracotta text-white flex items-center justify-center text-lg sm:text-xl font-serif italic shrink-0 shadow-xl">
                          {i + 1}
                        </div>
                        <p className="text-med-sand text-lg sm:text-xl leading-relaxed font-medium italic opacity-90">{tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="hidden lg:block relative">
                  <div className="aspect-square bg-gradient-to-br from-med-terracotta/20 to-med-blue/40 rounded-[4rem] p-16 flex flex-col justify-center items-center text-center border border-white/10 backdrop-blur-sm">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 8, repeat: Infinity }}
                    >
                      <Compass className="w-40 h-40 text-med-sand/20 mb-10" />
                    </motion.div>
                    <h4 className="text-5xl font-serif italic mb-8 tracking-tight">Ready to fly?</h4>
                    <p className="text-med-sand/80 text-2xl mb-12 font-medium italic">Your sanctuary is calling. Will you answer?</p>
                    <motion.button 
                      whileHover={{ scale: 1.05, backgroundColor: '#FEFAE0', color: '#1E3A5F' }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-med-terracotta text-white px-16 py-6 rounded-full text-xl font-bold transition-all shadow-2xl"
                    >
                      Save Itinerary
                    </motion.button>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-med-terracotta/10 blur-[150px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-med-sand/10 blur-[150px] translate-y-1/2 -translate-x-1/2" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destination Detail Modal */}
      <AnimatePresence>
        {selectedDestination && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-med-blue/90 backdrop-blur-xl"
            onClick={() => setSelectedDestination(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 40 }}
              className="bg-med-cream w-full max-w-6xl max-h-[90vh] rounded-[4rem] overflow-hidden shadow-3xl flex flex-col md:flex-row border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Side: Image & Key Info */}
              <div className="md:w-5/12 relative h-80 md:h-auto">
                <SafeImage 
                  src={selectedDestination.imageUrl} 
                  alt={selectedDestination.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-med-blue/90 via-med-blue/20 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="flex items-center gap-3 text-med-sand mb-4">
                    <MapPin className="w-6 h-6" />
                    <span className="text-lg font-bold uppercase tracking-[0.3em]">{selectedDestination.country}</span>
                  </div>
                  <h2 className={`font-serif italic text-white leading-tight mb-8 ${
                    selectedDestination.name.length > 15 ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'
                  }`}>
                    {selectedDestination.name}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 text-white text-xs sm:text-sm font-bold italic leading-tight">
                      {selectedDestination.bestTimeToVisit}
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 text-white text-xs sm:text-sm font-bold italic leading-tight">
                      {selectedDestination.estimatedDailyCost} / day
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDestination(null)}
                  className="absolute top-8 right-8 bg-white/10 backdrop-blur-md hover:bg-med-terracotta p-4 rounded-full text-white transition-all shadow-xl"
                >
                  <RefreshCw className="w-6 h-6 rotate-45" />
                </button>
                <button
                  onClick={(e) => toggleWishlist(e, selectedDestination)}
                  className="absolute top-8 right-24 bg-white/10 backdrop-blur-md p-4 rounded-full text-white transition-all shadow-xl border border-white/20 hover:bg-white/20"
                >
                  <Heart 
                    className={`w-6 h-6 transition-colors ${wishlist.some(d => d.name === selectedDestination.name) ? 'fill-med-terracotta text-med-terracotta' : 'text-white'}`} 
                  />
                </button>
              </div>

              {/* Right Side: Travel Guide Content */}
              <div id="modal-content" className="md:w-7/12 p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar bg-med-cream/50 relative">
                {loadingSimilar && (
                  <div className="absolute inset-0 z-50 bg-med-cream/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-med-sand border-t-med-terracotta rounded-full mb-6"
                    />
                    <p className="text-xl font-serif italic text-med-blue">Preparing your next sanctuary...</p>
                  </div>
                )}
                <div className="space-y-16 md:space-y-24">
                  {/* Quick Snapshot: Weather, Map, & Flights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    <a 
                      href={`https://www.google.com/search?q=weather+in+${encodeURIComponent(selectedDestination.name + ', ' + selectedDestination.country)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-5 sm:p-6 rounded-[3rem] border border-med-sand shadow-sm flex flex-col justify-between min-h-[180px] sm:min-h-[220px] group hover:border-med-terracotta transition-all"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 bg-med-sand rounded-2xl shrink-0 group-hover:bg-med-terracotta/10 transition-colors">
                          <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-med-terracotta" />
                        </div>
                        <h3 className="text-base sm:text-lg font-serif italic text-med-blue whitespace-nowrap">Weather</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 items-end">
                        <div className="overflow-hidden">
                          <p className="text-xl sm:text-2xl font-bold text-med-blue leading-none mb-1.5 truncate">{selectedDestination.weather.avgTemp}</p>
                          <p className="text-[9px] sm:text-[10px] text-med-olive italic font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] opacity-60">Avg Temp</p>
                        </div>
                        <div className="text-right overflow-hidden">
                          <p className="text-base sm:text-lg font-bold text-med-blue leading-none mb-1.5 truncate">{selectedDestination.weather.rainfall}</p>
                          <p className="text-[9px] sm:text-[10px] text-med-olive italic font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] opacity-60">Rainfall</p>
                        </div>
                      </div>
                    </a>

                    <a 
                      href={`https://www.google.com/search?q=flights+to+${encodeURIComponent(selectedDestination.name + ', ' + selectedDestination.country)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-5 sm:p-6 rounded-[3rem] border border-med-sand shadow-sm flex flex-col justify-between min-h-[180px] sm:min-h-[220px] group hover:border-med-terracotta transition-all"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 bg-med-sand rounded-2xl shrink-0 group-hover:bg-med-terracotta/10 transition-colors">
                          <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-med-terracotta" />
                        </div>
                        <h3 className="text-base sm:text-lg font-serif italic text-med-blue whitespace-nowrap">Flights</h3>
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1.5">
                          <p className="text-lg sm:text-xl font-bold text-med-blue">{selectedDestination.flightEstimate.min}</p>
                          <div className="h-[2px] w-2 sm:w-4 bg-med-sand shrink-0" />
                          <p className="text-lg sm:text-xl font-bold text-med-blue">{selectedDestination.flightEstimate.max}</p>
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-med-olive italic font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] opacity-60">Est. Round-trip</p>
                      </div>
                    </a>

                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedDestination.name + ', ' + selectedDestination.country)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-5 sm:p-6 rounded-[3rem] border border-med-sand shadow-sm overflow-hidden relative group block hover:border-med-terracotta transition-all min-h-[180px] sm:min-h-[220px]"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-3 bg-med-sand rounded-2xl shrink-0 group-hover:bg-med-terracotta/10 transition-colors">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-med-terracotta" />
                        </div>
                        <h3 className="text-base sm:text-lg font-serif italic text-med-blue whitespace-nowrap">Location</h3>
                      </div>
                      <div className="h-20 bg-med-sand/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <img 
                          src={`https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80`} 
                          alt="Map Background"
                          className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="relative z-10 flex flex-col items-center bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-white/40 shadow-sm">
                          <MapPin className="w-5 h-5 text-med-terracotta animate-bounce mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-med-blue">Open Maps</span>
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Photo Gallery Carousel */}
                  <section>
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-med-sand rounded-2xl">
                          <Sparkles className="w-6 h-6 text-med-terracotta" />
                        </div>
                        <h3 className="text-3xl font-serif italic text-med-blue">Gallery</h3>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setGalleryIndex(prev => (prev === 0 ? selectedDestination.galleryImages.length - 1 : prev - 1))}
                          className="p-3 rounded-full bg-white border border-med-sand hover:bg-med-sand transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-med-blue" />
                        </button>
                        <button 
                          onClick={() => setGalleryIndex(prev => (prev === selectedDestination.galleryImages.length - 1 ? 0 : prev + 1))}
                          className="p-3 rounded-full bg-white border border-med-sand hover:bg-med-sand transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-med-blue" />
                        </button>
                      </div>
                    </div>
                    <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-xl">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={galleryIndex}
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0"
                        >
                          <SafeImage
                            src={selectedDestination.galleryImages[galleryIndex]}
                            alt={`${selectedDestination.name} gallery ${galleryIndex}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedDestination.galleryImages.map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full transition-all ${i === galleryIndex ? 'bg-white w-6' : 'bg-white/50'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Budget Breakdown */}
                  <section className="bg-med-blue text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/10 rounded-2xl">
                            <Wallet className="w-6 h-6 text-med-sand" />
                          </div>
                          <h3 className="text-3xl font-serif italic">Budget Guide</h3>
                        </div>
                        {selectedDestination.flightEstimate && (
                          <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-4">
                            <Plane className="w-5 h-5 text-med-sand" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-med-sand opacity-60">Est. Round-trip Flight</p>
                              <p className="text-sm font-bold">{selectedDestination.flightEstimate.min} — {selectedDestination.flightEstimate.max}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                        <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/10">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-med-sand mb-2">Backpacker</p>
                          <p className="text-xl font-bold">{selectedDestination.budgetBreakdown.low}</p>
                        </div>
                        <div className="text-center p-6 rounded-3xl bg-white/10 border border-white/20 lg:scale-110 shadow-xl">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-med-sand mb-2">Comfort</p>
                          <p className="text-xl font-bold">{selectedDestination.budgetBreakdown.med}</p>
                        </div>
                        <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/10">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-med-sand mb-2">Luxury</p>
                          <p className="text-xl font-bold">{selectedDestination.budgetBreakdown.high}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-med-terracotta/20 blur-[80px] -translate-y-1/2 translate-x-1/2" />
                  </section>

                  {/* Itinerary */}
                  <section>
                    <div className="flex items-center gap-4 mb-12">
                      <div className="p-3 bg-med-sand rounded-2xl">
                        <Calendar className="w-6 h-6 text-med-terracotta" />
                      </div>
                      <h3 className="text-3xl font-serif italic text-med-blue">Sample Itinerary</h3>
                    </div>
                    <div className="space-y-10">
                      {selectedDestination.itinerary.map((day) => (
                        <div key={day.day} className="relative pl-12 border-l-2 border-med-sand">
                          <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-med-terracotta border-4 border-med-cream shadow-md" />
                          <h4 className="text-2xl font-serif italic text-med-blue mb-4">Day {day.day}: {day.title}</h4>
                          <ul className="space-y-4">
                            {day.activities.map((act, i) => (
                              <li key={i} className="text-med-olive text-lg font-medium flex items-start gap-4 italic opacity-90">
                                <div className="w-2 h-2 rounded-full bg-med-terracotta/40 mt-2.5 shrink-0" />
                                {act}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Popular Activities */}
                  <section>
                    <div className="flex items-center gap-4 mb-12">
                      <div className="p-3 bg-med-sand rounded-2xl">
                        <Sparkles className="w-6 h-6 text-med-terracotta" />
                      </div>
                      <h3 className="text-3xl font-serif italic text-med-blue">Curated Experiences</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {selectedDestination.popularActivities.map((act, i) => (
                        <div key={i} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-med-sand shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                          <div className="flex items-center justify-between mb-4">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                              act.type === 'solo' ? 'bg-med-cream text-med-olive' : 'bg-med-terracotta/10 text-med-terracotta'
                            }`}>
                              {act.type === 'solo' ? 'On Your Own' : 'Bookable'}
                            </span>
                          </div>
                          <h5 className="text-xl font-serif italic text-med-blue mb-2">{act.name}</h5>
                          <p className="text-sm text-med-olive font-medium mb-6 italic opacity-80 leading-relaxed">{act.description}</p>
                          {act.type === 'bookable' && (
                            <a 
                              href={act.bookingUrl?.startsWith('http') ? act.bookingUrl : `https://www.google.com/search?q=${encodeURIComponent(act.name + ' ' + selectedDestination.name + ' booking')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-med-terracotta text-xs sm:text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all group w-fit max-w-full"
                            >
                              <span className="truncate">Book on {act.bookingUrl && act.bookingUrl.startsWith('http') ? 'Partner Site' : (act.bookingUrl || 'Partner Site')}</span>
                              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 shrink-0" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Best Neighborhoods */}
                  {selectedDestination.neighborhoods && selectedDestination.neighborhoods.length > 0 && (
                    <section>
                      <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-med-sand rounded-2xl">
                          <Home className="w-6 h-6 text-med-terracotta" />
                        </div>
                        <h3 className="text-3xl font-serif italic text-med-blue">Where to Stay</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {selectedDestination.neighborhoods.map((area, i) => (
                          <div key={i} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-med-sand shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                              <h5 className="text-xl font-serif italic text-med-blue truncate">{area.name}</h5>
                              <span className="text-sm font-bold text-med-terracotta shrink-0">{area.avgNightlyPrice}<span className="text-[10px] text-med-olive opacity-60 ml-1">/night</span></span>
                            </div>
                            <p className="text-sm text-med-olive font-medium mb-6 italic opacity-80 leading-relaxed">{area.description}</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                              {area.vibe.map((tag, j) => (
                                <span key={j} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-med-cream text-med-olive border border-med-sand/50">
                                  <Tag className="w-3 h-3 opacity-60" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <a 
                              href={area.bookingUrl?.startsWith('http') ? area.bookingUrl : `https://www.google.com/search?q=hotels+in+${encodeURIComponent(area.name + ' ' + selectedDestination.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-med-terracotta text-xs sm:text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all group w-fit max-w-full"
                            >
                              <span className="truncate">Book Stay in {area.name}</span>
                              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 shrink-0" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Packing List */}
                  {selectedDestination.packingList && selectedDestination.packingList.length > 0 && (
                    <section>
                      <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-med-sand rounded-2xl">
                          <Briefcase className="w-6 h-6 text-med-terracotta" />
                        </div>
                        <h3 className="text-3xl font-serif italic text-med-blue">Packing Essentials</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-8">
                        {selectedDestination.packingList.map((cat, i) => (
                          <div key={i} className="bg-white/40 p-8 rounded-[2.5rem] border border-med-sand">
                            <h4 className="text-xl font-serif italic text-med-blue mb-6 flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-med-terracotta" />
                              {cat.category}
                            </h4>
                            <ul className="space-y-3">
                              {cat.items.map((item, j) => (
                                <li key={j} className="flex items-center gap-3 text-med-olive text-sm font-medium italic">
                                  <Check className="w-4 h-4 text-med-terracotta shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Similar Destinations */}
                  <section className="pt-12 border-t border-med-sand">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-med-sand rounded-2xl">
                        <Layers className="w-6 h-6 text-med-terracotta" />
                      </div>
                      <h3 className="text-3xl font-serif italic text-med-blue">Similar Destinations</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {selectedDestination.similarDestinations.map((sim, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleSimilarClick(sim.name, sim.country)}
                          className="bg-white/50 p-6 rounded-3xl border border-med-sand flex items-center justify-between group cursor-pointer hover:bg-white transition-all gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-lg font-bold text-med-blue truncate">{sim.name}</p>
                            <p className="text-xs text-med-olive italic truncate">{sim.country}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-med-sand flex items-center justify-center group-hover:bg-med-terracotta transition-colors shrink-0">
                            <ArrowRight className="w-5 h-5 text-med-blue group-hover:text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConciergeChat currentPrefs={prefs} />

      {/* Wishlist Toggle Button */}
      {wishlist.length > 0 && (
        <motion.button 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setShowWishlist(true)}
          className="fixed top-8 right-8 z-[60] p-4 bg-white/80 backdrop-blur-md border border-med-sand rounded-full shadow-2xl flex items-center gap-3 hover:bg-white transition-all group overflow-hidden"
        >
          <div className="relative">
            <Heart className="w-6 h-6 text-med-terracotta fill-med-terracotta" />
            <span className="absolute -top-2 -right-2 bg-med-blue text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {wishlist.length}
            </span>
          </div>
          <span className="text-med-blue font-bold text-sm mr-2 select-none">Saved Sanctuaries</span>
        </motion.button>
      )}

      {/* Wishlist Modal */}
      <AnimatePresence>
        {showWishlist && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-end"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWishlist(false)}
              className="absolute inset-0 bg-med-blue/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl h-full bg-med-cream shadow-2xl border-l border-med-sand flex flex-col"
            >
              <div className="p-10 border-b border-med-sand flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-med-terracotta/10 rounded-2xl">
                    <Heart className="w-6 h-6 text-med-terracotta fill-med-terracotta" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif italic text-med-blue">Your Sanctuaries</h2>
                    <p className="text-[10px] font-bold text-med-olive uppercase tracking-[0.2em] mt-1">{wishlist.length} Destinations Saved</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWishlist(false)}
                  className="p-3 rounded-full hover:bg-med-sand transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-med-blue rotate-180" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                {wishlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Heart className="w-16 h-16 mb-6 text-med-olive" />
                    <p className="text-xl font-medium italic">No sanctuaries saved yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {wishlist.map((dest) => (
                      <div 
                        key={dest.name}
                        onClick={() => {
                          setSelectedDestination(dest);
                          setShowWishlist(false);
                        }}
                        className="group bg-white p-6 rounded-[2.5rem] border border-med-sand shadow-sm hover:shadow-xl hover:shadow-med-blue/5 transition-all cursor-pointer flex gap-6 items-center"
                      >
                        <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0">
                          <SafeImage src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-med-blue truncate">{dest.name}</h3>
                          <p className="text-sm text-med-olive italic mb-3">{dest.country}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-med-terracotta uppercase tracking-[0.1em]">{dest.estimatedDailyCost}</span>
                            <span className="w-1 h-1 rounded-full bg-med-sand" />
                            <span className="text-[10px] font-bold text-med-olive uppercase tracking-[0.1em]">{dest.travelDistanceCategory} Haul</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(e, dest);
                          }}
                          className="p-3 rounded-full hover:bg-med-sand transition-colors"
                        >
                          <Heart className="w-5 h-5 fill-med-terracotta text-med-terracotta" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-10 border-t border-med-sand bg-white/50">
                <button 
                  onClick={() => setShowWishlist(false)}
                  className="w-full bg-med-blue text-white py-5 rounded-full font-bold shadow-xl hover:shadow-med-blue/20 transition-all"
                >
                  Return to Exploration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
