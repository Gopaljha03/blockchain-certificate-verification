import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateApi } from '../services/api';
import CertificateTemplate from '../components/CertificateTemplate';
import { Printer, ShieldCheck, ArrowLeft, Bug, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CertificateDetailPage = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tamperSuccess, setTamperSuccess] = useState('');

  const fetchCertificate = async () => {
    setLoading(true);
    try {
      const res = await certificateApi.getById(id);
      setCertificate(res.data);
      setError('');
    } catch (err) {
      setError('Certificate not found or failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleTamperDemo = async () => {
    if (!window.confirm('Simulate Tampering: This will modify the CGPA in PostgreSQL database without updating the blockchain. When verified, it will fail hash matching.')) {
      return;
    }
    try {
      await certificateApi.tamperDemo(id, 9.99);
      setTamperSuccess('Database record modified! Now click "Verify On Public Portal" to see TAMPER DETECTION in action.');
      fetchCertificate();
    } catch (err) {
      setError('Tamper demo execution failed');
    }
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Loading certificate view...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="page-body">
        <div className="alert alert-danger">{error || 'Certificate not found'}</div>
        <Link to="/admin/certificates" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to certificates
        </Link>
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Top Action Bar (hidden during printing) */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        background: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/certificates" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{certificate.certificateId}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Verification ID: {certificate.verificationId}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>

          <a
            href={`/verify/${certificate.verificationId}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <ShieldCheck size={16} color="#059669" />
            <span>Verify Live</span>
          </a>

          <button
            onClick={handleTamperDemo}
            className="btn btn-warning btn-sm"
            title="Demonstrate blockchain tamper detection by editing DB record"
          >
            <Bug size={16} />
            <span>Simulate DB Tamper (Demo)</span>
          </button>
        </div>
      </div>

      {tamperSuccess && (
        <div className="alert alert-danger no-print" style={{ border: '2px solid #ef4444', marginBottom: '2rem' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>DATABASE TAMPERING SIMULATION ACTIVATED:</strong>
            <p style={{ marginTop: '0.25rem' }}>{tamperSuccess}</p>
          </div>
        </div>
      )}

      {/* Official Certificate Canvas */}
      <div style={{ margin: '0 auto', maxWidth: '960px' }}>
        <CertificateTemplate certificate={certificate} institutionName="ABC UNIVERSITY" />
      </div>
    </div>
  );
};

export default CertificateDetailPage;
