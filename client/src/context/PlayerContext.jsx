import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { resolveMediaUrl, recordPlayApi } from '../services/api';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('sunteraho_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Play Event Listening Threshold Tracking
  const listenAccumulatorRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hasRecordedPlayRef = useRef(false);
  const sessionIdRef = useRef(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Track cumulative listening duration
      if (!audio.paused && !audio.seeking) {
        const delta = audio.currentTime - lastTimeRef.current;
        if (delta > 0 && delta < 2) {
          listenAccumulatorRef.current += delta;
        }
        lastTimeRef.current = audio.currentTime;

        // Check if listening threshold (30s or 50% of duration) reached
        const threshold = Math.min(30, Math.max(5, (audio.duration || 180) * 0.5));
        if (
          !hasRecordedPlayRef.current &&
          listenAccumulatorRef.current >= threshold &&
          currentSong?._id
        ) {
          hasRecordedPlayRef.current = true;
          recordPlayApi(currentSong._id, {
            listenDuration: Math.round(listenAccumulatorRef.current),
            sessionId: sessionIdRef.current,
          })
            .then((res) => {
              if (res.data?.success && res.data.playsCount !== undefined) {
                // Update song play count locally
                setCurrentSong((prev) => (prev ? { ...prev, playsCount: res.data.playsCount } : prev));
              }
            })
            .catch((err) => {
              console.warn('[Play Event Log Error]:', err.message);
            });
        }
      } else {
        lastTimeRef.current = audio.currentTime;
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || currentSong?.duration || 0);
      setIsBuffering(false);
      setPlayerError(null);
    };

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setPlayerError(null);
    };
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch((err) => console.warn('Replay failed:', err.message));
      } else {
        nextTrack();
      }
    };

    const onError = (e) => {
      console.warn('Audio playback error:', e);
      setIsBuffering(false);
      setIsPlaying(false);
      setPlayerError('Unable to stream this audio track. Check network connection or audio source.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [currentSong, repeatMode, volume, isMuted]);

  // Update volume
  const changeVolume = (newVol) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    localStorage.setItem('sunteraho_volume', clamped.toString());
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume || 0.5;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  // Play a specific song
  const playSong = (song, newQueue = null) => {
    if (!song) return;

    // Reset play threshold tracker for the new song
    listenAccumulatorRef.current = 0;
    lastTimeRef.current = 0;
    hasRecordedPlayRef.current = false;
    setPlayerError(null);

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((s) => s._id === song._id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else if (!queue.some((s) => s._id === song._id)) {
      setQueue((prev) => [...prev, song]);
      setQueueIndex(queue.length);
    }

    setCurrentSong(song);
    setCurrentTime(0);

    const audio = audioRef.current;
    const mediaUrl = resolveMediaUrl(song.audioUrl);
    audio.src = mediaUrl;
    audio.load();

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn('Autoplay restricted or playback interrupted:', err.message);
        setIsPlaying(false);
      });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentSong) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Play request error:', err.message);
        });
    }
  };

  const seek = (seconds) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = seconds;
      setCurrentTime(seconds);
      lastTimeRef.current = seconds;
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;

    let nextIdx;
    if (isShuffle && queue.length > 1) {
      nextIdx = Math.floor(Math.random() * queue.length);
      if (nextIdx === queueIndex) {
        nextIdx = (queueIndex + 1) % queue.length;
      }
    } else {
      nextIdx = queueIndex + 1;
    }

    if (nextIdx < queue.length) {
      setQueueIndex(nextIdx);
      playSong(queue[nextIdx]);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
      playSong(queue[0]);
    } else {
      setIsPlaying(false);
    }
  };

  const prevTrack = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;

    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      setQueueIndex(prevIdx);
      playSong(queue[prevIdx]);
    } else if (repeatMode === 'all') {
      const lastIdx = queue.length - 1;
      setQueueIndex(lastIdx);
      playSong(queue[lastIdx]);
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const addToQueue = (song) => {
    if (!song) return;
    setQueue((prev) => [...prev, song]);
  };

  const removeFromQueue = (index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  };

  const clearQueue = () => {
    setQueue(currentSong ? [currentSong] : []);
    setQueueIndex(currentSong ? 0 : -1);
  };

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    queue,
    queueIndex,
    isBuffering,
    playerError,
    isQueueOpen,
    playSong,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    changeVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleQueueModal: () => setIsQueueOpen((prev) => !prev),
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
