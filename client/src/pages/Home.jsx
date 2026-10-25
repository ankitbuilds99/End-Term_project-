import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHealthApi, listArtistsApi } from '../services/api';
import { 
  Play, 
  Sparkles, 
  Headphones, 
  Mic2, 
  CheckCircle2, 
  Radio, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Disc
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState('checking');
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);

  useEffect(() => {
    // Health check
    getHealthApi()
      .then((res) => {
        if (res.data?.status === 'healthy') {
          setHealthStatus('connected');
        }
      })
      .catch(() => setHealthStatus('disconnected'));

    // Fetch featured artists
    listArtistsApi({ limit: 4 })
      .then((res) => {
        if (res.data?.success) {
          setFeaturedArtists(res.data.artists || []);
        }
      })
      .catch((err) => console.error('Failed to load artists:', err))
      .finally(() => setLoadingArtists(false));
  }, []);

  // Personalized greeting
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
        background: 'linear-gradient(135deg, #18281d 0%, #101216 60%, #0d0f12 100%)',
        border: '1px solid rgba(30, 215, 96, 0.15)',
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
          background: 'radial-gradient(circle, rgba(30, 215, 96, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(30, 215, 96, 0.1)', border: '1px solid rgba(30, 215, 96, 0.25)', marginBottom: '18px' }}>
            <Radio size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>
              Phase 1 Live • Foundation & Auth System
            </span>
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            {user ? `${getGreeting()}, ${user.name.split(' ')[0]}` : 'Music That Moves Your Soul'}
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
            {user
              ? `You are logged in as a verified ${user.role}. Explore talented creators, update your profile, or build your custom sound identity.`
              : 'Stream independent music, connect directly with artists, and discover tracks curated for true listeners. Built with modern, secure architecture.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link to="/artists" className="btn-primary">
                  <Sparkles size={18} />
                  <span>Discover Artists</span>
                </Link>
                <Link to="/profile" className="btn-secondary">
                  <span>Manage Profile</span>
                  <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary">
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Role Feature Highlights */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.02em' }}>
          Designed for Every Music Lover
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Listener Card */}
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
              For Listeners
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
              Create your account, personalize your bio, and get ready for streaming, playlist building, and following your favorite independent creators.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>Secure session authentication with HTTP-only cookies</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>Customizable listener profiles and bio</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" />
                <span>Cross-device persistent state</span>
              </li>
            </ul>
          </div>

          {/* Artist Card */}
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
              For Artists & Producers
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
              Register as a verified Artist to establish your presence, configure stage name, highlight musical genres, and connect social channels.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#ff6b81" />
                <span>Artist portal with stage name & genre tags</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#ff6b81" />
                <span>Showcase social links (Instagram, Twitter, YouTube)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#ff6b81" />
                <span>Readied for track uploads & streaming in Phase 2</span>
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

        {loadingArtists ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner-white" />
          </div>
        ) : featuredArtists.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {featuredArtists.map((artist) => (
              <div key={artist._id} className="glass-card" style={{ padding: '20px', textAlign: 'center', transition: 'all 0.2s ease' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  margin: '0 auto 16px auto',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '2px solid rgba(255, 65, 108, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.8rem',
                  color: '#ff6b81',
                  overflow: 'hidden'
                }}>
                  {artist.avatar ? (
                    <img src={artist.avatar} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (artist.artistProfile?.stageName || artist.name).charAt(0).toUpperCase()
                  )}
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {artist.artistProfile?.stageName || artist.name}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                  @{artist.username}
                </p>

                {artist.artistProfile?.genres?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginBottom: '16px' }}>
                    {artist.artistProfile.genres.slice(0, 2).map((genre, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        color: 'var(--text-muted)'
                      }}>
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  to={`/artists`}
                  className="btn-outline"
                  style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
            <Disc size={32} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              No Artists Registered Yet
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Be the first creator to register an Artist profile on SunteRaho!
            </p>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Register as Artist
            </Link>
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
        <span>SunteRaho Engine v1.0.0</span>
      </footer>
    </div>
  );
};

export default Home;
