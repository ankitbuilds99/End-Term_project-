import React, { useState, useEffect } from 'react';
import { listArtistsApi, toggleFollowApi, getFollowStatusApi, resolveMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Search, 
  Sparkles, 
  BadgeCheck, 
  Globe, 
  Music, 
  Disc,
  UserPlus,
  UserCheck,
  Users,
  Loader2
} from 'lucide-react';
import { InstagramIcon, TwitterIcon, YoutubeIcon } from '../components/SocialIcons';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 10px 40px' }}>
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
            placeholder="Search artists by name, username, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              width: '100%'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {GENRE_FILTERS.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedGenre === genre ? 'var(--accent-primary)' : 'var(--border-subtle)',
                backgroundColor: selectedGenre === genre ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: selectedGenre === genre ? '#000' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Artists */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={36} className="spin" color="var(--accent-primary)" />
        </div>
      ) : filteredArtists.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist._id} artist={artist} />
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
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

const ArtistCard = ({ artist }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [toggling, setToggling] = useState(false);

  const stageName = artist.artistProfile?.stageName || artist.name;
  const genres = artist.artistProfile?.genres || [];
  const socials = artist.artistProfile?.socialLinks || {};
  const isSelf = user && (user._id === artist._id || user.id === artist._id);

  useEffect(() => {
    getFollowStatusApi(artist._id)
      .then((res) => {
        if (res.data?.success) {
          setIsFollowing(res.data.isFollowing);
          setFollowerCount(res.data.followerCount || 0);
        }
      })
      .catch((err) => {
        console.warn('Error checking follow status:', err.message);
      })
      .finally(() => setLoadingStatus(false));
  }, [artist._id, user]);

  const handleFollowToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isSelf) return;

    setToggling(true);
    try {
      const res = await toggleFollowApi(artist._id);
      if (res.data?.success) {
        setIsFollowing(res.data.isFollowing);
        setFollowerCount(res.data.followerCount);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update follow');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        transition: 'transform 0.2s ease, background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          overflow: 'hidden',
          marginBottom: '16px',
          backgroundColor: 'var(--bg-deep)',
          border: '3px solid var(--accent-primary)',
          boxShadow: '0 8px 24px rgba(0, 242, 254, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {artist.avatar ? (
          <img
            src={resolveMediaUrl(artist.avatar)}
            alt={stageName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Music size={40} color="var(--accent-primary)" />
        )}
      </div>

      {/* Name & Verification */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
          {stageName}
        </h3>
        {artist.artistProfile?.isVerified && (
          <BadgeCheck size={18} color="#1ed760" />
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
        @{artist.username}
      </p>

      {/* Follower Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Users size={14} />
        <span>{followerCount} {followerCount === 1 ? 'follower' : 'followers'}</span>
      </div>

      {/* Follow Button */}
      {!isSelf && (
        <button
          onClick={handleFollowToggle}
          disabled={toggling || loadingStatus}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 20px',
            borderRadius: '9999px',
            border: isFollowing ? '1px solid var(--border-subtle)' : 'none',
            backgroundColor: isFollowing ? 'transparent' : 'var(--accent-primary)',
            color: isFollowing ? '#fff' : '#000',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease',
          }}
        >
          {toggling ? (
            <Loader2 size={16} className="spin" />
          ) : isFollowing ? (
            <>
              <UserCheck size={16} /> Following
            </>
          ) : (
            <>
              <UserPlus size={16} /> Follow
            </>
          )}
        </button>
      )}

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
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
};

export default Artists;
