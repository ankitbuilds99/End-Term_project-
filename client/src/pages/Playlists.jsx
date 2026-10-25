import React, { useState, useEffect } from 'react';
import { getPlaylistsApi, getMyPlaylistsApi, createPlaylistApi, resolveMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { Plus, FolderPlus, Play, Lock, Globe, Music, Loader2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Playlists = () => {
  const { user } = useAuth();
  const { playPlaylist } = usePlayer();
  const navigate = useNavigate();

  const [myPlaylists, setMyPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverUrl, setCoverUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const publicReq = getPlaylistsApi({ limit: 20 });
      const myReq = user ? getMyPlaylistsApi() : Promise.resolve({ data: { playlists: [] } });

      const [pubRes, myRes] = await Promise.all([publicReq, myReq]);
      if (pubRes.data?.success) setPublicPlaylists(pubRes.data.playlists || []);
      if (myRes.data?.success) setMyPlaylists(myRes.data.playlists || []);
    } catch (err) {
      console.warn('Error fetching playlists:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    setErrorMsg('');

    try {
      const res = await createPlaylistApi({
        title: newTitle.trim(),
        description: newDesc.trim(),
        isPublic,
        coverUrl: coverUrl.trim() || undefined,
      });

      if (res.data?.success && res.data.playlist) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        setCoverUrl('');
        setIsPublic(true);
        navigate(`/playlists/${res.data.playlist._id}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 10px 40px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '6px' }}>Playlists</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Curate, organize, and discover playlists created by listeners and artists.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
          >
            <Plus size={18} />
            Create Playlist
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={36} className="spin" color="var(--accent-primary)" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* User's Playlists Section */}
          {user && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '18px', color: '#fff' }}>
                Your Playlists
              </h2>

              {myPlaylists.length === 0 ? (
                <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: '16px' }}>
                  <FolderPlus size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>No playlists yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Create your first playlist and start gathering your favorite tracks.
                  </p>
                  <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                    Create a Playlist
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {myPlaylists.map((pl) => (
                    <PlaylistCard key={pl._id} playlist={pl} onPlay={() => playPlaylist(pl.songs)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Public / Community Playlists */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '18px', color: '#fff' }}>
              Explore Public Playlists
            </h2>

            {publicPlaylists.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: '16px' }}>
                <Music size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-muted)' }}>No public playlists found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {publicPlaylists.map((pl) => (
                  <PlaylistCard key={pl._id} playlist={pl} onPlay={() => playPlaylist(pl.songs)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '20px',
              padding: '28px',
              backgroundColor: '#12141a',
              border: '1px solid var(--border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>New Playlist</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="My favorite tracks"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-deep)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Give your playlist a vibe or theme..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-deep)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-deep)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                  }}
                />
              </div>

              {/* Visibility toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-surface)' }}>
                <input
                  type="checkbox"
                  id="isPublicToggle"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isPublicToggle" style={{ fontSize: '0.9rem', color: '#fff', cursor: 'pointer' }}>
                  {isPublic ? 'Public — visible to all users' : 'Private — only visible to you'}
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {creating && <Loader2 size={16} className="spin" />}
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PlaylistCard = ({ playlist, onPlay }) => {
  const navigate = useNavigate();
  const cover = playlist.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';

  return (
    <div
      className="glass-card"
      onClick={() => navigate(`/playlists/${playlist._id}`)}
      style={{
        padding: '16px',
        borderRadius: '16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s',
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
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '12px',
          backgroundColor: 'var(--bg-deep)',
        }}
      >
        <img
          src={cover}
          alt={playlist.title}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Visibility Badge */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 8px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {playlist.isPublic ? <Globe size={12} /> : <Lock size={12} />}
          {playlist.isPublic ? 'Public' : 'Private'}
        </div>
      </div>

      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {playlist.title}
      </h3>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        By {playlist.owner?.name || 'User'} • {playlist.songs?.length || 0} tracks
      </p>
    </div>
  );
};

export default Playlists;
