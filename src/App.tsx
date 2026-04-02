/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Info
} from 'lucide-react';
import { TravelPreferences, Destination, RecommendationResponse } from './types';
import { getVacationRecommendations } from './services/gemini';

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

export default function App() {
  const [step, setStep] = useState<'hero' | 'form' | 'loading' | 'results'>('hero');
  const [prefs, setPrefs] = useState<TravelPreferences>({
    travelingFrom: '',
    budget: 'moderate',
    climate: ['temperate'],
    activities: [],
    duration: '1 week',
    travelStyle: ['cultural'],
    companions: 'couple',
    maxTravelDistance: 'any',
  });
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [activityInput, setActivityInput] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

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
    setStep('loading');
    try {
      const data = await getVacationRecommendations(prefs);
      setResults(data);
      setStep('results');
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      setStep('form');
      alert("Something went wrong. Please try again.");
    }
  };

  const addActivity = () => {
    if (activityInput.trim() && !prefs.activities.includes(activityInput.trim())) {
      setPrefs({ ...prefs, activities: [...prefs.activities, activityInput.trim()] });
      setActivityInput('');
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
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative h-screen flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 z-0">
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=2070" 
                alt="Mediterranean Coast" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-med-blue/40 via-med-blue/20 to-med-cream" />
            </div>
            <div className="relative z-10 text-center px-4 max-w-5xl">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex justify-center mb-10">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="bg-white/10 backdrop-blur-md p-6 rounded-full border border-white/30 shadow-2xl"
                  >
                    <Compass className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                <h1 className="text-7xl md:text-9xl font-serif italic text-white mb-8 tracking-tight leading-none drop-shadow-lg">
                  Discover Your <br />
                  <span className="font-serif not-italic text-med-cream">Sanctuary</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
                  Beyond the map lies a feeling. Let our AI curate the journey that resonates with your spirit.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#C05E41', color: '#FEFAE0' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="group bg-white text-med-blue px-12 py-6 rounded-full text-xl font-bold transition-all flex items-center gap-4 mx-auto shadow-2xl border border-white/20"
                >
                  Begin Exploration
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </motion.div>
            </div>
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
            <div className="mb-20 text-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-med-terracotta font-bold uppercase tracking-[0.3em] text-xs mb-6 block"
              >
                The Wanderer's Questionnaire
              </motion.span>
              <h2 className="text-6xl font-serif italic mb-6 tracking-tight text-med-blue">Design Your Escape</h2>
              <p className="text-med-olive text-xl font-medium italic opacity-80">We'll handle the logistics, you handle the dreaming.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-24">
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
                      <button
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
                      </button>
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
                      <button
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
                      </button>
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
                <div className="flex gap-4 mb-8">
                  <input
                    type="text"
                    value={activityInput}
                    onChange={(e) => setActivityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
                    placeholder="e.g. Scuba diving, Art galleries, Local food tour..."
                    className="flex-1 px-8 py-6 rounded-3xl border-2 border-transparent bg-white/50 focus:bg-white focus:border-med-terracotta focus:ring-8 focus:ring-med-terracotta/5 outline-none transition-all text-lg font-medium"
                  />
                  <button
                    type="button"
                    onClick={addActivity}
                    className="bg-med-blue text-white px-10 py-6 rounded-3xl font-bold hover:bg-med-terracotta transition-all shadow-xl"
                  >
                    Add
                  </button>
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
                      <button
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
                      </button>
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
                      <option>Weekend Getaway</option>
                      <option>1 week</option>
                      <option>2 weeks</option>
                      <option>3 weeks</option>
                      <option>1 month+</option>
                    </select>
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ArrowRight className="w-6 h-6 rotate-90 text-med-olive opacity-50" />
                    </div>
                  </div>
                </section>
              </div>

              {/* Traveling From - Moved to end of first page (end of form) */}
              <section className="bg-white/40 backdrop-blur-md p-12 rounded-[4rem] shadow-2xl shadow-med-blue/5 border border-white/60">
                <div className="flex items-center gap-4 mb-12">
                  <div className="p-3 bg-med-sand rounded-2xl">
                    <MapPin className="w-6 h-6 text-med-terracotta" />
                  </div>
                  <h3 className="text-2xl font-serif text-med-blue">Where are you traveling from?</h3>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={prefs.travelingFrom}
                    onChange={(e) => setPrefs({ ...prefs, travelingFrom: e.target.value })}
                    placeholder="e.g. New York, USA or London, UK"
                    className="w-full px-8 py-6 rounded-3xl border-2 border-transparent bg-white/50 focus:bg-white focus:border-med-terracotta focus:ring-8 focus:ring-med-terracotta/5 outline-none transition-all font-bold text-lg text-med-blue"
                  />
                </div>
              </section>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#C05E41' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-med-blue text-white py-10 rounded-[3rem] text-3xl font-serif italic shadow-2xl shadow-med-blue/20 transition-all flex items-center justify-center gap-6 group"
              >
                <Sparkles className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                Find My Sanctuary
              </motion.button>
            </form>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col items-center justify-center text-center px-4 bg-med-cream"
          >
            <div className="relative mb-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 border-[2px] border-med-sand border-t-med-terracotta rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Compass className="w-20 h-20 text-med-blue" />
              </motion.div>
            </div>
            <h2 className="text-5xl font-serif italic mb-8 tracking-tight text-med-blue">Consulting the Stars...</h2>
            <div className="flex gap-3 mb-8">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  className="w-4 h-4 bg-med-terracotta rounded-full shadow-lg shadow-med-terracotta/20"
                />
              ))}
            </div>
            <p className="text-med-olive text-2xl max-w-md font-medium italic opacity-80">We're scanning the globe for the sanctuaries that speak your language.</p>
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
                <h2 className="text-7xl md:text-8xl font-serif italic mb-6 tracking-tight leading-none text-med-blue">
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

            <div className="grid md:grid-cols-2 gap-16 mb-32">
              {results.destinations.map((dest, idx) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelectedDestination(dest)}
                  className="group cursor-pointer relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-3xl hover:shadow-med-blue/20 transition-all duration-700"
                >
                  <img 
                    src={dest.imageUrl} 
                    alt={dest.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-med-blue/90 via-med-blue/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  
                  <div className="absolute inset-0 p-12 flex flex-col justify-end">
                    <div className="flex items-center gap-3 text-med-sand mb-4">
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-[0.3em]">{dest.country}</span>
                    </div>
                    <h3 className="text-5xl md:text-6xl font-serif italic text-white mb-6 leading-tight">{dest.name}</h3>
                    
                    <div className="max-h-0 group-hover:max-h-48 overflow-hidden transition-all duration-700 ease-in-out">
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
                  <h3 className="text-6xl font-serif italic mb-12 tracking-tight leading-tight">Pro Tips for <br /> Your Journey</h3>
                  <div className="space-y-8">
                    {results.travelTips.map((tip, i) => (
                      <motion.div 
                        whileHover={{ x: 15 }}
                        key={i} 
                        className="flex items-start gap-8 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-med-terracotta text-white flex items-center justify-center text-xl font-serif italic shrink-0 shadow-xl">
                          {i + 1}
                        </div>
                        <p className="text-med-sand text-xl leading-relaxed font-medium italic opacity-90">{tip}</p>
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
                <img 
                  src={selectedDestination.imageUrl} 
                  alt={selectedDestination.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-med-blue/90 via-med-blue/20 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="flex items-center gap-3 text-med-sand mb-4">
                    <MapPin className="w-6 h-6" />
                    <span className="text-lg font-bold uppercase tracking-[0.3em]">{selectedDestination.country}</span>
                  </div>
                  <h2 className="text-6xl font-serif italic text-white leading-tight mb-8">{selectedDestination.name}</h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white text-sm font-bold italic">
                      {selectedDestination.bestTimeToVisit}
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white text-sm font-bold italic">
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
              </div>

              {/* Right Side: Itinerary & Activities */}
              <div className="md:w-7/12 p-12 md:p-20 overflow-y-auto custom-scrollbar bg-med-cream/50">
                <div className="space-y-20">
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
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-med-sand shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
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
                            <button className="text-med-terracotta text-sm font-bold flex items-center gap-2 hover:gap-4 transition-all group">
                              Book on {act.bookingUrl || 'Partner Site'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                            </button>
                          )}
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
    </div>
  );
}
