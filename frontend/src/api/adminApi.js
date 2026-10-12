import axiosClient from './axiosClient';

export const adminApi = {
  getDashboardStats: () => axiosClient.get('/admin/dashboard'),
  getReports: () => axiosClient.get('/admin/reports'),
  getUsers: (params) => axiosClient.get('/admin/users', { params }),
  updateUserStatus: (id, active) => axiosClient.patch(`/admin/users/${id}/active`, { active }),
  createStaffUser: (data) => axiosClient.post('/admin/users/staff', data),
  getStaffByDept: (deptId) => axiosClient.get('/admin/staff-by-dept', { params: { departmentId: deptId } }),
};
