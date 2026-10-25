import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { 
  getMyTracksApi, 
  getArtistAnalyticsApi,
  createSongApi, 
  updateSongApi, 
  deleteSongApi, 
  resolveMediaUrl 
} from '../services/api';
import { formatTime, formatPlays } from '../components/SongCard';
import {
  Mic2,
  Upload,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Music,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  BarChart3,
  Layers,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Activity,
  Flame,
  Disc,
  Radio,
  Loader2
} from 'lucide-react';

const GENRES = [
  'Bollywood',
  'Indie Pop',
  'Electronic / EDM',
  'Folk & Acoustic',
  'Lo-Fi Beats',
  'Hip-Hop / Rap',
  'Sufi',
  'Rock',
  'Classical',
  'R&B / Soul',
];

const ArtistStudio = () => {
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  const [tracks, setTracks] = useState([]);
  const [stats, setStats] = useState({ totalTracks: 0, publishedCount: 0, totalPlays: 0 });
  const [loading, setLoading] = useState(true);

  // Studio Navigation Tabs
  const [activeTab, setActiveTab] = useState('tracks'); // 'tracks' | 'analytics'
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('all'); // 'all' | '30d' | '7d'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadGenre, setUploadGenre] = useState('Bollywood');
  const [uploadAlbum, setUploadAlbum] = useState('');
  const [uploadAudioFile, setUploadAudioFile] = useState(null);
  const [uploadArtworkFile, setUploadArtworkFile] = useState(null);
  const [uploadIsPublished, setUploadIsPublished] = useState(true);
  const [detectedDuration, setDetectedDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Edit Modal State
  const [editingTrack, setEditingTrack] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [editArtworkFile, setEditArtworkFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Notification
  const [toastMessage, setToastMessage] = useState('');

  const fetchMyTracks = async () => {
    try {
      const res = await getMyTracksApi();
      if (res.data?.success) {
        setTracks(res.data.songs || []);
        setStats(res.data.stats || { totalTracks: 0, publishedCount: 0, totalPlays: 0 });
      }
    } catch (err) {
      console.error('Failed to load my tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (tf = analyticsTimeframe) => {
    setLoadingAnalytics(true);
    try {
      const res = await getArtistAnalyticsApi({ timeframe: tf });
      if (res.data?.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load analytics:', err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchMyTracks();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics(analyticsTimeframe);
    }
  }, [activeTab, analyticsTimeframe]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Audio file picker change with client duration detection
  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setModalError('Please select a valid audio file (MP3, WAV, OGG, M4A, FLAC, AAC).');
      return;
    }
    if (file.size > 35 * 1024 * 1024) {
      setModalError('Audio file is too large. Max file size allowed is 35 MB.');
      return;
    }

    setUploadAudioFile(file);
    setModalError('');

    // Probe duration using standard Audio element
    try {
      const objectUrl = URL.createObjectURL(file);
      const tempAudio = new Audio(objectUrl);
      tempAudio.addEventListener('loadedmetadata', () => {
        if (tempAudio.duration && !isNaN(tempAudio.duration)) {
          setDetectedDuration(Math.round(tempAudio.duration));
        }
        URL.revokeObjectURL(objectUrl);
      });
    } catch {
      // Ignore probing errors
    }
  };

  const handleArtworkSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setModalError('Image is too large. Max file size allowed is 6 MB.');
      return;
    }

    setUploadArtworkFile(file);
    setModalError('');
  };

  // Handle Track Upload Form Submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!uploadTitle.trim()) {
      setModalError('Track title is required.');
      return;
    }
    if (!uploadAudioFile) {
      setModalError('Please select an audio file to upload.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', uploadTitle.trim());
      formData.append('genre', uploadGenre);
      formData.append('album', uploadAlbum.trim());
      formData.append('audio', uploadAudioFile);
      if (uploadArtworkFile) {
        formData.append('artwork', uploadArtworkFile);
      }
      formData.append('duration', detectedDuration || 180);
      formData.append('isPublished', uploadIsPublished);

      const res = await createSongApi(formData);
      if (res.data?.success) {
        showToast('Track successfully uploaded and added to your portfolio!');
        setIsUploadOpen(false);
        // Reset form
        setUploadTitle('');
        setUploadAlbum('');
        setUploadAudioFile(null);
        setUploadArtworkFile(null);
        setDetectedDuration(0);
        fetchMyTracks();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async (track) => {
    try {
      const res = await updateSongApi(track._id, { isPublished: !track.isPublished });
      if (res.data?.success) {
        showToast(`Track "${track.title}" is now ${!track.isPublished ? 'Published' : 'Private (Draft)'}.`);
        fetchMyTracks();
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  // Open Edit Modal
  const openEditModal = (track) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditGenre(track.genre);
    setEditAlbum(track.album || '');
    setEditIsPublished(track.isPublished);
    setEditArtworkFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTrack) return;

    setSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('genre', editGenre);
      formData.append('album', editAlbum.trim());
      formData.append('isPublished', editIsPublished);
      if (editArtworkFile) {
        formData.append('artwork', editArtworkFile);
      }

      const res = await updateSongApi(editingTrack._id, formData);
      if (res.data?.success) {
        showToast('Track updated successfully!');
        setEditingTrack(null);
        fetchMyTracks();
      }
    } catch (err) {
      console.error('Failed to update track:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Track
  const handleDeleteTrack = async (trackId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await deleteSongApi(trackId);
      if (res.data?.success) {
        showToast(`Track "${title}" deleted.`);
        fetchMyTracks();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(255, 65, 108, 0.12)', border: '1px solid rgba(255, 65, 108, 0.3)', marginBottom: '14px' }}>
            <Sparkles size={14} color="#ff6b81" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ff6b81', letterSpacing: '0.04em' }}>
              Creator Studio
            </span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {user?.artistProfile?.stageName || user?.name} Studio
          </h1>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)' }}>
            Upload new original music, manage release status, and oversee track performance
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="btn-primary"
          style={{
            background: 'var(--artist-gradient)',
            boxShadow: '0 4px 14px rgba(255, 65, 108, 0.4)',
          }}
        >
          <Plus size={18} />
          <span>Upload New Track</span>
        </button>
      </div>

      {/* Studio Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveTab('tracks')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'tracks' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: activeTab === 'tracks' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.96rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Music size={18} color={activeTab === 'tracks' ? 'var(--accent-primary)' : 'currentColor'} />
          <span>Catalog & Uploads</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid #ff6b81' : '3px solid transparent',
            color: activeTab === 'analytics' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.96rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <BarChart3 size={18} color={activeTab === 'analytics' ? '#ff6b81' : 'currentColor'} />
          <span>Audience & Stream Analytics</span>
        </button>
      </div>

      {/* Notifications */}
      {toastMessage && (
        <div className="form-success">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {activeTab === 'analytics' ? (
        <div>
          {/* Timeframe Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                Audience & Streaming Analytics
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Derived in real-time from verified listening sessions and follower activity
              </p>
            </div>

            {/* Timeframe Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-deep)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              {[
                { label: 'All Time', value: 'all' },
                { label: 'Last 30 Days', value: '30d' },
                { label: 'Last 7 Days', value: '7d' },
              ].map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setAnalyticsTimeframe(tf.value)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: analyticsTimeframe === tf.value ? '#ff4757' : 'transparent',
                    color: analyticsTimeframe === tf.value ? '#fff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {loadingAnalytics ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <Loader2 size={36} className="spin" color="#ff6b81" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* 6 Key Analytics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total Streams</span>
                    <Flame size={18} color="#ff4757" />
                  </div>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                    {formatPlays(analyticsData?.metrics?.totalPlays || 0)}
                  </p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {analyticsTimeframe === 'all' ? 'All-time verified plays' : `In selected ${analyticsTimeframe}`}
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Followers</span>
                    <Users size={18} color="#06b6d4" />
                  </div>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                    {analyticsData?.metrics?.totalFollowers || 0}
                  </p>
                  <p style={{ fontSize: '0.74rem', color: '#22c55e', marginTop: '4px' }}>
                    +{analyticsData?.metrics?.periodFollowers || 0} in {analyticsTimeframe === 'all' ? 'total' : analyticsTimeframe}
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Unique Listeners</span>
                    <Activity size={18} color="#a855f7" />
                  </div>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                    {analyticsData?.metrics?.uniqueListeners || 0}
                  </p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Individual accounts
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Listening Time</span>
                    <Clock size={18} color="#eab308" />
                  </div>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                    {analyticsData?.metrics?.totalListeningMinutes || 0} <span style={{ fontSize: '1rem', fontWeight: 500 }}>min</span>
                  </p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Validated airtime
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Published Releases</span>
                    <Eye size={18} color="#22c55e" />
                  </div>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                    {analyticsData?.metrics?.publishedTracks || 0}
                  </p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Active catalogue
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Unlisted Drafts</span>
                    <EyeOff size={18} color="var(--text-dim)" />
                  </div>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                    {analyticsData?.metrics?.unpublishedTracks || 0}
                  </p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Studio work in progress
                  </p>
                </div>
              </div>

              {/* Streams Activity Timeline Chart */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Streams Activity Timeline</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Daily validated streams across all your tracks</p>
                  </div>
                  <TrendingUp size={20} color="var(--accent-primary)" />
                </div>

                {(!analyticsData?.timeline || analyticsData.timeline.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                    <Activity size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.9rem' }}>No stream events recorded during this timeframe yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px', paddingTop: '20px', paddingBottom: '10px', overflowX: 'auto' }}>
                    {(() => {
                      const maxPlays = Math.max(1, ...analyticsData.timeline.map((t) => t.plays));
                      return analyticsData.timeline.map((point) => {
                        const heightPct = Math.max(14, Math.round((point.plays / maxPlays) * 100));
                        return (
                          <div
                            key={point.date}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              flex: '1 0 38px',
                              height: '100%',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                              {point.plays}
                            </span>
                            <div
                              title={`${point.date}: ${point.plays} streams`}
                              style={{
                                width: '100%',
                                maxWidth: '28px',
                                height: `${heightPct}%`,
                                borderRadius: '6px 6px 0 0',
                                background: 'linear-gradient(180deg, var(--accent-primary) 0%, rgba(6, 182, 212, 0.4) 100%)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                              }}
                            />
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                              {point.date.slice(5)}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Top Performing Tracks */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                  Top Performing Tracks ({analyticsTimeframe === 'all' ? 'All Time' : analyticsTimeframe})
                </h3>

                {(!analyticsData?.topTracks || analyticsData.topTracks.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>
                    No stream data available for ranking yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analyticsData.topTracks.map((track, idx) => {
                      const isCurrent = currentSong?._id === track._id;
                      return (
                        <div
                          key={track._id}
                          onClick={() => {
                            if (isCurrent) togglePlay();
                            else playSong(track, analyticsData.topTracks);
                          }}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '40px 1fr 140px 100px 80px',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            backgroundColor: isCurrent ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <span style={{ fontWeight: 800, color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : 'var(--text-dim)', fontSize: '1rem' }}>
                            #{idx + 1}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <img
                              src={resolveMediaUrl(track.artworkUrl)}
                              alt={track.title}
                              style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: isCurrent ? 'var(--accent-primary)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {track.title}
                              </p>
                              <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                                {track.genre}
                              </p>
                            </div>
                          </div>

                          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                            {formatTime(track.duration)}
                          </span>

                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            {formatPlays(track.playsCount)}
                          </span>

                          <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '9999px', textAlign: 'center', backgroundColor: track.isPublished ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: track.isPublished ? '#4ade80' : 'var(--text-dim)' }}>
                            {track.isPublished ? 'Live' : 'Draft'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Genre Distribution in Catalog */}
              {analyticsData?.genreDistribution && Object.keys(analyticsData.genreDistribution).length > 0 && (
                <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                    Catalog Soundscape
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {Object.entries(analyticsData.genreDistribution).map(([genre, count]) => (
                      <div
                        key={genre}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <Disc size={16} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{genre}</span>
                        <span style={{ fontSize: '0.76rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'var(--bg-deep)', color: 'var(--text-muted)', fontWeight: 700 }}>
                          {count} {count === 1 ? 'track' : 'tracks'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Discography & Tracks content (existing) */
        <>
          {/* Statistics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total Tracks</span>
                <Music size={18} color="var(--accent-primary)" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalTracks}</p>
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total Streams</span>
                <BarChart3 size={18} color="#ff6b81" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>{formatPlays(stats.totalPlays)}</p>
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>Published Publicly</span>
                <Eye size={18} color="#22e668" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.publishedCount}</p>
            </div>

            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>Private Drafts</span>
                <EyeOff size={18} color="var(--text-dim)" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalTracks - stats.publishedCount}</p>
            </div>
          </div>

          {/* Tracks Table Header */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>
            Your Music Discography
          </h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div className="spinner-white" />
            </div>
          ) : tracks.length > 0 ? (
            <div className="glass-card" style={{ overflowX: 'auto', padding: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '680px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '12px 16px' }}>Track</th>
                    <th style={{ padding: '12px 16px' }}>Genre</th>
                    <th style={{ padding: '12px 16px' }}>Duration</th>
                    <th style={{ padding: '12px 16px' }}>Streams</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track) => {
                    const isTrackPlaying = currentSong?._id === track._id && isPlaying;
                    return (
                      <tr
                        key={track._id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Track info & Play button */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                              onClick={() => {
                                if (currentSong?._id === track._id) {
                                  togglePlay();
                                } else {
                                  playSong(track, tracks);
                                }
                              }}
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isTrackPlaying ? 'var(--accent-primary)' : '#fff',
                                flexShrink: 0,
                              }}
                            >
                              {isTrackPlaying ? <Pause size={18} /> : <Play size={18} />}
                            </button>

                            <img
                              src={resolveMediaUrl(track.artworkUrl)}
                              alt={track.title}
                              style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                            />

                            <div>
                              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                                {track.title}
                              </p>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                                {track.album || 'Single'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Genre */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '0.76rem', padding: '3px 10px', borderRadius: '9999px', backgroundColor: 'var(--bg-deep)', color: 'var(--text-muted)' }}>
                            {track.genre}
                          </span>
                        </td>

                        {/* Duration */}
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {formatTime(track.duration)}
                        </td>

                        {/* Plays Count */}
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
                          {formatPlays(track.playsCount)}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            onClick={() => handleTogglePublish(track)}
                            title="Click to toggle publish visibility"
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              border: track.isPublished ? '1px solid rgba(30, 215, 96, 0.4)' : '1px solid var(--border-subtle)',
                              backgroundColor: track.isPublished ? 'rgba(30, 215, 96, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: track.isPublished ? '#22e668' : 'var(--text-dim)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            {track.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                            <span>{track.isPublished ? 'Published' : 'Draft (Private)'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => openEditModal(track)}
                              title="Edit track"
                              style={{
                                padding: '6px',
                                color: 'var(--text-muted)',
                                borderRadius: '6px',
                                transition: 'color 0.2s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              onClick={() => handleDeleteTrack(track._id, track.title)}
                              title="Delete track"
                              style={{
                                padding: '6px',
                                color: 'var(--text-dim)',
                                borderRadius: '6px',
                                transition: 'color 0.2s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--error-text)')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Music size={40} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                No Tracks Released Yet
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Share your voice with listeners across the world. Upload your first track today!
              </p>
              <button onClick={() => setIsUploadOpen(true)} className="btn-primary">
                <Plus size={18} />
                <span>Upload My First Track</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Upload Track Modal */}
      {isUploadOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '580px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '36px',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Upload size={22} color="#ff6b81" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Upload New Track</h3>
              </div>
              <button onClick={() => setIsUploadOpen(false)} style={{ color: 'var(--text-dim)' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="form-error">
                <AlertCircle size={18} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Track Title *</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kasoor (Acoustic Version)"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Genre *</label>
                  <select
                    value={uploadGenre}
                    onChange={(e) => setUploadGenre(e.target.value)}
                    className="form-input"
                    style={{ cursor: 'pointer' }}
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g} style={{ background: '#181a20' }}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="album">Album / EP (Optional)</label>
                  <input
                    id="album"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Midnight EP"
                    value={uploadAlbum}
                    onChange={(e) => setUploadAlbum(e.target.value)}
                  />
                </div>
              </div>

              {/* Audio File Input */}
              <div className="form-group">
                <label className="form-label">Audio File * (MP3, WAV, OGG, M4A, AAC, FLAC up to 35MB)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioSelect}
                  className="form-input"
                  style={{ padding: '8px' }}
                  required
                />
                {detectedDuration > 0 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', marginTop: '4px' }}>
                    ✓ Audio detected: {formatTime(detectedDuration)} duration
                  </p>
                )}
              </div>

              {/* Artwork File Input */}
              <div className="form-group">
                <label className="form-label">Cover Artwork (JPEG, PNG, WEBP up to 6MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleArtworkSelect}
                  className="form-input"
                  style={{ padding: '8px' }}
                />
              </div>

              {/* Publication Status Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: 'var(--bg-deep)',
                borderRadius: '10px',
                marginBottom: '24px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Publish Publicly Immediately</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    If turned off, this track will remain a private draft visible only to you.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={uploadIsPublished}
                  onChange={(e) => setUploadIsPublished(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    background: 'var(--artist-gradient)',
                  }}
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>Upload & Save Track</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Track Modal */}
      {editingTrack && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '540px',
            padding: '36px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Edit Track Metadata</h3>
              <button onClick={() => setEditingTrack(null)} style={{ color: 'var(--text-dim)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="editTitle">Track Title</label>
                <input
                  id="editTitle"
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <select
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="form-input"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g} style={{ background: '#181a20' }}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editAlbum">Album / EP</label>
                  <input
                    id="editAlbum"
                    type="text"
                    className="form-input"
                    value={editAlbum}
                    onChange={(e) => setEditAlbum(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Replace Artwork Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditArtworkFile(e.target.files?.[0] || null)}
                  className="form-input"
                  style={{ padding: '8px' }}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-deep)',
                borderRadius: '10px',
                marginBottom: '24px',
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Public Visibility</span>
                <button
                  type="button"
                  onClick={() => setEditIsPublished(!editIsPublished)}
                  className={editIsPublished ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  {editIsPublished ? 'Published' : 'Draft / Private'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="btn-secondary"
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? <span className="spinner" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistStudio;
