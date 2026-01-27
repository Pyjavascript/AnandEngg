import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';

const API = `${BASE_URL}/api/admin`;

const authHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const getAdminStats = async () => {
  const res = await axios.get(`${API}/stats`, await authHeader());
  return res.data;
};
