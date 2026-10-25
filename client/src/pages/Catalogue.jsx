import React, { useState, useEffect } from 'react';
import { getSongsApi } from '../services/api';
import SongCard from '../components/SongCard';
import { 
  Music, 
  Search, 
  SlidersHorizontal, 
  Disc, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  Sparkles 
} from 'lucide-react';

const GENRE_CHIPS = [
  'All',
  'Bollywood',
  'Indie Pop',
  'Electronic / EDM',
  'Folk & Acoustic',
  'Lo-Fi Beats',
  'Hip-Hop / Rap',
  'Sufi',
  'Rock',
];

const SORT_OPTIONS = [
  { value: 'popular', label: '🔥 Most Popular' },
  { value: 'latest', label: '✨ Latest Releases' },
  { value: 'title', label: '🔤 Title (A - Z)' },
  { value: 'oldest', label: '⏳ Oldest First' },
];

const Catalogue = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchSongs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: sortBy,
      };
      if (selectedGenre && selectedGenre !== 'All') {
        params.genre = selectedGenre;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await getSongsApi(params);
      if (res.data?.success) {
        setSongs(res.data.songs || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs(1);
  }, [selectedGenre, sortBy]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSongs(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchSongs(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(30, 215, 96, 0.1)', border: '1px solid rgba(30, 215, 96, 0.25)', marginBottom: '14px' }}>
          <Music size={14} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>
            Live Music Catalogue
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Explore Songs & Tracks
        </h1>
        <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)' }}>
          Stream verified independent music and trending releases across all genres
        </p>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '12px 18px',
            flex: '1',
            minWidth: '280px',
            maxWidth: '540px',
          }}>
            <Search size={18} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by track title, album, artist, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                width: '100%',
              }}
            />
          </div>

          {/* Sort Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: '#181a20' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Genre Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}>
          {GENRE_CHIPS.map((genre) => {
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
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(30, 215, 96, 0.15)' : 'var(--bg-surface)',
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

      {/* Catalogue Results Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Showing {songs.length} of {pagination.total} published tracks
        </p>
      </div>

      {/* Songs Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner-white" style={{ width: '32px', height: '32px' }} />
        </div>
      ) : songs.length > 0 ? (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}>
            {songs.map((song) => (
              <SongCard key={song._id} song={song} playlist={songs} />
            ))}
          </div>

          {/* Pagination Bar */}
          {pagination.pages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '24px 0',
            }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Disc size={40} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            No Tracks Found
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {searchQuery
              ? `No tracks found matching "${searchQuery}". Try different keywords.`
              : 'No tracks uploaded in this genre yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Catalogue;
