import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { resolveMediaUrl } from '../services/api';
import { formatTime } from './SongCard';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  AlertCircle,
  X,
  Trash2,
  Music2,
  Disc3,
  Loader2,
  Heart
} from 'lucide-react';

const AudioPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    queue,
    queueIndex,
    isBuffering,
    playerError,
    isQueueOpen,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    changeVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    playSong,
    removeFromQueue,
    clearQueue,
    toggleQueueModal,
    isSongLiked,
    toggleLikeTrack,
  } = usePlayer();

  if (!currentSong) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const artistName = currentSong.artist?.artistProfile?.stageName || currentSong.artist?.name || 'Unknown Artist';
  const artwork = resolveMediaUrl(currentSong.artworkUrl);

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  return (
    <>
      {/* Persistent Bottom Bar */}
      <footer
        className="app-audio-player"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'var(--player-height, 86px)',
          backgroundColor: '#0a0b0e',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          zIndex: 1000,
          boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Left: Track Information */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '280px', minWidth: '180px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '0px',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface-elevated)',
            flexShrink: 0,
            border: '1px solid var(--border-subtle)',
          }}>
            <img
              src={artwork}
              alt={currentSong.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0px' }}
            />
          </div>

          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h4 style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '3px'
            }}>
              {currentSong.title}
            </h4>
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {artistName}
            </p>
          </div>

          {/* Like/Heart Button */}
          <button
            onClick={() => toggleLikeTrack(currentSong._id)}
            title={isSongLiked(currentSong._id) ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isSongLiked(currentSong._id) ? '#ff3366' : 'var(--text-dim)',
              marginLeft: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0px',
              transition: 'transform 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Heart size={19} fill={isSongLiked(currentSong._id) ? '#ff3366' : 'none'} />
          </button>
        </div>

        {/* Center: Playback Controls & Seek Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          flex: 1,
          maxWidth: '560px',
          padding: '0 16px',
        }}>
          {/* Button Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
              style={{
                color: isShuffle ? 'var(--accent-primary)' : 'var(--text-dim)',
                transition: 'color 0.2s',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Shuffle size={18} />
            </button>

            {/* Previous */}
            <button
              onClick={prevTrack}
              title="Previous Track"
              style={{
                color: 'var(--text-main)',
                transition: 'transform 0.1s',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <SkipBack size={20} />
            </button>

            {/* Play / Pause Circular Button */}
            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--accent-glow)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isBuffering ? (
                <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#000' }} />
              ) : isPlaying ? (
                <Pause size={20} fill="#000" color="#000" />
              ) : (
                <Play size={20} fill="#000" color="#000" style={{ marginLeft: '2px' }} />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              title="Next Track"
              style={{
                color: 'var(--text-main)',
                transition: 'transform 0.1s',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <SkipForward size={20} />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode}`}
              style={{
                color: repeatMode !== 'off' ? 'var(--accent-primary)' : 'var(--text-dim)',
                transition: 'color 0.2s',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Seek Slider Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', minWidth: '35px', textAlign: 'right' }}>
              {formatTime(currentTime)}
            </span>

            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
                style={{
                  width: '100%',
                  height: '4px',
                  borderRadius: '0px',
                  background: `linear-gradient(to right, var(--accent-primary) ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%)`,
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', minWidth: '35px' }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Error Banner if audio fails */}
          {playerError && (
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--error-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <AlertCircle size={12} />
              <span>{playerError}</span>
            </div>
          )}
        </div>

        {/* Right: Queue & Volume Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '280px', justifyContent: 'flex-end' }}>
          {/* Queue Button with Badge */}
          <button
            onClick={toggleQueueModal}
            title="Play Queue"
            style={{
              position: 'relative',
              color: isQueueOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
              padding: '6px',
              borderRadius: '0px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ListMusic size={20} />
            {queue.length > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: '-2px',
                fontSize: '0.62rem',
                fontWeight: 800,
                backgroundColor: 'var(--accent-primary)',
                color: '#000',
                borderRadius: '0px',
                padding: '1px 4px',
              }}>
                {queue.length}
              </span>
            )}
          </button>

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', borderRadius: '0px' }}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={18} />
              ) : volume < 0.5 ? (
                <Volume1 size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              style={{
                width: '85px',
                height: '4px',
                borderRadius: '0px',
                background: `linear-gradient(to right, #fff ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.2) ${(isMuted ? 0 : volume) * 100}%)`,
                appearance: 'none',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </footer>

      {/* Slide-out Queue Modal / Drawer - Sharp Geometric */}
      {isQueueOpen && (
        <div style={{
          position: 'fixed',
          bottom: '86px',
          right: '24px',
          width: '380px',
          maxHeight: '480px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: '0px',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Queue Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListMusic size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Play Queue ({queue.length})</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {queue.length > 1 && (
                <button
                  onClick={clearQueue}
                  title="Clear Queue"
                  style={{ color: 'var(--text-dim)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '0px' }}
                >
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              )}
              <button onClick={toggleQueueModal} style={{ color: 'var(--text-dim)', borderRadius: '0px' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Queue Track List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
            {queue.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Your queue is empty. Click the queue button on any track to add it!
              </div>
            ) : (
              queue.map((song, idx) => {
                const isItemPlaying = currentSong?._id === song._id;
                return (
                  <div
                    key={`${song._id}-${idx}`}
                    onClick={() => playSong(song)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '0px',
                      cursor: 'pointer',
                      backgroundColor: isItemPlaying ? 'rgba(30, 215, 96, 0.1)' : 'transparent',
                      border: isItemPlaying ? '1px solid rgba(30, 215, 96, 0.35)' : '1px solid transparent',
                      marginBottom: '4px',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{ fontSize: '0.75rem', color: isItemPlaying ? 'var(--accent-primary)' : 'var(--text-dim)', width: '18px' }}>
                        {isItemPlaying ? '▶' : idx + 1}
                      </span>
                      <img
                        src={resolveMediaUrl(song.artworkUrl)}
                        alt={song.title}
                        style={{ width: '36px', height: '36px', borderRadius: '0px', objectFit: 'cover' }}
                      />
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <p style={{
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: isItemPlaying ? 'var(--accent-primary)' : '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {song.title}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {song.artist?.artistProfile?.stageName || song.artist?.name || 'Artist'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {formatTime(song.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(idx);
                        }}
                        style={{ color: 'var(--text-dim)', padding: '2px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AudioPlayer;
