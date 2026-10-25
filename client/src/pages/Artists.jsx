import React, { useState, useEffect } from 'react';
import { listArtistsApi } from '../services/api';
import { 
  Compass, 
  Search, 
  Sparkles, 
  BadgeCheck, 
  Globe, 
  Music, 
  Disc 
} from 'lucide-react';
import { InstagramIcon, TwitterIcon, YoutubeIcon } from '../components/SocialIcons';


const GENRE_FILTERS = [
  'All',
  'Bollywood',
  'Indie Pop',
  'Hip-Hop / Rap',
  'Lo-Fi Beats',
  'Electronic / EDM',
  'Folk & Acoustic',
  'Sufi',
  'Rock',
  'Classical'
];

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchArtists = async (genre = '') => {
    setLoading(true);
    try {
      const params = {};
      if (genre && genre !== 'All') {
        params.genre = genre;
      }
      const res = await listArtistsApi(params);
      if (res.data?.success) {
        setArtists(res.data.artists || []);
      }
    } catch (err) {
      console.error('Error fetching artists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists(selectedGenre);
  }, [selectedGenre]);

  const filteredArtists = artists.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = a.name?.toLowerCase().includes(q);
    const usernameMatch = a.username?.toLowerCase().includes(q);
    const stageMatch = a.artistProfile?.stageName?.toLowerCase().includes(q);
    const bioMatch = a.bio?.toLowerCase().includes(q);
    return nameMatch || usernameMatch || stageMatch || bioMatch;
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(255, 65, 108, 0.1)', border: '1px solid rgba(255, 65, 108, 0.25)', marginBottom: '14px' }}>
          <Compass size={14} color="#ff6b81" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ff6b81', letterSpacing: '0.04em' }}>
            Artist Discovery
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Explore Creators
        </h1>
        <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)' }}>
          Discover visionary artists, independent producers, and songwriters making waves on SunteRaho
        </p>
      </div>

      {/* Search & Genre Filters */}
      <div style={{ marginBottom: '36px' }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '20px',
          maxWidth: '540px'
        }}>
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search artists by name, stage name, or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              width: '100%'
            }}
          />
        </div>

        {/* Genre Filter Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}>
          {GENRE_FILTERS.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: isSelected ? '1px solid #ff6b81' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(255, 65, 108, 0.2)' : 'var(--bg-surface)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Artists Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner-white" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : filteredArtists.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {filteredArtists.map((artist) => {
            const stageName = artist.artistProfile?.stageName || artist.name;
            const genres = artist.artistProfile?.genres || [];
            const socials = artist.artistProfile?.socialLinks || {};

            return (
              <div
                key={artist._id}
                className="glass-card"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '3px solid rgba(255, 65, 108, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '2rem',
                  color: '#ff6b81',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)'
                }}>
                  {artist.avatar ? (
                    <img src={artist.avatar} alt={stageName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    stageName.charAt(0).toUpperCase()
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    {stageName}
                  </h3>
                  {artist.artistProfile?.isVerified && (
                    <BadgeCheck size={18} color="#1ed760" />
                  )}
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                  @{artist.username}
                </p>

                {artist.bio && (
                  <p style={{
                    fontSize: '0.84rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.45,
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {artist.bio}
                  </p>
                )}

                {/* Genre badges */}
                {genres.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '18px' }}>
                    {genres.map((g, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social media links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingTop: '10px' }}>
                  {socials.instagram && (
                    <a href={socials.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.2s' }}>
                      <InstagramIcon size={18} />
                    </a>
                  )}
                  {socials.twitter && (
                    <a href={socials.twitter} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.2s' }}>
                      <TwitterIcon size={18} />
                    </a>
                  )}
                  {socials.youtube && (
                    <a href={socials.youtube} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.2s' }}>
                      <YoutubeIcon size={18} />
                    </a>
                  )}
                  {socials.website && (
                    <a href={socials.website} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.2s' }}>
                      <Globe size={18} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Disc size={40} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            No Artists Found
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {selectedGenre !== 'All'
              ? `No artists found in the "${selectedGenre}" category yet.`
              : 'Try searching with a different term or clear the filter.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Artists;
