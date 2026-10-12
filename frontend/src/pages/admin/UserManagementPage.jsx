import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { departmentApi } from '../../api/departmentApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Create Staff Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'STAFF',
    employeeId: '',
    phoneNumber: '',
    departmentId: '',
  });
  const [savingStaff, setSavingStaff] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        role: roleFilter || undefined,
        search: search.trim() || undefined,
        page,
        size: 10,
      });
      if (res.success && res.data) {
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  useEffect(() => {
    departmentApi.getDepartments(true).then((res) => {
      if (res.success && res.data) {
        setDepartments(res.data);
        if (res.data.length > 0) {
          setStaffForm((prev) => ({ ...prev, departmentId: res.data[0].id }));
        }
      }
    });
  }, []);

  const handleToggleActive = async (user) => {
    const updatedStatus = !user.active;
    if (window.confirm(`Are you sure you want to ${updatedStatus ? 'activate' : 'deactivate'} account for ${user.fullName}?`)) {
      try {
        await adminApi.updateUserStatus(user.id, updatedStatus);
        fetchUsers();
      } catch (err) {
        alert(err.message || 'Status update failed.');
      }
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSavingStaff(true);

    try {
      await adminApi.createStaffUser(staffForm);
      setModalOpen(false);
      setStaffForm({
        fullName: '',
        email: '',
        password: '',
        role: 'STAFF',
        employeeId: '',
        phoneNumber: '',
        departmentId: departments[0]?.id || '',
      });
      fetchUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create staff account.');
    } finally {
      setSavingStaff(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">User Account Management</h3>
          <p className="text-muted small mb-0">
            Audit user roles, activate/deactivate access, and provision staff technicians.
          </p>
        </div>
        <button
          className="btn btn-primary-navy px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2"
          onClick={() => { setErrorMessage(''); setModalOpen(true); }}
        >
          <i className="bi bi-person-plus-fill"></i>
          <span>Provision Staff / Sub-Admin</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); fetchUsers(); } }}
              />
            </div>
          </div>

          <div className="col-md-4">
            <select
              className="form-select form-select-sm"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            >
              <option value="">All Roles (Students, Staff, Admins)</option>
              <option value="STUDENT">STUDENT</option>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-primary-navy btn-sm w-100"
              onClick={() => { setPage(0); fetchUsers(); }}
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        {loading ? (
          <LoadingSpinner message="Loading user directory..." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small text-uppercase">
                  <tr>
                    <th className="ps-4">User</th>
                    <th>Role</th>
                    <th>Roll / Employee ID</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Account Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{u.fullName}</div>
                            <small className="text-muted">{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          u.role === 'ADMIN' ? 'bg-dark text-white' :
                          u.role === 'STAFF' ? 'bg-indigo text-white' : 'bg-primary-subtle text-primary'
                        }`} style={{ backgroundColor: u.role === 'STAFF' ? '#6d28d9' : undefined }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className="small text-secondary">{u.identifierCode || '—'}</span>
                      </td>
                      <td>
                        <span className="small text-dark">{u.departmentName || '—'}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                          {u.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className={`btn btn-sm rounded-pill px-3 ${u.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-3 border-top d-flex align-items-center justify-content-between text-muted small">
              <div>Page {page + 1} of {Math.max(1, totalPages)}</div>
              <div className="d-flex gap-1">
                <button
                  className="btn btn-light btn-sm border"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </button>
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
        )}
      </div>

      {/* Provision Staff Modal */}
      <Modal
        show={modalOpen}
        title="Provision Staff / Admin Account"
        onClose={() => setModalOpen(false)}
        footer={
          <div className="d-flex gap-2 justify-content-end w-100">
            <button className="btn btn-light btn-sm rounded-pill px-3" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary-navy btn-sm rounded-pill px-4 fw-semibold"
              onClick={handleCreateStaff}
              disabled={savingStaff}
            >
              {savingStaff ? 'Creating...' : 'Provision User'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateStaff}>
          {errorMessage && (
            <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ramesh Rao"
                value={staffForm.fullName}
                onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">College Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. staff.maint@campuscare.edu"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Assigned Role *</label>
              <select
                className="form-select"
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                required
              >
                <option value="STAFF">STAFF (Technician / Departmental)</option>
                <option value="ADMIN">ADMIN (Administrative Officer)</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Department *</label>
              <select
                className="form-select"
                value={staffForm.departmentId}
                onChange={(e) => setStaffForm({ ...staffForm, departmentId: Number(e.target.value) })}
                required={staffForm.role === 'STAFF'}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Employee ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. EMP-MNT-103"
                value={staffForm.employeeId}
                onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+91 9876543210"
                value={staffForm.phoneNumber}
                onChange={(e) => setStaffForm({ ...staffForm, phoneNumber: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Initial Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
