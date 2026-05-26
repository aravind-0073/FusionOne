import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, Plus, Users, Send, Shield, Play, Pause, ChevronUp, ChevronDown, 
  Trash2, Search, ArrowLeft, Volume2, Video, Music, Check, Share2, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WatchParty({ user, theme, initialRoomId }) {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Room Form State
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(20);

  // Active Room States
  const [socket, setSocket] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [mediaSearchResults, setMediaSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Playback sync refs
  const videoRef = useRef(null);
  const isSyncingRef = useRef(false);
  const chatBottomRef = useRef(null);

  const isLight = theme === 'light';

  // Fetch public rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/rooms');
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      toast.error('Failed to load active watch parties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentRoom) {
      fetchRooms();
    }
  }, [currentRoom]);

  useEffect(() => {
    if (initialRoomId && user) {
      const loadInitialRoom = async () => {
        try {
          const res = await axios.get(`/api/rooms/${initialRoomId}`);
          if (res.data.success) {
            joinRoomSession(res.data.room);
          }
        } catch (err) {
          toast.error('Could not find room from link');
        }
      };
      loadInitialRoom();
    }
  }, [initialRoomId, user]);

  // Handle Room Creation
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName) {
      toast.error('Room name is required');
      return;
    }
    try {
      const res = await axios.post('/api/rooms', {
        roomName,
        description,
        isPrivate,
        roomCode: isPrivate ? roomCode : undefined,
        maxParticipants
      });
      if (res.data.success) {
        toast.success(`Room "${roomName}" created!`);
        setShowCreateModal(false);
        // Clear form
        setRoomName('');
        setDescription('');
        setIsPrivate(false);
        setRoomCode('');
        
        // Enter the room
        joinRoomSession(res.data.room);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    }
  };

  // Helper to resolve stream URL
  const resolveStreamUrl = (media) => {
    if (!media) return '';
    const filePath = media.type === 'video' ? media.videoUrl : media.musicUrl;
    if (!filePath) {
      return media.type === 'video'
        ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    let cleanPath = filePath.replace(/\\/g, '/');
    if (cleanPath.startsWith('./')) cleanPath = cleanPath.substring(2);
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    return `${API_BASE_URL}/${cleanPath}`;
  };

  // Join Room Session
  const joinRoomSession = async (room) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/rooms/${room._id}`);
      if (res.data.success) {
        setCurrentRoom(res.data.room);
        setQueue(res.data.queue);
        setChatHistory(res.data.room.chatHistory || []);
        setParticipants(res.data.room.currentParticipants || []);
        
        // Initialize Socket.IO connection
        const newSocket = io(API_BASE_URL, {
          withCredentials: true,
          transports: ['websocket', 'polling']
        });

        // Join socket room
        newSocket.emit('joinRoom', {
          roomId: room._id,
          userId: user._id,
          username: user.username
        });

        // Socket listeners
        newSocket.on('userJoined', (data) => {
          setParticipants(prev => {
            if (prev.some(p => p.userId === data.userId)) return prev;
            return [...prev, { userId: data.userId, username: data.username, role: 'viewer' }];
          });
          toast.success(`${data.username} joined the party!`);
        });

        newSocket.on('userLeft', (data) => {
          setParticipants(prev => prev.filter(p => p.userId !== data.userId));
        });

        newSocket.on('newMessage', (msg) => {
          setChatHistory(prev => [...prev, msg]);
          // Scroll to bottom
          setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        });

        newSocket.on('queueSync', (syncedQueue) => {
          if (syncedQueue) setQueue(syncedQueue);
        });

        newSocket.on('queueUpdated', (data) => {
          if (data.items) {
            setQueue(prev => ({ ...prev, items: data.items, totalItems: data.items.length }));
          }
        });

        newSocket.on('voteUpdated', (data) => {
          if (data.items) {
            setQueue(prev => ({ ...prev, items: data.items }));
          }
        });

        // Playback sync listeners
        newSocket.on('playbackPlay', ({ mediaId, title, position }) => {
          if (videoRef.current) {
            isSyncingRef.current = true;
            videoRef.current.currentTime = position;
            videoRef.current.play().catch(() => {});
          }
        });

        newSocket.on('playbackPause', ({ position }) => {
          if (videoRef.current) {
            isSyncingRef.current = true;
            videoRef.current.currentTime = position;
            videoRef.current.pause();
          }
        });

        newSocket.on('playbackSeek', ({ position }) => {
          if (videoRef.current) {
            isSyncingRef.current = true;
            videoRef.current.currentTime = position;
          }
        });

        setSocket(newSocket);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to join room details');
    } finally {
      setLoading(false);
    }
  };

  // Leave Room Session
  const leaveRoomSession = () => {
    if (socket && currentRoom) {
      socket.emit('leaveRoom', { roomId: currentRoom._id, userId: user._id });
      socket.disconnect();
    }
    setSocket(null);
    setCurrentRoom(null);
    setQueue(null);
    setChatHistory([]);
    setParticipants([]);
    setMediaSearchQuery('');
    setMediaSearchResults([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Send Chat Message
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !socket || !currentRoom) return;
    socket.emit('sendMessage', {
      roomId: currentRoom._id,
      userId: user._id,
      username: user.username,
      message: chatMessage
    });
    setChatMessage('');
  };

  // Search Media to Add to Queue
  const handleMediaSearch = async (e) => {
    e.preventDefault();
    if (!mediaSearchQuery.trim()) return;
    try {
      setSearchLoading(true);
      const res = await axios.get('/api/media', {
        params: { search: mediaSearchQuery, limit: 5 }
      });
      setMediaSearchResults(res.data.media || []);
    } catch (err) {
      toast.error('Failed to search media');
    } finally {
      setSearchLoading(false);
    }
  };

  // Add Item to Queue
  const handleAddToQueue = async (media) => {
    try {
      const res = await axios.post(`/api/rooms/${currentRoom._id}/queue`, { mediaId: media._id });
      if (res.data.success) {
        toast.success(`"${media.title}" added to queue!`);
        // Notify socket
        if (socket) {
          socket.emit('addToQueue', { roomId: currentRoom._id, items: res.data.queue.items });
        }
        setQueue(res.data.queue);
        setMediaSearchQuery('');
        setMediaSearchResults([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to queue');
    }
  };

  // Vote on Queue Item
  const handleVoteQueueItem = async (queueItemId, voteType) => {
    try {
      const res = await axios.post(`/api/rooms/${currentRoom._id}/vote`, { queueItemId, voteType });
      if (res.data.success) {
        // Notify socket
        if (socket) {
          socket.emit('voteMedia', { roomId: currentRoom._id, queueItemId, userId: user._id, voteType });
        }
        setQueue(res.data.queue);
      }
    } catch (err) {
      toast.error('Voting failed');
    }
  };

  // Play a specific queue item (Host only)
  const handlePlayQueueItem = async (queueItemId) => {
    if (!queue || !currentRoom) return;
    const item = queue.items.find(i => i.queueItemId === queueItemId);
    if (!item) return;

    try {
      // Find full media stream details
      const mediaRes = await axios.get(`/api/media/${item.mediaId}`);
      if (mediaRes.data.success) {
        const fullMedia = mediaRes.data.media;
        const streamUrl = resolveStreamUrl(fullMedia);
        
        // Update Room's playing metadata on REST
        // Set currently playing
        const updatedItems = queue.items.map(i => {
          if (i.queueItemId === queueItemId) {
            return { ...i, isPlaying: true };
          }
          return { ...i, isPlaying: false };
        });

        if (socket) {
          socket.emit('addToQueue', { roomId: currentRoom._id, items: updatedItems });
          socket.emit('syncPlay', {
            roomId: currentRoom._id,
            mediaId: item.mediaId,
            title: item.mediaTitle,
            position: 0
          });
        }
        
        setQueue(prev => ({ ...prev, items: updatedItems }));
        setCurrentRoom(prev => ({
          ...prev,
          currentlyPlayingId: item.mediaId,
          currentlyPlayingTitle: item.mediaTitle
        }));
      }
    } catch (err) {
      toast.error('Could not load stream path');
    }
  };

  // Sync handlers triggered on the Host player HTML element
  const handleLocalPlay = () => {
    const isHost = currentRoom?.creatorId === user._id;
    if (!isHost) return;
    
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }
    
    if (socket && videoRef.current) {
      socket.emit('syncPlay', {
        roomId: currentRoom._id,
        mediaId: currentRoom.currentlyPlayingId,
        title: currentRoom.currentlyPlayingTitle,
        position: videoRef.current.currentTime
      });
    }
  };

  const handleLocalPause = () => {
    const isHost = currentRoom?.creatorId === user._id;
    if (!isHost) return;

    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }

    if (socket && videoRef.current) {
      socket.emit('syncPause', {
        roomId: currentRoom._id,
        position: videoRef.current.currentTime
      });
    }
  };

  const handleLocalSeek = () => {
    const isHost = currentRoom?.creatorId === user._id;
    if (!isHost) return;

    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }

    if (socket && videoRef.current) {
      socket.emit('syncSeek', {
        roomId: currentRoom._id,
        position: videoRef.current.currentTime
      });
    }
  };

  // Find currently active item in queue to stream
  const activeQueueItem = queue?.items?.find(i => i.isPlaying);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Users className="h-16 w-16 text-cyan-400 mb-4 animate-pulse" />
        <h2 className="text-2xl font-black text-white mb-2">Authentication Required</h2>
        <p className="text-xs text-gray-400 max-w-xs mb-6">
          Please sign in using the top-right button to join watch party rooms.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 max-w-[1800px] mx-auto min-h-[calc(100vh-80px)]`}>
      <AnimatePresence mode="wait">
        {!currentRoom ? (
          // ============================================
          // WATCH PARTY PORTAL VIEW
          // ============================================
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header panel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
              <div>
                <h1 className="text-3xl font-black text-theme-title tracking-tight flex items-center gap-3">
                  <Tv className="text-cyan-400 h-8 w-8 animate-pulse" />
                  Live Watch Parties
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Create a public or private room, share your stream, and manage collaborative queues in real-time.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-dark-900 shadow-lg hover:opacity-90 transition-all font-bold"
              >
                <Plus className="h-4 w-4" />
                Create Party Room
              </button>
            </div>

            {/* Room listing grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="rounded-3xl border border-white/5 bg-white/5 p-16 text-center max-w-md mx-auto">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">No Active Parties</h3>
                <p className="text-xs text-gray-400 mb-6">There are no active public watch parties right now. Be the first to start one!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-dark-900 hover:opacity-90"
                >
                  Create Room
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <motion.div
                    key={room._id}
                    whileHover={{ y: -4 }}
                    className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between h-48 cursor-pointer relative overflow-hidden"
                    onClick={() => joinRoomSession(room)}
                  >
                    <div className="absolute top-0 right-0 p-3">
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                        <Users className="h-3 w-3" /> {room.participantCount || 0} online
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide truncate pr-16">{room.roomName}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{room.description || 'Join this collaborative space to stream videos and listen to music together.'}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-cyan-400/20 flex items-center justify-center text-[10px] text-cyan-400 font-bold">
                          {room.creatorName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-gray-400">Host: {room.creatorName}</span>
                      </div>
                      <span className="text-xs text-cyan-400 font-semibold group-hover:underline">Join Party &rarr;</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          // ============================================
          // ACTIVE WATCH ROOM VIEW
          // ============================================
          <motion.div
            key="room"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left and Center Panel (Video & Queue) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Back nav bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <button
                  onClick={leaveRoomSession}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold"
                >
                  <ArrowLeft className="h-4 w-4" /> Exit Room
                </button>
                <div className="text-right">
                  <h2 className="text-lg font-bold text-white leading-tight">{currentRoom.roomName}</h2>
                  <p className="text-[10px] text-gray-400">Host: {currentRoom.creatorName}</p>
                </div>
              </div>

              {/* Streaming Video Screen */}
              <div className="aspect-video w-full rounded-3xl bg-black border border-white/10 overflow-hidden relative shadow-2xl">
                {activeQueueItem ? (
                  <>
                    <video
                      ref={videoRef}
                      src={resolveStreamUrl(activeQueueItem)}
                      className="w-full h-full object-contain"
                      controls={currentRoom.creatorId === user._id}
                      onPlay={handleLocalPlay}
                      onPause={handleLocalPause}
                      onSeeked={handleLocalSeek}
                      autoPlay
                    />
                    {currentRoom.creatorId !== user._id && (
                      <div className="absolute top-4 left-4 bg-cyan-400/90 text-dark-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md pointer-events-none flex items-center gap-1.5 animate-pulse">
                        <Check className="h-3.5 w-3.5" /> Synced to Host Playback
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-slate-950/60 backdrop-blur-sm">
                    <Tv className="h-16 w-16 text-gray-600 mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-white mb-1">No media playing</h3>
                    <p className="text-xs text-gray-400 max-w-sm">
                      {currentRoom.creatorId === user._id
                        ? 'Search for videos in the library below, add them to the queue, and click play to begin streaming.'
                        : 'Waiting for the Host to start playing media.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Collaborative Queue Section */}
              <div className="glass-panel p-6 rounded-3xl space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Music className="text-cyan-400 h-5 w-5" />
                    Collaborative Queue ({queue?.items?.length || 0})
                  </h3>
                </div>

                {/* Queue list */}
                {!queue || queue.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    Queue is empty. Add tracks below to start the party!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queue.items.map((item, index) => (
                      <div
                        key={item.queueItemId}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          item.isPlaying
                            ? 'bg-cyan-400/10 border-cyan-400/40 shadow-sm'
                            : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xs font-bold text-gray-500 w-4">{index + 1}</span>
                          <div className="h-12 w-16 overflow-hidden rounded-xl bg-slate-800 flex-shrink-0 border border-white/5 relative">
                            <img
                              src={item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${API_BASE_URL}/${item.thumbnail.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'}
                              alt={item.mediaTitle}
                              className="h-full w-full object-cover"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150' }}
                            />
                            {item.isPlaying && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate leading-snug">{item.mediaTitle}</h4>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">Added by {item.addedByUsername}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 ml-4">
                          {/* Voting block */}
                          <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1 gap-1">
                            <button
                              onClick={() => handleVoteQueueItem(item.queueItemId, 'upvote')}
                              className="p-1 hover:text-cyan-400 text-gray-400 transition-colors"
                              title="Upvote"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-bold text-cyan-400 px-1">{item.votes || 0}</span>
                            <button
                              onClick={() => handleVoteQueueItem(item.queueItemId, 'downvote')}
                              className="p-1 hover:text-rose-400 text-gray-400 transition-colors"
                              title="Downvote"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Host play button */}
                          {currentRoom.creatorId === user._id && !item.isPlaying && (
                            <button
                              onClick={() => handlePlayQueueItem(item.queueItemId)}
                              className="p-2 rounded-xl bg-cyan-400 text-dark-900 hover:opacity-90 font-bold text-xs flex items-center gap-1"
                              title="Play immediately"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" /> Play
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search & Add Media Drawer */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Add Media to Queue</h4>
                  <form onSubmit={handleMediaSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search songs or videos..."
                        value={mediaSearchQuery}
                        onChange={(e) => setMediaSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs focus:ring-cyan-400 focus:outline-none focus:border-transparent"
                      />
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/5 hover:bg-white/15 text-xs text-white font-semibold transition-all"
                    >
                      Search
                    </button>
                  </form>

                  {/* Search results */}
                  <AnimatePresence>
                    {mediaSearchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-dark-900 border border-white/10 rounded-2xl p-4 space-y-2.5 shadow-2xl"
                      >
                        {searchLoading ? (
                          <div className="text-center py-4 text-xs text-gray-400">Searching library...</div>
                        ) : (
                          mediaSearchResults.map((media) => (
                            <div key={media._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-12 overflow-hidden rounded-lg bg-slate-800 flex-shrink-0">
                                  <img
                                    src={media.thumbnailUrl ? (media.thumbnailUrl.startsWith('http') ? media.thumbnailUrl : `${API_BASE_URL}/${media.thumbnailUrl.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
                                    alt={media.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-white truncate">{media.title}</h5>
                                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{media.creatorName} • {media.type}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddToQueue(media)}
                                className="px-2.5 py-1.5 rounded-lg bg-cyan-400 text-dark-900 font-bold text-[10px] hover:opacity-90"
                              >
                                + Add
                              </button>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right Panel (Live Chat & Members) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Active Members Card */}
              <div className="glass-panel p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-cyan-400" /> Room Participants ({participants.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {participants.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 font-semibold"
                    >
                      <div className="h-4 w-4 rounded-full bg-cyan-400/20 text-[8px] font-black text-cyan-400 flex items-center justify-center">
                        {p.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span>{p.username}</span>
                      {p.role === 'host' && <Shield className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10 ml-0.5" title="Host" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Card */}
              <div className="glass-panel rounded-3xl flex flex-col h-[500px] overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="h-4 w-4 text-cyan-400" /> Live Chat
                  </h3>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-xs text-gray-500">
                      Welcome to the Party! Send a message to start chatting.
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.userId === user._id
                            ? 'bg-cyan-400/10 border border-cyan-400/20 self-end ml-auto'
                            : 'bg-white/5 border border-white/5 self-start mr-auto'
                        }`}
                      >
                        <span className="font-bold text-[9px] text-cyan-400 tracking-wide uppercase mb-0.5">
                          {msg.username}
                        </span>
                        <p className="text-gray-200">{msg.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Form Input */}
                <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    placeholder="Send a chat message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs focus:ring-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-cyan-400 text-dark-900 hover:opacity-90 flex items-center justify-center transition-all"
                  >
                    <Send className="h-4 w-4 fill-current" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#1f2833]/90 p-8 shadow-2xl backdrop-blur-xl space-y-5"
            >
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="text-cyan-400" /> Start Watch Room
              </h2>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Room Name</label>
                  <input
                    type="text"
                    required
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="Enter room name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    placeholder="Tell everyone what we are watching..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Max Participants</label>
                    <input
                      type="number"
                      min="2"
                      max="100"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase h-11 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded border-white/10 bg-[#1f2833] text-cyan-400 focus:ring-cyan-400"
                      />
                      Private Room
                    </label>
                  </div>
                </div>

                <AnimatePresence>
                  {isPrivate && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Room Code / Password</label>
                      <input
                        type="text"
                        required={isPrivate}
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                        placeholder="Enter room password code"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-xl bg-white/5 border border-white/10 py-3 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-xs font-semibold text-dark-900 shadow-lg hover:opacity-90 font-bold"
                  >
                    Create & Join
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
