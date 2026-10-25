import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Compass, 
  User, 
  Sparkles, 
  LogOut, 
  Music2, 
  Heart,
  ListMusic,
  History
} from 'lucide-react';
import { resolveMediaUrl } from '../services/api';

const Sidebar = () => {
  const { user, isArtist, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '0px',
    fontSize: '0.90rem',
    fontWeight: 600,
    color: isActive ? '#fff' : 'var(--text-muted)',
    backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
    transition: 'all 0.15s ease',
  });

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
      {/* Brand Header with Uploaded Custom Logo */}
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 4px', marginBottom: '32px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '0px',
          background: '#000',
          border: '1px solid var(--accent-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <img src="/logo.png" alt="SunteRaho Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        </div>
        <div>
          <span style={{ fontSize: '1.20rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            Sunte<span style={{ color: 'var(--accent-primary)' }}>Raho</span>
          </span>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Music Streaming
          </p>
        </div>
      </NavLink>

      {/* Primary Navigation Menu - Sharp Grid Aesthetic */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', fontWeight: 800, padding: '8px 14px 4px 14px' }}>
          Menu
        </p>

        <NavLink to="/" style={navLinkStyle}>
          {({ isActive }) => (
            <>
              <Home size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Home</span>
            </>
          )}
        </NavLink>

        <NavLink to="/catalogue" style={navLinkStyle}>
          {({ isActive }) => (
            <>
              <Music2 size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Music Catalogue</span>
            </>
          )}
        </NavLink>

        <NavLink to="/artists" style={navLinkStyle}>
          {({ isActive }) => (
            <>
              <Compass size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Explore Artists</span>
            </>
          )}
        </NavLink>

        <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', fontWeight: 800, padding: '16px 14px 4px 14px' }}>
          Library
        </p>

        <NavLink to="/liked" style={navLinkStyle}>
          {({ isActive }) => (
            <>
              <Heart size={18} color={isActive ? '#ff3366' : 'currentColor'} fill={isActive ? '#ff3366' : 'none'} />
              <span>Liked Songs</span>
            </>
          )}
        </NavLink>

        <NavLink to="/playlists" style={navLinkStyle}>
          {({ isActive }) => (
            <>
              <ListMusic size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Playlists</span>
            </>
          )}
        </NavLink>

        {user && (
          <NavLink to="/history" style={navLinkStyle}>
            {({ isActive }) => (
              <>
                <History size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                <span>Listening History</span>
              </>
            )}
          </NavLink>
        )}

        {user && (
          <>
            <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', fontWeight: 800, padding: '16px 14px 4px 14px' }}>
              My Account
            </p>

            {isArtist && (
              <NavLink
                to="/studio"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '0px',
                  fontSize: '0.90rem',
                  fontWeight: 600,
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'rgba(255, 65, 108, 0.12)' : 'transparent',
                  borderLeft: isActive ? '3px solid #ff416c' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Sparkles size={18} color={isActive ? '#ff6b81' : '#ff4757'} />
                    <span style={{ color: isActive ? '#ff6b81' : 'var(--text-main)' }}>Artist Studio</span>
                  </>
                )}
              </NavLink>
            )}

            <NavLink to="/profile" style={navLinkStyle}>
              {({ isActive }) => (
                <>
                  <User size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                  <span>Profile & Settings</span>
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* User Section at bottom - Sharp Rectangular Card */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        {user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '0px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '0px',
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
                  <img src={resolveMediaUrl(user.avatar)} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0px' }} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </p>
                <span className={`badge-role ${user.role}`} style={{ fontSize: '0.60rem', padding: '1px 5px', marginTop: '2px', borderRadius: '0px' }}>
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
                borderRadius: '0px',
                transition: 'color 0.15s, background 0.15s',
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
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{
            padding: '14px',
            borderRadius: '0px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}>
            <p style={{ fontSize: '0.80rem', fontWeight: 700, color: '#fff', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Full Experience
            </p>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
              Sign in to stream tracks, create playlists, and follow artists.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <NavLink to="/login" className="btn-secondary" style={{ flex: 1, padding: '7px 10px', fontSize: '0.80rem', textAlign: 'center', borderRadius: '0px' }}>
                Log In
              </NavLink>
              <NavLink to="/register" className="btn-primary" style={{ flex: 1, padding: '7px 10px', fontSize: '0.80rem', textAlign: 'center', borderRadius: '0px' }}>
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
