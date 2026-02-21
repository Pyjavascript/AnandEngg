import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import reportApi from '../utils/reportApi';
import { theme } from '../theme/designSystem';

const DashboardScreen = ({ navigation }) => {
  const defaultAvatar =
    'https://ui-avatars.com/api/?name=User&background=286DA6&color=fff&size=200';

  const [userData, setUserData] = useState({
    name: '',
    role: '',
    employeeId: '',
    avatar: defaultAvatar,
  });

  const [reports, setReports] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load user data
  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (!storedUser) return;

          const user = JSON.parse(storedUser);

          setUserData({
            name: user.name || '',
            role: user.role || '',
            employeeId: user.employee_id || user.employeeId || '',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name || 'User',
            )}&background=286DA6&color=fff&size=200`,
          });
        } catch (err) {
          console.log('Failed to load user data', err);
        }
      };

      loadUser();
    }, []),
  );

  // Fetch reports data
  useFocusEffect(
    React.useCallback(() => {
      const fetchReports = async () => {
        setLoadingStats(true);
        try {
          const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');
          const all = await reportApi.getAllSubmissions();
          const mine = Array.isArray(all)
            ? all.filter(r => Number(r.submitted_by) === Number(user.id))
            : [];
          setReports(mine);
        } catch (err) {
          console.log('Failed to fetch reports', err);
        } finally {
          setLoadingStats(false);
        }
      };

      fetchReports();
    }, []),
  );

  // Calculate stats from reports
  const totalReports = reports.length;
  const approvedReports = reports.filter(r => r.status === 'manager_approved').length;
  const pendingReports = reports.filter(
    r => (r.status || 'submitted') === 'submitted' || r.status === 'inspector_reviewed',
  ).length;
  const rejectedReports = reports.filter(r => r.status === 'rejected').length;

  const quickActions = [
    {
      id: 1,
      icon: 'download-outline',
      label: 'Download Reports',
      color: '#286DA6',
      screen: 'DownloadReports',
    },
  ];

  const todayStats = [
    {
      id: 1,
      label: 'Approved',
      value: loadingStats ? '-' : approvedReports.toString(),
      icon: 'checkmark-circle',
      color: '#10B981',
    },
    {
      id: 2,
      label: 'Pending',
      value: loadingStats ? '-' : pendingReports.toString(),
      icon: 'time',
      color: '#F59E0B',
    },
    {
      id: 3,
      label: 'Rejected',
      value: loadingStats ? '-' : rejectedReports.toString(),
      icon: 'close-circle',
      color: '#EF4444',
    },
    {
      id: 4,
      label: 'Total',
      value: loadingStats ? '-' : totalReports.toString(),
      icon: 'cellular',
      color: '#2563EB',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with User Info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{userData.name || 'User'}</Text>
              <Text style={styles.userRole}>{userData.role || 'Loading...'}</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarContainer}
            >
              <Image
                source={{ uri: userData.avatar || defaultAvatar }}
                style={styles.avatar}
              />
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          {/* Employee ID Badge */}
          <View style={styles.employeeIdBadge}>
            <Ionicons name="card" size={16} color="#286DA6" />
            <Text style={styles.employeeIdText}>
              {userData.employeeId || '-'}
            </Text>
          </View>
        </View>

        {/* Today's Summary - Compact */}
        <View style={styles.todaySummary}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Reports Overview</Text>
            {loadingStats && (
              <ActivityIndicator size="small" color="#286DA6" />
            )}
          </View>
          <View style={styles.todayStatsRow}>
            {todayStats.map(stat => (
              <View key={stat.id} style={styles.todayStatItem}>
                <Ionicons name={stat.icon} size={22} color={stat.color} />
                <Text style={[styles.todayStatValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.todayStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <Pressable
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Reports Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <Pressable onPress={() => navigation.navigate('Reports')}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          {loadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#286DA6" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : reports.length > 0 ? (
            reports.slice(0, 3).map(report => (
              <Pressable
                key={report.id}
                style={styles.reportCard}
                onPress={() =>
                  navigation.navigate('ReportDetail', { reportId: report.id })
                }
              >
                <View style={styles.reportLeft}>
                  <View style={styles.reportIconContainer}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#286DA6"
                    />
                  </View>
                  <View style={styles.reportContent}>
                    <Text style={styles.reportTitle} numberOfLines={1}>
                      {report.template_label || 'Inspection Submission'}
                    </Text>
                    <Text style={styles.reportMeta}>
                      Template ID: {report.template_id}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    report.status === 'manager_approved' && styles.statusDotApproved,
                    report.status === 'submitted' && styles.statusDotPending,
                    report.status === 'rejected' && styles.statusDotRejected,
                    report.status === 'inspector_reviewed' &&
                      styles.statusDotReviewed,
                  ]}
                />
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#CBD5E1"
              />
              <Text style={styles.emptyStateText}>No reports yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your reports will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const C = theme.colors;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    backgroundColor: C.headerBg,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#DBEAFE',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: C.textStrong,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#DBEAFE',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  employeeIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  employeeIdText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  todaySummary: {
    backgroundColor: C.surface,
    margin: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  todayStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  todayStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  todayStatValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  todayStatLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#286DA6',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 80,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: C.surface,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  reportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  statusDotApproved: {
    backgroundColor: '#10B981',
  },
  statusDotPending: {
    backgroundColor: '#F59E0B',
  },
  statusDotRejected: {
    backgroundColor: '#EF4444',
  },
  statusDotReviewed: {
    backgroundColor: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: C.surface,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
});

export default DashboardScreen; 
