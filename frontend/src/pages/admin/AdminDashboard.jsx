import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { complaintApi } from '../../api/complaintApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0284c7', '#6d28d9', '#f59e0b', '#10b981', '#ea580c', '#64748b'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [unassignedComplaints, setUnassignedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Assignment Modal
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, compRes] = await Promise.all([
        adminApi.getDashboardStats(),
        complaintApi.getAllComplaints({ status: 'SUBMITTED', size: 6 }),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (compRes.success && compRes.data) setUnassignedComplaints(compRes.data.content || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openAssignModal = async (complaint) => {
    setAssigningComplaint(complaint);
    setSelectedStaffId('');
    setAssignRemarks('');
    try {
      const res = await adminApi.getStaffByDept(complaint.departmentId);
      if (res.success && res.data) {
        setStaffList(res.data);
        if (res.data.length > 0) setSelectedStaffId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load staff for department:', err);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!selectedStaffId) {
      alert('Please select an eligible staff member.');
      return;
    }

    setAssigningLoading(true);
    try {
      const res = await complaintApi.assignComplaint(assigningComplaint.id, {
        staffId: Number(selectedStaffId),
        remarks: assignRemarks.trim() || undefined,
      });

      if (res.success) {
        setAssigningComplaint(null);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Assignment failed.');
    } finally {
      setAssigningLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling campus executive analytics..." />;
  }

  // Prepare chart data
  const deptChartData = stats?.complaintsByDepartment
    ? Object.entries(stats.complaintsByDepartment).map(([name, count]) => ({ name, count }))
    : [];

  const statusPieData = stats?.complaintsByStatus
    ? Object.entries(stats.complaintsByStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Campus Administration Console 🏛️</h3>
          <p className="text-muted small mb-0">
            Real-time campus infrastructure oversight, workload dispatch, and operational resolution health.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/assign" className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-semibold">
            <i className="bi bi-person-gear me-1"></i> Assignment Queue
          </Link>
          <Link to="/admin/reports" className="btn btn-primary-navy btn-sm rounded-pill px-3 py-2 fw-semibold">
            <i className="bi bi-bar-chart-fill me-1"></i> Full Analytics
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Total Complaints</span>
              <div className="stat-icon-wrapper bg-primary-subtle text-primary">
                <i className="bi bi-card-checklist"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-dark">{stats?.totalComplaints || 0}</h2>
            <small className="text-muted">Registered in portal</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Pending Allocation</span>
              <div className="stat-icon-wrapper bg-warning-subtle text-warning">
                <i className="bi bi-exclamation-diamond"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-warning">{stats?.pendingComplaints || 0}</h2>
            <small className="text-muted">Awaiting staff delegation</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">In Progress</span>
              <div className="stat-icon-wrapper bg-info-subtle text-info">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-info">{stats?.inProgressComplaints || 0}</h2>
            <small className="text-muted">Being actively repaired</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Resolved</span>
              <div className="stat-icon-wrapper bg-success-subtle text-success">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
            <h2 className="fw-bold mb-1 text-success">{stats?.resolvedComplaints || 0}</h2>
            <small className="text-muted">Avg: {stats?.avgResolutionHours || 0} hrs to resolve</small>
          </div>
        </div>
      </div>

      {/* Secondary Stats Strip */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="p-3 bg-white rounded-4 border d-flex align-items-center gap-3">
            <div className="bg-light p-3 rounded-circle text-primary fs-4"><i className="bi bi-mortarboard"></i></div>
            <div>
              <div className="fs-5 fw-bold text-dark">{stats?.totalStudents || 0}</div>
              <small className="text-muted">Enrolled Students</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-white rounded-4 border d-flex align-items-center gap-3">
            <div className="bg-light p-3 rounded-circle text-indigo fs-4" style={{ color: '#6d28d9' }}><i className="bi bi-person-workspace"></i></div>
            <div>
              <div className="fs-5 fw-bold text-dark">{stats?.totalStaff || 0}</div>
              <small className="text-muted">Active Technicians & Staff</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-white rounded-4 border d-flex align-items-center gap-3">
            <div className="bg-light p-3 rounded-circle text-success fs-4"><i className="bi bi-buildings"></i></div>
            <div>
              <div className="fs-5 fw-bold text-dark">{stats?.totalDepartments || 0}</div>
              <small className="text-muted">Active Departments</small>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-1 brand-font">Complaints by Department</h5>
            <small className="text-muted mb-3 d-block">Breakdown of reported issues per college department</small>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={deptChartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-1 brand-font">Status Distribution</h5>
            <small className="text-muted mb-3 d-block">Current operational state proportions</small>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Unassigned Complaints Queue */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-bottom">
          <div>
            <h5 className="fw-bold text-dark mb-0 brand-font">Complaints Awaiting Staff Assignment</h5>
            <small className="text-muted">Recently submitted issues ready for routing</small>
          </div>
          <Link to="/admin/assign" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            Open Full Assignment Console
          </Link>
        </div>

        <div className="card-body p-0">
          {unassignedComplaints.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small text-uppercase">
                  <tr>
                    <th className="ps-4">Reference</th>
                    <th>Issue Title</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Submitted By</th>
                    <th className="text-end pe-4">Assignment Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedComplaints.map((c) => (
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
                        <div className="small fw-medium text-dark">{c.studentName}</div>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-primary-navy btn-sm rounded-pill px-3"
                          onClick={() => openAssignModal(c)}
                        >
                          <i className="bi bi-person-plus me-1"></i> Assign Staff
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-muted small">
              <i className="bi bi-check2-circle text-success fs-3 d-block mb-1"></i>
              No pending unassigned complaints! All submitted issues have been assigned to technicians.
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      <Modal
        show={!!assigningComplaint}
        title={`Assign Staff: ${assigningComplaint?.referenceNumber}`}
        onClose={() => setAssigningComplaint(null)}
        footer={
          <div className="d-flex gap-2 justify-content-end w-100">
            <button className="btn btn-light btn-sm rounded-pill px-3" onClick={() => setAssigningComplaint(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary-navy btn-sm rounded-pill px-4 fw-semibold"
              onClick={handleConfirmAssignment}
              disabled={assigningLoading || !selectedStaffId}
            >
              {assigningLoading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        }
      >
        <div>
          <div className="p-3 bg-light rounded-3 border mb-3 small">
            <div className="fw-bold text-dark">{assigningComplaint?.title}</div>
            <div className="text-muted mt-1">Department: <strong>{assigningComplaint?.departmentName}</strong></div>
            <div className="text-muted">Location: <strong>{assigningComplaint?.location}</strong></div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">
              Select Department Staff Technician *
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
                No active staff members found in this department. Please create or assign staff in User Management.
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="form-label fw-semibold text-secondary small">
              Assignment Directive / Remarks (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Inspect equipment immediately before scheduled class"
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
