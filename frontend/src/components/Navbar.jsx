import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, LogIn, Award } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.875rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e3a8a' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(30, 58, 138, 0.3)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.025em', color: '#0f172a' }}>
              CertVerify <span style={{ color: '#2563eb', fontWeight: 500 }}>Blockchain</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 500 }}>
              Academic Integrity & Verification Portal
            </div>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/verify" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} color="#059669" />
          <span>Verify Certificate</span>
        </Link>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#eff6ff',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid #bfdbfe'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e40af' }}>
                {user?.username} ({user?.role})
              </span>
            </div>
            <button onClick={logout} className="btn btn-secondary btn-sm" title="Log Out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            <LogIn size={16} />
            <span>Admin Login</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
