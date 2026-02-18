import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
// import { AdminStatsService } from '../../utils/mockData';
import { getAdminStats } from '../../utils/adminApi';

import CustomAlert from '../../components/CustomAlert';
import BASE_URL from '../../config/api';

const AdminDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ name: 'Admin' });
  const [alert, setAlert] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });
  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };
  const [stats, setStats] = useState({});

  // Load user data
  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            // const user = JSON.parse(storedUser);
            // setUserData({ name: user.nameX || 'Admin' });
          }
        } catch (err) {
          console.log('Failed to load user data', err);
        }
      };

      loadUser();
    }, []),
  );

  // Load admin stats
  useFocusEffect(
    React.useCallback(() => {
      const loadStats = async () => {
        setLoading(true);
        try {
          // const data = await AdminStatsService.getverviewStats();
          // setStats(data);
          const token = await AsyncStorage.getItem('token');

          const res = await fetch(`${BASE_URL}/api/admin/getStats`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            throw new Error('Failed to fetch admin stats');
          }
          const data = await res.json();
          setStats({
            totalUsers: data.users,
            totalSubmittedReports: data.reports,
            totalRoles:data.roles,
            systemHealth: 'Good',
          });
          console.log('Admin stats loaded', data);
          console.log(stats);
        } catch (err) {
          console.log('Failed to load stats', err);
        } finally {
          setLoading(false);
        }
      };

      loadStats();
    }, []),
  );

  const handleLogout = async () => {
    showAlert('info', 'Logging out');

    setTimeout(async () => {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      navigation.replace('AuthScreen');
    }, 1200);
  };

  const adminModules = [
    {
      id: 1,
      title: 'Manage Users',
      description: 'View, edit, and manage employee accounts',
      icon: 'people',
      color: '#286DA6',
      screen: 'ManageUsers',
      stat: stats.totalUsers,
      statLabel: 'Total Users',
    },
    {
      id: 2,
      title: 'Manage Roles',
      description: 'Create, edit, and manage user roles',
      icon: 'shield-checkmark',
      color: '#8B5CF6',
      screen: 'ManageRoles',
      stat: stats.totalRoles,
      statLabel: 'Roles',
    },
    {
      id: 3,
      title: 'Manage Reports',
      description: 'Configure report types and view submissions',
      icon: 'document-text',
      color: '#EC4899',
      screen: 'ManageReports',
      stat: stats.totalSubmittedReports,
      statLabel: 'Reports',
    },
  ];

  const overviewStats = [
    {
      id: 1,
      label: 'Active Users',
      value: stats.totalUsers,
      icon: 'checkmark-circle',
      color: '#10B981',
    },
    {
      id: 2,
      label: 'Report Types',
      value: stats.totalReportTypes,
      icon: 'layers',
      color: '#F59E0B',
    },
    {
      id: 3,
      label: 'System Status',
      value: stats.systemHealth,
      icon: 'pulse',
      color: '#2563EB',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Admin Panel</Text>
            <Text style={styles.subtitle}>Welcome, {userData.name}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="settings" size={32} color="#286DA6" />
          </View>
        </View>

        {/* Overview Stats Row */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#286DA6"
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={styles.statsRow}>
              {overviewStats.map(stat => (
                <View key={stat.id} style={styles.statCard}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: `${stat.color}15` },
                    ]}
                  >
                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Admin Modules Grid */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Admin Modules</Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#286DA6"
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={styles.modulesGrid}>
              {adminModules.map(module => (
                <Pressable
                  key={module.id}
                  style={({ pressed }) => [
                    styles.moduleCard,
                    pressed && styles.moduleCardPressed,
                  ]}
                  onPress={() => navigation.navigate(module.screen)}
                >
                  {/* Color accent bar */}
                  <View
                    style={[
                      styles.moduleAccent,
                      { backgroundColor: module.color },
                    ]}
                  />

                  <View style={styles.moduleHeader}>
                    <View
                      style={[
                        styles.moduleIcon,
                        { backgroundColor: `${module.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={module.icon}
                        size={28}
                        color={module.color}
                      />
                    </View>
                    <Pressable style={styles.moduleArrow}>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#B0C4D8"
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>
                    {module.description}
                  </Text>

                  {/* Stat badge */}
                  <View style={styles.moduleStat}>
                    <Ionicons
                      name="layers-outline"
                      size={14}
                      color={module.color}
                    />
                    <Text
                      style={[styles.moduleStatText, { color: module.color }]}
                    >
                      {module.stat} {module.statLabel}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Quick Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
            <Text style={styles.tipTitle}>Quick Tips</Text>
          </View>

          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>
                Always confirm before deleting users or roles
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>
                Protected roles (like admin) cannot be deleted
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>
                Changes to users and roles take effect immediately
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFE',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#286DA6',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  modulesSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modulesGrid: {
    gap: 16,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  moduleCardPressed: {
    opacity: 0.95,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  moduleAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  moduleStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  moduleStatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    margin: 20,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
});
