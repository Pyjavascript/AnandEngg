import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BASE_URL from '../config/api';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import CustomAlert from '../components/CustomAlert';
import reportApi from '../utils/reportApi';

export default function AddEntryScreen({ route, navigation }) {
  const { part, customer, reportType } = route.params;
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

        setForm(prev => ({
          ...prev,
          qa: parsed.name,
        }));
      }
      console.log(form);
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
    visualObservation: '',
    remarks: '',
    qa: userData.name, // Pre-filled with Rajesh Kumar
    reviewedBy: '',
    approvedBy: '',
  });

  const [loading, setLoading] = useState(false);

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
      // await axios.post(`${BASE_URL}api/report/create`, form);
      const token = await AsyncStorage.getItem('token');
      // setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 0));
      if (!token) {
        Alert.alert('Session expired', 'Please login again');
        setLoading(false);
        return;
      }

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

      await axios.post(`${BASE_URL}/api/report/submissions`, {
        template_id: part.templateId,
        inspection_date: form.inspectionDate,
        shift: form.shift,
        values,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Inspection Report</Text>
            <Text style={styles.headerSubtitle}>{reportType}</Text>
          </View>
        </View>

        {/* Inspector Info Card */}
        <View style={styles.inspectorCard}>
          <View style={styles.inspectorHeader}>
            <Ionicons name="person-circle-outline" size={24} color="#286DA6" />
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
          <Text style={styles.cardTitle}>Part Information</Text>
          <Image
            source={
              part?.img?.uri
                ? { uri: part.img.uri }
                : require('../assets/pictures/AppLogo.png')
            }
            style={styles.partImage}
          />

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
          <Text style={styles.cardTitle}>Shift Details</Text>
          <View style={styles.pickerWrapper}>
            <Ionicons
              name="time-outline"
              size={20}
              color="#286DA6"
              style={styles.pickerIcon}
            />
            <Picker
              selectedValue={form.shift}
              onValueChange={v => setForm({ ...form, shift: v })}
              style={styles.picker}
              dropdownIconColor="#286DA6"
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
            <Ionicons name="resize-outline" size={24} color="#286DA6" />
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
                      placeholderTextColor="#B0C4D8"
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
                <Ionicons name="add-circle-outline" size={18} color="#286DA6" />
                <Text style={styles.addSampleText}>Add Sample</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Observations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visual Observation</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter visual observations..."
            placeholderTextColor="#B0C4D8"
            value={form.visualObservation}
            multiline
            numberOfLines={4}
            onChangeText={t => setForm({ ...form, visualObservation: t })}
          />
        </View>

        {/* Remarks */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Remarks</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter any remarks..."
            placeholderTextColor="#B0C4D8"
            value={form.remarks}
            multiline
            numberOfLines={4}
            onChangeText={t => setForm({ ...form, remarks: t })}
          />
        </View>

        {/* Approvals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Approvals</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>QA Inspector</Text>
            <TextInput
              style={styles.input}
              placeholder="QA Name"
              placeholderTextColor="#B0C4D8"
              value={form.qa}
              onChangeText={t => setForm({ ...form, qa: t })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Reviewed By</Text>
            <TextInput
              style={styles.input}
              placeholder="Reviewer Name"
              placeholderTextColor="#B0C4D8"
              value={form.reviewedBy}
              onChangeText={t => setForm({ ...form, reviewedBy: t })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Approved By</Text>
            <TextInput
              style={styles.input}
              placeholder="Approver Name"
              placeholderTextColor="#B0C4D8"
              value={form.approvedBy}
              onChangeText={t => setForm({ ...form, approvedBy: t })}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitBtnText}>Submitting...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
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

        <View style={{ height: 30 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFE',
  },
  header: {
    backgroundColor: '#286DA6',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#DBEAFE',
  },
  inspectorCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  inspectorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#286DA6',
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
    color: '#6B7280',
    fontWeight: '500',
  },
  inspectorValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 16,
  },
  partImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    backgroundColor: '#F8FBFE',
    borderRadius: 12,
    marginBottom: 16,
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
    backgroundColor: '#F8FBFE',
    padding: 12,
    borderRadius: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  descriptionBox: {
    backgroundColor: '#F8FBFE',
    padding: 12,
    borderRadius: 10,
  },
  descriptionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  descriptionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E3F2FD',
    backgroundColor: '#F8FBFE',
    borderRadius: 12,
    paddingLeft: 12,
  },
  pickerIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    color: '#1F2937',
  },
  dimensionCard: {
    backgroundColor: '#F8FBFE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
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
    color: '#1F2937',
    marginBottom: 4,
  },
  dimensionSpec: {
    fontSize: 13,
    color: '#286DA6',
    fontWeight: '500',
  },
  actualInputContainer: {
    marginBottom: 8,
  },
  actualLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  actualInput: {
    borderWidth: 1,
    borderColor: '#E3F2FD',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  addSampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  addSampleText: {
    fontSize: 14,
    color: '#286DA6',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E3F2FD',
    backgroundColor: '#F8FBFE',
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E3F2FD',
    backgroundColor: '#F8FBFE',
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#286DA6',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 18,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
