import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { resolveMediaUrl } from '../services/api';
import { Play, Pause, ListPlus, Radio, Flame } from 'lucide-react';

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
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = usePlayer();

  const isCurrentSong = currentSong?._id === song._id;

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

  const artistName = song.artist?.artistProfile?.stageName || song.artist?.name || 'Unknown Artist';
  const artwork = resolveMediaUrl(song.artworkUrl);

  return (
    <div
      className="glass-card"
      onClick={handlePlayClick}
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
      {/* Artwork Container with Overlay Play Button */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '100%', // 1:1 Aspect ratio
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '14px',
        backgroundColor: 'var(--bg-deep)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
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
          }}
          loading="lazy"
        />

        {/* Hover / Active Play Button Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-primary)',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
          transform: isCurrentSong ? 'scale(1)' : 'translateY(8px)',
          opacity: isCurrentSong ? 1 : 0.9,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="card-play-btn"
        >
          {isCurrentSong && isPlaying ? (
            <Pause size={22} fill="#000" color="#000" />
          ) : (
            <Play size={22} fill="#000" color="#000" style={{ marginLeft: '3px' }} />
          )}
        </div>
      </div>

      {/* Track Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <h4 style={{
          fontSize: '0.98rem',
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
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {artistName}
        </p>

        {/* Metadata Badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.74rem',
          color: 'var(--text-dim)',
        }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-deep)',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}>
            {song.genre}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{formatTime(song.duration)}</span>
            <button
              onClick={handleQueueClick}
              title="Add to queue"
              style={{
                color: 'var(--text-dim)',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              <ListPlus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;
