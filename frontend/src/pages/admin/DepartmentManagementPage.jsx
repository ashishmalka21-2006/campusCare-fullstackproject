import React, { useState, useEffect } from 'react';
import { departmentApi } from '../../api/departmentApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    contactEmail: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentApi.getDepartments(false);
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      contactEmail: '',
      active: true,
    });
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      contactEmail: dept.contactEmail || '',
      active: dept.active,
    });
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSaving(true);

    try {
      if (editingDept) {
        await departmentApi.updateDepartment(editingDept.id, formData);
      } else {
        await departmentApi.createDepartment(formData);
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setErrorMessage(err.message || 'Operation failed. Please verify unique code and name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Department Management</h3>
          <p className="text-muted small mb-0">
            Configure campus departments, staff routing units, and contact dispatch points.
          </p>
        </div>
        <button
          className="btn btn-primary-navy px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2"
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Add Department</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        {loading ? (
          <LoadingSpinner message="Fetching departments..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="ps-4">Code</th>
                  <th>Department Name</th>
                  <th>Contact Email</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td className="ps-4">
                      <span className="badge bg-light text-primary border fw-bold fs-6">
                        {dept.code}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{dept.name}</div>
                    </td>
                    <td>
                      <div className="small text-secondary">{dept.contactEmail || 'N/A'}</div>
                    </td>
                    <td>
                      <div className="small text-muted text-truncate" style={{ maxWidth: '280px' }}>
                        {dept.description}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${dept.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {dept.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                        onClick={() => openEditModal(dept)}
                      >
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        show={modalOpen}
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create New Department'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="d-flex gap-2 justify-content-end w-100">
            <button className="btn btn-light btn-sm rounded-pill px-3" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary-navy btn-sm rounded-pill px-4 fw-semibold"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <label className="form-label small fw-semibold text-secondary">Department Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. IT Support"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-secondary">Unique Code *</label>
              <input
                type="text"
                className="form-control text-uppercase"
                placeholder="e.g. ITS"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Contact Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. it.support@campuscare.edu"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Scope of complaints handled by this department..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="deptActiveSwitch"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label className="form-check-label small fw-semibold text-secondary" htmlFor="deptActiveSwitch">
              Department is active and accepting complaints
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagementPage;
