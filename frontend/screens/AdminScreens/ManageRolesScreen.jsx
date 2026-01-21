import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { RoleService } from '../../utils/mockData';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import CustomAlert from '../../components/CustomAlert';

const ManageRolesScreen = ({ navigation }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [addRoleModal, setAddRoleModal] = useState({
    visible: false,
    name: '',
    displayName: '',
    description: '',
    isLoading: false,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    roleId: null,
    roleName: '',
    isLoading: false,
  });

  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };

  // Load roles
  useFocusEffect(
    React.useCallback(() => {
      const loadRoles = async () => {
        setLoading(true);
        try {
          const data = await RoleService.getAllRoles();
          setRoles(data);
        } catch (err) {
          showAlert('error', 'Failed to load roles');
          console.log('Failed to load roles', err);
        } finally {
          setLoading(false);
        }
      };

      loadRoles();
    }, []),
  );

  const handleAddRole = async () => {
    if (!addRoleModal.name || !addRoleModal.displayName) {
      showAlert('error', 'Validation Error', 'Name and Display Name are required');
      return;
    }

    setAddRoleModal(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await RoleService.addRole({
        name: addRoleModal.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: addRoleModal.displayName,
        description: addRoleModal.description,
        permissions: ['create_reports', 'view_own_reports'],
      });

      if (result.success) {
        setRoles([...roles, result.data]);
        showAlert('success', 'Success', 'Role added successfully');
        setAddRoleModal({ visible: false, name: '', displayName: '', description: '', isLoading: false });
      }
    } catch (err) {
      showAlert('error', 'Error', 'Failed to add role');
      console.log('Error:', err);
    } finally {
      setAddRoleModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteRole = async () => {
    if (!confirmDialog.roleId) return;

    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await RoleService.deleteRole(confirmDialog.roleId);
      if (result.success) {
        setRoles(roles.filter(r => r.id !== confirmDialog.roleId));
        showAlert('success', 'Success', 'Role deleted successfully');
      } else {
        showAlert('error', 'Error', result.message || 'Failed to delete role');
      }
    } catch (err) {
      showAlert('error', 'Error', 'Failed to delete role');
      console.log('Error:', err);
    } finally {
      setConfirmDialog({
        visible: false,
        roleId: null,
        roleName: '',
        isLoading: false,
      });
    }
  };

  const openDeleteConfirm = (roleId, roleName) => {
    setConfirmDialog({
      visible: true,
      roleId,
      roleName,
      isLoading: false,
    });
  };

  const getRoleColor = (role) => {
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

  const renderRoleItem = ({ item }) => {
    return (
      <View style={styles.roleCard}>
        <View style={styles.roleHeader}>
          <View
            style={[
              styles.roleIcon,
              { backgroundColor: getRoleColor(item.name) },
            ]}
          >
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
          </View>

          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>{item.displayName}</Text>
            <Text style={styles.roleCode}>{item.name}</Text>
            <Text style={styles.roleDescription} numberOfLines={1}>
              {item.description}
            </Text>
          </View>

          {item.protected && (
            <View style={styles.protectedBadge}>
              <Ionicons name="lock-closed" size={14} color="#EF4444" />
            </View>
          )}
        </View>

        <View style={styles.permissionsList}>
          {item.permissions.slice(0, 2).map((perm, idx) => (
            <View key={idx} style={styles.permissionTag}>
              <Text style={styles.permissionText}>{perm}</Text>
            </View>
          ))}
          {item.permissions.length > 2 && (
            <View style={styles.permissionTag}>
              <Text style={styles.permissionText}>
                +{item.permissions.length - 2} more
              </Text>
            </View>
          )}
        </View>

        {!item.protected && (
          <Pressable
            style={({ pressed }) => [
              styles.deleteRoleBtn,
              pressed && styles.deleteRoleBtnPressed,
            ]}
            onPress={() => openDeleteConfirm(item.id, item.displayName)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.deleteRoleBtnText}>Delete</Text>
          </Pressable>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#286DA6" />
        <Text style={styles.loadingText}>Loading roles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Ionicons name="chevron-back" size={24} color="#286DA6" />
          </Pressable>
          <Text style={styles.headerTitle}>Manage Roles</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={() => setAddRoleModal({ ...addRoleModal, visible: true })}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Protected Warning */}
      <View style={styles.warningBox}>
        <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
        <Text style={styles.warningText}>
          Roles with a lock icon are protected and cannot be deleted
        </Text>
      </View>

      {/* Roles List */}
      <FlatList
        data={roles}
        renderItem={renderRoleItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={48} color="#B0C4D8" />
            <Text style={styles.emptyStateText}>No roles available</Text>
          </View>
        }
      />

      {/* Add Role Modal */}
      <Modal
        visible={addRoleModal.visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => 
          setAddRoleModal({ visible: false, name: '', displayName: '', description: '', isLoading: false })
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Role</Text>
              <Pressable
                onPress={() =>
                  setAddRoleModal({
                    visible: false,
                    name: '',
                    displayName: '',
                    description: '',
                    isLoading: false,
                  })
                }
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {/* Role Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Role Name (ID)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., supervisor"
                  placeholderTextColor="#B0C4D8"
                  value={addRoleModal.name}
                  onChangeText={(text) =>
                    setAddRoleModal({ ...addRoleModal, name: text })
                  }
                  editable={!addRoleModal.isLoading}
                />
                <Text style={styles.formHelp}>
                  Used as the system identifier (lowercase, no spaces)
                </Text>
              </View>

              {/* Display Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Display Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Shift Supervisor"
                  placeholderTextColor="#B0C4D8"
                  value={addRoleModal.displayName}
                  onChangeText={(text) =>
                    setAddRoleModal({ ...addRoleModal, displayName: text })
                  }
                  editable={!addRoleModal.isLoading}
                />
                <Text style={styles.formHelp}>
                  How the role appears in the UI
                </Text>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textAreaInput]}
                  placeholder="e.g., Manages shift operations and staff"
                  placeholderTextColor="#B0C4D8"
                  value={addRoleModal.description}
                  onChangeText={(text) =>
                    setAddRoleModal({ ...addRoleModal, description: text })
                  }
                  multiline={true}
                  numberOfLines={3}
                  editable={!addRoleModal.isLoading}
                />
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View style={styles.modalFooter}>
              <Pressable
                style={({ pressed })  => [
                  styles.modalCancelButton,
                  pressed && styles.modalButtonPressed,
                ]}
                onPress={() =>
                  setAddRoleModal({
                    visible: false,
                    name: '',
                    displayName: '',
                    description: '',
                    isLoading: false,
                  })
                }
                disabled={addRoleModal.isLoading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalSaveButton,
                  pressed && styles.modalButtonPressed,
                  addRoleModal.isLoading && styles.modalButtonDisabled,
                ]}
                onPress={handleAddRole}
                disabled={addRoleModal.isLoading}
              >
                {addRoleModal.isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Create Role</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={confirmDialog.visible}
        title="Delete Role?"
        message={`Are you sure you want to delete the "${confirmDialog.roleName}" role? This action cannot be undone.`}
        confirmText="Delete Role"
        cancelText="Cancel"
        onConfirm={handleDeleteRole}
        onCancel={() =>
          setConfirmDialog({
            visible: false,
            roleId: null,
            roleName: '',
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

export default ManageRolesScreen;

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#286DA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  roleCode: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  roleDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  protectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionsList: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  permissionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  permissionText: {
    fontSize: 10,
    color: '#286DA6',
    fontWeight: '500',
  },
  deleteRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  deleteRoleBtnPressed: {
    opacity: 0.8,
  },
  deleteRoleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  modalScrollView: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    borderRadius: 8,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  formHelp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#286DA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonPressed: {
    opacity: 0.8,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
