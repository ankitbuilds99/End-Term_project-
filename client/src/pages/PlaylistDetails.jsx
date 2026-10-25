import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getPlaylistByIdApi,
  updatePlaylistApi,
  deletePlaylistApi,
  removeSongFromPlaylistApi,
  reorderPlaylistTracksApi,
  resolveMediaUrl,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../components/SongCard';
import {
  Play,
  Pause,
  Shuffle,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Globe,
  Lock,
  Clock,
  Music,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';

const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong, togglePlay, playPlaylist, isShuffle, toggleShuffle } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCover, setEditCover] = useState('');
  const [editPublic, setEditPublic] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPlaylist = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getPlaylistByIdApi(id);
      if (res.data?.success && res.data.playlist) {
        setPlaylist(res.data.playlist);
        setEditTitle(res.data.playlist.title);
        setEditDesc(res.data.playlist.description || '');
        setEditCover(res.data.playlist.coverUrl || '');
        setEditPublic(res.data.playlist.isPublic);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load playlist or access is denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const isOwner = user && playlist && (playlist.owner?._id === user.id || playlist.owner?._id === user._id || user.role === 'admin');

  const handlePlayAll = (shuffleMode = false) => {
    if (!playlist?.songs || playlist.songs.length === 0) return;
    if (shuffleMode && !isShuffle) {
      toggleShuffle();
    }
    playPlaylist(playlist.songs, 0);
  };

  const handleTrackClick = (song, index) => {
    if (currentSong?._id === song._id) {
      togglePlay();
    } else {
      playPlaylist(playlist.songs, index);
    }
  };

  const handleRemoveTrack = async (songId, e) => {
    e.stopPropagation();
    try {
      const res = await removeSongFromPlaylistApi(playlist._id, songId);
      if (res.data?.success && res.data.playlist) {
        setPlaylist(res.data.playlist);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove song');
    }
  };

  const handleMoveTrack = async (index, direction, e) => {
    e.stopPropagation();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= playlist.songs.length) return;

    const reordered = [...playlist.songs];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    // Optimistically update
    setPlaylist((prev) => ({ ...prev, songs: reordered }));

    try {
      const songIds = reordered.map((s) => s._id);
      const res = await reorderPlaylistTracksApi(playlist._id, songIds);
      if (res.data?.success && res.data.playlist) {
        setPlaylist(res.data.playlist);
      }
    } catch (err) {
      fetchPlaylist(); // Rollback on failure
      alert(err.response?.data?.message || 'Failed to reorder tracks');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setSavingEdit(true);
    try {
      const res = await updatePlaylistApi(playlist._id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        coverUrl: editCover.trim() || undefined,
        isPublic: editPublic,
      });

      if (res.data?.success && res.data.playlist) {
        setPlaylist(res.data.playlist);
        setShowEditModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update playlist');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deletePlaylistApi(playlist._id);
      if (res.data?.success) {
        navigate('/playlists');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete playlist');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Loader2 size={36} className="spin" color="var(--accent-primary)" />
      </div>
    );
  }

  if (errorMsg || !playlist) {
    return (
      <div className="glass-card" style={{ maxWidth: '500px', margin: '80px auto', padding: '40px 24px', textAlign: 'center', borderRadius: '0px' }}>
        <Lock size={48} color="#f87171" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Playlist Inaccessible</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {errorMsg || 'This playlist is private or does not exist.'}
        </p>
        <Link to="/playlists" className="btn-primary">
          Back to Playlists
        </Link>
      </div>
    );
  }

  const songs = playlist.songs || [];
  const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const cover = playlist.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 10px 40px' }}>
      {/* Hero Banner */}
      <div
        style={{
          borderRadius: '0px',
          padding: '36px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.20) 0%, rgba(168, 85, 247, 0.15) 60%, rgba(10, 11, 14, 0.95) 100%)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          flexWrap: 'wrap',
        }}
      >
        <img
          src={cover}
          alt={playlist.title}
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '0px',
            objectFit: 'cover',
            backgroundColor: 'var(--bg-deep)',
            border: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-primary)', fontWeight: 700 }}>
              Playlist
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '0px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'var(--text-dim)',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              {playlist.isPublic ? <Globe size={11} /> : <Lock size={11} />}
              {playlist.isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.1 }}>
            {playlist.title}
          </h1>

          {playlist.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginBottom: '14px', maxWidth: '640px' }}>
              {playlist.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <span style={{ color: '#fff', fontWeight: 600 }}>{playlist.owner?.name || 'User'}</span>
            <span>•</span>
            <span>{songs.length} tracks</span>
            <span>•</span>
            <span>{Math.round(totalDuration / 60)} min</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handlePlayAll(false)}
          disabled={songs.length === 0}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            fontSize: '1rem',
            borderRadius: '0px',
          }}
        >
          <Play size={20} fill="#000" />
          Play All
        </button>

        <button
          onClick={() => handlePlayAll(true)}
          disabled={songs.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 22px',
            borderRadius: '0px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <Shuffle size={18} />
          Shuffle
        </button>

        {isOwner && (
          <>
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '0px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <Edit2 size={16} />
              Edit
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '0px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={16} />
              Delete Playlist
            </button>
          </>
        )}
      </div>

      {/* Tracks Table */}
      {songs.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '0px' }}>
          <Music size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>This playlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Browse tracks from the catalogue and click the folder icon to add them.
          </p>
          <Link to="/catalogue" className="btn-primary" style={{ borderRadius: '0px' }}>
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '0px', overflow: 'hidden' }}>
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isOwner ? '40px 1fr 140px 90px 120px' : '40px 1fr 160px 100px',
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text-dim)',
            }}
          >
            <span>#</span>
            <span>Title</span>
            <span>Genre</span>
            <span style={{ textAlign: 'right' }}>
              <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
            </span>
            {isOwner && <span style={{ textAlign: 'right' }}>Actions</span>}
          </div>

          {/* Track Rows */}
          {songs.map((song, idx) => {
            const isCurrent = currentSong?._id === song._id;
            const artistName = song.artist?.artistProfile?.stageName || song.artist?.name || 'Unknown Artist';
            const artwork = resolveMediaUrl(song.artworkUrl);

            return (
              <div
                key={song._id}
                onClick={() => handleTrackClick(song, idx)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isOwner ? '40px 1fr 140px 90px 120px' : '40px 1fr 160px 100px',
                  alignItems: 'center',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  backgroundColor: isCurrent ? 'var(--bg-surface-elevated)' : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Index / Indicator */}
                <div style={{ color: isCurrent ? 'var(--accent-primary)' : 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {isCurrent && isPlaying ? (
                    <Pause size={16} fill="var(--accent-primary)" color="var(--accent-primary)" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Track Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  <img
                    src={artwork}
                    alt={song.title}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '0px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-deep)',
                    }}
                  />
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.94rem',
                      color: isCurrent ? 'var(--accent-primary)' : '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {song.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {artistName}
                    </div>
                  </div>
                </div>

                {/* Genre */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {song.genre}
                </div>

                {/* Duration */}
                <div style={{ textAlign: 'right', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {formatTime(song.duration)}
                </div>

                {/* Owner Actions: Reorder & Remove */}
                {isOwner && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <button
                      onClick={(e) => handleMoveTrack(idx, 'up', e)}
                      disabled={idx === 0}
                      title="Move up"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: idx === 0 ? 'rgba(255,255,255,0.1)' : 'var(--text-muted)',
                        cursor: idx === 0 ? 'default' : 'pointer',
                        padding: '4px',
                      }}
                    >
                      <ChevronUp size={16} />
                    </button>

                    <button
                      onClick={(e) => handleMoveTrack(idx, 'down', e)}
                      disabled={idx === songs.length - 1}
                      title="Move down"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: idx === songs.length - 1 ? 'rgba(255,255,255,0.1)' : 'var(--text-muted)',
                        cursor: idx === songs.length - 1 ? 'default' : 'pointer',
                        padding: '4px',
                      }}
                    >
                      <ChevronDown size={16} />
                    </button>

                    <button
                      onClick={(e) => handleRemoveTrack(song._id, e)}
                      title="Remove from playlist"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '4px',
                        marginLeft: '4px',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Playlist Modal */}
      {showEditModal && (
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
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '0px',
              padding: '28px',
              backgroundColor: '#12141a',
              border: '1px solid var(--border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Edit Playlist</h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '0px',
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
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '0px',
                    backgroundColor: 'var(--bg-deep)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '0px',
                    backgroundColor: 'var(--bg-deep)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                  }}
                />
              </div>

              {/* Visibility toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '0px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <input
                  type="checkbox"
                  id="editPublicToggle"
                  checked={editPublic}
                  onChange={(e) => setEditPublic(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                />
                <label htmlFor="editPublicToggle" style={{ fontSize: '0.9rem', color: '#fff', cursor: 'pointer' }}>
                  {editPublic ? 'Public — visible to all users' : 'Private — only visible to you'}
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '0px',
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
                  disabled={savingEdit || !editTitle.trim()}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '0px' }}
                >
                  {savingEdit && <Loader2 size={16} className="spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '420px',
              borderRadius: '0px',
              padding: '28px',
              backgroundColor: '#12141a',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle size={48} color="#f87171" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Delete Playlist?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to permanently delete "{playlist.title}"? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '0px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '10px 24px',
                  borderRadius: '0px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {deleting && <Loader2 size={16} className="spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetails;
