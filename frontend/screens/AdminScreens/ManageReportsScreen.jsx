import React, { useState } from 'react';
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
  Dimensions,
  
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { ReportTypeService } from '../../utils/mockData';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import CustomAlert from '../../components/CustomAlert';

const { width } = Dimensions.get('window');

const ManageReportsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('types'); // 'types' or 'submissions'
  const [reportTypes, setReportTypes] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [addReportModal, setAddReportModal] = useState({
    visible: false,
    name: '',
    code: '',
    description: '',
    frequency: 'Daily',
    isLoading: false,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    reportId: null,
    reportName: '',
    isLoading: false,
  });

  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };

  // Load data
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const [typesData, reportsData] = await Promise.all([
            ReportTypeService.getAllReportTypes(),
            ReportTypeService.getAllReports(),
          ]);
          setReportTypes(typesData);
          setAllReports(reportsData);
        } catch (err) {
          showAlert('error', 'Failed to load data');
          console.log('Failed to load', err);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, []),
  );

  const handleAddReportType = async () => {
    if (!addReportModal.name || !addReportModal.code) {
      showAlert('error', 'Validation Error', 'Name and Code are required');
      return;
    }

    setAddReportModal(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await ReportTypeService.addReportType({
        name: addReportModal.name,
        code: addReportModal.code.toUpperCase(),
        description: addReportModal.description,
        frequency: addReportModal.frequency,
        status: 'active',
      });

      if (result.success) {
        setReportTypes([...reportTypes, result.data]);
        showAlert('success', 'Success', 'Report type added successfully');
        setAddReportModal({
          visible: false,
          name: '',
          code: '',
          description: '',
          frequency: 'Daily',
          isLoading: false,
        });
      }
    } catch (err) {
      showAlert('error', 'Error', 'Failed to add report type');
      console.log('Error:', err);
    } finally {
      setAddReportModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteReportType = async () => {
    if (!confirmDialog.reportId) return;

    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await ReportTypeService.deleteReportType(confirmDialog.reportId);
      if (result.success) {
        setReportTypes(reportTypes.filter(r => r.id !== confirmDialog.reportId));
        showAlert('success', 'Success', 'Report type deleted successfully');
      } else {
        showAlert('error', 'Error', result.message || 'Failed to delete');
      }
    } catch (err) {
      showAlert('error', 'Error', 'Failed to delete');
      console.log('Error:', err);
    } finally {
      setConfirmDialog({
        visible: false,
        reportId: null,
        reportName: '',
        isLoading: false,
      });
    }
  };

  const openDeleteConfirm = (reportId, reportName) => {
    setConfirmDialog({
      visible: true,
      reportId,
      reportName,
      isLoading: false,
    });
  };

  const renderReportTypeItem = ({ item }) => {
    return (
      <View style={styles.reportTypeCard}>
        <View style={styles.reportTypeHeader}>
          <View style={styles.reportTypeIcon}>
            <Ionicons name="document-text" size={22} color="#286DA6" />
          </View>

          <View style={styles.reportTypeInfo}>
            <Text style={styles.reportTypeName}>{item.name}</Text>
            <Text style={styles.reportTypeCode}>{item.code}</Text>
            <Text style={styles.reportTypeDesc} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.reportTypeMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="repeat" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{item.frequency}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.metaText}>{item.submittedCount} submitted</Text>
          </View>
          <View
            style={[
              styles.statusTag,
              {
                backgroundColor: item.status === 'active' ? '#DCFCE7' : '#F3F4F6',
              },
            ]}
          >
            <Text
              style={[
                styles.statusTagText,
                {
                  color: item.status === 'active' ? '#059669' : '#6B7280',
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.deleteReportBtn,
            pressed && styles.deleteReportBtnPressed,
          ]}
          onPress={() => openDeleteConfirm(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text style={styles.deleteReportBtnText}>Delete</Text>
        </Pressable>
      </View>
    );
  };

  const renderReportSubmissionItem = ({ item }) => {
    const statusColor =
      item.status === 'approved'
        ? '#10B981'
        : item.status === 'pending'
        ? '#F59E0B'
        : '#EF4444';

    return (
      <View style={styles.submissionCard}>
        <View style={styles.submissionHeader}>
          <View
            style={[
              styles.submissionStatusDot,
              { backgroundColor: statusColor },
            ]}
          />
          <Text style={styles.submissionTitle}>{item.title}</Text>
        </View>

        <View style={styles.submissionDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.submittedBy}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="document-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.submittedDate}</Text>
          </View>
        </View>

        <View style={styles.submissionFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          {item.approvedBy && (
            <Text style={styles.approvedByText}>
              by {item.approvedBy}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#286DA6" />
        <Text style={styles.loadingText}>Loading reports...</Text>
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
          <Text style={styles.headerTitle}>Manage Reports</Text>
        </View>

        {activeTab === 'types' && (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={() => setAddReportModal({ ...addReportModal, visible: true })}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'types' && styles.tabActive]}
          onPress={() => setActiveTab('types')}
        >
          <Ionicons
            name="layers-outline"
            size={18}
            color={activeTab === 'types' ? '#286DA6' : '#B0C4D8'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'types' && styles.tabTextActive,
            ]}
          >
            Report Types
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab !== 'types' && styles.tabBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab !== 'types' && styles.tabBadgeTextInactive,
              ]}
            >
              {reportTypes.length}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'submissions' && styles.tabActive]}
          onPress={() => setActiveTab('submissions')}
        >
          <Ionicons
            name="document-text-outline"
            size={18}
            color={activeTab === 'submissions' ? '#286DA6' : '#B0C4D8'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'submissions' && styles.tabTextActive,
            ]}
          >
            All Submissions
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab !== 'submissions' && styles.tabBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab !== 'submissions' && styles.tabBadgeTextInactive,
              ]}
            >
              {allReports.length}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'types' ? (
        <FlatList
          data={reportTypes}
          renderItem={renderReportTypeItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="layers-outline" size={48} color="#B0C4D8" />
              <Text style={styles.emptyStateText}>No report types</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={allReports}
          renderItem={renderReportSubmissionItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#B0C4D8" />
              <Text style={styles.emptyStateText}>No submissions</Text>
            </View>
          }
        />
      )}

      {/* Add Report Type Modal */}
      <Modal
        visible={addReportModal.visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          setAddReportModal({
            visible: false,
            name: '',
            code: '',
            description: '',
            frequency: 'Daily',
            isLoading: false,
          })
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Report Type</Text>
              <Pressable
                onPress={() =>
                  setAddReportModal({
                    visible: false,
                    name: '',
                    code: '',
                    description: '',
                    frequency: 'Daily',
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
              {/* Report Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Report Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Daily Production Report"
                  placeholderTextColor="#B0C4D8"
                  value={addReportModal.name}
                  onChangeText={(text) =>
                    setAddReportModal({ ...addReportModal, name: text })
                  }
                  editable={!addReportModal.isLoading}
                />
              </View>

              {/* Report Code */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Report Code *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., RPT_PROD_001"
                  placeholderTextColor="#B0C4D8"
                  value={addReportModal.code}
                  onChangeText={(text) =>
                    setAddReportModal({ ...addReportModal, code: text })
                  }
                  editable={!addReportModal.isLoading}
                />
                <Text style={styles.formHelp}>
                  Unique identifier for this report type
                </Text>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textAreaInput]}
                  placeholder="Enter report description..."
                  placeholderTextColor="#B0C4D8"
                  value={addReportModal.description}
                  onChangeText={(text) =>
                    setAddReportModal({ ...addReportModal, description: text })
                  }
                  multiline={true}
                  numberOfLines={3}
                  editable={!addReportModal.isLoading}
                />
              </View>

              {/* Frequency */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Frequency</Text>
                <View style={styles.frequencyButtons}>
                  {['Daily', 'Weekly', 'Monthly', 'Per Batch', 'As Needed'].map(
                    freq => (
                      <Pressable
                        key={freq}
                        style={[
                          styles.frequencyButton,
                          addReportModal.frequency === freq &&
                            styles.frequencyButtonActive,
                        ]}
                        onPress={() =>
                          setAddReportModal({
                            ...addReportModal,
                            frequency: freq,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.frequencyButtonText,
                            addReportModal.frequency === freq &&
                              styles.frequencyButtonTextActive,
                          ]}
                        >
                          {freq}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View style={styles.modalFooter}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && styles.modalButtonPressed,
                ]}
                onPress={() =>
                  setAddReportModal({
                    visible: false,
                    name: '',
                    code: '',
                    description: '',
                    frequency: 'Daily',
                    isLoading: false,
                  })
                }
                disabled={addReportModal.isLoading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalSaveButton,
                  pressed && styles.modalButtonPressed,
                  addReportModal.isLoading && styles.modalButtonDisabled,
                ]}
                onPress={handleAddReportType}
                disabled={addReportModal.isLoading}
              >
                {addReportModal.isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Create Report Type</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={confirmDialog.visible}
        title="Delete Report Type?"
        message={`Are you sure you want to delete "${confirmDialog.reportName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteReportType}
        onCancel={() =>
          setConfirmDialog({
            visible: false,
            reportId: null,
            reportName: '',
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

export default ManageReportsScreen;

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
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#286DA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#286DA6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B0C4D8',
  },
  tabTextActive: {
    color: '#286DA6',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#286DA6',
  },
  tabBadgeInactive: {
    backgroundColor: '#E3F2FD',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabBadgeTextInactive: {
    color: '#286DA6',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reportTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  reportTypeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  reportTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportTypeInfo: {
    flex: 1,
  },
  reportTypeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  reportTypeCode: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  reportTypeDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  reportTypeMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deleteReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  deleteReportBtnPressed: {
    opacity: 0.8,
  },
  deleteReportBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  submissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  submissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  submissionStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  submissionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  submissionDetails: {
    gap: 6,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  submissionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  approvedByText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
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
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  frequencyButtonActive: {
    backgroundColor: '#286DA6',
    borderColor: '#286DA6',
  },
  frequencyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  frequencyButtonTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
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
