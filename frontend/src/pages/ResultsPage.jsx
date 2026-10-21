import React, { useState, useEffect } from 'react';
import { resultApi, studentApi } from '../services/api';
import { FileSpreadsheet, Plus, AlertCircle, CheckCircle2, X } from 'lucide-react';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Result Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    semester: 8,
    cgpa: 8.7,
    resultStatus: 'PASS',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResults, resStudents] = await Promise.all([
        resultApi.getAll(),
        studentApi.getAll(),
      ]);
      setResults(resResults.data);
      setStudents(resStudents.data);
      if (resStudents.data.length > 0 && !formData.studentId) {
        setFormData((prev) => ({ ...prev, studentId: resStudents.data[0].id }));
      }
      setError('');
    } catch (err) {
      setError('Failed to load academic results or students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setFormData({
      studentId: students.length > 0 ? students[0].id : '',
      semester: 8,
      cgpa: 8.7,
      resultStatus: 'PASS',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await resultApi.create({
        studentId: Number(formData.studentId),
        semester: Number(formData.semester),
        cgpa: parseFloat(formData.cgpa),
        resultStatus: formData.resultStatus,
      });
      setSuccess('Academic result successfully recorded!');
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record result. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Academic Results Management</h1>
          <p className="page-subtitle">Record and view semester grades, CGPA evaluations, and passing status</p>
        </div>
        <button onClick={openModal} className="btn btn-primary" disabled={students.length === 0}>
          <Plus size={16} />
          <span>Add Academic Result</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <div>{success}</div>
        </div>
      )}

      {students.length === 0 && !loading && (
        <div className="alert alert-info">
          No students are currently registered. Please register a student first before recording results.
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Result ID</th>
              <th>Student Roll No</th>
              <th>Student Name</th>
              <th>Semester</th>
              <th>CGPA</th>
              <th>Result Status</th>
              <th>Recorded At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Loading academic results...
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No academic results recorded yet. Click "Add Academic Result" to post semester grades.
                </td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', color: '#64748b' }}>#{r.id}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>
                      {r.studentRollNo}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{r.studentName}</td>
                  <td>Semester {r.semester}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: r.cgpa >= 7.5 ? '#059669' : r.cgpa >= 5.0 ? '#d97706' : '#dc2626'
                    }}>
                      {r.cgpa?.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.resultStatus === 'PASS' ? 'badge-success' : 'badge-danger'}`}>
                      {r.resultStatus}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Post Semester Academic Result
              </h2>
              <button onClick={closeModal} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Select Student *</label>
                <select
                  required
                  className="form-select"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studentId} — {s.name} ({s.course})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Semester *</label>
                  <select
                    className="form-select"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">CGPA (0.0 - 10.0) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    className="form-input"
                    placeholder="8.7"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Result Status *</label>
                <select
                  className="form-select"
                  value={formData.resultStatus}
                  onChange={(e) => setFormData({ ...formData, resultStatus: e.target.value })}
                >
                  <option value="PASS">PASS</option>
                  <option value="FAIL">FAIL</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Posting...' : 'Record Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
