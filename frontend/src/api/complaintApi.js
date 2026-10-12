import axiosClient from './axiosClient';

export const complaintApi = {
  createComplaint: (formData) => {
    return axiosClient.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createComplaintJson: (data) => axiosClient.post('/complaints', data),
  getMyComplaints: (params) => axiosClient.get('/complaints/my', { params }),
  getComplaintById: (id) => axiosClient.get(`/complaints/${id}`),
  getComplaintHistory: (id) => axiosClient.get(`/complaints/${id}/history`),
  getAllComplaints: (params) => axiosClient.get('/complaints', { params }),
  updateStatus: (id, data) => axiosClient.patch(`/complaints/${id}/status`, data),
  reopenComplaint: (id, data) => axiosClient.patch(`/complaints/${id}/reopen`, data),
  assignComplaint: (id, data) => axiosClient.post(`/complaints/${id}/assignments`, data),
  getAssignments: (id) => axiosClient.get(`/complaints/${id}/assignments`),
  getStaffComplaints: (params) => axiosClient.get('/staff/complaints', { params }),
};
