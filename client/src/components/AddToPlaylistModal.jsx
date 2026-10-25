import React, { useState, useEffect } from 'react';
import { getMyPlaylistsApi, addSongToPlaylistApi, createPlaylistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Check, Music2, FolderPlus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddToPlaylistModal = ({ song, onClose }) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionStatus, setActionStatus] = useState({}); // { [playlistId]: 'adding' | 'added' | 'error' }
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    getMyPlaylistsApi()
      .then((res) => {
        if (res.data?.success) {
          setPlaylists(res.data.playlists || []);
        }
      })
      .catch((err) => {
        console.warn('Error fetching playlists:', err.message);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleAdd = async (playlistId) => {
    setActionStatus((prev) => ({ ...prev, [playlistId]: 'adding' }));
    setErrorMsg('');

    try {
      const res = await addSongToPlaylistApi(playlistId, song._id);
      if (res.data?.success) {
        setActionStatus((prev) => ({ ...prev, [playlistId]: 'added' }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add track to playlist';
      setErrorMsg(msg);
      setActionStatus((prev) => ({ ...prev, [playlistId]: 'error' }));
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    setErrorMsg('');

    try {
      const res = await createPlaylistApi({
        title: newTitle.trim(),
        description: `Created for ${song.title}`,
        isPublic: true,
      });

      if (res.data?.success && res.data.playlist) {
        const newPl = res.data.playlist;
        // Now add song to the newly created playlist
        await addSongToPlaylistApi(newPl._id, song._id);
        setPlaylists((prev) => [newPl, ...prev]);
        setActionStatus((prev) => ({ ...prev, [newPl._id]: 'added' }));
        setNewTitle('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '0px',
          padding: '24px',
          backgroundColor: '#12141a',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Add to Playlist</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Adding "{song.title}"
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '0px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {!user ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              You need to be logged in to create and manage playlists.
            </p>
            <Link to="/login" className="btn-primary" onClick={onClose} style={{ borderRadius: '0px' }}>
              Log In
            </Link>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
            <Loader2 size={28} className="spin" color="var(--accent-primary)" />
          </div>
        ) : (
          <>
            {/* Create new playlist input */}
            <form onSubmit={handleCreateAndAdd} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="New playlist title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '0px',
                  backgroundColor: 'var(--bg-deep)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              />
              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  fontSize: '0.88rem',
                  borderRadius: '0px',
                }}
              >
                {creating ? <Loader2 size={16} className="spin" /> : <FolderPlus size={16} />}
                Create & Add
              </button>
            </form>

            {/* Existing Playlists list */}
            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {playlists.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-dim)' }}>
                  <Music2 size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.88rem' }}>No playlists yet. Create your first one above!</p>
                </div>
              ) : (
                playlists.map((pl) => {
                  const status = actionStatus[pl._id];
                  const isAdded = status === 'added';
                  const isAdding = status === 'adding';

                  return (
                    <div
                      key={pl._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '0px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {pl.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                          {pl.songs?.length || 0} tracks {pl.isPublic ? '• Public' : '• Private'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAdd(pl._id)}
                        disabled={isAdded || isAdding}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '0px',
                          border: isAdded ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border-subtle)',
                          cursor: isAdded ? 'default' : 'pointer',
                          backgroundColor: isAdded
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'var(--bg-surface-elevated)',
                          color: isAdded ? '#4ade80' : 'var(--text-main)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isAdding ? (
                          <Loader2 size={14} className="spin" />
                        ) : isAdded ? (
                          <>
                            <Check size={14} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
