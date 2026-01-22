import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
// import { UserService } from '../../utils/mockData';
import * as UserService from '../../utils/userApi';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import CustomAlert from '../../components/CustomAlert';

const ManageUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
    userId: null,
    userName: '',
    action: 'delete', // 'delete' or 'role'
    isLoading: false,
  });

  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };

  // Load users
  useFocusEffect(
    React.useCallback(() => {
      const loadUsers = async () => {
        setLoading(true);
        try {
          const data = await UserService.getAllUsers();
          setUsers(data);
        } catch (err) {
          showAlert('error', 'Failed to load users');
          console.log('Failed to load users', err);
        } finally {
          setLoading(false);
        }
      };

      loadUsers();
    }, []),
  );

const filteredUsers = users.filter(user =>
  user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  user.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
  user.email.toLowerCase().includes(searchQuery.toLowerCase())
);


  const handleDeleteUser = async () => {
    if (!confirmDialog.userId) return;

    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await UserService.deleteUser(confirmDialog.userId);
      if (result.success) {
        setUsers(users.filter(u => u.employee_id  !== confirmDialog.userId));
        setTimeout(() => {
          showAlert('success', 'User deleted successfully');
        }, 500);
      } else {
        setTimeout(() => {
          showAlert('error', 'Error', 'Failed to delete user');
        }, 500);
      }
    } catch (err) {
      setTimeout(() => {
        showAlert('error', 'Error', 'An error occurred while deleting user');
      }, 500);
      console.log('Delete error:', err);
    } finally {
      setConfirmDialog({
        visible: false,
        userId: null,
        userName: '',
        action: 'delete',
        isLoading: false,
      });
    }
  };

  const openDeleteConfirm = (userId, userName) => {
    setConfirmDialog({
      visible: true,
      userId,
      userName,
      action: 'delete',
      isLoading: false,
    });
  };

  const renderUserItem = ({ item }) => {
    const statusColor = item.status === 'active' ? '#10B981' : '#9CA3AF';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.userCard,
          pressed && styles.userCardPressed,
        ]}
        onPress={() =>
          navigation.navigate('UserDetail', {  employeeId: item.employee_id, })
        }
      >
        <View style={styles.userContent}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                item.name,
              )}&background=286DA6&color=fff&size=96`,
            }}
            style={styles.userAvatar}
          />

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userId}>ID: {item.employee_id}</Text>
            <View style={styles.userMeta}>
              <View
                style={[
                  styles.roleTag,
                  {
                    backgroundColor:
                      item.role === 'admin'
                        ? '#F87171'
                        : item.role === 'quality_manager'
                        ? '#F59E0B'
                        : item.role === 'quality_inspector'
                        ? '#3B82F6'
                        : '#10B981',
                  },
                ]}
              >
                <Text style={styles.roleTagText}>
                  {item.role.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <View
                style={[styles.statusBadge, { borderColor: statusColor }]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: statusColor }]}
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.editButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() =>
              navigation.navigate('UserDetail', { employeeId: item.employee_id })
            }
          >
            <Ionicons name="pencil" size={18} color="#286DA6" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => openDeleteConfirm(item.employee_id, item.name)}
          >
            <Ionicons name="trash" size={18} color="#EF4444" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#286DA6" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Ionicons name="chevron-back" size={24} color="#286DA6" />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#B0C4D8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID, or email..."
          placeholderTextColor="#B0C4D8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#B0C4D8" />
          </Pressable>
        ) : null}
      </View>

      {/* User Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Users</Text>
          <Text style={styles.statValue}>{users.length}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statValue}>
            {users.filter(u => u.status === 'active').length}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Inactive</Text>
          <Text style={styles.statValue}>
            {users.filter(u => u.status === 'inactive').length}
          </Text>
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.employee_id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#B0C4D8" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No users found' : 'No users available'}
            </Text>
          </View>
        }
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={confirmDialog.visible}
        title="Delete User?"
        message={`Are you sure you want to delete ${confirmDialog.userName}? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        onConfirm={handleDeleteUser}
        onCancel={() =>
          setConfirmDialog({
            visible: false,
            userId: null,
            userName: '',
            action: 'delete',
            isLoading: false,
          })
        }
        isLoading={confirmDialog.isLoading}
        isDangerous={true}
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

export default ManageUsersScreen;

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#286DA6',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E3F2FD',
    marginHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  userCardPressed: {
    opacity: 0.95,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  userContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  userRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  userId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  editButton: {
    backgroundColor: '#E0EFFF',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
