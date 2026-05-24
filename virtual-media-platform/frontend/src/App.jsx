import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Home from '../components/FRONTEND_COMPONENTS.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, User, LogIn, LogOut, X, Film, Music, CheckCircle, Play, Pause, XCircle, Heart, Share2,
  Home as HomeIcon, MessageSquare, Bell, Search, Settings, Sun, Moon
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Configure Axios Defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

// Setup Authorization Header Interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Logo component representing the stylized yellow F and colorful background dots
const Logo = ({ size = "md", showText = true }) => {
  const badgeSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-20 w-20" : "h-10 w-10";
  
  return (
    <div className="flex items-center gap-3">
      {/* Stylized Logo Badge */}
      <div className={`relative ${badgeSize} flex-shrink-0`}>
        {/* Floating colorful graphic vectors surrounding the circle */}
        <div className="absolute -top-1 -left-1 p-0.5 bg-purple-500/10 rounded border border-purple-500/20 text-purple-400 transform -rotate-12 select-none">
          <Heart className="h-1.5 w-1.5 fill-current" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 p-0.5 bg-amber-500/10 rounded border border-amber-500/20 text-amber-500 transform rotate-12 select-none">
          <Music className="h-1.5 w-1.5" />
        </div>
        <span className="absolute top-1/2 -left-3.5 h-1.5 w-1.5 rounded-full bg-cyan-400 select-none animate-pulse" />
        <span className="absolute -bottom-1 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400 select-none" />
        <span className="absolute bottom-1/2 -right-2.5 h-1 w-1 rounded-full bg-rose-500 select-none" />
        
        {/* Circle badge */}
        <div className="h-full w-full rounded-full bg-theme-logo-circle shadow-md flex items-center justify-center relative overflow-hidden border border-theme-logo-border transition-colors">
          {/* Yellow F symbol (3 horizontal bars + yellow dot) */}
          <div className="flex flex-col gap-[3px] items-start w-[50%]">
            {/* Top Bar */}
            <div className="h-[3px] w-full bg-amber-500 rounded-full" />
            {/* Middle Bar */}
            <div className="h-[3px] w-[80%] bg-amber-500 rounded-full" />
            {/* Bottom dot / Bar */}
            <div className="flex gap-[3px] items-center w-full">
              <div className="h-[3px] w-1.5 bg-amber-500 rounded-full" />
              <div className="h-[3px] w-[3px] bg-amber-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Branding Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline text-xl font-black tracking-tight leading-none text-theme-title">
            <span>Fusion</span>
            <span className="text-amber-500">One</span>
          </div>
          <span className="text-[7px] font-bold text-gray-400 tracking-[0.18em] mt-0.5 leading-none uppercase">
            ALL MEDIA. ONE PLATFORM.
          </span>
        </div>
      )}
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Profile Settings Form State
  const [showProfileSettingsModal, setShowProfileSettingsModal] = useState(false);
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');

  const openProfileSettings = () => {
    if (user) {
      setProfileFirstName(user.firstName || '');
      setProfileLastName(user.lastName || '');
      setProfileUsername(user.username || '');
      setProfileEmail(user.email || '');
      setProfilePassword('');
      setProfileConfirmPassword('');
      setShowProfileSettingsModal(true);
    } else {
      setAuthMode('login');
      setShowAuthModal(true);
    }
  };

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    if (profilePassword && profilePassword !== profileConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setUploading(true);
      const res = await axios.put('/api/users/profile', {
        email: profileEmail,
        username: profileUsername,
        firstName: profileFirstName,
        lastName: profileLastName,
        password: profilePassword || undefined
      });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success("Profile updated successfully!");
        setShowProfileSettingsModal(false);
        setProfilePassword('');
        setProfileConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadType, setUploadType] = useState('video');
  const [uploadCategory, setUploadCategory] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Check login status on load
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
    };
    fetchMe();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        const res = await axios.post('/api/auth/login', { email, password });
        if (res.data.success) {
          localStorage.setItem('token', res.data.token);
          setUser(res.data.user);
          toast.success(`Welcome back, ${res.data.user.username}!`);
          setShowAuthModal(false);
          // Reload page to refresh context
          window.location.reload();
        }
      } else {
        const res = await axios.post('/api/auth/register', { 
          email, username, password, firstName, lastName 
        });
        if (res.data.success) {
          localStorage.setItem('token', res.data.token);
          setUser(res.data.user);
          toast.success('Registration successful!');
          setShowAuthModal(false);
          window.location.reload();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    window.location.reload();
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadTitle) {
      toast.error('Title is required');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('description', uploadDesc);
    formData.append('type', uploadType);
    if (uploadCategory) formData.append('category', uploadCategory);

    if (uploadType === 'video' && videoFile) {
      formData.append('video', videoFile);
    } else if (uploadType === 'music' && musicFile) {
      formData.append('music', musicFile);
    }
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      // 1. Upload media
      const res = await axios.post('/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const mediaId = res.data.media._id;
        // 2. Automatically publish it
        await axios.post(`/api/media/${mediaId}/publish`);
        
        toast.success('Media uploaded and published successfully!');
        setShowUploadModal(false);
        // Clear fields
        setUploadTitle('');
        setUploadDesc('');
        setVideoFile(null);
        setMusicFile(null);
        setThumbnailFile(null);
        // Reload context
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePlayMedia = async (media) => {
    try {
      // Fetch details (to get file paths)
      const res = await axios.get(`/api/media/${media._id}`);
      if (res.data.success) {
        const mediaDetail = res.data.media;
        
        // Resolve stream URL safely
        const resolveStreamUrl = (filePath, type) => {
          if (!filePath) {
            return type === 'video'
              ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
              : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
          }
          if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            return filePath;
          }
          let cleanPath = filePath.replace(/\\/g, '/');
          if (cleanPath.startsWith('./')) {
            cleanPath = cleanPath.substring(2);
          }
          if (cleanPath.startsWith('/')) {
            cleanPath = cleanPath.substring(1);
          }
          return `${API_BASE_URL}/${cleanPath}`;
        };

        const url = resolveStreamUrl(
          mediaDetail.type === 'video' ? mediaDetail.videoUrl : mediaDetail.musicUrl,
          mediaDetail.type
        );

        setCurrentMedia({
          ...mediaDetail,
          userLikeStatus: res.data.userLikeStatus,
          streamUrl: url
        });
        setPlaying(true);
      }
    } catch (err) {
      toast.error('Could not fetch media link');
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like videos');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (!currentMedia) return;

    try {
      const res = await axios.post(`/api/media/${currentMedia._id}/like`, { type: 'like' });
      if (res.data.success) {
        // Fetch updated details to update count and like status
        const detailsRes = await axios.get(`/api/media/${currentMedia._id}`);
        if (detailsRes.data.success) {
          const updatedMedia = detailsRes.data.media;
          const userLikeStatus = detailsRes.data.userLikeStatus;
          setCurrentMedia(prev => ({
            ...updatedMedia,
            userLikeStatus,
            streamUrl: prev.streamUrl
          }));
          toast.success(res.data.action === 'removed' ? 'Removed like' : 'Liked video!');
        }
      }
    } catch (err) {
      toast.error('Could not update like status');
    }
  };

  const handleShareCurrent = () => {
    if (!currentMedia) return;
    const shareUrl = `${window.location.origin}/?media=${currentMedia._id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  // Deep linking for media shared links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mediaId = params.get('media');
    if (mediaId) {
      handlePlayMedia({ _id: mediaId });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 flex">
      <Toaster position="top-right" />

      {/* Sidebar Nav */}
      <aside className="w-20 bg-dark-900 border-r border-white/5 flex flex-col items-center py-6 gap-8 flex-shrink-0 hidden md:flex">
        {/* Logo Icon */}
        <div className="cursor-pointer" onClick={() => window.location.reload()}>
          <Logo showText={false} size="sm" />
        </div>
        
        <div className="flex flex-col gap-6 items-center flex-1 mt-6">
          <button className="p-3 text-cyan-400 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-cyan-400/20" title="Home" onClick={() => window.location.reload()}>
            <HomeIcon className="h-5 w-5" />
          </button>
          <button className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all" title="Messages" onClick={() => toast.success("Messages feature coming soon!")}>
            <MessageSquare className="h-5 w-5" />
          </button>
          <button className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all" title="Notifications" onClick={() => toast.success("No new notifications")}>
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all" title="Search" onClick={() => {
            document.querySelector("input[placeholder*='Search']")?.focus();
          }}>
            <Search className="h-5 w-5" />
          </button>
          <button className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all" title="Profile Settings" onClick={openProfileSettings}>
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-32">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0b0c10]/70 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="cursor-pointer" onClick={() => window.location.reload()}>
              <Logo />
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-gray-300 hover:text-white"
                title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-indigo-500 fill-indigo-500/10" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-400 fill-amber-400/10" />
                )}
              </button>

              {user ? (
                <>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-dark-900 transition-all hover:opacity-90 shadow-md"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                  <div 
                    onClick={openProfileSettings}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 pl-2 pr-4 py-1.5 text-sm text-gray-300 cursor-pointer hover:bg-white/10 hover:border-cyan-500/30 transition-all group shadow-md"
                    title="Edit Profile"
                  >
                    {/* Avatar Circle */}
                    <div className="relative h-7 w-7 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center font-bold text-xs text-cyan-400 group-hover:border-cyan-400 transition-all">
                      {user.username.substring(0, 2).toUpperCase()}
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-dark-900" />
                    </div>
                    <span className="font-semibold text-xs tracking-wide group-hover:text-cyan-400 transition-colors">
                      {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="rounded-xl p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4 text-cyan-400" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Home Page */}
        <Home onPlay={handlePlayMedia} theme={theme} />
      </div>

      {/* Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#1f2833]/90 p-8 shadow-2xl backdrop-blur-xl"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>

              <h2 className="text-3xl font-bold text-white mb-6">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Username</label>
                    <input 
                      type="text" 
                      required
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                      placeholder="cool_user"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-dark-900 shadow-lg hover:opacity-90 transition-all mt-4"
                >
                  {authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400">
                {authMode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setAuthMode('register')}
                      className="font-bold text-cyan-400 hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button 
                      onClick={() => setAuthMode('login')}
                      className="font-bold text-cyan-400 hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {showProfileSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#1f2833]/90 p-8 shadow-2xl backdrop-blur-xl"
            >
              <button 
                onClick={() => setShowProfileSettingsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>

              <h2 className="text-3xl font-bold text-white mb-6">
                Profile Settings
              </h2>

              <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">First Name</label>
                    <input 
                      type="text" 
                      value={profileFirstName} 
                      onChange={(e) => setProfileFirstName(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Last Name</label>
                    <input 
                      type="text" 
                      value={profileLastName} 
                      onChange={(e) => setProfileLastName(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Username</label>
                  <input 
                    type="text" 
                    required
                    value={profileUsername} 
                    onChange={(e) => setProfileUsername(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={profileEmail} 
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">New Password (leave blank to keep current)</label>
                  <input 
                    type="password" 
                    value={profilePassword} 
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={profileConfirmPassword} 
                    onChange={(e) => setProfileConfirmPassword(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={uploading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-dark-900 shadow-lg hover:opacity-90 transition-all mt-4 disabled:opacity-50"
                >
                  {uploading ? 'Updating Settings...' : 'Save Settings'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#1f2833]/90 p-8 shadow-2xl backdrop-blur-xl"
            >
              <button 
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>

              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload className="text-cyan-400" />
                Upload New Media
              </h2>

              <form onSubmit={handleUploadSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={uploadTitle} 
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="Enter awesome title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Description</label>
                  <textarea 
                    value={uploadDesc} 
                    onChange={(e) => setUploadDesc(e.target.value)}
                    rows="3"
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="Add description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Type</label>
                    <select 
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                      className="w-full rounded-xl bg-[#1f2833] border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="video">🎥 Video</option>
                      <option value="music">🎵 Music</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Category Vibe</label>
                    <select 
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full rounded-xl bg-[#1f2833] border border-white/10 p-3 text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="">Choose category...</option>
                      <option value="656860000000000000000001">🎵 Music</option>
                      <option value="656860000000000000000002">🎬 Videos</option>
                      <option value="656860000000000000000003">📚 Learning</option>
                      <option value="656860000000000000000004">🎮 Gaming</option>
                    </select>
                  </div>
                </div>

                {uploadType === 'video' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Video File</label>
                    <input 
                      type="file" 
                      accept="video/*"
                      required
                      onChange={(e) => setVideoFile(e.target.files[0])}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-400 file:text-dark-900 hover:file:opacity-90"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Audio File</label>
                    <input 
                      type="file" 
                      accept="audio/*"
                      required
                      onChange={(e) => setMusicFile(e.target.files[0])}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-400 file:text-dark-900 hover:file:opacity-90"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Thumbnail Image (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-400 file:text-dark-900 hover:file:opacity-90"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={uploading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-dark-900 shadow-lg hover:opacity-90 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-dark-900 border-t-transparent" />
                      Uploading & Processing...
                    </>
                  ) : 'Start Upload'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Floating Player Bar (Only for Music) */}
      <AnimatePresence>
        {currentMedia && currentMedia.type === 'music' && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 rounded-3xl border border-white/10 bg-[#1f2833]/95 p-4 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto"
          >
            {/* Left section: details */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-800 flex-shrink-0">
                <img 
                  src={currentMedia.thumbnailUrl ? `${API_BASE_URL}/${currentMedia.thumbnailUrl.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150'} 
                  alt={currentMedia.title}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-white truncate">{currentMedia.title}</h4>
                <p className="text-xs text-gray-400 truncate">{currentMedia.creatorName}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-semibold tracking-wider text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                  {currentMedia.type}
                </span>
              </div>
            </div>

            {/* Middle: Native Audio Player */}
            <div className="flex-1 w-full flex justify-center items-center">
              <audio 
                src={currentMedia.streamUrl} 
                controls 
                autoPlay
                className="w-full max-w-md"
              />
            </div>

            {/* Right: Close player button */}
            <div className="flex items-center justify-end w-full md:w-auto">
              <button 
                onClick={() => setCurrentMedia(null)}
                className="rounded-full bg-white/10 p-2.5 text-gray-400 hover:bg-white/20 hover:text-white"
                title="Close Player"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive YouTube-Style Video Player Overlay (For Videos) */}
      <AnimatePresence>
        {currentMedia && currentMedia.type === 'video' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-[#1f2833]/90 p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button 
                onClick={() => setCurrentMedia(null)}
                className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-gray-400 hover:bg-white/20 hover:text-white transition-colors"
                title="Exit Cinema Mode"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Large Video Player */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 relative">
                <video 
                  src={currentMedia.streamUrl} 
                  controls 
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Video Info Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="inline-block mb-2 text-xs uppercase font-bold tracking-wider text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                    Cinema Mode • Video
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">{currentMedia.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-8 w-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                      {currentMedia.creatorName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <span className="text-gray-300 font-semibold">{currentMedia.creatorName}</span>
                    <CheckCircle className="h-4 w-4 text-cyan-400 fill-cyan-400/10" />
                  </div>
                </div>

                {/* Video Actions */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleToggleLike}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all"
                  >
                    <Heart className={`h-5 w-5 text-rose-500 ${currentMedia.userLikeStatus === 'like' ? 'fill-rose-500' : ''}`} />
                    <span>{currentMedia.likes || 0}</span>
                  </button>
                  <button 
                    onClick={handleShareCurrent}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all"
                  >
                    <Share2 className="h-5 w-5 text-cyan-400" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Video Description Box */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Description</h4>
                <p className="text-sm text-gray-300 leading-relaxed font-light">
                  {currentMedia.description || 'No description provided for this video.'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
