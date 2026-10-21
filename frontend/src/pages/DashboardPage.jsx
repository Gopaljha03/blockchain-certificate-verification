import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { Users, FileSpreadsheet, Award, Cpu, CheckCircle2, XCircle, ArrowUpRight, ShieldCheck, RefreshCw } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStats();
      setStats(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="page-body">
      {/* Title & Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Administrator Dashboard</h1>
          <p className="page-subtitle">System status, academic records summary, and blockchain network health</p>
        </div>
        <button onClick={fetchStats} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Students */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Enrolled Students
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              {loading ? '...' : (stats?.totalStudents ?? 0)}
            </div>
            <Link to="/admin/students" style={{ fontSize: '0.775rem', color: '#2563eb', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              Manage students <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        {/* Total Results */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileSpreadsheet size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Academic Results
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              {loading ? '...' : (stats?.totalResults ?? 0)}
            </div>
            <Link to="/admin/results" style={{ fontSize: '0.775rem', color: '#d97706', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              View results <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        {/* Total Certificates */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Issued Certificates
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              {loading ? '...' : (stats?.totalCertificates ?? 0)}
            </div>
            <Link to="/admin/certificates" style={{ fontSize: '0.775rem', color: '#059669', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              View certificates <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        {/* Blockchain Status */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            backgroundColor: stats?.blockchainConnected ? '#ecfdf5' : '#fef2f2',
            color: stats?.blockchainConnected ? '#059669' : '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Blockchain Node
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              {stats?.blockchainConnected ? (
                <span className="badge badge-success">
                  <CheckCircle2 size={12} /> Connected
                </span>
              ) : (
                <span className="badge badge-danger">
                  <XCircle size={12} /> Disconnected
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Block #{stats?.latestBlockNumber ?? 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Details & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Blockchain Network Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={20} color="#1e3a8a" />
              <span>Smart Contract & Node Configuration</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>NETWORK RPC URL</span>
              <code style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#0f172a' }}>
                {stats?.rpcUrl || 'http://127.0.0.1:8545'}
              </code>
            </div>

            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>SMART CONTRACT ADDRESS</span>
              <code style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#1e3a8a', wordBreak: 'break-all' }}>
                {stats?.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
              </code>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>ENVIRONMENT</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>Local Hardhat EVM Node</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>INTEGRITY STANDARD</span>
                <span style={{ fontWeight: 600, color: '#1e3a8a' }}>SHA-256 Digest Mapping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Administrative Actions</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <Link to="/admin/students" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
              <Users size={20} color="#2563eb" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>Add Student</div>
                <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Register student profile</div>
              </div>
            </Link>

            <Link to="/admin/results" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
              <FileSpreadsheet size={20} color="#d97706" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>Add Result</div>
                <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Post semester CGPA</div>
              </div>
            </Link>

            <Link to="/admin/issue-certificate" className="btn btn-primary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
              <Award size={20} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: 'white' }}>Issue Certificate</div>
                <div style={{ fontSize: '0.725rem', color: '#bfdbfe' }}>Anchor to Blockchain</div>
              </div>
            </Link>

            <Link to="/verify" target="_blank" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
              <ShieldCheck size={20} color="#059669" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>Public Verify</div>
                <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Scan QR / ID check</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
