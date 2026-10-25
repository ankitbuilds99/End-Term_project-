import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { resolveMediaUrl } from '../services/api';
import { Play, Pause, ListPlus, Heart, FolderPlus } from 'lucide-react';
import AddToPlaylistModal from './AddToPlaylistModal';

export const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return '0:00';
  const minutes = Math.floor(secs / 60);
  const remainingSeconds = Math.floor(secs % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const formatPlays = (plays) => {
  if (!plays) return '0 plays';
  if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M plays`;
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K plays`;
  return `${plays} plays`;
};

const SongCard = ({ song, playlist = null }) => {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue, isSongLiked, toggleLikeTrack } = usePlayer();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const isCurrentSong = currentSong?._id === song._id;
  const isLiked = isSongLiked(song._id);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, playlist || [song]);
    }
  };

  const handleQueueClick = (e) => {
    e.stopPropagation();
    addToQueue(song);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLikeTrack(song._id);
  };

  const handlePlaylistClick = (e) => {
    e.stopPropagation();
    setShowPlaylistModal(true);
  };

  const artistName = song.artist?.artistProfile?.stageName || song.artist?.name || 'Unknown Artist';
  const artwork = resolveMediaUrl(song.artworkUrl);

  return (
    <>
      <div
        className="geometric-card"
        onClick={handlePlayClick}
        style={{
          padding: '14px',
          borderRadius: '0px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
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
        {/* Square Artwork Container with No Rounded Corners */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingTop: '100%', // 1:1 Aspect ratio
          borderRadius: '0px',
          overflow: 'hidden',
          marginBottom: '12px',
          backgroundColor: '#000',
          border: '1px solid var(--border-subtle)',
        }}>
          <img
            src={artwork}
            alt={song.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0px',
            }}
            loading="lazy"
          />

          {/* Quick Heart on artwork top-right - Sharp Square */}
          <button
            onClick={handleLikeClick}
            title={isLiked ? 'Unlike song' : 'Like song'}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '30px',
              height: '30px',
              borderRadius: '0px',
              backgroundColor: 'rgba(8, 9, 11, 0.85)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLiked ? '#ff3366' : '#fff',
              transition: 'background-color 0.15s',
            }}
          >
            <Heart size={15} fill={isLiked ? '#ff3366' : 'none'} />
          </button>

          {/* Play / Pause Button Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
              opacity: isCurrentSong ? 1 : 0.95,
              transition: 'transform 0.15s ease',
            }}
            className="card-play-btn"
          >
            {isCurrentSong && isPlaying ? (
              <Pause size={20} fill="#000" color="#000" />
            ) : (
              <Play size={20} fill="#000" color="#000" style={{ marginLeft: '2px' }} />
            )}
          </div>
        </div>

        {/* Track Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
          <h4 style={{
            fontSize: '0.94rem',
            fontWeight: 700,
            color: isCurrentSong ? 'var(--accent-primary)' : '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}>
            {song.title}
          </h4>

          <p style={{
            fontSize: '0.80rem',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {artistName}
          </p>

          {/* Metadata Badges & Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
          }}>
            <span style={{
              padding: '2px 6px',
              borderRadius: '0px',
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.68rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {song.genre}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem' }}>{formatTime(song.duration)}</span>

              {/* Add to Playlist button */}
              <button
                onClick={handlePlaylistClick}
                title="Add to playlist"
                style={{
                  color: 'var(--text-dim)',
                  padding: '4px',
                  borderRadius: '0px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-dim)';
                }}
              >
                <FolderPlus size={15} />
              </button>

              {/* Add to Queue button */}
              <button
                onClick={handleQueueClick}
                title="Add to queue"
                style={{
                  color: 'var(--text-dim)',
                  padding: '4px',
                  borderRadius: '0px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-dim)';
                }}
              >
                <ListPlus size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal song={song} onClose={() => setShowPlaylistModal(false)} />
      )}
    </>
  );
};

export default SongCard;
