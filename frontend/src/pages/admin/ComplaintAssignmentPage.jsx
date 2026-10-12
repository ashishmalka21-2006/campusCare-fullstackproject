import React, { useState, useEffect } from 'react';
import { complaintApi } from '../../api/complaintApi';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const ComplaintAssignmentPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SUBMITTED'); // SUBMITTED or REOPENED or ALL

  // Assignment Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  const fetchUnassigned = async () => {
    setLoading(true);
    try {
      const res = await complaintApi.getAllComplaints({
        status: activeTab === 'ALL' ? undefined : activeTab,
        size: 50,
      });
      if (res.success && res.data) {
        setComplaints(res.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load unassigned complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassigned();
  }, [activeTab]);

  const openAssignModal = async (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStaffId('');
    setRemarks('');
    setAlertMessage(null);

    try {
      const res = await adminApi.getStaffByDept(complaint.departmentId);
      if (res.success && res.data) {
        setStaffList(res.data);
        if (res.data.length > 0) setSelectedStaffId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load eligible staff members:', err);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!selectedStaffId) {
      alert('Please select an eligible staff member.');
      return;
    }

    setAssigning(true);
    try {
      const res = await complaintApi.assignComplaint(selectedComplaint.id, {
        staffId: Number(selectedStaffId),
        remarks: remarks.trim() || undefined,
      });

      if (res.success) {
        setSelectedComplaint(null);
        setAlertMessage({ type: 'success', text: `Complaint successfully assigned!` });
        fetchUnassigned();
      }
    } catch (err) {
      alert(err.message || 'Assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Complaint Assignment Console 🎯</h3>
          <p className="text-muted small mb-0">
            Route incoming and reopened campus complaints to qualified departmental staff technicians.
          </p>
        </div>
      </div>

      {alertMessage && (
        <div className={`alert alert-${alertMessage.type} small py-2 d-flex align-items-center gap-2 mb-4`}>
          <i className="bi bi-check-circle-fill"></i>
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 border shadow-sm d-inline-flex">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 py-2 small fw-semibold ${activeTab === 'SUBMITTED' ? 'active bg-primary-navy' : 'text-secondary'}`}
            onClick={() => setActiveTab('SUBMITTED')}
          >
            New Submissions
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 py-2 small fw-semibold ${activeTab === 'REOPENED' ? 'active bg-primary-navy' : 'text-secondary'}`}
            onClick={() => setActiveTab('REOPENED')}
          >
            Reopened Complaints
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 py-2 small fw-semibold ${activeTab === 'ALL' ? 'active bg-primary-navy' : 'text-secondary'}`}
            onClick={() => setActiveTab('ALL')}
          >
            All Lifecycle Queues
          </button>
        </li>
      </ul>

      {/* Complaints Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        {loading ? (
          <LoadingSpinner message="Loading assignment queue..." />
        ) : complaints.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="ps-4">Reference</th>
                  <th>Issue & Location</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Student</th>
                  <th>Currently Assigned</th>
                  <th className="text-end pe-4">Dispatch Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-4">
                      <span className="fw-bold text-primary">{c.referenceNumber}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </div>
                      <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{c.location}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {c.departmentName}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <div className="small fw-medium text-dark">{c.studentName}</div>
                    </td>
                    <td>
                      <span className="small text-secondary">
                        {c.assignedStaffName || <span className="text-muted fst-italic">Unassigned</span>}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-primary-navy btn-sm rounded-pill px-3"
                        onClick={() => openAssignModal(c)}
                      >
                        <i className="bi bi-person-plus me-1"></i>
                        {c.assignedStaffName ? 'Reassign' : 'Assign Staff'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              icon="bi-check-all"
              title="Queue is completely cleared!"
              description="No complaints currently match this assignment queue filter."
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        show={!!selectedComplaint}
        title={`Assign Technician: ${selectedComplaint?.referenceNumber}`}
        onClose={() => setSelectedComplaint(null)}
        footer={
          <div className="d-flex gap-2 justify-content-end w-100">
            <button className="btn btn-light btn-sm rounded-pill px-3" onClick={() => setSelectedComplaint(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary-navy btn-sm rounded-pill px-4 fw-semibold"
              onClick={handleConfirmAssignment}
              disabled={assigning || !selectedStaffId}
            >
              {assigning ? 'Dispatching...' : 'Dispatch Assignment'}
            </button>
          </div>
        }
      >
        <div>
          <div className="p-3 bg-light rounded-3 border mb-3 small">
            <div className="fw-bold text-dark">{selectedComplaint?.title}</div>
            <div className="text-muted mt-1">
              Required Department: <strong className="text-primary">{selectedComplaint?.departmentName}</strong>
            </div>
            <div className="text-muted">
              Location: <strong>{selectedComplaint?.location}</strong>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">
              Select Department Staff Member *
            </label>
            {staffList.length > 0 ? (
              <select
                className="form-select"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                required
              >
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.identifierCode || st.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="alert alert-warning small mb-0">
                No active staff found in {selectedComplaint?.departmentName}. Please provision staff under User Management first.
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="form-label fw-semibold text-secondary small">
              Assignment Directive / Instructions (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Please check switch port and report findings"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComplaintAssignmentPage;
