import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintApi } from '../../api/complaintApi';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    reopened: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const res = await complaintApi.getMyComplaints({ page: 0, size: 5 });
        if (res.success && res.data) {
          const list = res.data.content || [];
          setComplaints(list);
          setStats({
            total: res.data.totalElements || 0,
            inProgress: list.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length,
            resolved: list.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
            reopened: list.filter((c) => c.status === 'REOPENED').length,
          });
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your student workspace..." />;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">
            Welcome back, {user?.fullName}! 👋
          </h3>
          <p className="text-muted small mb-0">
            Student ID: <span className="fw-semibold text-dark">{user?.identifierCode || 'N/A'}</span> | Keep track of campus problems and resolutions.
          </p>
        </div>
        <Link to="/student/submit" className="btn btn-primary-navy px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Total Complaints</span>
              <div className="stat-icon-wrapper bg-primary-subtle text-primary">
                <i className="bi bi-folder2-open"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-dark">{stats.total}</h2>
            <small className="text-muted">Recorded lifetime submissions</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">In Progress</span>
              <div className="stat-icon-wrapper bg-warning-subtle text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-warning">{stats.inProgress}</h2>
            <small className="text-muted">Assigned & active repairs</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Resolved</span>
              <div className="stat-icon-wrapper bg-success-subtle text-success">
                <i className="bi bi-check2-circle"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-success">{stats.resolved}</h2>
            <small className="text-muted">Verified completed complaints</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Reopened</span>
              <div className="stat-icon-wrapper bg-danger-subtle text-danger">
                <i className="bi bi-arrow-repeat"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-danger">{stats.reopened}</h2>
            <small className="text-muted">Pending re-investigation</small>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-0 brand-font">Recent Complaints</h5>
            <small className="text-muted">Latest submissions and current real-time status</small>
          </div>
          <Link to="/student/complaints" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
            View All ({stats.total})
          </Link>
        </div>

        <div className="card-body p-0">
          {complaints.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small text-uppercase">
                  <tr>
                    <th className="ps-4">Reference</th>
                    <th>Issue Title</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td className="ps-4">
                        <Link to={`/student/complaints/${c.id}`} className="fw-bold text-primary text-decoration-none">
                          {c.referenceNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                          {c.title}
                        </div>
                        <small className="text-muted">{c.location}</small>
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
                        <small className="text-muted">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="text-end pe-4">
                        <Link to={`/student/complaints/${c.id}`} className="btn btn-outline-primary btn-sm rounded-pill px-3">
                          Track Details
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
                icon="bi-journal-check"
                title="No complaints filed yet"
                description="You haven't filed any complaints yet. Report campus infrastructure or service issues anytime."
                actionText="File Your First Complaint"
                onAction={() => window.location.href = '/student/submit'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
