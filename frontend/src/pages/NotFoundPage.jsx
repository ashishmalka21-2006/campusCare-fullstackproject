import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-page text-center p-4">
      <div className="brand-logo-icon mb-3" style={{ width: '64px', height: '64px', fontSize: '2rem' }}>
        <i className="bi bi-question-lg"></i>
      </div>
      <h1 className="display-4 fw-extrabold brand-font text-dark mb-2">404</h1>
      <h4 className="fw-bold text-secondary mb-3">Page Not Found</h4>
      <p className="text-muted small mb-4" style={{ maxWidth: '420px' }}>
        The campus portal page you are looking for does not exist or has been relocated.
      </p>
      <Link to="/" className="btn btn-primary-navy rounded-pill px-4 py-2 fw-semibold">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
