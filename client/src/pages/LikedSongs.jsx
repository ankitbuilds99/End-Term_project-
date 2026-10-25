import React, { useState, useEffect } from 'react';
import { getLikedSongsApi, resolveMediaUrl } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { formatTime } from '../components/SongCard';
import { Heart, Play, Pause, Music, Trash2, Clock, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const LikedSongs = () => {
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong, togglePlay, playPlaylist, toggleLikeTrack } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);

  const fetchLikedSongs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getLikedSongsApi({ page: pageNum, limit: 30 });
      if (res.data?.success) {
        setSongs(res.data.songs || []);
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.pages);
        setTotalSongs(res.data.pagination.total);
      }
    } catch (err) {
      console.warn('Error fetching liked songs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLikedSongs(1);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUnlike = async (songId, e) => {
    e.stopPropagation();
    await toggleLikeTrack(songId);
    setSongs((prev) => prev.filter((s) => s._id !== songId));
    setTotalSongs((prev) => Math.max(0, prev - 1));
  };

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    playPlaylist(songs, 0);
  };

  const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Heart size={64} color="var(--accent-secondary)" style={{ margin: '0 auto 20px', opacity: 0.8 }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Songs you love</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
          Log in to view and play all tracks saved to your personal collection.
        </p>
        <Link to="/login" className="btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 10px 40px' }}>
      {/* Hero Header Banner */}
      <div
        style={{
          borderRadius: '0px',
          padding: '36px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(99, 102, 241, 0.15) 60%, rgba(10, 11, 14, 0.95) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '0px',
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            flexShrink: 0,
          }}
        >
          <Heart size={64} fill="#fff" color="#fff" />
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#f472b6', fontWeight: 700 }}>
            Playlist
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, margin: '6px 0 12px', lineHeight: 1.1 }}>
            Liked Songs
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span style={{ color: '#fff', fontWeight: 600 }}>{user.name}</span>
            <span>•</span>
            <span>{totalSongs} songs</span>
            <span>•</span>
            <span>{Math.round(totalDuration / 60)} min</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            fontSize: '1rem',
            borderRadius: '0px',
          }}
        >
          <Play size={20} fill="#000" />
          Play All
        </button>
      </div>

      {/* Songs Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 size={36} className="spin" color="var(--accent-primary)" />
        </div>
      ) : songs.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '0px' }}>
          <Heart size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No liked songs yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Explore tracks from our catalogue and tap the heart icon to save them here.
          </p>
          <Link to="/catalogue" className="btn-primary" style={{ borderRadius: '0px' }}>
            Browse Catalogue
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '0px', overflow: 'hidden' }}>
          {/* Header Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 160px 100px 60px',
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text-dim)',
            }}
          >
            <span>#</span>
            <span>Title</span>
            <span>Genre</span>
            <span style={{ textAlign: 'right' }}>
              <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
            </span>
            <span></span>
          </div>

          {/* Song Rows */}
          {songs.map((song, idx) => {
            const isCurrent = currentSong?._id === song._id;
            const artistName = song.artist?.artistProfile?.stageName || song.artist?.name || 'Unknown Artist';
            const artwork = resolveMediaUrl(song.artworkUrl);

            return (
              <div
                key={song._id}
                onClick={() => (isCurrent ? togglePlay() : playSong(song, songs))}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 160px 100px 60px',
                  alignItems: 'center',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  backgroundColor: isCurrent ? 'var(--bg-surface-elevated)' : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Index / Play indicator */}
                <div style={{ color: isCurrent ? 'var(--accent-primary)' : 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {isCurrent && isPlaying ? (
                    <Pause size={16} fill="var(--accent-primary)" color="var(--accent-primary)" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Artwork + Title + Artist */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  <img
                    src={artwork}
                    alt={song.title}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '0px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-deep)',
                    }}
                  />
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.94rem',
                      color: isCurrent ? 'var(--accent-primary)' : '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {song.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {artistName}
                    </div>
                  </div>
                </div>

                {/* Genre */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {song.genre}
                </div>

                {/* Duration */}
                <div style={{ textAlign: 'right', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {formatTime(song.duration)}
                </div>

                {/* Unlike action */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={(e) => handleUnlike(song._id, e)}
                    title="Remove from Liked Songs"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#f43f5e',
                      padding: '6px',
                      borderRadius: '0px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Heart size={18} fill="#f43f5e" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LikedSongs;
