import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';

const ReportsScreen = () => {
  const [role, setRole] = useState(null);
  useEffect(() => {
    const getRole = async () => {
      const userRole = await AsyncStorage.getItem('role');
      setRole(userRole);
    };
    getRole();
  }, []);
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
    // navigation logic to view the report details
    // for example:
    // navigation.navigate('ReportDetail', { reportId: id });
    alert(`Open report #${id}`);
  };

  // const [activeFilter, setActiveFilter] = useState('all');

  // const filters = [
  //   { id: 'all', label: 'All', count: 24 },
  //   { id: 'pending', label: 'Pending', count: 5 },
  //   { id: 'approved', label: 'Approved', count: 15 },
  //   { id: 'rejected', label: 'Rejected', count: 4 },
  // ];

  // const reports = [
  //   {
  //     id: 1,
  //     title: 'Cutting Inspection - Vestas',
  //     partNo: '29314225-2',
  //     date: '22/12/2024',
  //     status: 'approved',
  //     inspector: 'Rajesh Kumar',
  //   },
  //   {
  //     id: 2,
  //     title: 'Welding Quality Check',
  //     partNo: '29314225-5',
  //     date: '21/12/2024',
  //     status: 'pending',
  //     inspector: 'Rajesh Kumar',
  //   },
  //   {
  //     id: 3,
  //     title: 'Final Assembly Review',
  //     partNo: '29314225-1',
  //     date: '20/12/2024',
  //     status: 'approved',
  //     inspector: 'Rajesh Kumar',
  //   },
  //   {
  //     id: 4,
  //     title: 'Material Quality Report',
  //     partNo: '29314225-6',
  //     date: '19/12/2024',
  //     status: 'rejected',
  //     inspector: 'Rajesh Kumar',
  //   },
  // ];
  const [activeFilter, setActiveFilter] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
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
      }
    };

    useEffect(() => {
      fetchReports();
    }, []);

    return () => {
      mounted = false;
    };
  }, []);

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
        return { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'time' };
      case 'rejected':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
      case 'inspector_approved':
        return {
          bg: '#DBEAFE',
          text: '#1D4ED8',
          icon: 'checkmark-done-circle',
        };

      default:
        return { bg: '#E5E7EB', text: '#6B7280', icon: 'help-circle' };
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
        <View>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSubtitle}>
            View and manage your reports
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reports..."
              placeholderTextColor="#B0C4D8"
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
              <TouchableOpacity key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportTitleSection}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportPartNo}>
                      Part No: {report.part_no}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Ionicons
                      name={statusStyle.icon}
                      size={14}
                      color={statusStyle.text}
                    />
                    <Text
                      style={[styles.statusText, { color: statusStyle.text }]}
                    >
                      {report.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.reportFooter}>
                  <View style={styles.reportInfo}>
                    <Ionicons name="person-outline" size={14} color="#6B7280" />
                    <Text style={styles.reportInfoText}>
                      {/* {report.inspector} */}
                      You
                    </Text>
                  </View>
                  <View style={styles.reportInfo}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.reportInfoText}>
                      {new Date(report.created_at).toLocaleDateString('en-GB')}
                    </Text>
                  </View>
                </View>
                {/* Role-based actions */}
                {role === 'machine_operator' && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleViewReport(report.id)}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#fff"
                    />
                    <Text style={styles.actionBtnText}>View Report</Text>
                  </TouchableOpacity>
                )}

                {role === 'quality_inspector' &&
                  report.status === 'pending_inspector' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: '#059669' },
                        ]}
                        onPress={() => handleApprove(report.id, 'inspector')}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: '#DC2626' },
                        ]}
                        onPress={() => handleReject(report.id)}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                {role === 'quality_inspector' &&
                  report.status === 'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: '#059669' },
                        ]}
                        onPress={() => handleApprove(report.id, 'inspector')}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: '#DC2626' },
                        ]}
                        onPress={() => handleReject(report.id)}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                {role === 'quality_manager' &&
                  report.status === 'inspector_approved' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: '#059669' },
                        ]}
                        onPress={() => handleApprove(report.id, 'manager')}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { backgroundColor: '#DC2626' },
                        ]}
                        onPress={() => handleReject(report.id)}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFE',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
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
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  filterChipActive: {
    backgroundColor: '#286DA6',
    borderColor: '#286DA6',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  filterCountActive: {
    color: '#FFFFFF',
  },
  reportsSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  reportTitleSection: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportPartNo: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reportFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  reportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },

  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#286DA6',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },

  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReportsScreen;
