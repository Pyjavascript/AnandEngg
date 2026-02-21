import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';

const API = `${BASE_URL}/api/roles`;

const authHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getPublicRoles = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const getAdminRoles = async () => {
  const res = await axios.get(`${API}/admin`, await authHeader());
  return res.data;
};

export const createRole = async payload => {
  const res = await axios.post(API, payload, await authHeader());
  return res.data;
};

export const deleteRole = async roleId => {
  const res = await axios.delete(`${API}/${roleId}`, await authHeader());
  return res.data;
};

export default {
  getPublicRoles,
  getAdminRoles,
  createRole,
  deleteRole,
};

