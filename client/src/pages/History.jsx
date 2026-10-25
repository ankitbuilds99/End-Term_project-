import React, { useState, useEffect } from 'react';
import { getListeningHistoryApi, clearListeningHistoryApi, resolveMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../components/SongCard';
import { History as HistoryIcon, Play, Pause, Trash2, Clock, Loader2, AlertTriangle, Music } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSecs = Math.floor((now - date) / 1000);

  if (diffInSecs < 60) return 'Just now';
  const mins = Math.floor(diffInSecs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const History = () => {
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getListeningHistoryApi({ limit: 50 });
      if (res.data?.success) {
        setHistoryItems(res.data.history || []);
      }
    } catch (err) {
      console.warn('Error fetching history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      const res = await clearListeningHistoryApi();
      if (res.data?.success) {
        setHistoryItems([]);
        setShowClearConfirm(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear history');
    } finally {
      setClearing(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <HistoryIcon size={64} color="var(--accent-primary)" style={{ margin: '0 auto 20px', opacity: 0.8 }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Your Listening History</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
          Log in to keep track of every song you play and relive your favorite listening moments.
        </p>
        <Link to="/login" className="btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 10px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '0px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HistoryIcon size={28} color="var(--accent-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>Listening History</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tracks you've streamed on SunteRaho
            </p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '0px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            <Trash2 size={16} />
            Clear History
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={36} className="spin" color="var(--accent-primary)" />
        </div>
      ) : historyItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '0px' }}>
          <Music size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No history yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Songs you stream will automatically appear here in chronological order.
          </p>
          <Link to="/catalogue" className="btn-primary" style={{ borderRadius: '0px' }}>
            Start Listening
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '0px', overflow: 'hidden' }}>
          {historyItems.map((item, idx) => {
            const song = item.song;
            if (!song) return null;

            const isCurrent = currentSong?._id === song._id;
            const artistName = song.artist?.artistProfile?.stageName || song.artist?.name || 'Unknown Artist';
            const artwork = resolveMediaUrl(song.artworkUrl);

            return (
              <div
                key={item._id || idx}
                onClick={() => (isCurrent ? togglePlay() : playSong(song))}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 140px 110px 80px',
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
                {/* Index / Play Status */}
                <div style={{ color: isCurrent ? 'var(--accent-primary)' : 'var(--text-dim)', fontSize: '0.88rem' }}>
                  {isCurrent && isPlaying ? (
                    <Pause size={16} fill="var(--accent-primary)" color="var(--accent-primary)" />
                  ) : (
                    <Play size={16} color="var(--text-dim)" />
                  )}
                </div>

                {/* Song info */}
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

                {/* Time Ago */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {formatTimeAgo(item.playedAt)}
                </div>

                {/* Duration */}
                <div style={{ textAlign: 'right', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {formatTime(song.duration)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '420px',
              borderRadius: '0px',
              padding: '28px',
              backgroundColor: '#12141a',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle size={48} color="#f87171" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Clear Listening History?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              This will remove all recorded plays from your personal profile. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '0px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                style={{
                  padding: '10px 24px',
                  borderRadius: '0px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {clearing && <Loader2 size={16} className="spin" />}
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
