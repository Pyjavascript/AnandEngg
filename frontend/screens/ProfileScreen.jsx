import React, { useState } from 'react';
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

const ProfileScreen = ({ navigation }) => {
  const [userData] = useState({
    name: 'Rajesh Kumar',
    employeeId: 'AE-2024-001',
    role: 'Quality Inspector',
    email: 'rajesh.kumar@anandeng.com',
    phone: '+91 98765 43210',
    department: 'Quality Control',
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=286DA6&color=fff&size=200',
  });

  const stats = [
    { id: 1, label: 'Reports', value: '24', icon: 'document-text-outline', color: '#286DA6' },
    { id: 2, label: 'Inspections', value: '156', icon: 'clipboard-outline', color: '#10B981' },
    { id: 3, label: 'Approved', value: '142', icon: 'checkmark-circle-outline', color: '#F59E0B' },
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        { id: 1, icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
        { id: 2, icon: 'lock-closed-outline', label: 'Change Password', onPress: () => {} },
        { id: 3, icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 4, icon: 'settings-outline', label: 'Settings', onPress: () => {} },
        { id: 5, icon: 'moon-outline', label: 'Dark Mode', onPress: () => {} },
        { id: 6, icon: 'language-outline', label: 'Language', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: 7, icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
        { id: 8, icon: 'information-circle-outline', label: 'About', onPress: () => {} },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.replace('AuthScreen'),
        },
      ]
    );
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
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileRole}>{userData.role}</Text>
          <View style={styles.employeeBadge}>
            <Ionicons name="card-outline" size={14} color="#286DA6" />
            <Text style={styles.employeeId}>{userData.employeeId}</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat) => (
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
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#286DA6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#286DA6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userData.phone}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color="#286DA6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{userData.department}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIdx) => (
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
                    <Ionicons name="chevron-forward" size={20} color="#B0C4D8" />
                  </TouchableOpacity>
                  {itemIdx < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Anand Engineering</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
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
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
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
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  employeeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  employeeId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#286DA6',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E3F2FD',
    marginVertical: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#B0C4D8',
  },
});

export default ProfileScreen;