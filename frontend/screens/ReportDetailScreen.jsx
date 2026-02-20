import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reportApi from '../utils/reportApi';

export default function ReportDetailScreen({ route, navigation }) {
  const { reportId } = route.params;

  const [report, setReport] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Editable fields for inspector/manager
  const [visualObservation, setVisualObservation] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');

      setRole(user.role);

      const res = await reportApi.getSubmissionById(reportId);
      const submission = res?.submission;
      const values = Array.isArray(res?.values) ? res.values : [];
      if (!submission) throw new Error('Submission not found');

      let templateData = null;
      try {
        const tplRes = await reportApi.getTemplatesByCategory(submission.template_id);
        templateData = tplRes?.template || null;
      } catch (e) {
        templateData = null;
      }

      const grouped = values.reduce((acc, v, idx) => {
        const key = v.field_id || `${v.label || 'field'}-${idx}`;
        if (!acc[key]) {
          acc[key] = {
            slNo: idx + 1,
            desc: v.label || '',
            spec: v.specification || '',
            unit: v.unit || '',
            actual: [],
          };
        }
        acc[key].actual.push(v.actual_value);
        return acc;
      }, {});

      const reportData = {
        ...submission,
        title: templateData?.part_description || 'Inspection Submission',
        part_no: templateData?.part_no || '',
        report_data: {
          customer: templateData?.customer || '',
          partNumber: templateData?.part_no || '',
          docNo: templateData?.doc_no || '',
          revNo: templateData?.rev_no || '',
          partDescription: templateData?.part_description || '',
          dimensions: Object.values(grouped),
          shift: submission.shift,
          visualObservation: submission.inspector_observation || '',
          remarks: submission.inspector_remarks || submission.manager_remarks || '',
          qa: submission.employee_name || '',
          reviewedBy: submission.inspector_name || '',
          approvedBy: submission.manager_name || '',
          submittedBy: submission.employee_name || '',
        },
      };

      setReport(reportData);
      setVisualObservation(submission.inspector_observation || '');
      setRemarks(submission.inspector_remarks || submission.manager_remarks || '');
    } catch (error) {
      console.log('Load error:', error);
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      if (role === 'quality_inspector') {
        await reportApi.inspectorReviewSubmission(reportId, {
          observation: visualObservation,
          remarks,
        });
      } else {
        await reportApi.managerReviewSubmission(reportId, {
          approved: true,
          remarks,
        });
      }

      Alert.alert('Success', 'Report approved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.log('APPROVE ERROR:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to approve report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Report',
      'Are you sure you want to reject this report? Please add remarks explaining why.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            if (!remarks.trim()) {
              Alert.alert('Required', 'Please add remarks before rejecting');
              return;
            }

            setSubmitting(true);
            try {
              await reportApi.rejectSubmission(reportId, { remarks });

              Alert.alert('Success', 'Report rejected', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err) {
              console.log('REJECT ERROR:', err.response?.data || err.message);
              Alert.alert('Error', 'Failed to reject report');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = status => {
    switch (status) {
      case 'approved':
      case 'manager_approved':
        return { bg: '#ECFDF5', text: '#059669', icon: 'checkmark-circle' };
      case 'pending':
      case 'submitted':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'time-outline' };
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

  // Determine if current user can edit this report
  const canEdit = () => {
    if (!report || !role) return false;

    // Inspector can edit when status is submitted
    if (role === 'quality_inspector' && report.status === 'submitted') {
      return true;
    }

    // Manager can edit when status is inspector reviewed
    if (role === 'quality_manager' && report.status === 'inspector_reviewed') {
      return true;
    }

    return false;
  };

  // Determine if current user can take action
  const canTakeAction = () => {
    if (!report || !role) return false;

    // Inspector can approve/reject when submitted
    if (role === 'quality_inspector' && report.status === 'submitted') {
      return true;
    }

    // Manager can approve/reject when inspector reviewed
    if (role === 'quality_manager' && report.status === 'inspector_reviewed') {
      return true;
    }

    return false;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#286DA6" />
        <Text style={styles.loadingText}>Loading report...</Text>
      </View>
    );
  }

  if (!report) return null;

  const data = report.report_data;
  const statusStyle = getStatusStyle(report.status);
  const isEditable = canEdit();
  const showActions = canTakeAction();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Status Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Ionicons
                name={statusStyle.icon}
                size={14}
                color={statusStyle.text}
              />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {report.status === 'inspector_reviewed'
                  ? 'Reviewed'
                  : report.status === 'manager_approved'
                  ? 'Approved'
                  : report.status}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="cube-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>Part: {report.part_no}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>
                {new Date(report.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {data.shift && (
            <View style={styles.shiftTag}>
              <Ionicons name="time-outline" size={14} color="#286DA6" />
              <Text style={styles.shiftText}>
                {data.shift === 'day'
                  ? 'Day Shift'
                  : data.shift === 'evening'
                  ? 'Evening Shift'
                  : 'Night Shift'}
              </Text>
            </View>
          )}

          {/* Workflow Progress */}
          <View style={styles.workflowContainer}>
            <Text style={styles.workflowTitle}>Approval Workflow</Text>
            <View style={styles.workflowSteps}>
              <WorkflowStep
                label="Operator"
                icon="create-outline"
                completed={true}
                active={false}
              />
              <View style={styles.workflowLine} />
              <WorkflowStep
                label="Inspector"
                icon="search-outline"
                completed={
                  report.status === 'inspector_reviewed' ||
                  report.status === 'manager_approved'
                }
                active={report.status === 'submitted'}
              />
              <View style={styles.workflowLine} />
              <WorkflowStep
                label="Manager"
                icon="checkmark-done-outline"
                completed={report.status === 'manager_approved'}
                active={report.status === 'inspector_reviewed'}
              />
            </View>
          </View>
        </View>

        {/* Part Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color="#286DA6" />
            <Text style={styles.cardTitle}>Part Information</Text>
          </View>

          <View style={styles.infoGrid}>
            <InfoItem label="Submitted By" value={data.submittedBy} />
            <InfoItem label="Customer" value={data.customer} />
            <InfoItem label="Part Number" value={data.partNumber} />
            <InfoItem label="Doc Number" value={data.docNo} />
            <InfoItem label="Rev Number" value={data.revNo} />
          </View>

          {data.partDescription && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descLabel}>Description</Text>
              <Text style={styles.descValue}>{data.partDescription}</Text>
            </View>
          )}
        </View>

        {/* Dimensions Inspection */}
        {data.dimensions && data.dimensions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="resize-outline" size={20} color="#286DA6" />
              <Text style={styles.cardTitle}>
                Dimensions Inspection ({data.dimensions.length})
              </Text>
            </View>
            <View style={styles.tableWrap}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeadCell, styles.colSl]}>Sl</Text>
                <Text style={[styles.tableHeadCell, styles.colDesc]}>Description</Text>
                <Text style={[styles.tableHeadCell, styles.colSpec]}>Spec</Text>
                <Text style={[styles.tableHeadCell, styles.colUnit]}>Unit</Text>
                <Text style={[styles.tableHeadCell, styles.colActual]}>Actual</Text>
              </View>
              {data.dimensions.map((dim, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colSl]}>{dim.slNo || index + 1}</Text>
                  <Text style={[styles.tableCell, styles.colDesc]} numberOfLines={2}>{dim.desc || '-'}</Text>
                  <Text style={[styles.tableCell, styles.colSpec]} numberOfLines={2}>{dim.spec || '-'}</Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>{dim.unit || '-'}</Text>
                  <Text style={[styles.tableCell, styles.colActual]} numberOfLines={2}>
                    {Array.isArray(dim.actual) && dim.actual.length > 0
                      ? dim.actual.filter(Boolean).join(', ')
                      : '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Visual Observation - Editable by Inspector/Manager */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="eye-outline" size={20} color="#286DA6" />
            <Text style={styles.cardTitle}>Visual Observation</Text>
            {isEditable && (
              <View style={styles.editableBadge}>
                <Ionicons name="create-outline" size={12} color="#286DA6" />
                <Text style={styles.editableText}>Editable</Text>
              </View>
            )}
          </View>

          {isEditable ? (
            <TextInput
              style={styles.textArea}
              placeholder="Add your visual observations..."
              placeholderTextColor="#94A3B8"
              value={visualObservation}
              onChangeText={setVisualObservation}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <View style={styles.textBox}>
              <Text style={styles.textContent}>
                {data.visualObservation || 'No observations recorded'}
              </Text>
            </View>
          )}
        </View>

        {/* Remarks - Editable by Inspector/Manager */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbox-outline" size={20} color="#286DA6" />
            <Text style={styles.cardTitle}>Remarks</Text>
            {isEditable && (
              <View style={styles.editableBadge}>
                <Ionicons name="create-outline" size={12} color="#286DA6" />
                <Text style={styles.editableText}>Editable</Text>
              </View>
            )}
          </View>

          {isEditable ? (
            <TextInput
              style={styles.textArea}
              placeholder="Add your remarks..."
              placeholderTextColor="#94A3B8"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <View style={styles.textBox}>
              <Text style={styles.textContent}>
                {data.remarks || 'No remarks added'}
              </Text>
            </View>
          )}
        </View>

        {/* Approvals */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color="#286DA6"
            />
            <Text style={styles.cardTitle}>Approvals</Text>
          </View>

          <View style={styles.approvalsList}>
            <ApprovalItem
              icon="person-outline"
              label="QA Inspector"
              value={data.qa}
            />
            <ApprovalItem
              icon="eye-outline"
              label="Reviewed By"
              value={data.reviewedBy}
            />
            <ApprovalItem
              icon="checkmark-circle-outline"
              label="Approved By"
              value={data.approvedBy}
            />
          </View>
        </View>

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionTitle}>
              {role === 'quality_inspector'
                ? 'Inspector Review'
                : 'Manager Final Approval'}
            </Text>
            <Text style={styles.actionSubtitle}>
              {role === 'quality_inspector'
                ? 'Review the measurements and add your observations before approving'
                : 'Provide final approval after reviewing inspector comments'}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={handleApprove}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionBtnText}>Approve Report</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={handleReject}
                disabled={submitting}
              >
                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Reject Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '-'}</Text>
  </View>
);

const ApprovalItem = ({ icon, label, value }) => (
  <View style={styles.approvalItem}>
    <View style={styles.approvalIcon}>
      <Ionicons name={icon} size={18} color="#286DA6" />
    </View>
    <View style={styles.approvalContent}>
      <Text style={styles.approvalLabel}>{label}</Text>
      <Text style={styles.approvalValue}>{value || 'Pending'}</Text>
    </View>
  </View>
);

const WorkflowStep = ({ label, icon, completed, active }) => (
  <View style={styles.workflowStep}>
    <View
      style={[
        styles.workflowIcon,
        completed && styles.workflowIconCompleted,
        active && styles.workflowIconActive,
      ]}
    >
      <Ionicons
        name={completed ? 'checkmark' : icon}
        size={16}
        color={completed ? '#FFFFFF' : active ? '#286DA6' : '#94A3B8'}
      />
    </View>
    <Text
      style={[
        styles.workflowLabel,
        completed && styles.workflowLabelCompleted,
        active && styles.workflowLabelActive,
      ]}
    >
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  header: {
    backgroundColor: '#286DA6',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  reportTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  shiftTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shiftText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#286DA6',
  },
  workflowContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  workflowTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  workflowSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workflowStep: {
    alignItems: 'center',
    flex: 1,
  },
  workflowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  workflowIconCompleted: {
    backgroundColor: '#059669',
  },
  workflowIconActive: {
    backgroundColor: '#EBF5FF',
    borderWidth: 2,
    borderColor: '#286DA6',
  },
  workflowLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  workflowLabelCompleted: {
    color: '#059669',
    fontWeight: '600',
  },
  workflowLabelActive: {
    color: '#286DA6',
    fontWeight: '600',
  },
  workflowLine: {
    height: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#286DA6',
    flex: 1,
  },
  editableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editableText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#286DA6',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  descriptionBox: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  descLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  descValue: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  dimensionCard: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dimensionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  dimensionNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#286DA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dimensionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dimensionInfo: {
    flex: 1,
  },
  dimensionDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  dimensionSpec: {
    fontSize: 13,
    color: '#286DA6',
    fontWeight: '500',
  },
  actualValues: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actualLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  actualChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actualChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actualChipLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '500',
  },
  actualChipValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#286DA6',
  },
  noData: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  tableWrap: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHeadCell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 11,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tableCell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#1E293B',
  },
  colSl: {
    width: '10%',
  },
  colDesc: {
    width: '26%',
  },
  colSpec: {
    width: '24%',
  },
  colUnit: {
    width: '12%',
  },
  colActual: {
    width: '28%',
  },
  textBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textContent: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#286DA6',
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  approvalsList: {
    gap: 10,
  },
  approvalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  approvalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approvalContent: {
    flex: 1,
  },
  approvalLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: '500',
  },
  approvalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 6,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  actionButtons: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  approveBtn: {
    backgroundColor: '#059669',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
