import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { certificateApi } from '../services/api';
import { Award, Eye, ShieldCheck, Bug, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CertificatesListPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tamperMessage, setTamperMessage] = useState('');

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await certificateApi.getAll();
      setCertificates(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch certificates directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleTamperDemo = async (cert) => {
    const confirmTamper = window.confirm(
      `TAMPER DEMONSTRATION:\n\nThis will deliberately alter the student's CGPA in PostgreSQL from ${cert.cgpa} to 9.9.\nThe blockchain smart contract will NOT be modified.\n\nWhen verified, the recalculated hash will mismatch the immutable blockchain hash, proving tamper detection!\n\nProceed?`
    );
    if (!confirmTamper) return;

    try {
      const res = await certificateApi.tamperDemo(cert.id, 9.9);
      setTamperMessage(
        `Database tampered for Certificate ${cert.certificateId}! CGPA in PostgreSQL altered from ${cert.cgpa} to 9.9. Now verify it to see tamper detection in action!`
      );
      fetchCertificates();
    } catch (err) {
      setError('Failed to execute tamper demonstration');
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Issued Academic Certificates</h1>
          <p className="page-subtitle">Directory of certificates cryptographically anchored to the blockchain</p>
        </div>
        <Link to="/admin/issue-certificate" className="btn btn-primary">
          <Award size={16} />
          <span>Issue New Certificate</span>
        </Link>
      </div>

      {tamperMessage && (
        <div className="alert alert-danger" style={{ border: '2px solid #ef4444' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>LIVE RESEARCH TAMPER DEMONSTRATION ACTIVE:</strong>
            <div style={{ marginTop: '0.25rem' }}>{tamperMessage}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <div>{error}</div>
        </div>
      )}

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Certificate ID</th>
              <th>Verification ID</th>
              <th>Student Roll & Name</th>
              <th>Course / Year</th>
              <th>CGPA</th>
              <th>Block #</th>
              <th>Issued At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Loading certificates...
                </td>
              </tr>
            ) : certificates.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No certificates issued yet. Go to "Issue Certificate" to anchor your first credential.
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>
                      {cert.certificateId}
                    </span>
                  </td>
                  <td>
                    <code style={{ background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', color: '#1d4ed8' }}>
                      {cert.verificationId}
                    </code>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{cert.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{cert.studentId}</div>
                  </td>
                  <td>{cert.course} ({cert.academicYear})</td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{cert.cgpa?.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="badge badge-info">#{cert.blockNumber || 'EVM'}</span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(cert.issuedAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Link
                        to={`/admin/certificates/${cert.id}`}
                        className="btn btn-secondary btn-sm"
                        title="View & Print Official Certificate"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </Link>

                      <a
                        href={`/verify/${cert.verificationId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        title="Verify Certificate"
                      >
                        <ShieldCheck size={14} color="#059669" />
                      </a>

                      <button
                        onClick={() => handleTamperDemo(cert)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#d97706', borderColor: '#fef3c7', background: '#fffbeb' }}
                        title="Demonstrate Database Tampering"
                      >
                        <Bug size={14} />
                        <span>Tamper Demo</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificatesListPage;
