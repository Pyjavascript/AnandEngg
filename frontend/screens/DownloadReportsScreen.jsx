import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DownloadReportsScreen = () => {
  const navigation = useNavigation();

  // State
  const [reportType, setReportType] = useState('summary');
  const [status, setStatus] = useState('all');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Dropdown states
  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const reportTypes = [
    { value: 'summary', label: 'Summary Report' },
    { value: 'detailed', label: 'Detailed Report' },
    { value: 'inspection', label: 'Inspection Report' },
    { value: 'defect', label: 'Defect Analysis' },
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'inspector_approved', label: 'Inspector Approved' },
  ];

  useEffect(() => {
    fetchMetrics();
  }, [fromDate, toDate, status]);

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/report/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          from: fromDate.toISOString().split('T')[0],
          to: toDate.toISOString().split('T')[0],
          status: status === 'all' ? undefined : status,
        },
      });
      setMetrics(res.data);
    } catch (err) {
      console.log('Metrics error:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const params = {
        reportType,
        status: status === 'all' ? undefined : status,
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
        format,
      };

      const res = await axios.get(`${BASE_URL}/api/report/download`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: 'blob',
      });

      // In React Native, you would use react-native-fs or similar to save the file
      Alert.alert(
        'Download Started',
        `Your ${format.toUpperCase()} report is being prepared. You will be notified when it's ready.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.log('Download error:', err);
      Alert.alert('Error', 'Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const onFromDateChange = (event, selectedDate) => {
    setShowFromPicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToPicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'approved':
        return '#059669';
      case 'pending':
        return '#D97706';
      case 'rejected':
        return '#DC2626';
      case 'inspector_approved':
        return '#2563EB';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Download Reports</Text>
          <Text style={styles.headerSubtitle}>
            Export inspection data in multiple formats
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Card */}
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <Ionicons name="funnel" size={20} color="#286DA6" />
            <Text style={styles.filterTitle}>Report Filters</Text>
          </View>

          {/* Report Type */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Report Type</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowReportTypeDropdown(!showReportTypeDropdown)}
            >
              <Text style={styles.dropdownText}>
                {reportTypes.find(r => r.value === reportType)?.label}
              </Text>
              <Ionicons
                name={showReportTypeDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
            {showReportTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {reportTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setReportType(type.value);
                      setShowReportTypeDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        reportType === type.value && styles.dropdownItemTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                    {reportType === type.value && (
                      <Ionicons name="checkmark" size={18} color="#286DA6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Date Range */}
          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>From Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowFromPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#64748B" />
                <Text style={styles.dateText}>{formatDate(fromDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.label}>To Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowToPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#64748B" />
                <Text style={styles.dateText}>{formatDate(toDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <Text style={styles.dropdownText}>
                {statuses.find(s => s.value === status)?.label}
              </Text>
              <Ionicons
                name={showStatusDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
            {showStatusDropdown && (
              <View style={styles.dropdownMenu}>
                {statuses.map((stat) => (
                  <TouchableOpacity
                    key={stat.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setStatus(stat.value);
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        status === stat.value && styles.dropdownItemTextActive,
                      ]}
                    >
                      {stat.label}
                    </Text>
                    {status === stat.value && (
                      <Ionicons name="checkmark" size={18} color="#286DA6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Download Buttons */}
        <View style={styles.downloadCard}>
          <View style={styles.downloadHeader}>
            <Ionicons name="download-outline" size={20} color="#286DA6" />
            <Text style={styles.downloadTitle}>Export Options</Text>
          </View>

          <View style={styles.downloadButtons}>
            <TouchableOpacity
              style={[styles.downloadBtn, styles.pdfBtn]}
              onPress={() => handleDownload('pdf')}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="document-text" size={20} color="#FFFFFF" />
                  <Text style={styles.downloadBtnText}>Download PDF</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.downloadBtn, styles.csvBtn]}
              onPress={() => handleDownload('csv')}
              disabled={downloading}
            >
              <Ionicons name="document" size={20} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Download CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.downloadBtn, styles.excelBtn]}
              onPress={() => handleDownload('excel')}
              disabled={downloading}
            >
              <Ionicons name="grid" size={20} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Download Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.downloadBtn, styles.printBtn]}
              onPress={() => handleDownload('print')}
              disabled={downloading}
            >
              <Ionicons name="print" size={20} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Print Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quality Metrics */}
        {metrics && (
          <View style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>Quality Metrics</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Pass Rate</Text>
                <Text style={[styles.metricValue, { color: '#059669' }]}>
                  {metrics.passRate || '0%'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Total Inspections</Text>
                <Text style={[styles.metricValue, { color: '#2563EB' }]}>
                  {metrics.totalInspections || 0}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Avg Processing Time</Text>
                <Text style={[styles.metricValue, { color: '#7C3AED' }]}>
                  {metrics.avgTime || 'N/A'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Rejection Rate</Text>
                <Text style={[styles.metricValue, { color: '#DC2626' }]}>
                  {metrics.rejectionRate || '0%'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onFromDateChange}
          maximumDate={new Date()}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onToDateChange}
          maximumDate={new Date()}
          minimumDate={fromDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#286DA6',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#286DA6',
  },
  filterGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#286DA6',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateGroup: {
    flex: 1,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  downloadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  downloadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#286DA6',
  },
  downloadButtons: {
    gap: 12,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfBtn: {
    backgroundColor: '#DC2626',
  },
  csvBtn: {
    backgroundColor: '#059669',
  },
  excelBtn: {
    backgroundColor: '#2563EB',
  },
  printBtn: {
    backgroundColor: '#64748B',
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
  },
});

export default DownloadReportsScreen;