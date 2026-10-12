import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Reopen modal state
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);
  const [reopenSuccess, setReopenSuccess] = useState(false);

  const fetchComplaintData = async () => {
    try {
      const [compRes, histRes] = await Promise.all([
        complaintApi.getComplaintById(id),
        complaintApi.getComplaintHistory(id),
      ]);

      if (compRes.success && compRes.data) setComplaint(compRes.data);
      if (histRes.success && histRes.data) setHistory(histRes.data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintData();
  }, [id]);

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim() || reopenReason.length < 10) {
      alert('Please provide a reason with at least 10 characters.');
      return;
    }

    setReopening(true);
    try {
      const res = await complaintApi.reopenComplaint(id, { reason: reopenReason });
      if (res.success && res.data) {
        setComplaint(res.data);
        setShowReopenModal(false);
        setReopenSuccess(true);
        fetchComplaintData();
      }
    } catch (err) {
      alert(err.message || 'Failed to reopen complaint.');
    } finally {
      setReopening(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading complaint audit details..." />;
  }

  if (errorMessage || !complaint) {
    return (
      <div className="alert alert-danger py-4 text-center rounded-4">
        <i className="bi bi-exclamation-triangle-fill fs-3 d-block mb-2"></i>
        <h5>Complaint Not Found or Access Denied</h5>
        <p className="text-muted small mb-3">{errorMessage || 'You may not have authorization to view this complaint.'}</p>
        <Link to="/student/complaints" className="btn btn-outline-danger btn-sm rounded-pill px-3">
          Back to My Complaints
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Header Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/student/complaints" className="btn btn-sm btn-light border rounded-circle p-1" title="Back">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <span className="fs-5 fw-extrabold text-primary brand-font">{complaint.referenceNumber}</span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <h4 className="fw-bold text-dark mb-0">{complaint.title}</h4>
        </div>

        {complaint.status === 'RESOLVED' && (
          <button
            className="btn btn-warning rounded-pill px-4 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2 text-dark"
            onClick={() => setShowReopenModal(true)}
          >
            <i className="bi bi-arrow-repeat"></i>
            <span>Reopen Complaint</span>
          </button>
        )}
      </div>

      {reopenSuccess && (
        <div className="alert alert-warning alert-dismissible fade show small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>This complaint has been reopened. Assigned technicians and administrators have been alerted.</span>
          <button type="button" className="btn-close" onClick={() => setReopenSuccess(false)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Complaint Details & Resolution */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3 brand-font border-bottom pb-2">Issue Description</h5>
            <p className="text-secondary mb-4" style={{ lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {complaint.description}
            </p>

            <div className="row g-3 p-3 bg-light rounded-3 border small mb-3">
              <div className="col-sm-6">
                <span className="text-muted d-block">Department:</span>
                <span className="fw-semibold text-dark">{complaint.departmentName}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Category:</span>
                <span className="fw-semibold text-dark">{complaint.category}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Location:</span>
                <span className="fw-semibold text-dark">{complaint.location}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Submitted Date:</span>
                <span className="fw-semibold text-dark">{new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Assigned Staff Info */}
            {complaint.assignedStaffName && (
              <div className="p-3 rounded-3 bg-primary-subtle border border-primary-subtle d-flex align-items-center gap-3 mb-3">
                <div className="bg-primary text-white p-2 rounded-circle">
                  <i className="bi bi-person-badge fs-5"></i>
                </div>
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Assigned Technician / Staff</small>
                  <span className="fw-bold text-primary">{complaint.assignedStaffName}</span>
                </div>
              </div>
            )}

            {/* Attachment preview / link */}
            {complaint.attachmentPath && (
              <div className="p-3 border rounded-3 bg-white mt-2">
                <small className="text-muted d-block mb-2 fw-semibold">Attached Photographic Evidence:</small>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-light p-2 rounded border">
                    <i className="bi bi-paperclip fs-4 text-primary"></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold small text-truncate" style={{ maxWidth: '280px' }}>
                      {complaint.attachmentOriginalName || complaint.attachmentPath}
                    </div>
                  </div>
                  <a
                    href={`/api/v1/files/download/${complaint.attachmentPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i> View / Download
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Notes Box */}
          {complaint.resolutionNotes && (
            <div className="card border-success shadow-sm rounded-4 p-4 bg-success-subtle mb-4">
              <div className="d-flex align-items-center gap-2 mb-2 text-success">
                <i className="bi bi-check-circle-fill fs-5"></i>
                <h5 className="fw-bold mb-0">Staff Resolution Report</h5>
              </div>
              <p className="text-dark small mb-2" style={{ whiteSpace: 'pre-line' }}>
                {complaint.resolutionNotes}
              </p>
              {complaint.resolvedAt && (
                <small className="text-muted">
                  Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
                </small>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Status Timeline & Audit Trail */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-4 brand-font border-bottom pb-2 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary"></i>
              <span>Audit History & Timeline</span>
            </h5>

            <div className="timeline-track">
              {history.map((item, idx) => (
                <div className="timeline-step" key={item.id || idx}>
                  <div className="timeline-dot active"></div>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <StatusBadge status={item.toStatus} />
                    </div>
                    <p className="small text-secondary mb-1">{item.remarks}</p>
                    <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                      <span>By: {item.changedByName || 'System'} ({item.changedByRole})</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reopen Complaint Modal */}
      <Modal
        show={showReopenModal}
        title="Reopen Complaint"
        onClose={() => setShowReopenModal(false)}
        footer={
          <div className="d-flex gap-2 justify-content-end w-100">
            <button
              className="btn btn-light btn-sm rounded-pill px-3"
              onClick={() => setShowReopenModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-warning btn-sm rounded-pill px-4 fw-semibold text-dark"
              onClick={handleReopen}
              disabled={reopening || reopenReason.trim().length < 10}
            >
              {reopening ? 'Reopening...' : 'Confirm Reopen'}
            </button>
          </div>
        }
      >
        <div>
          <p className="text-muted small mb-3">
            If the problem was not adequately resolved or persists, explain below. The issue status will update to <strong>REOPENED</strong>.
          </p>
          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">Reason for Reopening *</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. The Wi-Fi still disconnects intermittently every 5 minutes..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              required
            ></textarea>
            <small className="text-muted">Minimum 10 characters.</small>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComplaintDetailsPage;
