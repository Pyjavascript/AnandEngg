import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reportApi from '../utils/reportApi';
import { useAppTheme } from '../theme/ThemeProvider';

const UNAVAILABLE_TEXT = 'Unavailable';

const isUnavailable = value =>
  value === null ||
  value === undefined ||
  String(value).trim() === '' ||
  String(value).trim().toLowerCase() === UNAVAILABLE_TEXT.toLowerCase();

const toDisplayDate = value => {
  if (isUnavailable(value)) return UNAVAILABLE_TEXT;
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return UNAVAILABLE_TEXT;
  }
};

const getStatusLabel = submission => {
  const status = submission?.status;
  if (status === 'inspector_reviewed') return 'Approved by Inspector';
  if (status === 'manager_approved') return 'Approved';
  if (status === 'rejected' && submission?.manager_id) {
    return `Rejected by Manager${submission?.manager_name ? `: ${submission.manager_name}` : ''}`;
  }
  if (status === 'rejected' && submission?.inspector_id) {
    return `Rejected by Inspector${submission?.inspector_name ? `: ${submission.inspector_name}` : ''}`;
  }
  return status || '-';
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
      return { bg: '#EFF6FF', text: '#2563EB', icon: 'checkmark-done-circle' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280', icon: 'help-circle' };
  }
};

export default function ReportDetailScreen({ route, navigation }) {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);
  const { reportId } = route.params;

  const [report, setReport] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [inspectorObservation, setInspectorObservation] = useState('');
  const [inspectorRemarks, setInspectorRemarks] = useState('');
  const [managerObservation, setManagerObservation] = useState('');
  const [managerRemarks, setManagerRemarks] = useState('');

  const load = useCallback(async () => {
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
      } catch {
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
          inspectorObservation: submission.inspector_observation || '',
          inspectorRemarks: submission.inspector_remarks || '',
          managerObservation: submission.manager_observation || '',
          managerRemarks: submission.manager_remarks || '',
          templateCreatedAt: submission.template_created_at || templateData?.created_at || '',
          reportSubmittedAt: submission.created_at || '',
          qa: submission.employee_name || '',
          reviewedBy: submission.inspector_name || '',
          approvedBy: submission.manager_name || '',
          rejectedBy:
            submission.status === 'rejected'
              ? submission.manager_name || submission.inspector_name || ''
              : '',
          rejectedByRole:
            submission.status === 'rejected'
              ? submission.manager_id
                ? 'Manager'
                : submission.inspector_id
                ? 'Inspector'
                : ''
              : '',
          submittedBy: submission.employee_name || '',
        },
      };

      setReport(reportData);
      setInspectorObservation(submission.inspector_observation || '');
      setInspectorRemarks(submission.inspector_remarks || '');
      setManagerObservation(submission.manager_observation || '');
      setManagerRemarks(submission.manager_remarks || '');
    } catch (error) {
      console.log('Load error:', error);
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      if (role === 'quality_inspector') {
        await reportApi.inspectorReviewSubmission(reportId, {
          observation: inspectorObservation,
          remarks: inspectorRemarks,
        });
      } else {
        await reportApi.managerReviewSubmission(reportId, {
          approved: true,
          observation: managerObservation,
          remarks: managerRemarks,
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
            const remarkText =
              role === 'quality_inspector' ? inspectorRemarks : managerRemarks;
            if (!String(remarkText || '').trim()) {
              Alert.alert('Required', 'Please add remarks before rejecting');
              return;
            }

            setSubmitting(true);
            try {
              await reportApi.rejectSubmission(reportId, {
                observation:
                  role === 'quality_inspector'
                    ? inspectorObservation
                    : managerObservation,
                remarks: remarkText,
              });
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
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.primarySoft} />
        <Text style={styles.loadingText}>Loading report...</Text>
      </View>
    );
  }

  if (!report) return null;

  const data = report.report_data;
  const statusStyle = getStatusStyle(report.status);
  const inspectorCanEdit =
    role === 'quality_inspector' && report.status === 'submitted';
  const managerCanEdit =
    role === 'quality_manager' && report.status === 'inspector_reviewed';
  const showActions = inspectorCanEdit || managerCanEdit;
  const inspectorCompleted =
    report.status === 'inspector_reviewed' ||
    report.status === 'manager_approved' ||
    (report.status === 'rejected' && !!report.inspector_id);
  const managerCompleted =
    report.status === 'manager_approved' ||
    (report.status === 'rejected' && !!report.manager_id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={C.textStrong} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Ionicons name={statusStyle.icon} size={14} color={statusStyle.text} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {getStatusLabel(report)}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="cube-outline" size={16} color={C.textMuted} />
              <Text style={styles.metaText}>Part: {report.part_no || '-'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={C.textMuted} />
              <Text
                style={[
                  styles.metaText,
                  isUnavailable(data.reportSubmittedAt) && styles.unavailableText,
                ]}
              >
                {toDisplayDate(data.reportSubmittedAt)}
              </Text>
            </View>
          </View>

          {data.shift && (
            <View style={styles.shiftTag}>
              <Ionicons name="time-outline" size={14} color={C.primarySoft} />
              <Text style={styles.shiftText}>
                {data.shift === 'day'
                  ? 'Day Shift'
                  : data.shift === 'evening'
                  ? 'Evening Shift'
                  : 'Night Shift'}
              </Text>
            </View>
          )}

          <View style={styles.workflowContainer}>
            <Text style={styles.workflowTitle}>Approval Workflow</Text>
            <View style={styles.workflowSteps}>
              <WorkflowStep
                C={C}
                styles={styles}
                label="Operator"
                icon="create-outline"
                completed={true}
                active={false}
              />
              <View style={styles.workflowLine} />
              <WorkflowStep
                C={C}
                styles={styles}
                label="Inspector"
                icon="search-outline"
                completed={inspectorCompleted}
                active={report.status === 'submitted'}
              />
              <View style={styles.workflowLine} />
              <WorkflowStep
                C={C}
                styles={styles}
                label="Manager"
                icon="checkmark-done-outline"
                completed={managerCompleted}
                active={report.status === 'inspector_reviewed'}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color={C.primarySoft} />
            <Text style={styles.cardTitle}>Part Information</Text>
          </View>

          <View style={styles.infoGrid}>
            <InfoItem styles={styles} label="Submitted By" value={data.submittedBy} />
            <InfoItem styles={styles} label="Customer" value={data.customer} />
            <InfoItem styles={styles} label="Part Number" value={data.partNumber} />
            <InfoItem styles={styles} label="Doc Number" value={data.docNo} />
            <InfoItem styles={styles} label="Rev Number" value={data.revNo} />
            <InfoItem
              styles={styles}
              label="Template Created Date"
              value={toDisplayDate(data.templateCreatedAt)}
            />
            <InfoItem
              styles={styles}
              label="Report Submitted Date"
              value={toDisplayDate(data.reportSubmittedAt)}
            />
          </View>

          {data.partDescription && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descLabel}>Description</Text>
              <Text style={styles.descValue}>{data.partDescription}</Text>
            </View>
          )}
        </View>

        {data.dimensions && data.dimensions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="resize-outline" size={20} color={C.primarySoft} />
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
                  <Text style={[styles.tableCell, styles.colSl]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, styles.colDesc]} numberOfLines={2}>
                    {dim.desc || '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSpec]} numberOfLines={2}>
                    {dim.spec || '-'}
                  </Text>
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

        <ReviewCard
          C={C}
          styles={styles}
          title="Inspector Review"
          canEdit={inspectorCanEdit}
          observationValue={inspectorObservation}
          remarksValue={inspectorRemarks}
          setObservation={setInspectorObservation}
          setRemarks={setInspectorRemarks}
        />

        <ReviewCard
          C={C}
          styles={styles}
          title="Manager Review"
          canEdit={managerCanEdit}
          observationValue={managerObservation}
          remarksValue={managerRemarks}
          setObservation={setManagerObservation}
          setRemarks={setManagerRemarks}
        />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color={C.primarySoft}
            />
            <Text style={styles.cardTitle}>Approvals</Text>
          </View>

          <View style={styles.approvalsList}>
            <ApprovalItem C={C} styles={styles} icon="person-outline" label="QA Inspector" value={data.qa} />
            <ApprovalItem C={C} styles={styles} icon="eye-outline" label="Reviewed By" value={data.reviewedBy} />
            <ApprovalItem C={C} styles={styles} icon="checkmark-circle-outline" label="Approved By" value={data.approvedBy} />
            {report.status === 'rejected' && (
              <ApprovalItem
                C={C}
                styles={styles}
                icon="close-circle-outline"
                label="Rejected By"
                value={
                  data.rejectedByRole && data.rejectedBy
                    ? `${data.rejectedByRole}: ${data.rejectedBy}`
                    : data.rejectedBy || UNAVAILABLE_TEXT
                }
              />
            )}
          </View>
        </View>

        {showActions && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionTitle}>
              {role === 'quality_inspector'
                ? 'Inspector Review'
                : 'Manager Final Approval'}
            </Text>
            <Text style={styles.actionSubtitle}>
              {role === 'quality_inspector'
                ? 'Add inspector observation and remarks before taking action.'
                : 'Add manager observation and remarks before final action.'}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={handleApprove}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={C.surface} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={C.surface} />
                    <Text style={styles.actionBtnText}>Approve Report</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={handleReject}
                disabled={submitting}
              >
                <Ionicons name="close-circle" size={20} color={C.surface} />
                <Text style={styles.actionBtnText}>Reject Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomGap} />
      </ScrollView>
    </View>
  );
}

const InfoItem = ({ label, value, styles }) => {
  const unavailable = isUnavailable(value);
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, unavailable && styles.unavailableText]}>
        {unavailable ? UNAVAILABLE_TEXT : value}
      </Text>
    </View>
  );
};

const ApprovalItem = ({ icon, label, value, styles, C }) => {
  const unavailable = isUnavailable(value);
  return (
    <View style={styles.approvalItem}>
      <View style={styles.approvalIcon}>
        <Ionicons name={icon} size={18} color={C.primarySoft} />
      </View>
      <View style={styles.approvalContent}>
        <Text style={styles.approvalLabel}>{label}</Text>
        <Text style={[styles.approvalValue, unavailable && styles.unavailableText]}>
          {unavailable ? UNAVAILABLE_TEXT : value}
        </Text>
      </View>
    </View>
  );
};

const ReviewCard = ({
  C,
  styles,
  title,
  canEdit,
  observationValue,
  remarksValue,
  setObservation,
  setRemarks,
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name="document-text-outline" size={20} color={C.primarySoft} />
      <Text style={styles.cardTitle}>{title}</Text>
      {canEdit && (
        <View style={styles.editableBadge}>
          <Ionicons name="create-outline" size={12} color={C.primarySoft} />
          <Text style={styles.editableText}>Editable</Text>
        </View>
      )}
    </View>

    <Text style={styles.subFieldTitle}>Observation</Text>
    {canEdit ? (
      <TextInput
        style={styles.textArea}
        placeholder="Add observation..."
        placeholderTextColor={C.textSubtle}
        value={observationValue}
        onChangeText={setObservation}
        multiline
        textAlignVertical="top"
      />
    ) : (
      <View style={styles.textBox}>
        <Text
          style={[
            styles.textContent,
            isUnavailable(observationValue) && styles.unavailableText,
          ]}
        >
          {isUnavailable(observationValue) ? UNAVAILABLE_TEXT : observationValue}
        </Text>
      </View>
    )}

    <Text style={[styles.subFieldTitle, styles.subFieldSpacing]}>Remarks</Text>
    {canEdit ? (
      <TextInput
        style={styles.textArea}
        placeholder="Add remarks..."
        placeholderTextColor={C.textSubtle}
        value={remarksValue}
        onChangeText={setRemarks}
        multiline
        textAlignVertical="top"
      />
    ) : (
      <View style={styles.textBox}>
        <Text
          style={[
            styles.textContent,
            isUnavailable(remarksValue) && styles.unavailableText,
          ]}
        >
          {isUnavailable(remarksValue) ? UNAVAILABLE_TEXT : remarksValue}
        </Text>
      </View>
    )}
  </View>
);

const WorkflowStep = ({ label, icon, completed, active, styles, C }) => (
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
        color={completed ? C.surface : active ? C.primarySoft : C.textSubtle}
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

const createStyles = C =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: C.bg,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: C.textMuted,
    },
    header: {
      backgroundColor: C.primary,
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
      backgroundColor: C.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: C.surface,
    },
    placeholder: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    titleCard: {
      backgroundColor: C.surface,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
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
      color: C.textBody,
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
      borderBottomColor: C.border,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaText: {
      fontSize: 13,
      color: C.textMuted,
      fontWeight: '500',
    },
    shiftTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: C.surfaceAlt,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    shiftText: {
      fontSize: 12,
      fontWeight: '600',
      color: C.primarySoft,
    },
    workflowContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: C.border,
    },
    workflowTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: C.textMuted,
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
      backgroundColor: C.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    workflowIconCompleted: {
      backgroundColor: C.success,
    },
    workflowIconActive: {
      backgroundColor: C.surfaceAlt,
      borderWidth: 2,
      borderColor: C.primarySoft,
    },
    workflowLabel: {
      fontSize: 11,
      color: C.textSubtle,
      fontWeight: '500',
    },
    workflowLabelCompleted: {
      color: C.success,
      fontWeight: '600',
    },
    workflowLabelActive: {
      color: C.primarySoft,
      fontWeight: '600',
    },
    workflowLine: {
      height: 2,
      flex: 1,
      backgroundColor: C.border,
      marginHorizontal: 4,
      marginBottom: 24,
    },
    card: {
      backgroundColor: C.surface,
      marginHorizontal: 20,
      marginTop: 12,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
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
      color: C.primarySoft,
      flex: 1,
    },
    editableBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: C.surfaceAlt,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    editableText: {
      fontSize: 10,
      fontWeight: '600',
      color: C.primarySoft,
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
      color: C.textMuted,
      marginBottom: 4,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: C.textBody,
    },
    unavailableText: {
      fontSize: 12,
      fontStyle: 'italic',
      color: C.textSubtle,
      fontWeight: '500',
    },
    descriptionBox: {
      marginTop: 4,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: C.border,
    },
    descLabel: {
      fontSize: 12,
      color: C.textMuted,
      marginBottom: 6,
      fontWeight: '500',
    },
    descValue: {
      fontSize: 14,
      color: C.textBody,
      lineHeight: 20,
    },
    tableWrap: {
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 12,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: C.surfaceAlt,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    tableHeadCell: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      fontSize: 11,
      color: C.primarySoft,
      fontWeight: '700',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      backgroundColor: C.surface,
    },
    tableCell: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      fontSize: 12,
      color: C.textBody,
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
    subFieldTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: C.textMuted,
      marginBottom: 8,
    },
    subFieldSpacing: {
      marginTop: 12,
    },
    textBox: {
      backgroundColor: C.bg,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    textContent: {
      fontSize: 14,
      color: C.textBody,
      lineHeight: 20,
    },
    textArea: {
      backgroundColor: C.bg,
      borderWidth: 1,
      borderColor: C.primarySoft,
      padding: 14,
      borderRadius: 12,
      fontSize: 14,
      color: C.textBody,
      minHeight: 92,
      textAlignVertical: 'top',
    },
    approvalsList: {
      gap: 10,
    },
    approvalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: C.bg,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    approvalIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: C.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    approvalContent: {
      flex: 1,
    },
    approvalLabel: {
      fontSize: 12,
      color: C.textMuted,
      marginBottom: 2,
      fontWeight: '500',
    },
    approvalValue: {
      fontSize: 14,
      fontWeight: '600',
      color: C.textBody,
    },
    actionContainer: {
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: C.surface,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: C.border,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: C.primarySoft,
      marginBottom: 6,
    },
    actionSubtitle: {
      fontSize: 13,
      color: C.textMuted,
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
      backgroundColor: C.success,
    },
    rejectBtn: {
      backgroundColor: C.danger,
    },
    actionBtnText: {
      color: C.surface,
      fontSize: 15,
      fontWeight: '700',
    },
    bottomGap: {
      height: 30,
    },
  });
