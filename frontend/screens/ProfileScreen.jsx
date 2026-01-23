import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import CustomAlert from '../components/CustomAlert';
import BASE_URL from '../config/api';

const ProfileScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [alert, setAlert] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });
  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };

  // ✅ ALL useState FIRST
  const [userData, setUserData] = useState({
    name: '',
    employeeId: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    avatar: '',
  });
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
            employeeId: user.employeeId || user.employee_id || '',
            email: user.email || '',
            phone: user.phone || '',
            department: user.department || '',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name || 'User',
            )}&background=286DA6&color=fff&size=200`,
          });
        } catch (err) {
          console.log('Failed to load profile user', err);
        }
      };

      loadUser();
    }, []),
  );
  useFocusEffect(
    React.useCallback(() => {
      const fetchMyReports = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) return;

          const res = await fetch(`${BASE_URL}/api/report/my-reports`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          const reportsArray = Array.isArray(data)
            ? data
            : Array.isArray(data.reports)
            ? data.reports
            : [];

          setReports(reportsArray);
        } catch (err) {
          console.log('Failed to load report stats', err);
        } finally {
          setLoadingStats(false);
        }
      };

      fetchMyReports();
    }, []),
  );
  const totalReports = reports.length;

  const approvedReports = reports.filter(r => r.status === 'approved').length;

  const inProcessReports = reports.filter(
    r => (r.status || 'pending') === 'pending',
  ).length;

  const stats = [
    {
      id: 1,
      label: 'Reports',
      value: loadingStats ? '-' : totalReports,
      icon: 'document-text',
      color: '#286DA6',
    },
    {
      id: 2,
      label: 'In process',
      value: loadingStats ? '-' : inProcessReports,
      icon: 'time',
      color: '#10B981',
    },
    {
      id: 3,
      label: 'Approved',
      value: loadingStats ? '-' : approvedReports,
      icon: 'checkmark-circle',
      color: '#F59E0B',
    },
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          id: 1,
          icon: 'person-outline',
          label: 'Edit Profile',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 2,
          icon: 'lock-closed-outline',
          label: 'Change Password',
          onPress: () => navigation.navigate('ChangePassword'),
        },
      ],
    },
  ];

  const handleLogout = async () => {
    showAlert('info', 'Logging out');

    setTimeout(async () => {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      navigation.replace('AuthScreen');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  userData.avatar ||
                  'https://ui-avatars.com/api/?name=User&background=286DA6&color=fff',
              }}
              style={styles.avatar}
            />
            {/* <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity> */}
          </View>

          <Text style={styles.profileName}>{userData.name || '-'}</Text>
          <Text style={styles.profileRole}>{userData.role || '-'}</Text>

          <View style={styles.employeeBadge}>
            <Ionicons name="card-outline" size={14} color="#286DA6" />
            <Text style={styles.employeeId}>{userData.employeeId || '-'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map(stat => (
            <View key={stat.id} style={styles.statCard}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="mail-outline" label="Email" value={userData.email} />
            <InfoRow icon="call-outline" label="Phone" value={userData.phone} />
            <InfoRow
              icon="briefcase-outline"
              label="Department"
              value={userData.department}
            />
          </View>
        </View>

        {/* Menu */}
        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuLeft}>
                      <View style={styles.menuIcon}>
                        <Ionicons name={item.icon} size={20} color="#286DA6" />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#B0C4D8"
                    />
                  </TouchableOpacity>
                  {index < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
            <CustomAlert
              visible={alert.visible}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onHide={() => setAlert(prev => ({ ...prev, visible: false }))}
            />
          </View>
        ))}
        {/* <View style={{ height: 20 }}>
          <Text
            onPress={() => {
              navigation.navigate('AdminDashboard');
            }}
          >
            Admin
          </Text>
        </View> */}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={styles.container}>
          <ScrollView>...</ScrollView>

          <CustomAlert
            visible={alert.visible}
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onHide={() => setAlert(prev => ({ ...prev, visible: false }))}
          />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

/* Reusable Row */
const InfoRow = ({ icon, label, value }) => (
  <>
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#286DA6" />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
      </View>
    </View>
    <View style={styles.divider} />
  </>
);

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FBFE' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#286DA6' },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#E3F2FD',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#286DA6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  profileRole: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  employeeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  employeeId: { fontSize: 13, fontWeight: '600', color: '#286DA6' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#286DA6' },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#E3F2FD', marginVertical: 6 },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '500', color: '#1F2937' },
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

export default ProfileScreen;
