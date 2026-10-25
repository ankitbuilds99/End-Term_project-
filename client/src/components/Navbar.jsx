import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <header style={{
      height: 'var(--navbar-height)',
      backgroundColor: 'rgba(8, 9, 11, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
    }}>
      {/* Navigation history controls & Search - Sharp Rectangular Form */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '0px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            title="Go back"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => navigate(1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '0px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            title="Go forward"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Global Search Bar - Sharp Rectangular */}
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
            backgroundColor: 'var(--bg-deep)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0px',
            padding: '8px 14px',
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
              borderRadius: '0px',
            }}
            onFocus={(e) => {
              if (location.pathname !== '/catalogue') {
                navigate('/catalogue');
              }
            }}
          />
        </form>
      </div>

      {/* Auth Actions / User Badge - Sharp Rectangular */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {user ? (
          <Link
            to="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 12px 4px 6px',
              borderRadius: '0px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '0px',
              backgroundColor: 'var(--accent-primary)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0px' }} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
              {user.name.split(' ')[0]}
            </span>
            <span className={`badge-role ${user.role}`} style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: '0px' }}>
              {user.role}
            </span>
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/register" style={{
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: '0px',
              transition: 'color 0.15s',
            }}>
              Sign Up
            </Link>
            <Link to="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem', borderRadius: '0px' }}>
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
