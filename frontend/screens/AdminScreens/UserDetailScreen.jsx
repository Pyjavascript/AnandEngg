import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
// import { UserService, RoleService, mockRoles } from '../utils/mockData';
import * as UserService from '../../utils/userApi';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import CustomAlert from '../../components/CustomAlert';

const UserDetailScreen = ({ navigation, route }) => {
  const ROLES = [
    {
      id: 1,
      name: 'admin',
      displayName: 'Admin',
      description: 'System administrator with full access',
    },
    {
      id: 2,
      name: 'quality_manager',
      displayName: 'Quality Manager',
      description: 'Manages quality inspections and approvals',
    },
    {
      id: 3,
      name: 'quality_inspector',
      displayName: 'Quality Inspector',
      description: 'Inspects and submits quality reports',
    },
    {
      id: 4,
      name: 'machine_operator',
      displayName: 'Machine Operator',
      description: 'Operates machines and submits logs',
    },
  ];

  // const { userId } = route.params;
  const { employeeId } = route.params;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [alert, setAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
   useEffect(() => {
    if (!alert.visible) return;
  
    const t = setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }));
    }, 2000);
  
    return () => clearTimeout(t);
  }, [alert.visible]);
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    isLoading: false,
  });

  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };

  // Load user and roles
  useFocusEffect(
  React.useCallback(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userData = await UserService.getUserByEmployeeId(employeeId);

        setUser(userData);
        setRoles(ROLES);
        setSelectedRole(userData.role);
      } catch (err) {
        console.log('Failed to load user', err);
        showAlert('error', 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employeeId])
);


  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === user.role) {
      setShowRoleMenu(false);
      return;
    }

    setConfirmDialog({ visible: true, isLoading: false });
  };

  const confirmRoleChange = async () => {
    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    try {
      // const result = await UserService.updateUserRole(userId, selectedRole);
      const result = await UserService.updateUserRole(user.id, selectedRole);
      if (result.success) {
        setUser(prev => ({ ...prev, role: selectedRole }));
        showAlert('success', 'Success', 'User role updated successfully');
      } else {
        showAlert('error', 'Error', result.message || 'Failed to update role');
        setSelectedRole(user.role);
      }
    } catch (err) {
      showAlert('error', 'Error', 'Failed to update role');
      console.log('Error:', err);
      setSelectedRole(user.role);
    } finally {
      setConfirmDialog({ visible: false, isLoading: false });
      setShowRoleMenu(false);
    }
  };

  const handleDeleteUser = async () => {
    setConfirmDialog({ visible: true, isLoading: false });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#286DA6" />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>User not found</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const getRoleColor = role => {
    switch (role) {
      case 'admin':
        return '#F87171';
      case 'quality_manager':
        return '#F59E0B';
      case 'quality_inspector':
        return '#3B82F6';
      case 'machine_operator':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getRoleLabel = role => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
        >
          <Ionicons name="chevron-back" size={24} color="#286DA6" />
        </Pressable>
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name,
              )}&background=286DA6&color=fff&size=200`,
            }}
            style={styles.profileImage}
          />

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userId}>ID: {user.employee_id}</Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  user.status === 'active' ? '#DCFCE7' : '#F3F4F6',
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    user.status === 'active' ? '#10B981' : '#9CA3AF',
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: user.status === 'active' ? '#059669' : '#6B7280',
                },
              ]}
            >
              {user.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail" size={18} color="#286DA6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="call" size={18} color="#286DA6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="briefcase" size={18} color="#286DA6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{user.department}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="calendar" size={18} color="#286DA6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Join Date</Text>
              <Text style={styles.infoValue}>{user.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Role Management Card */}
        <View style={styles.roleCard}>
          <Text style={styles.cardTitle}>Role Management</Text>

          <Text style={styles.roleLabel}>Current Role</Text>
          <View
            style={[
              styles.currentRoleBadge,
              { backgroundColor: getRoleColor(user.role) },
            ]}
          >
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.currentRoleText}>
              {getRoleLabel(user.role)}
            </Text>
          </View>

          <Text style={styles.roleLabel} styles={{ marginTop: 16 }}>
            Change Role
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.roleSelector,
              pressed && styles.roleSelectorPressed,
            ]}
            onPress={() => setShowRoleMenu(!showRoleMenu)}
          >
            <Text style={styles.roleSelectorText}>
              {getRoleLabel(selectedRole)}
            </Text>
            <Ionicons
              name={showRoleMenu ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#286DA6"
            />
          </Pressable>

          {showRoleMenu && (
            <View style={styles.roleMenu}>
              {roles.map(role => (
                <Pressable
                  key={role.id}
                  style={({ pressed }) => [
                    styles.roleMenuItem,
                    pressed && styles.roleMenuItemPressed,
                    selectedRole === role.name && styles.roleMenuItemSelected,
                  ]}
                  onPress={() => setSelectedRole(role.name)}
                >
                  <View
                    style={[
                      styles.roleMenuIcon,
                      {
                        backgroundColor: getRoleColor(role.name),
                      },
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleMenuTitle}>{role.displayName}</Text>
                    <Text style={styles.roleMenuDescription}>
                      {role.description}
                    </Text>
                  </View>
                  {selectedRole === role.name && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {selectedRole !== user.role && (
            <Pressable
              style={({ pressed }) => [
                styles.updateRoleButton,
                pressed && styles.updateRoleButtonPressed,
              ]}
              onPress={handleRoleChange}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.updateRoleButtonText}>Update Role</Text>
            </Pressable>
          )}
        </View>

        {/* Admin Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Admin Actions</Text>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteActionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleDeleteUser}
          >
            <Ionicons name="trash" size={20} color="#EF4444" />
            <Text style={styles.deleteActionText}>Delete User</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Confirmation Dialog for Role Change */}
      <ConfirmationDialog
        visible={confirmDialog.visible && selectedRole !== user.role}
        title="Change User Role?"
        message={`Are you sure you want to change this user's role from ${getRoleLabel(
          user.role,
        )} to ${getRoleLabel(selectedRole)}?`}
        confirmText="Update Role"
        cancelText="Cancel"
        onConfirm={confirmRoleChange}
        onCancel={() => {
          setConfirmDialog({ visible: false, isLoading: false });
          setSelectedRole(user.role);
        }}
        isLoading={confirmDialog.isLoading}
        isDangerous={false}
      />

      {/* Alert */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() =>
          setAlert({ visible: false, type: 'success', title: '', message: '' })
        }
      />
    </View>
  );
};

export default UserDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBFE',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBFE',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnPressed: {
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  userId: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 2,
  },
  roleCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  roleLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  currentRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  currentRoleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleSelectorPressed: {
    backgroundColor: '#F3F4F6',
  },
  roleSelectorText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  roleMenu: {
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  roleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  roleMenuItemPressed: {
    backgroundColor: '#F3F4F6',
  },
  roleMenuItemSelected: {
    backgroundColor: '#E0EFFF',
  },
  roleMenuIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleMenuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  roleMenuDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  updateRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  updateRoleButtonPressed: {
    opacity: 0.9,
  },
  updateRoleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  deleteActionButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#286DA6',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
