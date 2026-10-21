import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentApi, resultApi, certificateApi } from '../services/api';
import { Award, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const IssueCertificatePage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState('');
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState('');
  const [issuedCert, setIssuedCert] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await studentApi.getAll();
        setStudents(res.data);
        if (res.data.length > 0) {
          setSelectedStudentId(res.data[0].id);
        }
      } catch (err) {
        setError('Failed to fetch students list');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      setStudentResults([]);
      setSelectedResultId('');
      return;
    }
    const fetchResults = async () => {
      try {
        const res = await resultApi.getByStudent(selectedStudentId);
        setStudentResults(res.data);
        if (res.data.length > 0) {
          setSelectedResultId(res.data[0].id);
        } else {
          setSelectedResultId('');
        }
      } catch (err) {
        setStudentResults([]);
        setSelectedResultId('');
      }
    };
    fetchResults();
  }, [selectedStudentId]);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedResultId) {
      setError('Please select both a student and an academic result');
      return;
    }

    setIssuing(true);
    setError('');
    setIssuedCert(null);

    try {
      const res = await certificateApi.issue({
        studentId: Number(selectedStudentId),
        resultId: Number(selectedResultId),
      });
      setIssuedCert(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate issuance failed on blockchain or database');
    } finally {
      setIssuing(false);
    }
  };

  const currentStudent = students.find((s) => s.id === Number(selectedStudentId));
  const currentResult = studentResults.find((r) => r.id === Number(selectedResultId));

  // Canonical string preview:
  const canonicalPreview = currentStudent && currentResult
    ? `${currentStudent.studentId}|${currentStudent.name}|${currentStudent.course}|${currentStudent.branch}|${currentStudent.academicYear}|${currentResult.semester}|${currentResult.cgpa}|${currentResult.resultStatus}`
    : 'Select student and result to preview canonical structure';

  return (
    <div className="page-body">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Issue Academic Certificate</h1>
        <p className="page-subtitle">
          Construct canonical certificate data, generate SHA-256 integrity hash, and anchor directly to Solidity smart contract
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Success View */}
      {issuedCert ? (
        <div className="card" style={{ border: '2px solid #059669', background: '#f0fdf4', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#059669', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={32} />
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Certificate Successfully Issued & Anchored!</h2>
              <p style={{ color: '#065f46', fontSize: '0.875rem' }}>
                Cryptographic SHA-256 fingerprint has been committed to the local blockchain smart contract.
              </p>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #bbf7d0',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{issuedCert.studentName} ({issuedCert.studentId})</div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>{issuedCert.course} - {issuedCert.branch}</div>

              <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Certificate Identifiers</div>
              <div style={{ fontSize: '0.875rem' }}><strong>Certificate ID:</strong> {issuedCert.certificateId}</div>
              <div style={{ fontSize: '0.875rem' }}><strong>Verification ID:</strong> <span style={{ color: '#1e3a8a', fontWeight: 700 }}>{issuedCert.verificationId}</span></div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Blockchain Settlement</div>
              <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                <strong>Block Number:</strong> #{issuedCert.blockNumber || 'Pending'}
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                <strong>Tx Hash:</strong> <code style={{ color: '#059669' }}>{issuedCert.transactionHash}</code>
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', wordBreak: 'break-all' }}>
                <strong>SHA-256 Fingerprint:</strong> <code style={{ color: '#1e3a8a' }}>{issuedCert.certificateHash}</code>
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'white', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'inline-block' }}>
                <QRCodeSVG value={issuedCert.verificationUrl} size={110} level="H" />
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 600 }}>
                Verification QR Code
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={`/admin/certificates/${issuedCert.id}`} className="btn btn-primary">
              <Printer size={16} />
              <span>View & Print Official Certificate</span>
            </Link>

            <a
              href={`/verify/${issuedCert.verificationId}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              <ShieldCheck size={16} color="#059669" />
              <span>Verify on Public Portal</span>
              <ExternalLink size={14} />
            </a>

            <button
              onClick={() => { setIssuedCert(null); }}
              className="btn btn-secondary"
            >
              Issue Another Certificate
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Issue Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#1e3a8a" />
              <span>Select Candidate & Result</span>
            </h2>
          </div>

          {students.length === 0 && !loading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
              No students enrolled yet. Please register a student first.
            </div>
          ) : (
            <form onSubmit={handleIssue}>
              <div className="form-group">
                <label className="form-label">1. Select Enrolled Student *</label>
                <select
                  className="form-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studentId} — {s.name} ({s.course} {s.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">2. Select Academic Result / Semester *</label>
                {studentResults.length === 0 ? (
                  <div style={{
                    padding: '0.75rem',
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#92400e'
                  }}>
                    This student does not have any recorded semester results yet. Please add a result in the Academic Results tab first.
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={selectedResultId}
                    onChange={(e) => setSelectedResultId(e.target.value)}
                  >
                    {studentResults.map((r) => (
                      <option key={r.id} value={r.id}>
                        Semester {r.semester} — CGPA: {r.cgpa?.toFixed(2)} ({r.resultStatus})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Research Canonical Pipeline Explanation */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1.5rem 0'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Canonical Certificate String (Data for Hashing)
                </div>
                <div style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  wordBreak: 'break-all'
                }}>
                  {canonicalPreview}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Order: <code>studentId|name|course|branch|academicYear|semester|cgpa|resultStatus</code>
                </div>
              </div>

              <button
                type="submit"
                disabled={issuing || !selectedResultId}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.875rem' }}
              >
                {issuing ? (
                  <>
                    <span className="spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
                    <span>Broadcasting to Smart Contract...</span>
                  </>
                ) : (
                  <>
                    <Award size={18} />
                    <span>Generate Hash & Issue Certificate</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Workflow Diagram Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Cryptographic Pipeline</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                1
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Canonical String Assembly</div>
                <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Deterministic field ordering prevents formatting discrepancies.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                2
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>SHA-256 Digest Computation</div>
                <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Produces fixed 64-character hexadecimal cryptographic fingerprint.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                3
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Hardhat Smart Contract Storage</div>
                <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Writes verificationId and hash to EVM storage. Prevents overwriting.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                4
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>QR Code & Verification URL</div>
                <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Generates public verification QR containing permanent URL.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCertificatePage;
