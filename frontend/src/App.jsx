import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import ResultsPage from './pages/ResultsPage';
import IssueCertificatePage from './pages/IssueCertificatePage';
import CertificatesListPage from './pages/CertificatesListPage';
import CertificateDetailPage from './pages/CertificateDetailPage';
import PublicVerifyPage from './pages/PublicVerifyPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<PublicVerifyPage />} />
          <Route path="/verify/:verificationId" element={<PublicVerifyPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="issue-certificate" element={<IssueCertificatePage />} />
            <Route path="certificates" element={<CertificatesListPage />} />
            <Route path="certificates/:id" element={<CertificateDetailPage />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/verify" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
