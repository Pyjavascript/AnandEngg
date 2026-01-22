import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api'

const API = `${BASE_URL}/api/admin`;

const authHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getAllUsers = async () => {
  const res = await axios.get(`${API}/users`, await authHeader());
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${API}/users/${id}`, await authHeader());
  return res.data;
};

export const updateUserRole = async (id, role) => {
  const res = await axios.put(
    `${API}/users/${id}/role`,
    { role },
    await authHeader()
  );
  return res.data;
};

export const updateUserStatus = async (id, status) => {
  const res = await axios.put(
    `${API}/users/${id}/status`,
    { status },
    await authHeader()
  );
  return res.data;
};

export const getUserByEmployeeId = async (employeeId) => {
  const res = await axios.get(`${BASE_URL}/api/users/${employeeId}`, await authHeader());
  return res.data;
};
