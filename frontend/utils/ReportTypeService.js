// utils/ReportTypeService.js
import axios from 'axios';
import BASE_URL from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const ReportTypeService = {
  async getAllReportTypes() {
    const res = await axios.get(`${BASE_URL}/api/report-templates`, {
      headers: await authHeader(),
    });
    return res.data;
  },

  async addReportType(payload) {
    const res = await axios.post(
      `${BASE_URL}/api/admin/report-templates`,
      payload,
      { headers: await authHeader() },
    );
    return { success: true, data: res.data };
  },
};
