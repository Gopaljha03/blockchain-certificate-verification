import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const CertificateTemplate = ({ certificate, institutionName = "ABC UNIVERSITY" }) => {
  if (!certificate) return null;

  const verifyUrl = certificate.verificationUrl || `http://localhost:5173/verify/${certificate.verificationId}`;

  return (
    <div className="printable-certificate certificate-frame">
      {/* Top Academic Header */}
      <div className="certificate-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a8a, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <ShieldCheck size={20} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.2em', color: '#b45309' }}>
            BLOCKCHAIN-ANCHORED CREDENTIAL
          </span>
        </div>

        <h1 className="inst-name">{institutionName}</h1>
        <div className="inst-subtitle">Department of Academic Records & Examinations</div>
        <div className="cert-title">Academic Degree Certificate</div>
      </div>

      {/* Main Presentation */}
      <div className="cert-presentation">
        This is to officially certify that
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 className="student-name-cert">{certificate.studentName}</h2>
      </div>

      <p className="cert-body-text">
        bearing Student Identification Number <strong>{certificate.studentId}</strong> has successfully completed the prescribed
        curriculum in <strong>{certificate.course} ({certificate.branch})</strong> for the academic year <strong>{certificate.academicYear}</strong>,
        securing a Cumulative Grade Point Average (CGPA) of <strong>{certificate.cgpa}</strong> with classification
        <span style={{ fontWeight: 700, color: '#059669', marginLeft: '6px' }}>{certificate.resultStatus}</span>.
      </p>

      {/* Cryptographic & Blockchain Integrity Banner */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.875rem 1.25rem',
        margin: '1.5rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>CRYPTOGRAPHICALLY SEALED ON BLOCKCHAIN</span>
        </div>
        <div style={{ fontFamily: 'monospace', color: '#475569' }}>
          Verification ID: <strong>{certificate.verificationId}</strong>
        </div>
      </div>

      {/* Hash Fingerprint Display */}
      <div style={{
        background: '#f1f5f9',
        borderRadius: '6px',
        padding: '0.5rem 0.875rem',
        fontSize: '0.675rem',
        fontFamily: 'monospace',
        wordBreak: 'break-all',
        color: '#475569',
        marginBottom: '1rem',
        borderLeft: '3px solid #1e3a8a'
      }}>
        <span style={{ fontWeight: 700, color: '#1e3a8a' }}>SHA-256 HASH: </span>
        {certificate.certificateHash}
      </div>

      {/* Footer / QR / Signatures / Seal */}
      <div className="cert-footer">
        {/* Left: QR Code & Verification Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'white',
            padding: '8px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            display: 'inline-block'
          }}>
            <QRCodeSVG
              value={verifyUrl}
              size={95}
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="cert-meta-info">
            <div><strong>Scan to Verify</strong></div>
            <div>Cert ID: {certificate.certificateId}</div>
            <div>Issued: {new Date(certificate.issuedAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            {certificate.blockNumber && <div>Block: #{certificate.blockNumber}</div>}
          </div>
        </div>

        {/* Center: Institutional Gold Seal */}
        <div className="cert-seal">
          <ShieldCheck size={24} style={{ marginBottom: '2px' }} />
          <span>OFFICIAL</span>
          <span>SEAL</span>
        </div>

        {/* Right: Academic Authority Signature */}
        <div style={{ textAlign: 'center', minWidth: '160px' }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontSize: '1.25rem',
            color: '#1e3a8a',
            borderBottom: '1.5px solid #64748b',
            paddingBottom: '0.25rem',
            marginBottom: '0.25rem'
          }}>
            Academic Registrar
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
