import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  checkHealth, 
  getSongsApi, 
  getArtistsApi,
  getPersonalizedDiscoveryApi,
  resolveMediaUrl
} from '../services/api';
import SongCard from '../components/SongCard';
import { 
  Sparkles, 
  Flame, 
  Headphones, 
  Mic2, 
  CheckCircle2, 
  ArrowRight,
  Radio,
  Music2
} from 'lucide-react';

const Home = () => {
  const { user, isArtist } = useAuth();
  const [healthStatus, setHealthStatus] = useState('checking');
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [discoveryStrategy, setDiscoveryStrategy] = useState('fallback_popular');
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    checkHealth()
      .then((res) => setHealthStatus(res.data?.database || 'connected'))
      .catch(() => setHealthStatus('disconnected'));

    setLoadingContent(true);
    Promise.all([
      // Personalized / Fallback Discovery
      getPersonalizedDiscoveryApi({ limit: 6 })
        .then((res) => {
          setRecommendedSongs(res.data?.songs || []);
          setDiscoveryStrategy(res.data?.strategy || 'fallback_popular');
        })
        .catch(() => setRecommendedSongs([])),

      // Top Trending Tracks
      getSongsApi({ sort: 'popular', limit: 6 })
        .then((res) => setTrendingSongs(res.data?.songs || []))
        .catch(() => setTrendingSongs([])),

      // Spotlight Artists
      getArtistsApi({ limit: 4 })
        .then((res) => setFeaturedArtists(res.data?.artists || []))
        .catch(() => setFeaturedArtists([])),
    ])
      .catch((err) => console.error('Failed to load homepage feeds:', err))
      .finally(() => setLoadingContent(false));
  }, [user]);

  const getGreeting = () => {
    return 'Welcome';
  };

  return (
    <div>
      {/* Hero Section - Sharp Geometric COMET-Style Architecture */}
      <section style={{
        position: 'relative',
        borderRadius: '0px',
        background: 'linear-gradient(135deg, rgba(16, 26, 18, 0.95) 0%, rgba(13, 15, 19, 0.98) 60%, rgba(8, 9, 11, 1) 100%)',
        border: '1px solid rgba(30, 215, 96, 0.30)',
        padding: '48px 40px',
        overflow: 'hidden',
        marginBottom: '40px',
      }}>
        {/* Subtle grid pattern background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '5px 12px', 
            borderRadius: '0px', 
            background: 'rgba(30, 215, 96, 0.08)', 
            border: '1px solid rgba(30, 215, 96, 0.35)', 
            marginBottom: '18px' 
          }}>
            <Radio size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Real-Time Music Streaming &amp; Analytics
            </span>
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            {user ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome to SunteRaho'}
          </h1>

          <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
            {user
              ? `Stream real audio, explore trending releases, or jump into your ${isArtist ? 'Artist Studio to upload tracks' : 'listening queue'}.`
              : 'Stream independent music, connect directly with artists, and discover tracks curated for true listeners. Built with persistent audio playback and verified streaming.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/catalogue" className="btn-primary" style={{ borderRadius: '0px' }}>
              <Music2 size={18} />
              <span>Browse Music Catalogue</span>
            </Link>

            {isArtist && (
              <Link to="/studio" className="btn-secondary" style={{ borderRadius: '0px', border: '1px solid rgba(255, 65, 108, 0.4)' }}>
                <Sparkles size={16} color="#ff6b81" />
                <span>Open Artist Studio</span>
              </Link>
            )}

            {!user && (
              <Link to="/register" className="btn-secondary" style={{ borderRadius: '0px' }}>
                <span>Sign Up Free</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Made For You / Discovery Section */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                {user ? 'Made For You' : 'Recommended Discovery'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {discoveryStrategy === 'rule_based_personalized'
                  ? 'Personalized based on followed artists, favorite genres & listening habits'
                  : 'Trending selections across genres to explore'}
              </p>
            </div>
          </div>
          <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span>Explore All</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loadingContent ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner-white" />
          </div>
        ) : recommendedSongs.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {recommendedSongs.map((song) => (
              <SongCard key={song._id} song={song} playlist={recommendedSongs} />
            ))}
          </div>
        ) : (
          <div className="geometric-card" style={{ padding: '36px', textAlign: 'center', borderRadius: '0px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No recommendations available right now.</p>
          </div>
        )}
      </section>

      {/* Trending Songs Section */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={20} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                Trending Tracks
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Top streams right now on SunteRaho
              </p>
            </div>
          </div>
          <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span>Explore All</span>
            <ArrowRight size={15} />
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
            gap: '16px',
          }}>
            {trendingSongs.map((song) => (
              <SongCard key={song._id} song={song} playlist={trendingSongs} />
            ))}
          </div>
        ) : (
          <div className="geometric-card" style={{ padding: '36px', textAlign: 'center', borderRadius: '0px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No trending tracks found.</p>
          </div>
        )}
      </section>

      {/* Role Feature Highlights - Sharp Rectangular Cards */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
          Engineered for Pure Audio Quality
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Audio Player Card */}
          <div className="geometric-card" style={{ padding: '28px', borderRadius: '0px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '0px',
              backgroundColor: 'rgba(30, 215, 96, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              border: '1px solid rgba(30, 215, 96, 0.3)'
            }}>
              <Headphones size={22} color="var(--accent-primary)" />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px' }}>
              Persistent Audio Streaming
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
              Play any track uninterrupted across navigation. Includes queue management, shuffle, repeat modes, and accurate duration seeking.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>Seamless navigation with no audio pauses</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>Interactive queue drawer to reorder and add tracks</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>Automated listening threshold verification (30s rule)</span>
              </li>
            </ul>
          </div>

          {/* Artist Upload Card */}
          <div className="geometric-card" style={{ padding: '28px', borderRadius: '0px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '0px',
              backgroundColor: 'rgba(255, 65, 108, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              border: '1px solid rgba(255, 65, 108, 0.3)'
            }}>
              <Mic2 size={22} color="#ff6b81" />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px' }}>
              Artist Studio &amp; Track Releases
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
              Verified artists can upload original audio (MP3, WAV, FLAC, M4A), upload cover artwork, control draft/published visibility, and monitor streams.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#ff6b81" />
                <span>Strict media validation and automated file cleanup</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#ff6b81" />
                <span>Owner-enforced permissions on track updates &amp; deletion</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#ff6b81" />
                <span>Private draft mode for unreleased demos</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Artists preview - Sharp Rectangular Cards */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Spotlight Artists
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Meet the creators producing sounds on SunteRaho
            </p>
          </div>
          <Link to="/artists" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span>View All</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {featuredArtists.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {featuredArtists.map((artist) => (
              <div key={artist._id} className="geometric-card" style={{ padding: '20px', textAlign: 'center', borderRadius: '0px' }}>
                <div style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '0px',
                  margin: '0 auto 14px auto',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid rgba(255, 65, 108, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  color: '#ff6b81',
                  overflow: 'hidden'
                }}>
                  {artist.avatar ? (
                    <img src={resolveMediaUrl(artist.avatar)} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0px' }} />
                  ) : (
                    (artist.artistProfile?.stageName || artist.name).charAt(0).toUpperCase()
                  )}
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {artist.artistProfile?.stageName || artist.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                  @{artist.username}
                </p>

                <Link
                  to="/artists"
                  className="btn-outline"
                  style={{ width: '100%', padding: '6px 12px', fontSize: '0.80rem', borderRadius: '0px' }}
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Backend Connectivity Status Footer - Sharp Rectangular Bar */}
      <footer style={{
        padding: '14px 20px',
        borderRadius: '0px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.80rem',
        color: 'var(--text-dim)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '0px',
            backgroundColor: healthStatus === 'connected' ? 'var(--accent-primary)' : 'var(--error-text)',
            boxShadow: healthStatus === 'connected' ? '0 0 6px var(--accent-primary)' : 'none'
          }} />
          <span>
            API Status: {healthStatus === 'connected' ? 'Online & Connected to MongoDB Atlas' : 'Checking status...'}
          </span>
        </div>
        <span>SunteRaho Engine v1.2.0 • COMET Geometric Refined</span>
      </footer>
    </div>
  );
};

export default Home;
