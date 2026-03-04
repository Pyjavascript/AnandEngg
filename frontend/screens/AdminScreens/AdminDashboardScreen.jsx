import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from '../../config/api';
import { useAppTheme } from '../../theme/ThemeProvider';

const AdminDashboardScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ name: 'Admin' });
  const [stats, setStats] = useState({});

  // Load user data
  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserData({ name: user.name || 'Admin' });
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
            totalUsers: Number(data.users ?? data.totalUsers ?? 0),
            totalSubmittedReports: Number(
              data.reports ?? data.totalSubmittedReports ?? 0,
            ),
            totalRoles: Number(data.roles ?? data.totalRoles ?? 0),
            systemHealth: 'Good',
          });
          console.log('Admin stats loaded', data);
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
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    navigation.replace('AuthScreen');
  };

  const adminModules = [
    {
      id: 1,
      title: 'Manage Users',
      description: 'View, edit, and manage employee accounts',
      icon: 'people',
      color: '#2F5BFF',
      screen: 'ManageUsers',
      stat: stats.totalUsers,
      statLabel: 'Total Users',
    },
    {
      id: 2,
      title: 'Manage Roles',
      description: 'Create, edit, and manage user roles',
      icon: 'shield-checkmark',
      color: '#12B981',
      screen: 'ManageRoles',
      stat: stats.totalRoles,
      statLabel: 'Roles',
    },
    {
      id: 3,
      title: 'Manage Reports',
      description: 'Configure report types and view submissions',
      icon: 'document-text',
      color: '#F59E0B',
      screen: 'ManageReports',
      stat: stats.totalSubmittedReports,
      statLabel: 'Reports',
    },
  ];

  const overviewStats = [
    {
      id: 1,
      label: 'Total Users',
      value: stats.totalUsers ?? 0,
      icon: 'people-outline',
      color: '#2F5BFF',
    },
    {
      id: 2,
      label: 'Total Roles',
      value: stats.totalRoles ?? 0,
      icon: 'shield-checkmark-outline',
      color: '#12B981',
    },
    {
      id: 3,
      label: 'Total Reports',
      value: stats.totalSubmittedReports ?? 0,
      icon: 'document-text-outline',
      color: '#F59E0B',
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
          <View style={styles.headerTextWrap}>
            <View style={styles.headerPill}>
              <Ionicons name="sparkles-outline" size={14} color="#0D4D7C" />
              <Text style={styles.headerPillText}>Control Center</Text>
            </View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Inspection Control Panel - {userData.name}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={28} color="#2F5BFF" />
          </View>
        </View>
        <Pressable style={styles.themeSwitch} onPress={toggleTheme}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={16}
            color={C.primarySoft}
          />
          <Text style={styles.themeSwitchText}>
            {isDark ? 'Light' : 'Dark'} mode
          </Text>
        </Pressable>

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
                    {/* <Pressable style={styles.moduleArrow}>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#7B8595"
                      />
                    </Pressable> */}
                  </View>

                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>
                    {module.description}
                  </Text>

                  {/* <View style={styles.moduleOptions}>
                    <View style={styles.moduleOptionChip}>
                      <Ionicons name="flash-outline" size={12} color="#334155" />
                      <Text style={styles.moduleOptionText}>Quick Access</Text>
                    </View>
                    <View style={styles.moduleOptionChip}>
                      <Ionicons name="grid-outline" size={12} color="#334155" />
                      <Text style={styles.moduleOptionText}>Options</Text>
                    </View>
                  </View> */}

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

const createStyles = C => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
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
    paddingBottom: 28,
    backgroundColor: C.headerBg,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerTextWrap: { flex: 1, paddingRight: 10 },
  headerPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  headerPillText: {
    fontSize: 11,
    color: C.primarySoft,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 27,
    fontWeight: '800',
    color: '#123A59',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: '500',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeSwitch: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  themeSwitchText: {
    color: C.primarySoft,
    fontSize: 12,
    fontWeight: '700',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: C.textStrong,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
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
    fontSize: 17,
    fontWeight: '700',
    color: C.textBody,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: C.textSubtle,
    fontWeight: '500',
    textAlign: 'center',
  },
  modulesSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modulesGrid: {
    gap: 16,
  },
  moduleCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  moduleCardPressed: {
    opacity: 0.95,
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textBody,
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  moduleOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  moduleOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  moduleOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
  },
  moduleStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surfaceAlt,
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
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.textStrong,
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
    color: C.textMuted,
    lineHeight: 16,
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: C.surface,
    margin: 20,
    padding: 15,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
});
