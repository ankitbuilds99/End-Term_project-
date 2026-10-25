import React, { useState, useEffect } from 'react';
import { listArtistsApi, toggleFollowApi, getFollowStatusApi, resolveMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Search, 
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
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 0 40px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '5px 12px', 
          borderRadius: '0px', 
          background: 'rgba(255, 65, 108, 0.08)', 
          border: '1px solid rgba(255, 65, 108, 0.35)', 
          marginBottom: '14px' 
        }}>
          <Compass size={14} color="#ff6b81" />
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ff6b81', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Artist Discovery
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px', textTransform: 'uppercase' }}>
          Explore Creators
        </h1>
        <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)' }}>
          Discover visionary artists, independent producers, and songwriters making waves on SunteRaho
        </p>
      </div>

      {/* Search & Genre Filters - Sharp Geometric */}
      <div style={{ marginBottom: '36px' }}>
        {/* Search Bar - Sharp Rectangle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0px',
          padding: '10px 16px',
          marginBottom: '16px',
          maxWidth: '540px'
        }}>
          <Search size={16} color="var(--text-dim)" />
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
              fontSize: '0.90rem',
              width: '100%',
              borderRadius: '0px'
            }}
          />
        </div>

        {/* Filter Chips - Sharp Rectangles */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
          {GENRE_FILTERS.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              style={{
                padding: '7px 14px',
                borderRadius: '0px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                border: '1px solid',
                borderColor: selectedGenre === genre ? 'var(--accent-primary)' : 'var(--border-subtle)',
                backgroundColor: selectedGenre === genre ? 'rgba(30, 215, 96, 0.15)' : 'var(--bg-surface)',
                color: selectedGenre === genre ? 'var(--accent-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Artists - Sharp Rectangular Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={32} className="spin" color="var(--accent-primary)" />
        </div>
      ) : filteredArtists.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist._id} artist={artist} />
          ))}
        </div>
      ) : (
        <div className="geometric-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '0px' }}>
          <Disc size={36} color="var(--text-dim)" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
            No Artists Found
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
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
      className="geometric-card"
      style={{
        padding: '24px 20px',
        borderRadius: '0px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-medium)';
        e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
      }}
    >
      {/* Square Avatar Container */}
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '0px',
          overflow: 'hidden',
          marginBottom: '16px',
          backgroundColor: '#000',
          border: '1px solid rgba(255, 65, 108, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {artist.avatar ? (
          <img
            src={resolveMediaUrl(artist.avatar)}
            alt={stageName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0px' }}
          />
        ) : (
          <Music size={36} color="var(--accent-primary)" />
        )}
      </div>

      {/* Name & Verification */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
          {stageName}
        </h3>
        {artist.artistProfile?.isVerified && (
          <BadgeCheck size={18} color="#1ed760" />
        )}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
        @{artist.username}
      </p>

      {/* Follower Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Users size={14} />
        <span>{followerCount} {followerCount === 1 ? 'follower' : 'followers'}</span>
      </div>

      {/* Follow Button - Sharp Rectangular */}
      {!isSelf && (
        <button
          onClick={handleFollowToggle}
          disabled={toggling || loadingStatus}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 20px',
            borderRadius: '0px',
            border: isFollowing ? '1px solid var(--border-medium)' : '1px solid var(--accent-primary)',
            backgroundColor: isFollowing ? 'transparent' : 'var(--accent-primary)',
            color: isFollowing ? '#fff' : '#000',
            fontWeight: 800,
            fontSize: '0.82rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.15s ease',
          }}
        >
          {toggling ? (
            <Loader2 size={14} className="spin" />
          ) : isFollowing ? (
            <>
              <UserCheck size={15} /> Following
            </>
          ) : (
            <>
              <UserPlus size={15} /> Follow
            </>
          )}
        </button>
      )}

      {artist.bio && (
        <p style={{
          fontSize: '0.82rem',
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

      {/* Genre badges - Sharp Rectangular Chips */}
      {genres.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
          {genres.map((g, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '0px',
                backgroundColor: 'var(--bg-deep)',
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
          <a href={socials.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.15s' }}>
            <InstagramIcon size={16} />
          </a>
        )}
        {socials.twitter && (
          <a href={socials.twitter} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.15s' }}>
            <TwitterIcon size={16} />
          </a>
        )}
        {socials.youtube && (
          <a href={socials.youtube} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.15s' }}>
            <YoutubeIcon size={16} />
          </a>
        )}
        {socials.website && (
          <a href={socials.website} target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)', transition: 'color 0.15s' }}>
            <Globe size={16} />
          </a>
        )}
      </div>
    </div>
  );
};

export default Artists;
