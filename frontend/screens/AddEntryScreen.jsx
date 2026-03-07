import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BASE_URL from '../config/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import CustomAlert from '../components/CustomAlert';
import reportApi from '../utils/reportApi';
import { useAppTheme } from '../theme/ThemeProvider';
import ZoomableImageModal from '../components/ZoomableImageModal';


const resolveImageUri = (imageUri) => {
  if (!imageUri || typeof imageUri !== 'string') return null;
  if (/^https?:\/\//i.test(imageUri)) return imageUri;
  const normalizedBase = BASE_URL.replace(/\/+$/, '');
  const normalizedPath = imageUri.startsWith('/') ? imageUri : `/${imageUri}`;
  return `${normalizedBase}${normalizedPath}`;
};
export default function AddEntryScreen({ route, navigation }) {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);
  const { part, customer, reportType, draftSubmissionId } = route.params;
  const rawImageUri = typeof part?.img === 'string' ? part.img : part?.img?.uri;
  const partImageUri = resolveImageUri(rawImageUri);
  const diagramSource = partImageUri
    ? { uri: partImageUri }
    : require('../assets/pictures/AppLogo.png');
  const [alert, setAlert] = useState({
    visible: false,
    type: 'success', // success | error | info
    title: '',
    message: '',
  });
  const showAlert = ({ type = 'info', title, message }) => {
    setAlert({
      visible: true,
      type,
      title,
      message,
    });
  };
  const [userData, setUserData] = useState({
    name: '',
    employeeId: '',
  });
  useEffect(() => {
    const loadUser = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        setUserData({
          name: parsed.name,
          employeeId: parsed.employee_id, // or parsed.employeeId if you store that
        });
      }
    };

    loadUser();
  }, []);
  // Initialize Dimensions
  const initDimensions = part.dimensions.map(d => ({
    ...d,
    actual: Array.isArray(d.actual) ? d.actual : [d.actual || ''],
  }));

  // Initialize Form with current date
  const [form, setForm] = useState({
    customer: customer,
    partNumber: part.partNo,
    partDescription: part.description,
    docNo: part.docNo,
    revNo: part.revNo,
    reportType: reportType,
    inspectionDate: new Date().toISOString().split('T')[0],
    shift: '',
    dimensions: initDimensions,
  });

  const [loading, setLoading] = useState(false);
  const [draftHydrating, setDraftHydrating] = useState(false);
  const [diagramViewerVisible, setDiagramViewerVisible] = useState(false);

  const buildSubmissionValues = async () => {
    const templateRes = await reportApi.getTemplatesByCategory(part.templateId);
    const templateFields = Array.isArray(templateRes?.fields)
      ? templateRes.fields
      : [];

    const byPosition = new Map();
    const byLabel = new Map();

    templateFields.forEach(f => {
      if (f.position !== null && f.position !== undefined) {
        byPosition.set(Number(f.position), f);
      }
      if (f.label) {
        byLabel.set(String(f.label).trim().toLowerCase(), f);
      }
    });

    const values = [];
    form.dimensions.forEach((d, index) => {
      const matchByPos = byPosition.get(Number(d.slNo));
      const matchByLabel = d.desc
        ? byLabel.get(String(d.desc).trim().toLowerCase())
        : null;
      const fallbackByIndex = templateFields[index];
      const field = matchByPos || matchByLabel || fallbackByIndex;

      if (!field?.id || !Array.isArray(d.actual)) return;

      d.actual
        .map(v => (v ?? '').toString().trim())
        .filter(Boolean)
        .forEach(actualValue => {
          values.push({
            field_id: field.id,
            value: actualValue,
          });
        });
    });

    return values;
  };

  const handleSubmit = async () => {
    console.log(form);

    // Validation
    if (!form.shift) {
      // Alert.alert('Missing Information', 'Please select a shift');
      showAlert({
        type: 'error',
        title: 'Missing Information',
        message: 'Please select a shift',
      });

      return;
    }

    setLoading(true);
    try {
      const values = await buildSubmissionValues();
      if (!part?.templateId) {
        showAlert({
          type: 'error',
          title: 'Submission Failed',
          message: 'Missing template selection. Please reselect the part and try again.',
        });
        setLoading(false);
        return;
      }

      if (values.length === 0) {
        showAlert({
          type: 'error',
          title: 'Missing Measurements',
          message: 'Please enter at least one measurement value before submitting.',
        });
        setLoading(false);
        return;
      }

      await reportApi.createSubmission({
        template_id: part.templateId,
        inspection_date: form.inspectionDate,
        shift: form.shift,
        values,
      });

      // Alert.alert('Success', 'Inspection report submitted successfully!', [
      //   { text: 'OK', onPress: () => navigation.goBack() },
      // ]);
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Inspection report submitted successfully!',
      });

      setTimeout(() => {
        navigation.goBack();
      }, 2000); // same as alert duration

      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.log('Submission Error:', errorMessage, err);
      // Alert.alert('Error', 'Failed to submit report: ' + errorMessage);
      showAlert({
        type: 'error',
        title: 'Submission Failed',
        message: errorMessage,
      });

      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!part?.templateId) return;
    setLoading(true);
    try {
      const values = await buildSubmissionValues();
      await reportApi.createSubmission({
        template_id: part.templateId,
        inspection_date: form.inspectionDate,
        shift: form.shift || null,
        values,
        status: 'draft',
      });
      showAlert({
        type: 'success',
        title: 'Draft Saved',
        message: 'You can continue this report later from Saved Reports.',
      });
      setTimeout(() => navigation.goBack(), 1200);
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Draft Save Failed',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDimensionChange = (dimIndex, actualIndex, value) => {
    const updated = [...form.dimensions];
    if (updated[dimIndex] && updated[dimIndex].actual) {
      updated[dimIndex].actual[actualIndex] = value;
      setForm({ ...form, dimensions: updated });
    }
  };

  const addSample = dimIndex => {
    const updated = [...form.dimensions];
    if (updated[dimIndex] && updated[dimIndex].actual) {
      updated[dimIndex].actual.push('');
      setForm({ ...form, dimensions: updated });
    }
  };

  // const formatDate = date => {
  //   return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  // };

  useEffect(() => {
    const loadDraft = async () => {
      if (!draftSubmissionId) return;
      setDraftHydrating(true);
      try {
        const res = await reportApi.getSubmissionById(draftSubmissionId);
        const submission = res?.submission || {};
        const values = Array.isArray(res?.values) ? res.values : [];

        const byLabel = {};
        values.forEach(v => {
          const key = (v.label || '').trim().toLowerCase();
          if (!key) return;
          if (!byLabel[key]) byLabel[key] = [];
          byLabel[key].push(String(v.actual_value ?? v.value ?? ''));
        });

        const mergedDims = initDimensions.map(d => {
          const key = (d.desc || '').trim().toLowerCase();
          const actualList = byLabel[key];
          if (actualList && actualList.length > 0) {
            return { ...d, actual: actualList };
          }
          return d;
        });

        setForm(prev => ({
          ...prev,
          inspectionDate: submission.inspection_date
            ? String(submission.inspection_date).slice(0, 10)
            : prev.inspectionDate,
          shift: submission.shift || prev.shift,
          dimensions: mergedDims,
        }));
      } catch (err) {
        console.log('Failed to hydrate draft', err);
      } finally {
        setDraftHydrating(false);
      }
    };

    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftSubmissionId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={C.surface} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerPill}>
              <Ionicons name="sparkles-outline" size={13} color={C.primarySoft} />
              <Text style={styles.headerPillText}>Smart Quality Entry</Text>
            </View>
            <Text style={styles.headerTitle}>Inspection Report</Text>
            <Text style={styles.headerSubtitle}>{reportType}</Text>
          </View>
        </View>

        {/* Inspector Info Card */}
        <View style={styles.inspectorCard}>
          <View style={styles.inspectorHeader}>
            <Ionicons name="person-circle-outline" size={24} color={C.primarySoft} />
            <Text style={styles.inspectorTitle}>Inspector Details</Text>
          </View>
          <View style={styles.inspectorInfo}>
            <View style={styles.inspectorRow}>
              <Text style={styles.inspectorLabel}>Name:</Text>
              <Text style={styles.inspectorValue}>{userData.name}</Text>
            </View>
            <View style={styles.inspectorRow}>
              <Text style={styles.inspectorLabel}>Employee ID:</Text>
              <Text style={styles.inspectorValue}>{userData.employeeId}</Text>
            </View>
            <View style={styles.inspectorRow}>
              <Text style={styles.inspectorLabel}>Date:</Text>
              {/* <Text style={styles.inspectorValue}>
                {formatDate(form.inspectionDate)}
              </Text> */}
              <Text style={styles.inspectorValue}>{form.inspectionDate}</Text>
            </View>
          </View>
        </View>

        {/* Part Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube-outline" size={20} color={C.primarySoft} />
            <Text style={styles.cardTitle}>Part Information</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setDiagramViewerVisible(true)}
          >
            <Image source={diagramSource} style={styles.partImage} />
            <Text style={styles.imageTapHint}>Tap diagram to enlarge and zoom</Text>
          </TouchableOpacity>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>{form.customer}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Part No</Text>
              <Text style={styles.infoValue}>{form.partNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Doc No</Text>
              <Text style={styles.infoValue}>{form.docNo}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rev No</Text>
              <Text style={styles.infoValue}>{form.revNo}</Text>
            </View>
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.descriptionValue}>{form.partDescription}</Text>
          </View>
        </View>

        {/* Shift Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={20} color={C.primarySoft} />
            <Text style={styles.cardTitle}>Shift Details</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <Ionicons
              name="time-outline"
              size={20}
              color={C.primarySoft}
              style={styles.pickerIcon}
            />
            <Picker
              selectedValue={form.shift}
              onValueChange={v => setForm({ ...form, shift: v })}
              style={styles.picker}
              dropdownIconColor={C.primarySoft}
            >
              <Picker.Item label="Select Shift" value="" />
              <Picker.Item label="Day Shift" value="day" />
              <Picker.Item label="Evening Shift" value="evening" />
              <Picker.Item label="Night Shift" value="night" />
            </Picker>
          </View>
        </View>

        {/* Dimensions Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="resize-outline" size={24} color={C.primarySoft} />
            <Text style={styles.cardTitle}>Dimensions Inspection</Text>
          </View>

          {form.dimensions.map((d, i) => (
            <View key={i} style={styles.dimensionCard}>
              <View style={styles.dimensionHeader}>
                <View style={styles.dimensionNumber}>
                  <Text style={styles.dimensionNumberText}>{d.slNo}</Text>
                </View>
                <View style={styles.dimensionInfo}>
                  <Text style={styles.dimensionDesc}>{d.desc}</Text>
                  <Text style={styles.dimensionSpec}>
                    Specification: {d.spec} {d.unit ? `(${d.unit})` : ''}
                  </Text>
                </View>
              </View>

              {Array.isArray(d.actual) &&
                d.actual.map((val, idx) => (
                  <View key={idx} style={styles.actualInputContainer}>
                    <Text style={styles.actualLabel}>Sample {idx + 1}</Text>
                    <TextInput
                      style={styles.actualInput}
                      placeholder="Enter actual value"
                      placeholderTextColor={C.textSubtle}
                      value={val}
                      keyboardType="numeric"
                      onChangeText={newVal =>
                        handleDimensionChange(i, idx, newVal)
                      }
                    />
                  </View>
                ))}

              <TouchableOpacity
                style={styles.addSampleBtn}
                onPress={() => addSample(i)}
              >
                <Ionicons name="add-circle-outline" size={18} color={C.primarySoft} />
                <Text style={styles.addSampleText}>Add Sample</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.draftBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSaveDraft}
          disabled={loading || draftHydrating}
        >
          <Ionicons name="save-outline" size={20} color={C.primarySoft} />
          <Text style={styles.draftBtnText}>Save as Draft</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || draftHydrating}
        >
          {loading ? (
            <Text style={styles.submitBtnText}>Submitting...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color={C.surface} />
              <Text style={styles.submitBtnText}>Submit Inspection Report</Text>
            </>
          )}
        </TouchableOpacity>
        <CustomAlert
          visible={alert.visible}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onHide={() =>
            setAlert(prev => ({
              ...prev,
              visible: false,
            }))
          }
        />
        <ZoomableImageModal
          visible={diagramViewerVisible}
          onClose={() => setDiagramViewerVisible(false)}
          imageSource={diagramSource}
          title={`${form.partNumber || 'Part'} Diagram`}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = C => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    backgroundColor: C.surface,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  headerPillText: {
    color: C.primarySoft,
    fontSize: 11,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.textStrong,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.textMuted,
  },
  inspectorCard: {
    backgroundColor: C.surface,
    marginHorizontal: 20,
    marginTop: -12,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  inspectorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primarySoft,
  },
  inspectorInfo: {
    gap: 8,
  },
  inspectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inspectorLabel: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: '500',
  },
  inspectorValue: {
    fontSize: 14,
    color: C.textBody,
    fontWeight: '600',
  },
  card: {
    backgroundColor: C.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
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
    fontSize: 17,
    fontWeight: '700',
    color: C.textStrong,
  },
  partImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageTapHint: {
    marginTop: -6,
    marginBottom: 8,
    color: C.primarySoft,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: C.surfaceAlt,
    padding: 12,
    borderRadius: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textBody,
  },
  descriptionBox: {
    backgroundColor: C.surfaceAlt,
    padding: 12,
    borderRadius: 10,
  },
  descriptionLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 4,
  },
  descriptionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textBody,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    paddingLeft: 12,
  },
  pickerIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    color: C.textBody,
  },
  dimensionCard: {
    backgroundColor: C.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  dimensionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  dimensionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dimensionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.surface,
  },
  dimensionInfo: {
    flex: 1,
  },
  dimensionDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textBody,
    marginBottom: 4,
  },
  dimensionSpec: {
    fontSize: 13,
    color: C.primarySoft,
    fontWeight: '500',
  },
  actualInputContainer: {
    marginBottom: 8,
  },
  actualLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
  actualInput: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    color: C.textBody,
  },
  addSampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  addSampleText: {
    fontSize: 14,
    color: C.primarySoft,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textBody,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surfaceAlt,
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: C.textBody,
  },
  textArea: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surfaceAlt,
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: C.textBody,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: C.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  draftBtn: {
    flexDirection: 'row',
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  draftBtnText: {
    color: C.primarySoft,
    fontSize: 15,
    fontWeight: '700',
  },
});

