import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintApi } from '../../api/complaintApi';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchStaffComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintApi.getStaffComplaints({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page: 0,
        size: 20,
      });
      if (res.success && res.data) {
        setComplaints(res.data.content || []);
      }
    } catch (err) {
      console.error('Failed to load staff complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffComplaints();
  }, [statusFilter, priorityFilter]);

  const assignedCount = complaints.filter((c) => c.status === 'ASSIGNED').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">
            Staff Workstation 🛠️
          </h3>
          <p className="text-muted small mb-0">
            Welcome, <strong>{user?.fullName}</strong> ({user?.departmentName || 'Technician'}). Manage complaints assigned directly to you.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">New Assigned</span>
              <div className="stat-icon-wrapper bg-purple-subtle text-indigo" style={{ backgroundColor: '#ede9fe', color: '#6d28d9' }}>
                <i className="bi bi-person-check-fill"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1" style={{ color: '#6d28d9' }}>{assignedCount}</h2>
            <small className="text-muted">Awaiting diagnostic action</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">In Progress</span>
              <div className="stat-icon-wrapper bg-warning-subtle text-warning">
                <i className="bi bi-tools"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-warning">{inProgressCount}</h2>
            <small className="text-muted">Active investigations & repairs</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Resolved by Me</span>
              <div className="stat-icon-wrapper bg-success-subtle text-success">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-success">{resolvedCount}</h2>
            <small className="text-muted">Completed resolutions</small>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-md-6 col-sm-6">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Assigned Statuses</option>
              <option value="ASSIGNED">ASSIGNED (New)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Under Repair)</option>
              <option value="RESOLVED">RESOLVED (Complete)</option>
              <option value="REOPENED">REOPENED (Action Required)</option>
            </select>
          </div>

          <div className="col-md-4 col-sm-6">
            <select
              className="form-select form-select-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-light btn-sm border w-100"
              onClick={() => { setStatusFilter(''); setPriorityFilter(''); }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Complaints Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="card-header bg-white py-3 px-4 border-bottom">
          <h5 className="fw-bold text-dark mb-0 brand-font">Assigned Complaints Queue</h5>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading assigned tasks..." />
          ) : complaints.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small text-uppercase">
                  <tr>
                    <th className="ps-4">Reference</th>
                    <th>Issue Description</th>
                    <th>Location</th>
                    <th>Student Details</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Resolution Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td className="ps-4">
                        <Link to={`/staff/complaints/${c.id}`} className="fw-bold text-primary text-decoration-none">
                          {c.referenceNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                          {c.title}
                        </div>
                        <small className="text-muted">{c.category}</small>
                      </td>
                      <td>
                        <span className="small text-secondary"><i className="bi bi-geo-alt me-1"></i>{c.location}</span>
                      </td>
                      <td>
                        <div className="small fw-medium text-dark">{c.studentName}</div>
                        <small className="text-muted">{c.studentEmail}</small>
                      </td>
                      <td>
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="text-end pe-4">
                        <Link to={`/staff/complaints/${c.id}`} className="btn btn-primary-navy btn-sm rounded-pill px-3">
                          Update Status
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4">
              <EmptyState
                icon="bi-check2-circle"
                title="All caught up!"
                description="No assigned complaints require your attention right now."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
