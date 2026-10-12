import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentApi } from '../../api/departmentApi';
import { complaintApi } from '../../api/complaintApi';
import Modal from '../../components/common/Modal';

const categoryOptions = [
  'Network & Internet',
  'Audio / Visual & Projectors',
  'Water Supply & Plumbing',
  'Electrical & Lighting',
  'HVAC & Air Conditioning',
  'Sanitation & Cleanliness',
  'Furniture & Carpentry',
  'Laboratory Equipment',
  'Hostel Facilities',
  'Campus Security & Transport',
  'General Maintenance',
];

const SubmitComplaintPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    category: 'Network & Internet',
    location: '',
    priority: 'MEDIUM',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successComplaint, setSuccessComplaint] = useState(null);

  useEffect(() => {
    departmentApi.getDepartments(true)
      .then((res) => {
        if (res.success && res.data) {
          setDepartments(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, departmentId: res.data[0].id }));
          }
        }
      })
      .catch((err) => console.error('Failed to load active departments:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size must not exceed 5MB.');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim() || formData.title.length < 5) {
      setErrorMessage('Title must be at least 5 characters.');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setErrorMessage('Description must provide at least 10 characters of detail.');
      return;
    }
    if (!formData.departmentId) {
      setErrorMessage('Please select a department.');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('Please specify the campus location.');
      return;
    }

    setLoading(true);

    try {
      if (selectedFile) {
        const data = new FormData();
        const jsonBlob = new Blob([JSON.stringify(formData)], { type: 'application/json' });
        data.append('data', jsonBlob);
        data.append('file', selectedFile);

        const res = await complaintApi.createComplaint(data);
        if (res.success && res.data) {
          setSuccessComplaint(res.data);
        }
      } else {
        const res = await complaintApi.createComplaintJson(formData);
        if (res.success && res.data) {
          setSuccessComplaint(res.data);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit complaint. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2" style={{ maxWidth: '840px' }}>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-1">Submit a Complaint</h3>
        <p className="text-muted small mb-0">
          Report maintenance, IT, sanitation, or hostel issues. You will receive an instant tracking reference number.
        </p>
      </div>

      {errorMessage && (
        <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="card shadow-sm border-0 rounded-4 bg-white p-4 p-md-5">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">Complaint Title *</label>
            <input
              type="text"
              name="title"
              className="form-control form-control-lg fs-6"
              placeholder="e.g. Wi-Fi Access Point not working in CSE Lab 3"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <small className="text-muted">Be concise and specific.</small>
          </div>

          <div className="row g-3 mb-3">
            {/* Department */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Responsible Department *</label>
              <select
                name="departmentId"
                className="form-select"
                value={formData.departmentId}
                onChange={handleChange}
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small">Problem Category *</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categoryOptions.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="col-md-8">
              <label className="form-label fw-semibold text-secondary small">Specific Location *</label>
              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="e.g. Block B, 3rd Floor, Room 304 or LH-2"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* Priority */}
            <div className="col-md-4">
              <label className="form-label fw-semibold text-secondary small">Urgency / Priority *</label>
              <select
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="LOW">Low (Minor cosmetic issue)</option>
                <option value="MEDIUM">Medium (General repair)</option>
                <option value="HIGH">High (Disrupting class / lab)</option>
                <option value="URGENT">Urgent (Safety / Water / Power outage)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">Detailed Description *</label>
            <textarea
              name="description"
              className="form-control"
              rows="4"
              placeholder="Provide complete observations, error messages, when it started, and any symptoms..."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
            <small className="text-muted">Minimum 10 characters.</small>
          </div>

          {/* Attachment */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-secondary small">Attach Photo / Proof (Optional)</label>
            <input
              type="file"
              className="form-control"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileChange}
            />
            <small className="text-muted d-block mt-1">Allowed formats: PNG, JPG, WEBP, PDF (Max 5MB)</small>

            {filePreview && (
              <div className="mt-2 position-relative d-inline-block">
                <img
                  src={filePreview}
                  alt="Attachment Preview"
                  className="rounded border"
                  style={{ maxHeight: '140px', objectFit: 'contain' }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 translate-middle"
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  title="Remove attachment"
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            )}
          </div>

          <div className="d-flex align-items-center gap-3">
            <button
              type="submit"
              className="btn btn-primary-navy px-4 py-2 rounded-pill fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-check-circle-fill me-2"></i>
              )}
              {loading ? 'Submitting...' : 'Register Complaint'}
            </button>
            <button
              type="button"
              className="btn btn-light rounded-pill px-4"
              onClick={() => navigate('/student/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        show={!!successComplaint}
        title="Complaint Registered Successfully"
        onClose={() => navigate('/student/complaints')}
        footer={
          <div className="d-flex gap-2 w-100 justify-content-end">
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              onClick={() => navigate('/student/complaints')}
            >
              Go to My Complaints
            </button>
            <button
              className="btn btn-primary-navy btn-sm rounded-pill px-3"
              onClick={() => navigate(`/student/complaints/${successComplaint?.id}`)}
            >
              View Complaint Details
            </button>
          </div>
        }
      >
        <div className="text-center py-3">
          <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3 fs-2">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h5 className="fw-bold text-dark mb-1">Tracking Code Generated!</h5>
          <p className="text-muted small mb-3">Your complaint has been submitted and registered in the system.</p>

          <div className="p-3 bg-light rounded-3 border d-inline-block text-start mb-3">
            <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.68rem' }}>Reference Number</div>
            <div className="fs-4 fw-extrabold text-primary brand-font">{successComplaint?.referenceNumber}</div>
            <div className="small text-dark fw-medium mt-1">{successComplaint?.title}</div>
          </div>
          <p className="text-muted small mb-0">
            Administrators have been notified for staff allocation.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SubmitComplaintPage;
