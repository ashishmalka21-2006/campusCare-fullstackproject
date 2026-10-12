import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { departmentApi } from '../api/departmentApi';

const LandingPage = () => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    departmentApi.getDepartments(true)
      .then((res) => {
        if (res.success && res.data) setDepartments(res.data);
      })
      .catch((err) => console.error('Failed to load departments:', err));
  }, []);

  return (
    <div className="min-vh-100 d-flex flex-column bg-page">
      <Navbar />

      {/* Hero Section */}
      <section className="py-5 px-3 px-md-5 text-center text-md-start" style={{ background: 'linear-gradient(135deg, #0f2b5c 0%, #1a365d 60%, #0369a1 100%)', color: 'white' }}>
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-10 border border-white border-opacity-20 mb-3">
                <i className="bi bi-stars text-info"></i>
                <span className="small fw-medium text-white">Smart Academic Campus Solution</span>
              </div>
              <h1 className="display-4 fw-extrabold brand-font mb-3 text-white">
                AI-Enabled College Complaint Management & Resolution System
              </h1>
              <p className="lead text-white-50 mb-4 fw-normal" style={{ maxWidth: '620px' }}>
                Report campus infrastructure issues, track resolutions with real-time audit trails, and get instant 24/7 assistance from our built-in AI Assistant.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
                <Link to="/login" className="btn btn-light btn-lg px-4 py-3 fw-bold rounded-pill shadow-sm text-primary">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Access Portal
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4 py-3 fw-medium rounded-pill">
                  <i className="bi bi-person-plus me-2"></i>Student Registration
                </Link>
              </div>

              {/* Demo Credentials Pill */}
              <div className="mt-4 p-3 rounded-3 bg-black bg-opacity-25 border border-white border-opacity-10 d-inline-block text-start small">
                <div className="fw-semibold text-warning mb-1 d-flex align-items-center gap-1">
                  <i className="bi bi-key-fill"></i> Academic Evaluation Demo Credentials:
                </div>
                <div className="text-white-50">
                  <span className="text-white fw-bold">Admin:</span> admin@campuscare.edu | <span className="text-white fw-bold">Staff:</span> staff.it@campuscare.edu | <span className="text-white fw-bold">Student:</span> student1@campuscare.edu
                  <br />Password for all: <code className="text-info bg-dark px-2 py-0 rounded">Admin@123 / Staff@123 / Student@123</code>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="bg-white rounded-4 p-4 shadow-lg text-dark">
                <h5 className="fw-bold mb-3 brand-font d-flex align-items-center gap-2">
                  <i className="bi bi-lightning-charge text-warning"></i>
                  <span>Quick Issue Reporting</span>
                </h5>
                <p className="text-muted small mb-4">
                  Experiencing disruptions on campus? File a complaint in seconds and receive your unique reference tracking code.
                </p>
                <div className="list-group list-group-flush mb-4">
                  <div className="list-group-item d-flex align-items-center gap-3 px-0 border-0">
                    <div className="bg-primary-subtle text-primary p-2 rounded-3"><i className="bi bi-wifi fs-5"></i></div>
                    <div>
                      <div className="fw-semibold small">Wi-Fi & Network Failures</div>
                      <small className="text-muted">Hostel & lab internet disruptions</small>
                    </div>
                  </div>
                  <div className="list-group-item d-flex align-items-center gap-3 px-0 border-0">
                    <div className="bg-info-subtle text-info p-2 rounded-3"><i className="bi bi-projector fs-5"></i></div>
                    <div>
                      <div className="fw-semibold small">Classroom AV & Equipment</div>
                      <small className="text-muted">Smart boards, projectors, laboratory gear</small>
                    </div>
                  </div>
                  <div className="list-group-item d-flex align-items-center gap-3 px-0 border-0">
                    <div className="bg-success-subtle text-success p-2 rounded-3"><i className="bi bi-droplet-half fs-5"></i></div>
                    <div>
                      <div className="fw-semibold small">Hostel Maintenance & Water</div>
                      <small className="text-muted">Plumbing, electricity, and room repairs</small>
                    </div>
                  </div>
                </div>
                <Link to="/login" className="btn btn-primary-navy w-100 py-2 fw-semibold rounded-pill">
                  Submit Complaint Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Steps Section */}
      <section className="py-5 px-3 container">
        <div className="text-center mb-5">
          <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-2">Resolution Lifecycle</span>
          <h2 className="fw-bold brand-font text-dark">How CampusCare Works</h2>
          <p className="text-muted max-w-md mx-auto" style={{ maxWidth: '500px' }}>
            Transparent end-to-end management ensuring college issues are acknowledged, delegated, and verified.
          </p>
        </div>

        <div className="row g-4 text-center">
          <div className="col-md-3">
            <div className="stat-card h-100 p-4">
              <div className="stat-icon-wrapper bg-primary-subtle text-primary mx-auto mb-3">1</div>
              <h5 className="fw-bold mb-2">Submit Complaint</h5>
              <p className="text-muted small mb-0">Students submit details with department, location, priority, and optional photos.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card h-100 p-4">
              <div className="stat-icon-wrapper bg-info-subtle text-info mx-auto mb-3">2</div>
              <h5 className="fw-bold mb-2">Admin Delegation</h5>
              <p className="text-muted small mb-0">Administrators assign complaints to eligible departmental staff members.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card h-100 p-4">
              <div className="stat-icon-wrapper bg-warning-subtle text-warning mx-auto mb-3">3</div>
              <h5 className="fw-bold mb-2">Staff Resolution</h5>
              <p className="text-muted small mb-0">Technicians diagnose issues, post status updates, and provide resolution remarks.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card h-100 p-4">
              <div className="stat-icon-wrapper bg-success-subtle text-success mx-auto mb-3">4</div>
              <h5 className="fw-bold mb-2">Verify or Reopen</h5>
              <p className="text-muted small mb-0">Students receive notifications and can reopen unresolved complaints if needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Departments */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold brand-font text-dark mb-1">Campus Departments</h3>
              <p className="text-muted small mb-0">Configured departments handling student resolutions</p>
            </div>
          </div>

          <div className="row g-3">
            {departments.map((dept) => (
              <div className="col-md-4 col-sm-6" key={dept.id}>
                <div className="p-3 border rounded-3 bg-light h-100">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold mb-0 text-dark">{dept.name}</h6>
                    <span className="badge bg-secondary-subtle text-secondary small">{dept.code}</span>
                  </div>
                  <p className="text-muted small mb-2">{dept.description}</p>
                  <div className="small text-primary"><i className="bi bi-envelope me-1"></i>{dept.contactEmail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-4 bg-dark text-white-50 text-center small border-top">
        <div className="container">
          <p className="mb-1 text-white">CampusCare — AI-Enabled College Complaint Management & Resolution System</p>
          <p className="mb-0">B.Tech 3rd-Year CSE Academic Capstone Project | Built with React, Vite, Spring Boot 3 & MySQL 8</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
