import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Sparkles, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  BadgeCheck,
  Music,
  Camera,
  LogOut
} from 'lucide-react';
import { InstagramIcon, TwitterIcon, YoutubeIcon } from '../components/SocialIcons';
import { resolveMediaUrl } from '../services/api';


const GENRE_LIST = [
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

const Profile = () => {
  const { user, isArtist, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [stageName, setStageName] = useState('');
  const [genres, setGenres] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    youtube: '',
    website: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      if (user.artistProfile) {
        setStageName(user.artistProfile.stageName || '');
        setGenres(user.artistProfile.genres || []);
        setSocialLinks({
          instagram: user.artistProfile.socialLinks?.instagram || '',
          twitter: user.artistProfile.socialLinks?.twitter || '',
          youtube: user.artistProfile.socialLinks?.youtube || '',
          website: user.artistProfile.socialLinks?.website || '',
        });
      }
    }
  }, [user]);

  const toggleGenre = (genre) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      if (genres.length < 5) {
        setGenres([...genres, genre]);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setSaving(true);

    const updatePayload = {
      name,
      bio,
      avatar,
    };

    if (isArtist) {
      updatePayload.artistProfile = {
        stageName,
        genres,
        socialLinks,
      };
    }

    const res = await updateProfile(updatePayload);
    setSaving(false);

    if (res.success) {
      setSuccessMessage('Your profile has been successfully updated!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(res.message || 'Failed to update profile.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Header Profile Hero Card */}
      <div className="glass-card" style={{
        padding: '36px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        background: isArtist
          ? 'linear-gradient(135deg, rgba(255, 65, 108, 0.12) 0%, rgba(18, 20, 26, 0.95) 70%)'
          : 'linear-gradient(135deg, rgba(30, 215, 96, 0.12) 0%, rgba(18, 20, 26, 0.95) 70%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          {/* Avatar display */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '0px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: `2px solid ${isArtist ? '#ff6b81' : 'var(--accent-primary)'}`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '2.5rem',
              color: isArtist ? '#ff6b81' : 'var(--accent-primary)',
            }}>
              {avatar ? (
                <img src={resolveMediaUrl(avatar)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0px' }} />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className={`badge-role ${user?.role}`}>
                {user?.role}
              </span>
              {isArtist && user?.artistProfile?.isVerified && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1ed760', fontSize: '0.8rem', fontWeight: 700 }}>
                  <BadgeCheck size={16} />
                  <span>Verified Creator</span>
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {isArtist && stageName ? stageName : name}
            </h1>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
              @{user?.username} {isArtist && stageName && `(${name})`}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="var(--text-dim)" />
                {user?.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--text-dim)" />
                Joined {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>

          {/* Quick Header Log Out */}
          <div>
            <button
              onClick={handleLogout}
              type="button"
              title="Log out of SunteRaho"
              style={{
                borderRadius: '0px',
                border: '1px solid rgba(255, 75, 75, 0.45)',
                color: 'var(--error-text)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.86rem',
                padding: '9px 18px',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 75, 75, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--error-bg)';
                e.currentTarget.style.borderColor = 'var(--error-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 75, 75, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 75, 75, 0.45)';
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="form-success">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="form-error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="glass-card" style={{ padding: '36px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.01em' }}>
          Account Settings
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Display Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="avatar">Avatar Image URL</label>
            <input
              id="avatar"
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/... or your photo URL"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bio">About / Bio</label>
          <textarea
            id="bio"
            rows={3}
            className="form-input"
            placeholder="Write a few words about your musical taste or artistic journey..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Artist-Specific Settings Section */}
        {isArtist && (
          <div style={{
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Sparkles size={20} color="#ff6b81" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ff6b81' }}>
                Artist Portfolio & Identity
              </h3>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="stageName">Stage / Band Name</label>
              <input
                id="stageName"
                type="text"
                className="form-input"
                placeholder="Your official performance or producer title"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Featured Genres</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                  {genres.length}/5 selected
                </span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {GENRE_LIST.map((genre) => {
                  const isSelected = genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: '0px',
                        border: isSelected ? '1px solid #ff6b81' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'rgba(255, 65, 108, 0.2)' : 'var(--bg-deep)',
                        color: isSelected ? '#fff' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '20px', marginBottom: '14px' }}>
              Connect Social Profiles
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <InstagramIcon size={14} color="#E1306C" />
                  <span>Instagram</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://instagram.com/yourhandle"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TwitterIcon size={14} color="#1DA1F2" />
                  <span>Twitter / X</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://x.com/yourhandle"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <YoutubeIcon size={14} color="#FF0000" />
                  <span>YouTube Channel</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://youtube.com/@channel"
                  value={socialLinks.youtube}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} color="var(--accent-primary)" />
                  <span>Official Website</span>
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://yourwebsite.com"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? (
              <span className="spinner" />
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Account Session & Sign Out Card */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        marginTop: '28px',
        border: '1px solid rgba(255, 75, 75, 0.25)',
        borderRadius: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: 'rgba(255, 75, 75, 0.04)',
      }}>
        <div>
          <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} color="var(--error-text)" />
            <span>Account Session</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Signed in as <strong style={{ color: '#fff' }}>@{user?.username}</strong> ({user?.email}).
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            borderRadius: '0px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            fontSize: '0.88rem',
            fontWeight: 700,
            backgroundColor: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            color: 'var(--error-text)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--error-text)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 75, 75, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--error-border)';
            e.currentTarget.style.backgroundColor = 'var(--error-bg)';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out of SunteRaho</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
