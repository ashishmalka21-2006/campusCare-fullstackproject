import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters state
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        status: status || undefined,
        category: category || undefined,
        search: search.trim() || undefined,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };
      const res = await complaintApi.getMyComplaints(params);
      if (res.success && res.data) {
        setComplaints(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to fetch my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setStatus('');
    setCategory('');
    setSearch('');
    setPage(0);
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">My Complaints</h3>
          <p className="text-muted small mb-0">
            View, filter, and track the status lifecycle of all your submitted complaints.
          </p>
        </div>
        <Link to="/student/submit" className="btn btn-primary-navy px-3 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0"
                placeholder="Search by title or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
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

          <div className="col-md-3 col-sm-6">
            <select
              className="form-select form-select-sm"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(0); }}
            >
              <option value="">All Categories</option>
              <option value="Network & Internet">Network & Internet</option>
              <option value="Audio / Visual">Audio / Visual & Projector</option>
              <option value="Water Supply & Plumbing">Water Supply & Plumbing</option>
              <option value="Electrical & Lighting">Electrical & Lighting</option>
              <option value="HVAC & Cooling">HVAC & Air Conditioning</option>
              <option value="Sanitation & Cleanliness">Sanitation</option>
            </select>
          </div>

          <div className="col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-primary-navy btn-sm flex-fill">
              Filter
            </button>
            <button type="button" className="btn btn-light btn-sm border" onClick={handleResetFilters} title="Reset filters">
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Complaints Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        {loading ? (
          <LoadingSpinner message="Fetching your complaints list..." />
        ) : complaints.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small text-uppercase">
                  <tr>
                    <th className="ps-4">Reference</th>
                    <th>Title & Location</th>
                    <th>Department</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="text-end pe-4">Actions</th>
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
                        <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{c.location}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {c.departmentName}
                        </span>
                      </td>
                      <td>
                        <small className="text-secondary">{c.category}</small>
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
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 text-muted small">
              <div>
                Showing <strong>{complaints.length}</strong> of <strong>{totalElements}</strong> total records
              </div>
              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-light btn-sm border"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <i className="bi bi-chevron-left"></i> Previous
                </button>
                <span className="px-2">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <button
                  className="btn btn-light btn-sm border"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4">
            <EmptyState
              icon="bi-search"
              title="No complaints found"
              description="No complaints matched your search filter criteria. Try adjusting filters or submit a new problem."
              actionText="Reset Filters"
              onAction={handleResetFilters}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaintsPage;
