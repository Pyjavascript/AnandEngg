import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import reportApi from '../utils/reportApi';
import { useAppTheme } from '../theme/ThemeProvider';

const ReportsScreen = () => {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);

  const navigation = useNavigation();
  const [role, setRole] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    visible: false,
    report: null,
  });

  useEffect(() => {
    const getRole = async () => {
      const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');
      setRole(user?.role || null);
    };
    getRole();
  }, []);

  const fetchReports = async () => {
    try {
      const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');
      const [submissionRes, notificationRes] = await Promise.all([
        reportApi.getAllSubmissions(),
        reportApi.getNotifications().catch(() => []),
      ]);
      const data = Array.isArray(submissionRes) ? submissionRes : [];
      setNotifications(Array.isArray(notificationRes) ? notificationRes : []);

      if (user?.role === 'machine_operator' && user?.id) {
        setReports(data.filter(r => Number(r.submitted_by) === Number(user.id)));
      } else {
        setReports(data);
      }
    } catch (err) {
      console.log('FETCH SUBMISSIONS ERROR:', err.response?.data || err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchReports();
      const id = setInterval(() => {
        fetchReports();
      }, 12000);
      return () => clearInterval(id);
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleApprove = async (id, roleType) => {
    try {
      if (roleType === 'inspector') {
        await reportApi.inspectorReviewSubmission(id, {
          observation: '',
          remarks: '',
        });
      } else {
        await reportApi.managerReviewSubmission(id, {
          approved: true,
          remarks: '',
        });
      }
      alert('Submission approved successfully');
      fetchReports();
    } catch (err) {
      console.log('APPROVE ERROR:', err.response?.data || err.message);
    }
  };

  const handleReject = async id => {
    try {
      await reportApi.rejectSubmission(id, {});
      alert('Submission rejected');
      fetchReports();
    } catch (err) {
      console.log('REJECT ERROR:', err.response?.data || err.message);
    }
  };

  const handleViewReport = id => {
    navigation.navigate('ReportDetail', { reportId: id });
  };

  const handleDeleteReport = id => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportApi.deleteSubmission(id);
              await fetchReports();
            } catch (err) {
              Alert.alert(
                'Delete Failed',
                err?.response?.data?.message || 'Unable to delete report.',
              );
            }
          },
        },
      ],
    );
  };

  const handleReportLongPress = report => {
    if (role !== 'machine_operator') return;
    setReportOptions({ visible: true, report });
  };

  const unreadNotificationCount = notifications.filter(
    item => Number(item.is_read) !== 1,
  ).length;

  const openNotifications = async () => {
    setNotificationsVisible(true);
    if (unreadNotificationCount > 0) {
      try {
        await reportApi.markNotificationsRead();
        setNotifications(prev => prev.map(item => ({ ...item, is_read: 1 })));
      } catch (err) {
        console.log('Failed to mark notifications read', err);
      }
    }
  };

  const counts = {
    all: reports.length,
    draft: reports.filter(r => r.status === 'draft').length,
    pending: reports.filter(r => (r.status || 'submitted') === 'submitted').length,
    approved: reports.filter(r => r.status === 'manager_approved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  const filters = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'draft', label: 'Draft', count: counts.draft },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'approved', label: 'Approved', count: counts.approved },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  const getStatusColor = status => {
    switch (status) {
      case 'approved':
      case 'manager_approved':
        return { bg: '#ECFDF5', text: '#059669', icon: 'checkmark-circle' };
      case 'pending':
      case 'submitted':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'time-outline' };
      case 'draft':
        return { bg: '#EEF2FF', text: '#4F46E5', icon: 'save-outline' };
      case 'rejected':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
      case 'inspector_approved':
      case 'inspector_reviewed':
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
      : reports.filter(r => {
          const status = r.status || 'submitted';
          if (activeFilter === 'draft') return status === 'draft';
          if (activeFilter === 'pending') return status === 'submitted';
          if (activeFilter === 'approved') return status === 'manager_approved';
          return status === activeFilter;
        });

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
              style={styles.notificationBtn}
              onPress={openNotifications}
            >
              <Ionicons name="notifications-outline" size={20} color="#286DA6" />
              {unreadNotificationCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
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
                onLongPress={() => handleReportLongPress(report)}
                delayLongPress={350}
                activeOpacity={0.7}
              >
                {/* Top Section */}
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.reportTitle} numberOfLines={1}>
                      {report.template_label || 'Inspection Submission'}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.partNo}>Template ID: {report.template_id}</Text>
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
                    <Text style={styles.bylineText}>
                      Submitted by: {report.submitted_by_name || report.submitted_by || 'Unknown'}
                    </Text>
                    {(report.inspector_name || report.manager_name) ? (
                      <Text style={styles.bylineText}>
                        {report.manager_name
                          ? `Manager: ${report.manager_name}`
                          : `Inspector: ${report.inspector_name}`}
                      </Text>
                    ) : null}
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
                      {report.status === 'inspector_reviewed'
                        ? 'Approved by Inspector'
                        : report.status === 'manager_approved'
                        ? 'Approved'
                        : report.status === 'rejected' && report.manager_id
                        ? 'Rejected by Manager'
                        : report.status === 'rejected' && report.inspector_id
                        ? 'Rejected by Inspector'
                        : report.status}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                {((role === 'quality_inspector' &&
                  (report.status === 'pending_inspector' ||
                    report.status === 'pending' ||
                    report.status === 'submitted')) ||
                  (role === 'quality_manager' &&
                    (report.status === 'inspector_approved' ||
                      report.status === 'inspector_reviewed'))) && (
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

      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotificationsVisible(false)}>
                <Ionicons name="close" size={22} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <Text style={styles.modalEmptyText}>No notifications yet.</Text>
              ) : (
                notifications.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.notificationItem}
                    onPress={() => {
                      setNotificationsVisible(false);
                      if (item.related_submission_id) {
                        navigation.navigate('ReportDetail', {
                          reportId: item.related_submission_id,
                        });
                      }
                    }}
                  >
                    <View style={styles.notificationDot} />
                    <View style={styles.notificationTextWrap}>
                      <Text style={styles.notificationItemTitle}>{item.title}</Text>
                      <Text style={styles.notificationItemMessage}>{item.message}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reportOptions.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportOptions({ visible: false, report: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Report Options</Text>
                <Text style={styles.actionSheetSubtitle}>
                  {reportOptions.report?.template_label || 'Inspection Submission'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReportOptions({ visible: false, report: null })}>
                <Ionicons name="close" size={22} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                const reportId = reportOptions.report?.id;
                setReportOptions({ visible: false, report: null });
                if (reportId) {
                  handleViewReport(reportId);
                }
              }}
            >
              <Ionicons name="eye-outline" size={18} color={C.primarySoft} />
              <Text style={styles.optionRowText}>View report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionRow, styles.optionRowDanger]}
              onPress={() => {
                const reportId = reportOptions.report?.id;
                setReportOptions({ visible: false, report: null });
                if (reportId) {
                  handleDeleteReport(reportId);
                }
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
              <Text style={styles.optionRowDangerText}>Delete report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = C => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    backgroundColor: C.surface,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.textStrong,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: C.textMuted,
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
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textBody,
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
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: {
    backgroundColor: '#286DA6',
    borderColor: '#286DA6',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
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
    color: C.textMuted,
  },
  filterCountActive: {
    color: '#FFFFFF',
  },
  reportsSection: {
    paddingHorizontal: 20,
    gap: 10,
  },
  reportCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.textBody,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partNo: {
    fontSize: 12,
    color: C.textMuted,
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
    color: C.textMuted,
    fontWeight: '500',
  },
  bylineText: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 4,
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
    borderTopColor: C.border,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  modalCard: {
    maxHeight: '70%',
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.textStrong,
  },
  modalEmptyText: {
    fontSize: 14,
    color: C.textMuted,
    paddingVertical: 18,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: C.primarySoft,
    marginTop: 5,
  },
  notificationTextWrap: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textBody,
  },
  notificationItemMessage: {
    marginTop: 4,
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 17,
  },
  actionSheet: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  actionSheetSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  optionRowDanger: {
    marginTop: 2,
  },
  optionRowText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textBody,
  },
  optionRowDangerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});

export default ReportsScreen;
