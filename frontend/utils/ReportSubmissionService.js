import axios from 'axios';
import BASE_URL from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const ReportSubmissionService = {
  async getAllSubmissions() {
    const res = await axios.get(`${BASE_URL}/api/reports`, {
      headers: await authHeader(),
    });
    return res.data;
  },
};
