import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';
import { useNavigation } from '@react-navigation/native';

const ReportsScreen = () => {
  const navigation = useNavigation();
  const [role, setRole] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const getRole = async () => {
      const userRole = await AsyncStorage.getItem('role');
      setRole(userRole);
    };
    getRole();
  }, []);

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/api/report/my-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(res.data);
    } catch (err) {
      console.log('FETCH REPORTS ERROR:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleApprove = async (id, role) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const endpoint =
        role === 'inspector'
          ? `${BASE_URL}/api/report/approve/inspector/${id}`
          : `${BASE_URL}/api/report/approve/manager/${id}`;

      await axios.put(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert('Report approved successfully');
      fetchReports();
    } catch (err) {
      console.log('APPROVE ERROR:', err.response?.data || err.message);
    }
  };

  const handleReject = async id => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/report/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert('Report rejected');
      fetchReports();
    } catch (err) {
      console.log('REJECT ERROR:', err.response?.data || err.message);
    }
  };

  const handleViewReport = id => {
    navigation.navigate('ReportDetail', { reportId: id });
  };

  const counts = {
    all: reports.length,
    pending: reports.filter(r => (r.status || 'pending') === 'pending').length,
    approved: reports.filter(r => r.status === 'approved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  const filters = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'approved', label: 'Approved', count: counts.approved },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  const getStatusColor = status => {
    switch (status) {
      case 'approved':
        return { bg: '#ECFDF5', text: '#059669', icon: 'checkmark-circle' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'time-outline' };
      case 'rejected':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
      case 'inspector_approved':
        return {
          bg: '#EFF6FF',
          text: '#2563EB',
          icon: 'checkmark-done-circle',
        };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'help-circle' };
    }
  };

  const filteredReports =
    activeFilter === 'all'
      ? reports
      : reports.filter(r => (r.status || 'pending') === activeFilter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Reports</Text>
            <Text style={styles.headerSubtitle}>
              {reports.length} {reports.length === 1 ? 'report' : 'reports'}{' '}
              total
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.downloadNavBtn}
              onPress={() => navigation.navigate('DownloadReports')}
            >
              <Ionicons name="download-outline" size={22} color="#286DA6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#286DA6" />
              ) : (
                <Ionicons name="refresh" size={22} color="#286DA6" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by part number or title..."
              placeholderTextColor="#B0B7C3"
            />
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  activeFilter === filter.id && styles.filterLabelActive,
                ]}
              >
                {filter.label}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  activeFilter === filter.id && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterCount,
                    activeFilter === filter.id && styles.filterCountActive,
                  ]}
                >
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reports List */}
        <View style={styles.reportsSection}>
          {filteredReports.map(report => {
            const statusStyle = getStatusColor(report.status);
            return (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() => handleViewReport(report.id)}
                activeOpacity={0.7}
              >
                {/* Top Section */}
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.reportTitle} numberOfLines={1}>
                      {report.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.partNo}>Part: {report.part_no}</Text>
                      <View style={styles.dotSeparator} />
                      <Text style={styles.dateText}>
                        {new Date(report.created_at).toLocaleDateString(
                          'en-GB',
                          {
                            day: 'numeric',
                            month: 'short',
                          },
                        )}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Ionicons
                      name={statusStyle.icon}
                      size={12}
                      color={statusStyle.text}
                    />
                    <Text
                      style={[styles.statusText, { color: statusStyle.text }]}
                    >
                      {report.status === 'inspector_approved'
                        ? 'Reviewed'
                        : report.status}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                {((role === 'quality_inspector' &&
                  (report.status === 'pending_inspector' ||
                    report.status === 'pending')) ||
                  (role === 'quality_manager' &&
                    report.status === 'inspector_approved')) && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() =>
                        handleApprove(
                          report.id,
                          role === 'quality_inspector'
                            ? 'inspector'
                            : 'manager',
                        )
                      }
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#059669"
                      />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleReject(report.id)}
                    >
                      <Ionicons name="close-circle" size={16} color="#DC2626" />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredReports.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'Create your first report to get started'
                : `No ${activeFilter} reports available`}
            </Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#286DA6',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  filtersContainer: {
    paddingLeft: 20,
    marginBottom: 12,
  },
  filtersContent: {
    paddingRight: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#286DA6',
    borderColor: '#286DA6',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterCountActive: {
    color: '#FFFFFF',
  },
  reportsSection: {
    paddingHorizontal: 20,
    gap: 10,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardLeft: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partNo: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
  },
  approveBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  approveBtnText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default ReportsScreen;
