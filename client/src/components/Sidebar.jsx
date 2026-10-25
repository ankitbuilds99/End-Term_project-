import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Compass, 
  User, 
  Sparkles, 
  LogOut, 
  Radio, 
  Music2, 
  Disc3,
  Heart,
  ListMusic,
  History
} from 'lucide-react';

const Sidebar = () => {
  const { user, isArtist, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className="app-sidebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-deep)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 100,
      }}
    >
      {/* Brand Header */}
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '32px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px var(--accent-glow)'
        }}>
          <Radio size={22} color="#000" strokeWidth={2.5} />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            Sunte<span style={{ color: 'var(--accent-primary)' }}>Raho</span>
          </span>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Music Streaming
          </p>
        </div>
      </NavLink>

      {/* Primary Navigation Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 700, padding: '8px 12px 4px 12px' }}>
          Menu
        </p>

        <NavLink
          to="/"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.94rem',
            fontWeight: 600,
            color: isActive ? '#fff' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
            transition: 'all 0.2s ease',
          })}
        >
          {({ isActive }) => (
            <>
              <Home size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Home</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/catalogue"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.94rem',
            fontWeight: 600,
            color: isActive ? '#fff' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
            transition: 'all 0.2s ease',
          })}
        >
          {({ isActive }) => (
            <>
              <Music2 size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Music Catalogue</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/artists"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.94rem',
            fontWeight: 600,
            color: isActive ? '#fff' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
            transition: 'all 0.2s ease',
          })}
        >
          {({ isActive }) => (
            <>
              <Compass size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Explore Artists</span>
            </>
          )}
        </NavLink>

        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 700, padding: '16px 12px 4px 12px' }}>
          Library
        </p>

        <NavLink
          to="/liked"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.94rem',
            fontWeight: 600,
            color: isActive ? '#fff' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
            transition: 'all 0.2s ease',
          })}
        >
          {({ isActive }) => (
            <>
              <Heart size={20} color={isActive ? '#ff3366' : 'currentColor'} fill={isActive ? '#ff3366' : 'none'} />
              <span>Liked Songs</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/playlists"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '0.94rem',
            fontWeight: 600,
            color: isActive ? '#fff' : 'var(--text-muted)',
            backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
            transition: 'all 0.2s ease',
          })}
        >
          {({ isActive }) => (
            <>
              <ListMusic size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Playlists</span>
            </>
          )}
        </NavLink>

        {user && (
          <NavLink
            to="/history"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '0.94rem',
              fontWeight: 600,
              color: isActive ? '#fff' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
          >
            {({ isActive }) => (
              <>
                <History size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                <span>Listening History</span>
              </>
            )}
          </NavLink>
        )}

        {user && (
          <>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 700, padding: '16px 12px 4px 12px' }}>
              My Account
            </p>

            {isArtist && (
              <NavLink
                to="/studio"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'rgba(255, 65, 108, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 65, 108, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Sparkles size={20} color={isActive ? '#ff6b81' : '#ff4757'} />
                    <span style={{ color: isActive ? '#ff6b81' : 'var(--text-main)' }}>Artist Studio</span>
                  </>
                )}
              </NavLink>
            )}

            <NavLink
              to="/profile"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.94rem',
                fontWeight: 600,
                color: isActive ? '#fff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                transition: 'all 0.2s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <User size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                  <span>Profile & Settings</span>
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* User Section at bottom */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        {user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                flexShrink: 0
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </p>
                <span className={`badge-role ${user.role}`} style={{ fontSize: '0.62rem', padding: '2px 6px', marginTop: '2px' }}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                color: 'var(--text-dim)',
                padding: '6px',
                borderRadius: '8px',
                transition: 'color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--error-text)';
                e.currentTarget.style.backgroundColor = 'var(--error-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Enjoy Full Experience
            </p>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Sign in to stream tracks, create playlists, and follow artists.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <NavLink to="/login" className="btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', textAlign: 'center' }}>
                Log In
              </NavLink>
              <NavLink to="/register" className="btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', textAlign: 'center' }}>
                Sign Up
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
