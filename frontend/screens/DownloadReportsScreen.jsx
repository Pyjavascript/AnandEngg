import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import reportApi from '../utils/reportApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';

const DownloadReportsScreen = () => {
  const navigation = useNavigation();

  // State
  const [reportType, setReportType] = useState('all');
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
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('all');
  const [reportOptions, setReportOptions] = useState([
    { value: 'all', label: 'All Reports' },
  ]);

  const [reportTypes, setReportTypes] = useState([
    { value: 'all', label: 'All Types' },
  ]);

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'inspector_reviewed', label: 'Inspector Reviewed' },
    { value: 'manager_approved', label: 'Manager Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const submissions = await reportApi.getAllSubmissions();
      const items = Array.isArray(submissions) ? submissions : [];
      const typeMap = new Map();
      items.forEach((item) => {
        const label = item.template_label || 'Unknown';
        if (!typeMap.has(label)) {
          typeMap.set(label, { value: label, label });
        }
      });
      setReportTypes([
        { value: 'all', label: 'All Types' },
        ...Array.from(typeMap.values()),
      ]);

      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      const filtered = items.filter(item => {
        const created = item.created_at ? new Date(item.created_at) : null;
        const inRange = created ? created >= from && created <= to : true;
        const byStatus = status === 'all' ? true : item.status === status;
        const byType = reportType === 'all'
          ? true
          : (item.template_label || 'Unknown') === reportType;
        return inRange && byStatus && byType;
      });

      const options = filtered.map((item) => ({
        value: String(item.id),
        label: `#${item.id} - ${item.template_label || 'Inspection Report'} (${new Date(item.created_at).toLocaleDateString('en-GB')})`,
      }));
      setReportOptions([{ value: 'all', label: 'All Reports' }, ...options]);
      if (selectedReportId !== 'all' && !options.find(o => o.value === selectedReportId)) {
        setSelectedReportId('all');
      }

      const total = filtered.length;
      const approved = filtered.filter(f => f.status === 'manager_approved').length;
      const rejected = filtered.filter(f => f.status === 'rejected').length;

      setMetrics({
        passRate: total ? `${Math.round((approved / total) * 100)}%` : '0%',
        totalInspections: total,
        avgTime: 'N/A',
        rejectionRate: total ? `${Math.round((rejected / total) * 100)}%` : '0%',
      });
    } catch (err) {
      console.log('Metrics error:', err);
    } finally {
      setLoadingMetrics(false);
    }
  }, [fromDate, toDate, status, reportType, selectedReportId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Session Expired', 'Please login again.');
        return;
      }

      const query = [
        `format=${encodeURIComponent(format)}`,
        `reportType=${encodeURIComponent(reportType)}`,
        `status=${encodeURIComponent(status)}`,
        `fromDate=${encodeURIComponent(fromDate.toISOString().split('T')[0])}`,
        `toDate=${encodeURIComponent(toDate.toISOString().split('T')[0])}`,
        `submissionId=${encodeURIComponent(selectedReportId)}`,
        `token=${encodeURIComponent(token)}`,
      ].join('&');
      const url = `${BASE_URL}/api/report/download?${query}`;
      await Linking.openURL(url);
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

          {/* Manual Report Selection */}
          <View style={styles.filterGroup}>
            <Text style={styles.label}>Select Report (Manual)</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowReportDropdown(!showReportDropdown)}
            >
              <Text style={styles.dropdownText}>
                {reportOptions.find(r => r.value === selectedReportId)?.label}
              </Text>
              <Ionicons
                name={showReportDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
            {showReportDropdown && (
              <View style={styles.dropdownMenu}>
                {reportOptions.map((report) => (
                  <TouchableOpacity
                    key={report.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedReportId(report.value);
                      setShowReportDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedReportId === report.value && styles.dropdownItemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {report.label}
                    </Text>
                    {selectedReportId === report.value && (
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

          </View>
        </View>

        {/* Quality Metrics */}
        {metrics && (
          <View style={styles.metricsCard}>
            <View style={styles.metricsHeader}>
              <Text style={styles.metricsTitle}>Quality Metrics</Text>
              {loadingMetrics ? (
                <ActivityIndicator size="small" color="#286DA6" />
              ) : null}
            </View>

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
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
