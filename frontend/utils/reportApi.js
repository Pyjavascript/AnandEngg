import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';

const API = `${BASE_URL}/api/report`;

const authHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getCategories = async () => {
  const res = await axios.get(`${API}/categories`, await authHeader());
  return res.data;
};

export const createCategory = async (name) => {
  const res = await axios.post(`${API}/categories`, { name }, await authHeader());
  return res.data;
};

export const createTemplate = async (data) => {
  const res = await axios.post(`${API}/templates`, data, await authHeader());
  return res.data;
};

export const createField = async (templateId, field) => {
  const res = await axios.post(`${API}/templates/${templateId}/fields`, field, await authHeader());
  return res.data;
};

export const uploadDiagram = async (templateId, file) => {
  const form = new FormData();
  form.append('diagram', file);
  const res = await axios.post(`${API}/templates/${templateId}/diagram`, form, {
    ...(await authHeader()),
    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${await AsyncStorage.getItem('token')}` },
  });
  return res.data;
};

export const getTemplatesByCategory = async (categoryId) => {
  const res = await axios.get(`${API}/templates/${categoryId}`, await authHeader());
  return res.data;
};

export const getAllSubmissions = async () => {
  const res = await axios.get(`${API}/submissions`, await authHeader());
  return res.data;
};

export const createSubmission = async (payload) => {
  const res = await axios.post(`${API}/submissions`, payload, await authHeader());
  return res.data;
};

export const getSubmissionById = async (id) => {
  const res = await axios.get(`${API}/submissions/${id}`, await authHeader());
  return res.data;
};

export const inspectorReviewSubmission = async (id, payload) => {
  const res = await axios.put(`${API}/submissions/${id}/inspect`, payload, await authHeader());
  return res.data;
};

export const managerReviewSubmission = async (id, payload) => {
  const res = await axios.put(`${API}/submissions/${id}/manager`, payload, await authHeader());
  return res.data;
};

export const rejectSubmission = async (id, payload = {}) => {
  const res = await axios.put(`${API}/submissions/${id}/reject`, payload, await authHeader());
  return res.data;
};

export const getTemplatesWithParts = async () => {
  const res = await axios.get(`${API}/templates-with-parts`, await authHeader());
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await axios.delete(`${API}/categories/${id}`, await authHeader());
  return res.data;
};

export const getAllInspectionReports = async () => {
  const res = await axios.get(`${API}/submissions`, await authHeader());
  return res.data;
};

export const getReportTypesWithStats = async () => {
  const submissions = await getAllSubmissions();
  const statsMap = {};
  (submissions || []).forEach((s) => {
    const key = s.template_label || 'Unknown';
    if (!statsMap[key]) {
      statsMap[key] = {
        report_type: key,
        submission_count: 0,
        first_created: s.created_at,
        last_created: s.created_at,
      };
    }
    statsMap[key].submission_count += 1;
    if (s.created_at && s.created_at < statsMap[key].first_created) {
      statsMap[key].first_created = s.created_at;
    }
    if (s.created_at && s.created_at > statsMap[key].last_created) {
      statsMap[key].last_created = s.created_at;
    }
  });
  return Object.values(statsMap);
};

export default {
  getCategories,
  createCategory,
  createTemplate,
  createField,
  uploadDiagram,
  getTemplatesByCategory,
  getAllSubmissions,
  createSubmission,
  getSubmissionById,
  inspectorReviewSubmission,
  managerReviewSubmission,
  rejectSubmission,
  deleteCategory,
  getTemplatesWithParts,
  getAllInspectionReports,
  getReportTypesWithStats,
};
