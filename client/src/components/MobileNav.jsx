import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Compass, Heart, ListMusic, Sparkles, User } from 'lucide-react';

const MobileNav = () => {
  const { user, isArtist } = useAuth();

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
    fontSize: '0.7rem',
    fontWeight: isActive ? 700 : 500,
    textDecoration: 'none',
    flex: 1,
    padding: '8px 0',
    transition: 'color 0.15s ease',
  });

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'rgba(18, 19, 24, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'none', // Controlled via @media in index.css
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 150,
        padding: '0 8px',
      }}
    >
      <NavLink to="/" style={navItemStyle}>
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/catalogue" style={navItemStyle}>
        <Compass size={20} />
        <span>Discover</span>
      </NavLink>

      <NavLink to="/liked" style={navItemStyle}>
        <Heart size={20} />
        <span>Liked</span>
      </NavLink>

      <NavLink to="/playlists" style={navItemStyle}>
        <ListMusic size={20} />
        <span>Playlists</span>
      </NavLink>

      {isArtist ? (
        <NavLink to="/studio" style={navItemStyle}>
          <Sparkles size={20} color="#ff416c" />
          <span style={{ color: '#ff416c' }}>Studio</span>
        </NavLink>
      ) : (
        <NavLink to={user ? '/profile' : '/login'} style={navItemStyle}>
          <User size={20} />
          <span>{user ? 'Profile' : 'Log In'}</span>
        </NavLink>
      )}
    </nav>
  );
};

export default MobileNav;
