import axiosClient from './axiosClient';

export const departmentApi = {
  getDepartments: (activeOnly = false) => axiosClient.get(`/departments?activeOnly=${activeOnly}`),
  getDepartmentById: (id) => axiosClient.get(`/departments/${id}`),
  createDepartment: (data) => axiosClient.post('/departments', data),
  updateDepartment: (id, data) => axiosClient.put(`/departments/${id}`, data),
};
