import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { verifyApi } from '../services/api';
import Navbar from '../components/Navbar';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Cpu,
  Hash,
  Award,
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const PublicVerifyPage = () => {
  const { verificationId: paramVerificationId } = useParams();
  const [verificationId, setVerificationId] = useState(paramVerificationId || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleVerify = async (idToVerify) => {
    const id = idToVerify || verificationId;
    if (!id || !id.trim()) {
      setError('Please enter a valid Verification ID (e.g. VER-2027-XXXXXXXX)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await verifyApi.verify(id.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification service error or network failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramVerificationId) {
      setVerificationId(paramVerificationId);
      handleVerify(paramVerificationId);
    }
  }, [paramVerificationId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verificationId.trim()) {
      navigate(`/verify/${verificationId.trim()}`, { replace: false });
      handleVerify(verificationId.trim());
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2.5rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {/* Header Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={34} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
            Verify Academic Certificate
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Scan the QR code on your certificate or enter the Verification ID below to cryptographically
            recalculate the SHA-256 hash and verify its integrity against the blockchain.
          </p>
        </div>

        {/* Verification Form Card */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: '42px', fontSize: '0.95rem', height: '48px' }}
                placeholder="Enter Verification ID (e.g. VER-2027-E4988F9A)"
                value={verificationId}
                onChange={(e) => setVerificationId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ height: '48px', padding: '0 1.75rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </form>

          {error && (
            <div className="alert alert-danger" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <div>{error}</div>
            </div>
          )}
        </div>

        {/* Verification Result Display */}
        {result && (
          <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
            {result.valid ? (
              /* VALID CERTIFICATE CARD */
              <div className="card" style={{
                border: '2px solid #059669',
                background: '#ffffff',
                boxShadow: '0 20px 25px -5px rgba(5, 150, 105, 0.1)',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: 'white',
                    color: '#059669',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>✓ CERTIFICATE VERIFIED & AUTHENTIC</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                      {result.message}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '2rem' }}>
                  {/* Verified Student Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Student Name</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{result.studentName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Student Roll ID</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>{result.studentId}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Degree & Branch</div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>{result.course} ({result.branch})</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Evaluation</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>
                        CGPA: {result.cgpa} ({result.resultStatus})
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Comparison Section */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                    Cryptographic Integrity Verification
                  </h3>

                  <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                        <span>RECALCULATED SHA-256 HASH (FROM DB DATA):</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ MATCH</span>
                      </div>
                      <div style={{ background: '#0f172a', color: '#38bdf8', padding: '0.625rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                        {result.generatedHash}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                        <span>IMMUTABLE BLOCKCHAIN HASH (FROM SMART CONTRACT):</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ MATCH</span>
                      </div>
                      <div style={{ background: '#0f172a', color: '#4ade80', padding: '0.625rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                        {result.blockchainHash}
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Details */}
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
                    <div>
                      <strong>Verification ID:</strong> <span style={{ fontFamily: 'monospace', color: '#1e3a8a' }}>{result.verificationId}</span>
                    </div>
                    <div>
                      <strong>Block Number:</strong> #{result.blockNumber || 'EVM'}
                    </div>
                    {result.transactionHash && (
                      <div style={{ wordBreak: 'break-all' }}>
                        <strong>Tx:</strong> <code style={{ color: '#059669' }}>{result.transactionHash}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* INVALID / TAMPERED CERTIFICATE CARD */
              <div className="card" style={{
                border: '2px solid #dc2626',
                background: '#ffffff',
                boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.1)',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: 'white',
                    color: '#dc2626',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <XCircle size={32} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>✗ VERIFICATION FAILED / TAMPERED</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                      {result.message}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '2rem' }}>
                  <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                    <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>TAMPERING DETECTED:</strong>
                      <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                        The academic record data (e.g. CGPA, student name, or grade) stored in the database has been modified
                        after certificate issuance. The recalculated SHA-256 fingerprint does NOT match the immutable record stored on the blockchain!
                      </p>
                    </div>
                  </div>

                  {result.generatedHash && result.blockchainHash && (
                    <div style={{ background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', padding: '1.25rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem' }}>
                          RECALCULATED SHA-256 HASH (FROM ALTERED DATABASE):
                        </div>
                        <div style={{ background: '#0f172a', color: '#f87171', padding: '0.625rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                          {result.generatedHash}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                          IMMUTABLE BLOCKCHAIN HASH (PERMANENT SMART CONTRACT RECORD):
                        </div>
                        <div style={{ background: '#0f172a', color: '#4ade80', padding: '0.625rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                          {result.blockchainHash}
                        </div>
                      </div>

                      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700 }}>
                        ≠ HASH MISMATCH: PROOF OF DATA ALTERATION
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicVerifyPage;
