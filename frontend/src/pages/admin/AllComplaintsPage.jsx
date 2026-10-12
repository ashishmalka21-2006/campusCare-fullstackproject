import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import { departmentApi } from '../../api/departmentApi';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const AllComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [deptId, setDeptId] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        departmentId: deptId || undefined,
        status: status || undefined,
        priority: priority || undefined,
        search: search.trim() || undefined,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };

      const res = await complaintApi.getAllComplaints(params);
      if (res.success && res.data) {
        setComplaints(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to load all complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentApi.getDepartments(false).then((res) => {
      if (res.success && res.data) setDepartments(res.data);
    });
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, deptId, status, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

  const handleReset = () => {
    setDeptId('');
    setStatus('');
    setPriority('');
    setSearch('');
    setPage(0);
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Campus Complaints Directory 📋</h3>
          <p className="text-muted small mb-0">
            Global search, filtering, and audit log for all campus issues across every department.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0"
                placeholder="Reference or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <select
              className="form-select form-select-sm"
              value={deptId}
              onChange={(e) => { setDeptId(e.target.value); setPage(0); }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2 col-sm-6">
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REOPENED">REOPENED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="col-md-2 col-sm-6">
            <select
              className="form-select form-select-sm"
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(0); }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <div className="col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-primary-navy btn-sm flex-fill">
              Filter
            </button>
            <button type="button" className="btn btn-light btn-sm border" onClick={handleReset} title="Reset filters">
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Complaints Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        {loading ? (
          <LoadingSpinner message="Querying complaints records..." />
        ) : complaints.length > 0 ? (
          <>
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
                    <th>Assigned Staff</th>
                    <th>Submitted</th>
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
                        <span className="badge bg-light text-dark border">{c.departmentName}</span>
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
                      <td>
                        <small className="text-muted">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-3 border-top d-flex align-items-center justify-content-between text-muted small">
              <div>
                Showing <strong>{complaints.length}</strong> of <strong>{totalElements}</strong> complaints
              </div>
              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-light btn-sm border"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </button>
                <span className="px-2">Page {page + 1} of {Math.max(1, totalPages)}</span>
                <button
                  className="btn btn-light btn-sm border"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4">
            <EmptyState
              icon="bi-search"
              title="No complaints match criteria"
              description="Adjust the filters to see more results."
              actionText="Reset All Filters"
              onAction={handleReset}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AllComplaintsPage;
