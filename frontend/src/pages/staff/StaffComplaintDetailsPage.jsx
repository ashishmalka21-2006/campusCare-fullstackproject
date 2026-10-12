import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StaffComplaintDetailsPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);

  const fetchDetails = async () => {
    try {
      const [compRes, histRes] = await Promise.all([
        complaintApi.getComplaintById(id),
        complaintApi.getComplaintHistory(id),
      ]);
      if (compRes.success && compRes.data) setComplaint(compRes.data);
      if (histRes.success && histRes.data) setHistory(histRes.data);
    } catch (err) {
      setAlertInfo({ type: 'danger', message: err.message || 'Failed to load details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdateStatus = async (targetStatus) => {
    setAlertInfo(null);

    if (targetStatus === 'RESOLVED' && (!resolutionNotes.trim() || resolutionNotes.trim().length < 5)) {
      setAlertInfo({ type: 'danger', message: 'Please provide resolution notes describing the fix (min 5 characters).' });
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        status: targetStatus,
        remarks: remarks.trim() || undefined,
        resolutionNotes: targetStatus === 'RESOLVED' ? resolutionNotes.trim() : undefined,
      };

      const res = await complaintApi.updateStatus(id, payload);
      if (res.success && res.data) {
        setComplaint(res.data);
        setRemarks('');
        setResolutionNotes('');
        setAlertInfo({ type: 'success', message: `Status successfully updated to ${targetStatus}!` });
        fetchDetails();
      }
    } catch (err) {
      setAlertInfo({ type: 'danger', message: err.message || 'Status transition failed.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading assigned ticket details..." />;
  }

  if (!complaint) {
    return (
      <div className="alert alert-danger py-4 text-center rounded-4">
        <h5>Complaint Record Not Accessible</h5>
        <Link to="/staff/complaints" className="btn btn-outline-danger btn-sm rounded-pill mt-2">
          Return to Assigned List
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/staff/complaints" className="btn btn-sm btn-light border rounded-circle p-1">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <span className="fs-5 fw-extrabold text-primary brand-font">{complaint.referenceNumber}</span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <h4 className="fw-bold text-dark mb-0">{complaint.title}</h4>
        </div>
      </div>

      {alertInfo && (
        <div className={`alert alert-${alertInfo.type} small py-2 d-flex align-items-center gap-2 mb-4`}>
          <i className={`bi ${alertInfo.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
          <span>{alertInfo.message}</span>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-7">
          {/* Action Transition Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3 brand-font border-bottom pb-2 d-flex align-items-center gap-2">
              <i className="bi bi-arrow-left-right text-primary"></i>
              <span>Staff Resolution Actions</span>
            </h5>

            {complaint.status === 'ASSIGNED' && (
              <div>
                <p className="text-secondary small mb-3">
                  This complaint is currently queued as <strong>ASSIGNED</strong>. Mark as <strong>IN_PROGRESS</strong> when you begin inspecting or repairing the issue.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Diagnostic Remark (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Inspecting Wi-Fi router or checking projector cabling"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-warning rounded-pill px-4 py-2 fw-semibold text-dark shadow-sm"
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  disabled={updating}
                >
                  <i className="bi bi-play-circle-fill me-1"></i>
                  {updating ? 'Updating...' : 'Start Work (Mark In-Progress)'}
                </button>
              </div>
            )}

            {complaint.status === 'IN_PROGRESS' && (
              <div>
                <p className="text-secondary small mb-3">
                  Work is currently <strong>IN_PROGRESS</strong>. When repairs and testing are finalized, provide resolution notes and mark as <strong>RESOLVED</strong>.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Resolution Notes *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe specific repairs performed, replaced components, or verification completed..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    required
                  ></textarea>
                  <small className="text-muted">Required when marking as resolved (min 5 characters).</small>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Additional Remarks (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Advised teaching assistant on proper HDMI connection"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm"
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  disabled={updating || !resolutionNotes.trim()}
                >
                  <i className="bi bi-check-circle-fill me-1"></i>
                  {updating ? 'Resolving...' : 'Complete & Mark as Resolved'}
                </button>
              </div>
            )}

            {complaint.status === 'REOPENED' && (
              <div>
                <div className="alert alert-warning small py-2 d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>The student has reported that the issue remains unresolved.</span>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Follow-Up Action Remark</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Re-inspecting booster pump wiring"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-warning rounded-pill px-4 py-2 fw-semibold text-dark shadow-sm"
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  disabled={updating}
                >
                  <i className="bi bi-arrow-repeat me-1"></i>
                  {updating ? 'Updating...' : 'Resume Work (Mark In-Progress)'}
                </button>
              </div>
            )}

            {(complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && (
              <div className="alert alert-success small mb-0 py-2 d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill"></i>
                <span>This ticket is complete ({complaint.status}). No further actions required unless reopened.</span>
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3 brand-font border-bottom pb-2">Ticket Specifications</h5>
            <p className="text-secondary mb-3" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {complaint.description}
            </p>

            <div className="p-3 bg-light rounded-3 border small">
              <div className="row g-2">
                <div className="col-sm-6">
                  <span className="text-muted d-block">Department:</span>
                  <span className="fw-semibold text-dark">{complaint.departmentName}</span>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted d-block">Location:</span>
                  <span className="fw-semibold text-dark">{complaint.location}</span>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted d-block">Student Name:</span>
                  <span className="fw-semibold text-dark">{complaint.studentName}</span>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted d-block">Student Email:</span>
                  <span className="fw-semibold text-dark">{complaint.studentEmail}</span>
                </div>
              </div>
            </div>

            {complaint.attachmentPath && (
              <div className="mt-3 p-3 border rounded-3 bg-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-paperclip fs-5 text-primary"></i>
                  <span className="small text-truncate" style={{ maxWidth: '240px' }}>
                    {complaint.attachmentOriginalName || complaint.attachmentPath}
                  </span>
                </div>
                <a
                  href={`/api/v1/files/download/${complaint.attachmentPath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                >
                  View Attachment
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Audit History Timeline */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-4 brand-font border-bottom pb-2 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary"></i>
              <span>Ticket Timeline History</span>
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
                      <span>By: {item.changedByName || 'System'}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffComplaintDetailsPage;
