import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileSpreadsheet, Award, FileCheck2, ExternalLink } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Academic Results', path: '/admin/results', icon: FileSpreadsheet },
    { name: 'Issue Certificate', path: '/admin/issue-certificate', icon: Award },
    { name: 'Issued Certificates', path: '/admin/certificates', icon: FileCheck2 },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      backgroundColor: '#0f172a',
      color: '#cbd5e1',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: 'calc(100vh - 65px)',
      borderRight: '1px solid #1e293b'
    }}>
      <div style={{ padding: '1.5rem 1.25rem 0.5rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
        Administration
      </div>

      <nav style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#1e3a8a' : 'transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid #1e293b' }}>
        <a
          href="/verify"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: 'rgba(30, 58, 138, 0.4)',
            borderRadius: '8px',
            color: '#60a5fa',
            fontSize: '0.825rem',
            fontWeight: 500
          }}
        >
          <span>Public Portal</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
