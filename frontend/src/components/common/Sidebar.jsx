import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const Sidebar = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotification();
  const role = user?.role;

  return (
    <aside className="dashboard-sidebar py-3 d-none d-md-block">
      <div className="px-3 mb-3">
        <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
          {role} Workspace
        </small>
      </div>

      <nav className="nav flex-column">
        {/* STUDENT NAVIGATION */}
        {role === 'STUDENT' && (
          <>
            <NavLink to="/student/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-grid-1x2"></i>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/student/submit" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-plus-circle"></i>
              <span>Submit Complaint</span>
            </NavLink>
            <NavLink to="/student/complaints" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-journal-text"></i>
              <span>My Complaints</span>
            </NavLink>
          </>
        )}

        {/* STAFF NAVIGATION */}
        {role === 'STAFF' && (
          <>
            <NavLink to="/staff/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-grid-1x2"></i>
              <span>Staff Dashboard</span>
            </NavLink>
            <NavLink to="/staff/complaints" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-check2-square"></i>
              <span>Assigned Complaints</span>
            </NavLink>
          </>
        )}

        {/* ADMIN NAVIGATION */}
        {role === 'ADMIN' && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-speedometer2"></i>
              <span>Executive Dashboard</span>
            </NavLink>
            <NavLink to="/admin/complaints" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-card-checklist"></i>
              <span>All Complaints</span>
            </NavLink>
            <NavLink to="/admin/assign" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-person-gear"></i>
              <span>Complaint Assignment</span>
            </NavLink>
            <NavLink to="/admin/departments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-diagram-3"></i>
              <span>Departments</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-people"></i>
              <span>User Management</span>
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-bar-chart-line"></i>
              <span>Analytics & Reports</span>
            </NavLink>
          </>
        )}

        {/* COMMON ITEMS */}
        <hr className="my-3 mx-3 text-secondary opacity-25" />
        <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bell"></i>
          <span className="flex-grow-1">Notifications</span>
          {unreadCount > 0 && (
            <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
              {unreadCount}
            </span>
          )}
        </NavLink>
      </nav>

      {/* Helpful Info Box */}
      <div className="mt-auto px-3 pt-4">
        <div className="bg-light p-3 rounded-3 border text-secondary small">
          <div className="d-flex align-items-center gap-2 mb-1 text-dark fw-semibold">
            <i className="bi bi-info-circle text-primary"></i>
            <span>Need Help?</span>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: '0.78rem' }}>
            Click the floating AI Assistant on the bottom right for instant FAQ guidance.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
