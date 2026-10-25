import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHealthApi, listArtistsApi, getSongsApi } from '../services/api';
import SongCard from '../components/SongCard';
import { 
  Play, 
  Sparkles, 
  Headphones, 
  Mic2, 
  CheckCircle2, 
  Radio, 
  ArrowRight,
  TrendingUp,
  Disc,
  Music2,
  Flame
} from 'lucide-react';

const Home = () => {
  const { user, isArtist } = useAuth();
  const [healthStatus, setHealthStatus] = useState('checking');
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    // Health check
    getHealthApi()
      .then((res) => {
        if (res.data?.status === 'healthy') {
          setHealthStatus('connected');
        }
      })
      .catch(() => setHealthStatus('disconnected'));

    // Fetch featured artists and trending songs in parallel
    Promise.all([
      listArtistsApi({ limit: 4 }),
      getSongsApi({ limit: 6, sort: 'popular' })
    ])
      .then(([artistsRes, songsRes]) => {
        if (artistsRes.data?.success) {
          setFeaturedArtists(artistsRes.data.artists || []);
        }
        if (songsRes.data?.success) {
          setTrendingSongs(songsRes.data.songs || []);
        }
      })
      .catch((err) => console.error('Failed to load home content:', err))
      .finally(() => setLoadingContent(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #16241a 0%, #101216 60%, #0d0f12 100%)',
        border: '1px solid rgba(30, 215, 96, 0.18)',
        padding: '48px 40px',
        overflow: 'hidden',
        marginBottom: '40px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Ambient glow decoration */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30, 215, 96, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(30, 215, 96, 0.1)', border: '1px solid rgba(30, 215, 96, 0.25)', marginBottom: '18px' }}>
            <Radio size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>
              Phase 2 Live • Audio Player & Media Catalogue
            </span>
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            {user ? `${getGreeting()}, ${user.name.split(' ')[0]}` : 'Music That Moves Your Soul'}
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
            {user
              ? `Stream real audio, explore trending releases, or jump into your ${isArtist ? 'Artist Studio to upload tracks' : 'listening queue'}.`
              : 'Stream independent music, connect directly with artists, and discover tracks curated for true listeners. Built with persistent audio playback and verified streaming.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/catalogue" className="btn-primary">
              <Music2 size={18} />
              <span>Browse Music Catalogue</span>
            </Link>

            {isArtist && (
              <Link to="/studio" className="btn-secondary" style={{ border: '1px solid rgba(255, 65, 108, 0.3)' }}>
                <Sparkles size={16} color="#ff6b81" />
                <span>Open Artist Studio</span>
              </Link>
            )}

            {!user && (
              <Link to="/register" className="btn-secondary">
                <span>Sign Up Free</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trending Songs Section */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={22} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Trending Tracks
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Top streams right now on SunteRaho
              </p>
            </div>
          </div>
          <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.88rem' }}>
            <span>Explore All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loadingContent ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner-white" />
          </div>
        ) : trendingSongs.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '18px',
          }}>
            {trendingSongs.map((song) => (
              <SongCard key={song._id} song={song} playlist={trendingSongs} />
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No trending tracks found.</p>
          </div>
        )}
      </section>

      {/* Role Feature Highlights */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.02em' }}>
          Engineered for Pure Audio Quality
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Audio Player Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(30, 215, 96, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(30, 215, 96, 0.3)'
            }}>
              <Headphones size={24} color="var(--accent-primary)" />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
              Persistent Audio Streaming
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
              Play any track uninterrupted across navigation. Includes queue management, shuffle, repeat modes, and accurate duration seeking.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>Seamless navigation with no audio pauses</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>Interactive queue drawer to reorder and add tracks</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>Automated listening threshold verification (30s rule)</span>
              </li>
            </ul>
          </div>

          {/* Artist Upload Card */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 65, 108, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(255, 65, 108, 0.3)'
            }}>
              <Mic2 size={24} color="#ff6b81" />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
              Artist Studio & Track Releases
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
              Verified artists can upload original audio (MP3, WAV, FLAC, M4A), upload cover artwork, control draft/published visibility, and monitor streams.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#ff6b81" />
                <span>Strict media validation and automated file cleanup</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#ff6b81" />
                <span>Owner-enforced permissions on track updates & deletion</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#ff6b81" />
                <span>Private draft mode for unreleased demos</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Artists preview */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Spotlight Artists
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Meet the creators producing sounds on SunteRaho
            </p>
          </div>
          <Link to="/artists" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.88rem' }}>
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {featuredArtists.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {featuredArtists.map((artist) => (
              <div key={artist._id} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  margin: '0 auto 14px auto',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '2px solid rgba(255, 65, 108, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  color: '#ff6b81',
                  overflow: 'hidden'
                }}>
                  {artist.avatar ? (
                    <img src={artist.avatar} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (artist.artistProfile?.stageName || artist.name).charAt(0).toUpperCase()
                  )}
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {artist.artistProfile?.stageName || artist.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                  @{artist.username}
                </p>

                <Link
                  to="/artists"
                  className="btn-outline"
                  style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Backend Connectivity Status Footer */}
      <footer style={{
        padding: '16px 20px',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
        color: 'var(--text-dim)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: healthStatus === 'connected' ? 'var(--accent-primary)' : 'var(--error-text)',
            boxShadow: healthStatus === 'connected' ? '0 0 8px var(--accent-primary)' : 'none'
          }} />
          <span>
            API Status: {healthStatus === 'connected' ? 'Online & Connected to MongoDB Atlas' : 'Checking status...'}
          </span>
        </div>
        <span>SunteRaho Engine v1.1.0 • Phase 2 Verified</span>
      </footer>
    </div>
  );
};

export default Home;
