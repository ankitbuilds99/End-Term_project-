import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Search, ShieldCheck, UserCheck } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <header style={{
      height: 'var(--navbar-height)',
      backgroundColor: 'rgba(11, 12, 16, 0.75)',
      backdropFilter: 'var(--blur-standard)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
    }}>
      {/* Navigation history controls & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              transition: 'background 0.2s',
            }}
            title="Go back"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => navigate(1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              transition: 'background 0.2s',
            }}
            title="Go forward"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.currentTarget.search.value;
            navigate(`/catalogue${q ? `?search=${encodeURIComponent(q)}` : ''}`);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '9999px',
            padding: '8px 16px',
            width: '320px',
          }}
        >
          <Search size={16} color="var(--text-dim)" />
          <input
            name="search"
            type="text"
            placeholder="Search tracks, artists, or genres..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              width: '100%',
            }}
            onFocus={(e) => {
              if (location.pathname !== '/catalogue') {
                navigate('/catalogue');
              }
            }}
          />
        </form>
      </div>

      {/* Auth Actions / User Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {user ? (
          <Link
            to="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 14px 4px 6px',
              borderRadius: '9999px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#fff' }}>
              {user.name.split(' ')[0]}
            </span>
            <span className={`badge-role ${user.role}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
              {user.role}
            </span>
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/register" style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: 700,
              padding: '8px 16px',
              transition: 'color 0.2s',
            }}>
              Sign Up
            </Link>
            <Link to="/login" className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
