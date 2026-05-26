// frontend/src/pages/Home.jsx
// Premium Home Page with mockup-styled 3-column layout

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Share2, Volume2, BarChart3, Search, Sparkles, AlertCircle, CheckCircle, Compass, Flame, Coffee, Target, Dumbbell, Zap, BookOpen, Music } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = ({ onPlay, theme, user, onStartWatchParty }) => {
  const [trendingMedia, setTrendingMedia] = useState([]);
  const [recommendedMedia, setRecommendedMedia] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const moods = [
    { id: 'relaxing', name: 'Relaxing', color: 'from-blue-400 to-cyan-400', glowClass: 'vibe-glow-blue', icon: Coffee },
    { id: 'focus', name: 'Focus', color: 'from-purple-400 to-pink-400', glowClass: 'vibe-glow-purple', icon: Target },
    { id: 'workout', name: 'Workout', color: 'from-red-400 to-orange-400', glowClass: 'vibe-glow-red', icon: Dumbbell },
    { id: 'energetic', name: 'Energetic', color: 'from-yellow-400 to-orange-400', glowClass: 'vibe-glow-yellow', icon: Zap },
    { id: 'emotional', name: 'Emotional', color: 'from-rose-400 to-pink-400', glowClass: 'vibe-glow-rose', icon: Heart },
    { id: 'study', name: 'Study', color: 'from-green-400 to-emerald-400', glowClass: 'vibe-glow-green', icon: BookOpen },
  ];

  useEffect(() => {
    fetchContent();
  }, [selectedMood]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      let trendingData = [];
      let recommendedData = [];

      try {
        const trendingRes = await axios.get('/api/media/trending', {
          params: { moodId: selectedMood, limit: 12 }
        });
        trendingData = trendingRes.data.trending || [];
      } catch (err) {
        console.error('Error fetching trending media:', err);
      }

      try {
        const recommendedRes = await axios.get('/api/recommendations/personalized', {
          params: { limit: 12 }
        });
        recommendedData = recommendedRes.data.recommendations || [];
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        // Fallback: Fetch general media list for anonymous users
        try {
          const fallbackRes = await axios.get('/api/media', {
            params: { limit: 12 }
          });
          recommendedData = fallbackRes.data.media || [];
        } catch (fallbackErr) {
          console.error('Error fetching fallback media:', fallbackErr);
        }
      }

      setTrendingMedia(trendingData);
      setRecommendedMedia(recommendedData);
    } catch (error) {
      console.error('Error in fetchContent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    try {
      setLoading(true);
      setIsSearching(true);
      const res = await axios.get('/api/media', {
        params: { search: searchQuery, limit: 12 }
      });
      setSearchResults(res.data.media || []);
    } catch (err) {
      console.error('Error searching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  // Select the first trending item as the main featured item
  const featuredItem = trendingMedia.length > 0 ? trendingMedia[0] : null;
  // Exclude featured item from the list below
  const listMedia = trendingMedia.slice(1);

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0b0c10] text-gray-100'} transition-colors duration-300`}>
      {/* Premium Hero Section */}
      <motion.div
        className={`relative h-[360px] bg-gradient-to-br ${isLight ? 'from-slate-100 via-cyan-50/70 to-blue-50 border-b border-slate-200' : 'from-slate-950 via-[#12072b] to-slate-950 border-b border-white/5'} overflow-hidden flex flex-col justify-center items-center transition-colors duration-300`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background grids and glowing orbs */}
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isLight ? 'from-cyan-300/30' : 'from-purple-900/30'} via-transparent to-transparent pointer-events-none`} />
        <div className={`absolute inset-0 bg-[linear-gradient(to_right,${isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.01)'}_1px,transparent_1px),linear-gradient(to_bottom,${isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.01)'}_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none`} />

        <motion.div
          className={`relative z-10 flex flex-col justify-center items-center text-center ${isLight ? 'text-slate-900' : 'text-white'} px-4 max-w-3xl`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isLight ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-600' : 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400'} text-xs font-semibold uppercase tracking-wider mb-5`}>
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen Streaming Vibe
          </div>
          <h1 className={`text-3xl md:text-5xl font-black mb-3 tracking-tight leading-none bg-gradient-to-r ${isLight ? 'from-slate-900 via-cyan-800 to-indigo-900' : 'from-white via-cyan-200 to-purple-400'} bg-clip-text text-transparent`}>
            Your Media. Your Mood. Your Way.
          </h1>
          <p className={`text-sm md:text-base ${isLight ? 'text-slate-600' : 'text-gray-300'} max-w-xl font-light mb-5`}>
            An interactive media hub powered by real-time moods. Discover curated video streams, immersive music tracks, and learning paths.
          </p>

          {/* Glassmorphic Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-lg relative group">
            <div className="relative">
              <input
                type="text"
                placeholder="Search videos, music, vibes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') {
                    setIsSearching(false);
                    setSearchResults([]);
                  }
                }}
                className={`w-full pl-12 pr-24 py-3.5 rounded-2xl ${isLight ? 'bg-white/80 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-cyan-500 shadow-sm' : 'bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:ring-cyan-400'} focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-md shadow-lg font-light text-sm`}
              />
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isLight ? 'text-slate-400 group-focus-within:text-cyan-600' : 'text-gray-400 group-focus-within:text-cyan-400'} transition-colors`} />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-dark-900 font-semibold text-xs hover:opacity-90 transition-all shadow-md"
              >
                Search
              </button>
            </div>
          </form>
        </motion.div>

        {/* Animated ambient background orbs */}
        <motion.div
          className={`absolute -top-20 -right-20 w-80 h-80 ${isLight ? 'bg-cyan-300/30' : 'bg-purple-600'} rounded-full blur-[120px] ${isLight ? 'opacity-20' : 'opacity-20'} pointer-events-none`}
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute -bottom-20 -left-20 w-80 h-80 ${isLight ? 'bg-blue-300/30' : 'bg-cyan-500'} rounded-full blur-[120px] ${isLight ? 'opacity-20' : 'opacity-20'} pointer-events-none`}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* 3-Column Content Layout (Mockup Style) */}
      <div className="px-4 md:px-8 py-12 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-8">
        
        {/* ==========================================
            LEFT COLUMN: Brand panel & Moods Selector
            ========================================== */}
        <div className="lg:col-span-3 xl:col-span-2 space-y-6">
          {/* Brand Card representing the second image logo */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient subtle glow background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* Large Logo Badge */}
            <div className="relative h-20 w-20 mb-4 flex-shrink-0">
              {/* Floating graphic elements */}
              <div className="absolute -top-1 -left-2 p-1 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400 transform -rotate-12 select-none">
                <Heart className="h-3 w-3 fill-current" />
              </div>
              <div className="absolute -top-2.5 -right-2 p-1 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-500 transform rotate-12 select-none">
                <Music className="h-3 w-3" />
              </div>
              <span className="absolute top-1/2 -left-4 h-2 w-2 rounded-full bg-cyan-400 select-none animate-pulse" />
              <span className="absolute -bottom-1 right-2 h-1.5 w-3 rounded-full bg-emerald-400 transform rotate-45 select-none" />
              <span className="absolute bottom-1/2 -right-3 h-1.5 w-1.5 rounded-full bg-rose-500 select-none" />
              
              {/* Circle Badge */}
              <div className="h-full w-full rounded-full bg-theme-logo-circle shadow-lg flex items-center justify-center border border-theme-logo-border transition-colors">
                <div className="flex flex-col gap-[4px] items-start w-[50%]">
                  <div className="h-[4px] w-full bg-amber-500 rounded-full" />
                  <div className="h-[4px] w-[80%] bg-amber-500 rounded-full" />
                  <div className="flex gap-[4px] items-center w-full">
                    <div className="h-[4px] w-2 bg-amber-500 rounded-full" />
                    <div className="h-[4px] w-[4px] bg-amber-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-1 text-theme-title">
              <span>Fusion</span>
              <span className="text-amber-500">One</span>
            </h2>
            <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4 leading-none">
              ALL MEDIA. ONE PLATFORM.
            </p>

            {/* User Avatars Grid */}
            <div className="flex items-center -space-x-2 mt-2">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-dark-900 object-cover animate-pulse" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="avatar" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-dark-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="avatar" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-dark-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="avatar" />
              <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center font-bold text-xs text-cyan-400 ring-2 ring-dark-900">
                +8
              </div>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold mt-2">Creators Online</span>
          </div>

          {/* Vibe Selection vertical stack */}
          <div className="glass-panel p-5 rounded-3xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-cyan-400" />
              Filter by Vibe
            </h3>
            <div className="flex flex-col gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left w-full group relative overflow-hidden ${
                    selectedMood === mood.id
                      ? 'border-cyan-400 bg-white/10 shadow-[0_0_15px_rgba(102,252,241,0.15)]'
                      : `border-white/5 bg-white/5 hover:bg-white/10 ${mood.glowClass}`
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />
                  <mood.icon className={`h-5 w-5 transition-colors ${selectedMood === mood.id ? 'text-amber-500 dark:text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                  <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">{mood.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==========================================
            CENTER COLUMN: Content, search, trending grid
            ========================================== */}
        <div className="lg:col-span-6 xl:col-span-8 space-y-8">
          
          {/* Search Results Section */}
          {isSearching && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-1 bg-cyan-400 rounded-full" />
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Search Results for <span className="text-cyan-400 font-light italic">"{searchQuery}"</span>
                </h2>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center max-w-md mx-auto">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">No matches found</h3>
                  <p className="text-sm text-gray-400">We couldn't find any videos or music matching your query. Try searching for another keyword.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {searchResults.map((media) => (
                    <MediaCard key={media._id} media={media} variants={itemVariants} onPlay={onPlay} user={user} onStartWatchParty={onStartWatchParty} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Featured Pick Card */}
          {!isSearching && featuredItem && (
            <motion.div
              className="mt-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-1 bg-amber-400 rounded-full" />
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-gray-400">Featured Release</h2>
              </div>

              <motion.div
                className="glass-panel relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col group cursor-pointer"
                whileHover={{ y: -4 }}
                onClick={() => onPlay && onPlay(featuredItem)}
              >
                {/* Image banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                  <img
                    src={featuredItem.thumbnailUrl ? (featuredItem.thumbnailUrl.startsWith('http') ? featuredItem.thumbnailUrl : `${API_BASE_URL}/${featuredItem.thumbnailUrl.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
                    alt={featuredItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' }}
                  />
                  
                  {/* Floating music notes */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.span className="absolute top-8 right-12 text-3xl opacity-80" animate={{ y: [0, -15, 0], x: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity }}>🎵</motion.span>
                    <motion.span className="absolute bottom-12 right-20 text-2xl opacity-60" animate={{ y: [0, -10, 0], x: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}>🎶</motion.span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-85" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-dark-900/80 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-wider">
                    {featuredItem.type === 'video' ? '🎥 Featured Video' : '🎵 Featured Track'}
                  </div>

                  {/* Creator Avatar Bubble Overlay */}
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border border-cyan-400 overflow-hidden shadow-lg bg-dark-900 flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block leading-none">Curated Vibe by</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        {featuredItem.creatorName} <CheckCircle className="h-3 w-3.5 text-cyan-400 fill-cyan-400/10" />
                      </span>
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300">
                    <button className="w-16 h-16 rounded-full bg-cyan-400 text-dark-900 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-all">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </button>
                  </div>
                </div>

                {/* Info block */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
                    {featuredItem.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-light line-clamp-2">
                    {featuredItem.description || 'Immerse yourself in this featured mood release. Stream and feel the vibes now.'}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Trending Section */}
          {!isSearching && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-purple-500 rounded-full" />
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    {selectedMood ? (
                      <>Trending in <span className="text-cyan-400">{moods.find(m => m.id === selectedMood)?.name}</span></>
                    ) : (
                      <>Trending Now <Flame className="h-5 w-5 text-orange-500 fill-orange-500" /></>
                    )}
                  </h2>
                </div>
              </div>
                 {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : listMedia.length === 0 && !featuredItem ? (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center max-w-md mx-auto">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">No items found</h3>
                  <p className="text-sm text-gray-400">There are no trending media items currently tagged with this vibe.</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                  variants={containerVariants}
                >
                  {listMedia.map((media) => (
                    <MediaCard key={media._id} media={media} variants={itemVariants} onPlay={onPlay} user={user} onStartWatchParty={onStartWatchParty} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Recommended Section */}
          {!isSearching && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-1 bg-cyan-400 rounded-full" />
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  Personalized Recommendations
                </h2>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : recommendedMedia.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center max-w-md mx-auto">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">No recommendations yet</h3>
                  <p className="text-sm text-gray-400">Sign in or stream some tracks to get personalized mood recommendation analytics.</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                  variants={containerVariants}
                >
                  {recommendedMedia.map((media) => (
                    <MediaCard key={media._id} media={media} variants={itemVariants} onPlay={onPlay} user={user} onStartWatchParty={onStartWatchParty} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* ==========================================
            RIGHT COLUMN: Discover Creators & Channels
            ========================================== */}
        <div className="lg:col-span-3 xl:col-span-2 space-y-6">
          {/* Discover Creators Panel */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              Discover Creators
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Alex Rivers', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', role: 'Vibe Creator', followers: '14.2K' },
                { name: 'Lara Croft', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', role: 'Audio Producer', followers: '8.9K' },
                { name: 'Marcus Aurel', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', role: 'Visual Artist', followers: '22.1K' }
              ].map((creator, i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={creator.avatar} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        {creator.name} <CheckCircle className="h-3 w-3 text-cyan-400 fill-cyan-400/10" />
                      </h4>
                      <p className="text-[10px] text-gray-400">{creator.role}</p>
                    </div>
                  </div>
                  <button className="px-2 py-1 rounded-lg bg-cyan-400/10 text-cyan-400 text-[9px] font-bold uppercase hover:bg-cyan-400 hover:text-dark-900 transition-all">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Vibe Channels */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Active Vibe Channels
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Chill Beats', listeners: '1.2K active', color: 'bg-blue-500' },
                { title: 'Workout Energy', listeners: '840 active', color: 'bg-red-500' },
                { title: 'Late Night Focus', listeners: '3.1K active', color: 'bg-purple-500' }
              ].map((channel, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-2 w-2 rounded-full ${channel.color} animate-pulse`} />
                    <div>
                      <h4 className="text-xs font-bold text-white">{channel.title}</h4>
                      <p className="text-[9px] text-gray-400">{channel.listeners}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">⚡</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================
// Media Card Component
// ============================================

const MediaCard = ({ media, variants, onPlay, user, onStartWatchParty }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(media.userLikeStatus === 'like');
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    setLiked(media.userLikeStatus === 'like');
  }, [media.userLikeStatus]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in to like items');
      return;
    }
    try {
      const res = await axios.post(`/api/media/${media._id}/like`, { type: 'like' });
      if (res.data.success) {
        const isRemoved = res.data.action === 'removed';
        setLiked(!isRemoved);
        media.userLikeStatus = isRemoved ? 'neutral' : 'like';
        if (isRemoved) {
          media.likes = Math.max(0, (media.likes || 0) - 1);
          toast.success('Removed like');
        } else {
          media.likes = (media.likes || 0) + 1;
          toast.success('Liked!');
        }
      }
    } catch (err) {
      toast.error('Could not update like status');
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?media=${media._id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  return (
    <motion.div
      variants={variants}
      className="glass-panel glass-panel-hover relative group cursor-pointer h-72 rounded-2xl overflow-hidden flex flex-col shadow-lg"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onPlay && onPlay(media)}
    >
      {/* Top half: Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-black/40">
        <img
          src={media.thumbnailUrl ? (media.thumbnailUrl.startsWith('http') ? media.thumbnailUrl : `${API_BASE_URL}/${media.thumbnailUrl.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'}
          alt={media.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60" />

        {/* Badge */}
        {media.type && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-dark-900/80 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase font-bold tracking-wider">
            {media.type === 'video' ? '🎥 Video' : '🎵 Music'}
          </div>
        )}

        {/* Hover Overlay with Play Button */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            onClick={(e) => { e.stopPropagation(); onPlay && onPlay(media); }}
            className="w-12 h-12 rounded-full bg-cyan-400 text-dark-900 flex items-center justify-center shadow-lg transition-transform pointer-events-auto"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom half: Info */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white leading-snug group-hover:text-cyan-400 transition-colors line-clamp-1">
            {media.title}
          </h3>
          
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-gray-400 truncate max-w-[140px]">{media.creatorName || 'FusionOne Creator'}</span>
            <CheckCircle className="h-3 w-3 text-cyan-400 fill-cyan-400/10 flex-shrink-0" />
          </div>
        </div>

        {/* Action and stats */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <BarChart3 className="h-3.5 w-3.5 text-cyan-400/70" />
            <span>{media.views || 0} views</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleLike}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </motion.button>
            <div className="relative">
              <motion.button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-3.5 h-3.5" />
              </motion.button>
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 bottom-9 z-50 w-44 rounded-xl border border-white/10 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowShareMenu(false);
                        const shareUrl = `${window.location.origin}/?media=${media._id}`;
                        navigator.clipboard.writeText(shareUrl)
                          .then(() => toast.success('Link copied!'))
                          .catch(() => toast.error('Failed to copy'));
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold text-gray-300 hover:bg-white/10 transition-colors uppercase tracking-wider"
                    >
                      Copy Standard Link
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowShareMenu(false);
                        if (!user) {
                          toast.error('Please sign in to start watch parties');
                          return;
                        }
                        if (onStartWatchParty) {
                          onStartWatchParty(media);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-black text-cyan-400 hover:bg-cyan-400/10 transition-colors uppercase tracking-wider"
                    >
                      Start Watch Party
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
