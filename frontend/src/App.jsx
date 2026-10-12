import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout & Components
import DashboardLayout from './components/layout/DashboardLayout';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './pages/NotificationsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitComplaintPage from './pages/student/SubmitComplaintPage';
import MyComplaintsPage from './pages/student/MyComplaintsPage';
import ComplaintDetailsPage from './pages/student/ComplaintDetailsPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffComplaintDetailsPage from './pages/staff/StaffComplaintDetailsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllComplaintsPage from './pages/admin/AllComplaintsPage';
import ComplaintAssignmentPage from './pages/admin/ComplaintAssignmentPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AnalyticsReportsPage from './pages/admin/AnalyticsReportsPage';

// Protected Route Guard
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying authentication credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to proper role dashboard
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="submit" element={<SubmitComplaintPage />} />
          <Route path="complaints" element={<MyComplaintsPage />} />
          <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
        </Route>

        {/* Staff Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="complaints" element={<StaffDashboard />} />
          <Route path="complaints/:id" element={<StaffComplaintDetailsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="complaints" element={<AllComplaintsPage />} />
          <Route path="assign" element={<ComplaintAssignmentPage />} />
          <Route path="departments" element={<DepartmentManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="reports" element={<AnalyticsReportsPage />} />
        </Route>

        {/* Common Authenticated Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<NotificationsPage />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Persistent AI Chatbot Widget */}
      <ChatbotWidget />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
