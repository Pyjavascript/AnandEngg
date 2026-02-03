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

export const deleteCategory = async (id) => {
  const res = await axios.delete(`${API}/categories/${id}`, await authHeader());
  return res.data;
};

export default {
  getCategories,
  createCategory,
  createTemplate,
  uploadDiagram,
  getTemplatesByCategory,
  getAllSubmissions,
  deleteCategory,
};
