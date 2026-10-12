import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg portal-navbar sticky-top py-2 px-3 px-md-4">
      <div className="container-fluid p-0">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/">
          <div className="brand-logo-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div>
            <span className="fw-bold fs-5 text-dark brand-font" style={{ letterSpacing: '-0.03em' }}>CampusCare</span>
            <span className="badge bg-primary-subtle text-primary ms-2 d-none d-sm-inline-block small" style={{ fontSize: '0.68rem' }}>AI-Enabled</span>
          </div>
        </Link>

        <div className="d-flex align-items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <Link to="/notifications" className="btn btn-light position-relative p-2 rounded-circle border" title="Notifications">
                <i className="bi bi-bell fs-5 text-secondary"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Profile Pill */}
              <div className="d-flex align-items-center gap-2 ps-2 border-start">
                <div className="d-none d-md-block text-end">
                  <div className="fw-semibold text-dark small leading-tight">{user?.fullName}</div>
                  <div className="d-flex align-items-center justify-content-end gap-1">
                    <span className="badge bg-navy-subtle text-primary border" style={{ fontSize: '0.65rem' }}>
                      {user?.role}
                    </span>
                    {user?.departmentName && (
                      <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        • {user.departmentName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '38px', height: '38px' }}>
                  {user?.fullName?.charAt(0) || 'U'}
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm rounded-pill ms-1 px-3 py-1 d-flex align-items-center gap-1"
                  title="Sign Out"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span className="d-none d-sm-inline">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-outline-primary btn-sm px-3 py-2 fw-medium rounded-pill">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary-navy btn-sm px-3 py-2 fw-medium rounded-pill">
                Register as Student
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
