import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        studentId: formData.studentId,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });
      navigate('/student/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-page">
      <Navbar />

      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <div className="brand-logo-icon mx-auto mb-3" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
                  <i className="bi bi-person-badge-fill"></i>
                </div>
                <h3 className="fw-bold brand-font text-dark mb-1">Student Registration</h3>
                <p className="text-muted small">Create your student account to file and track college complaints</p>
                <div className="badge bg-primary-subtle text-primary border py-1 px-3">
                  <i className="bi bi-shield-check me-1"></i>Enforced Student Role
                </div>
              </div>

              {errorMessage && (
                <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Student Roll / ID Number</label>
                    <input
                      type="text"
                      name="studentId"
                      className="form-control"
                      placeholder="e.g. CS202445"
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">College Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="rahul@campuscare.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-control"
                      placeholder="+91 9876543210"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-navy w-100 py-2 fw-semibold rounded-pill mt-4 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="bi bi-person-check-fill me-2"></i>
                  )}
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>

                <div className="text-center text-muted small">
                  Already registered?{' '}
                  <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                    Log in here
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

export default RegisterPage;
