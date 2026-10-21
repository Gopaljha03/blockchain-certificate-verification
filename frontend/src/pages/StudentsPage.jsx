import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import { Users, Plus, Edit2, Trash2, Search, AlertCircle, CheckCircle2, X } from 'lucide-react';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    academicYear: 2027,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getAll();
      setStudents(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      studentId: '',
      name: '',
      email: '',
      course: 'B.Tech',
      branch: 'Computer Science & Engineering',
      academicYear: 2027,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      course: student.course,
      branch: student.branch,
      academicYear: student.academicYear,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingStudent) {
        await studentApi.update(editingStudent.id, {
          name: formData.name,
          email: formData.email,
          course: formData.course,
          branch: formData.branch,
          academicYear: Number(formData.academicYear),
        });
        setSuccess('Student updated successfully!');
      } else {
        await studentApi.create({
          studentId: formData.studentId,
          name: formData.name,
          email: formData.email,
          course: formData.course,
          branch: formData.branch,
          academicYear: Number(formData.academicYear),
        });
        setSuccess('Student registered successfully!');
      }
      closeModal();
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please verify input data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student and their associated records?')) {
      return;
    }
    try {
      await studentApi.delete(id);
      setSuccess('Student deleted successfully!');
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const filteredStudents = students.filter((s) =>
    s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-subtitle">Register, update, and manage student profiles and academic credentials</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Student</span>
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

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search students by Roll ID, name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student Roll ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Course & Branch</th>
              <th>Academic Year</th>
              <th>Records</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Loading student registry...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No students found. Click "Add Student" to register the first student.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>
                      {s.studentId}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</td>
                  <td style={{ color: '#64748b' }}>{s.email}</td>
                  <td>{s.course} ({s.branch})</td>
                  <td>
                    <span className="badge badge-info">{s.academicYear}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className="badge badge-warning">{s.resultCount} Results</span>
                      <span className="badge badge-success">{s.certificateCount} Certs</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(s)}
                        className="btn btn-secondary btn-sm"
                        title="Edit student"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626' }}
                        title="Delete student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
              </h2>
              <button onClick={closeModal} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Student ID / Roll Number *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingStudent}
                  className="form-input"
                  placeholder="e.g. GU2027CS001"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Gopal Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. gopal@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Course *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. B.Tech"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. CSE"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Academic Year *</label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={2100}
                  className="form-input"
                  placeholder="2027"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
