import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const sessionExpired = searchParams.get('sessionExpired');

  const fillDemoCredentials = (role) => {
    setErrorMessage('');
    if (role === 'ADMIN') {
      setEmail('admin@campuscare.edu');
      setPassword('Admin@123');
    } else if (role === 'STAFF') {
      setEmail('staff.it@campuscare.edu');
      setPassword('Staff@123');
    } else if (role === 'STUDENT') {
      setEmail('student1@campuscare.edu');
      setPassword('Student@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-page">
      <Navbar />

      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <div className="brand-logo-icon mx-auto mb-3" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h3 className="fw-bold brand-font text-dark mb-1">CampusCare Login</h3>
                <p className="text-muted small">Sign in to your college complaint management account</p>
              </div>

              {sessionExpired && (
                <div className="alert alert-warning small py-2 d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>Your session has expired. Please log in again.</span>
                </div>
              )}

              {errorMessage && (
                <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Quick Demo Fill Buttons */}
              <div className="mb-4 p-3 bg-light rounded-3 border">
                <small className="fw-bold text-secondary text-uppercase d-block mb-2" style={{ fontSize: '0.7rem' }}>
                  Quick Demo Login (Click to Fill):
                </small>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm flex-fill"
                    onClick={() => fillDemoCredentials('STUDENT')}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-info btn-sm flex-fill"
                    onClick={() => fillDemoCredentials('STAFF')}
                  >
                    Staff (IT)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm flex-fill"
                    onClick={() => fillDemoCredentials('ADMIN')}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">College Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      placeholder="student@campuscare.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-key"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-navy w-100 py-2 fw-semibold rounded-pill mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                  )}
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                <div className="text-center text-muted small">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                    Register as Student
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
