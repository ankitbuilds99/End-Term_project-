import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Radio, 
  Headphones, 
  Mic2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  Sparkles 
} from 'lucide-react';

const GENRE_OPTIONS = [
  'Bollywood',
  'Indie Pop',
  'Hip-Hop / Rap',
  'Lo-Fi Beats',
  'Electronic / EDM',
  'Folk & Acoustic',
  'Sufi',
  'Rock',
  'R&B / Soul',
  'Classical'
];

const Register = () => {
  const [role, setRole] = useState('listener'); // 'listener' | 'artist'
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stageName, setStageName] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genre]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
      setErrorMessage('Username can only contain letters, numbers, underscores, and dots.');
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      role,
      bio: bio.trim(),
    };

    if (role === 'artist') {
      payload.stageName = stageName.trim() || name.trim();
      payload.genres = selectedGenres;
    }

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      navigate('/profile');
    } else {
      setErrorMessage(result.message || 'Registration failed.');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 0',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '40px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--accent-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 6px 16px var(--accent-glow)'
          }}>
            <Radio size={26} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Join SunteRaho
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Choose your journey on the platform
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '28px',
        }}>
          <button
            type="button"
            onClick={() => setRole('listener')}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: role === 'listener' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              backgroundColor: role === 'listener' ? 'rgba(30, 215, 96, 0.08)' : 'var(--bg-deep)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <Headphones size={24} color={role === 'listener' ? 'var(--accent-primary)' : 'var(--text-dim)'} />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: role === 'listener' ? '#fff' : 'var(--text-muted)' }}>
              I am a Listener
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
              Discover tracks, stream, & follow creators
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole('artist')}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: role === 'artist' ? '2px solid #ff6b81' : '1px solid var(--border-subtle)',
              backgroundColor: role === 'artist' ? 'rgba(255, 65, 108, 0.08)' : 'var(--bg-deep)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <Mic2 size={24} color={role === 'artist' ? '#ff6b81' : 'var(--text-dim)'} />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: role === 'artist' ? '#fff' : 'var(--text-muted)' }}>
              I am an Artist
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
              Upload songs, build fanbase, & view stats
            </span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="form-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="e.g. Abhishek Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="username">Username *</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="e.g. abhisheksingh"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password * (min 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Conditional Artist Custom Fields */}
          {role === 'artist' && (
            <div style={{
              margin: '20px 0',
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 65, 108, 0.05)',
              border: '1px solid rgba(255, 65, 108, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={18} color="#ff6b81" />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ff6b81' }}>
                  Artist Profile Setup
                </h3>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stageName">Artist / Stage Name</label>
                <input
                  id="stageName"
                  type="text"
                  className="form-input"
                  placeholder="Defaults to your full name if empty"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Music Genres (Choose up to 5)</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    {selectedGenres.length}/5 selected
                  </span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {GENRE_OPTIONS.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          border: isSelected ? '1px solid #ff6b81' : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'rgba(255, 65, 108, 0.2)' : 'var(--bg-deep)',
                          color: isSelected ? '#fff' : 'var(--text-muted)',
                          transition: 'all 0.15s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isSelected && <Check size={12} color="#ff6b81" strokeWidth={3} />}
                        <span>{genre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="bio">Artist Bio</label>
                <textarea
                  id="bio"
                  rows={3}
                  className="form-input"
                  placeholder="Tell listeners about your musical sound, inspirations, or instruments..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* Regular Listener Bio */}
          {role === 'listener' && (
            <div className="form-group">
              <label className="form-label" htmlFor="listenerBio">Bio (Optional)</label>
              <input
                id="listenerBio"
                type="text"
                className="form-input"
                placeholder="What music vibe represents you?"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '12px',
              background: role === 'artist' ? 'var(--artist-gradient)' : 'var(--accent-gradient)',
              boxShadow: role === 'artist' ? '0 4px 14px rgba(255, 65, 108, 0.3)' : '0 4px 14px var(--accent-glow)',
            }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <span>Create {role === 'artist' ? 'Artist Account' : 'Listener Account'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: 'var(--text-muted)'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
