import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import reportApi from '../utils/reportApi';

const AccordanceScreen = ({ navigation }) => {
  const [reportType, setReportType] = useState('');
  const [customer, setCustomer] = useState('');
  const [part, setPart] = useState(null);
  const [reportsData, setReportsData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch templates with parts when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadTemplatesData();
    }, [])
  );

  const loadTemplatesData = async () => {
    try {
      setLoading(true);
      const data = await reportApi.getTemplatesWithParts();
      console.log(data);
      
      setReportsData(data);
    } catch (error) {
      console.log('Error loading templates:', error);
      // Fallback to empty state if API fails
      setReportsData({});
    } finally {
      setLoading(false);
    }
  };

  const handleGoToReport = () => {
    if (!reportType || !customer || !part) {
      alert('Please select all fields!');
      return;
    }

    navigation.navigate('AddEntry', {
      reportType,
      customer,
      part,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#286DA6" />
        </View>
      </View>
    );
  }

  return (
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
          <Ionicons name="clipboard-outline" size={32} color="#fafafaff" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Inspection Setup</Text>
            <Text style={styles.subtitle}>
              Configure your inspection report
            </Text>
          </View>
        </View>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        {Object.keys(reportsData).length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Ionicons name="document-outline" size={48} color="#c3c3c3" />
            <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>
              No inspection templates available
            </Text>
            <Text style={{ marginTop: 8, color: '#999', fontSize: 14 }}>
              Ask your admin to create templates
            </Text>
          </View>
        ) : (
          <>
            {/* Step 1: Report Type */}
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepTitle}>Select Report Type</Text>
              </View>

              <View style={styles.pickerWrapper}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#286DA6"
                  style={styles.pickerIcon}
                />
                <Picker
                  selectedValue={reportType}
                  onValueChange={value => {
                    setReportType(value);
                    setCustomer('');
                    setPart(null);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#286DA6"
                >
                  <Picker.Item label="-- Select Report Type --" value="" />
                  {Object.keys(reportsData).map(r => (
                    <Picker.Item key={r} label={r} value={r} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Step 2: Customer */}
            {reportType ? (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepTitle}>Select Customer</Text>
                </View>

                <View style={styles.pickerWrapper}>
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color="#286DA6"
                    style={styles.pickerIcon}
                  />
                  <Picker
                    selectedValue={customer}
                    onValueChange={value => {
                      setCustomer(value);
                      setPart(null);
                    }}
                    style={styles.picker}
                    dropdownIconColor="#286DA6"
                  >
                    <Picker.Item label="-- Select Customer --" value="" />
                    {Object.keys(reportsData[reportType].customers).map(c => (
                      <Picker.Item key={c} label={c} value={c} />
                    ))}
                  </Picker>
                </View>
              </View>
            ) : null}

            {/* Step 3: Part */}
            {customer ? (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepTitle}>Select Part</Text>
                </View>

                <View style={styles.pickerWrapper}>
                  <Ionicons
                    name="cube-outline"
                    size={20}
                    color="#286DA6"
                    style={styles.pickerIcon}
                  />
                  <Picker
                    selectedValue={part?.partNo || ''}
                    onValueChange={value => {
                      const selected = reportsData[reportType].customers[
                        customer
                      ].find(p => p.partNo === value);
                      setPart(selected);
                    }}
                    style={styles.picker}
                    dropdownIconColor="#286DA6"
                  >
                    <Picker.Item label="-- Select Part --" value="" />
                    {reportsData[reportType].customers[customer].map(p => (
                      <Picker.Item
                        key={p.partNo}
                        label={`${p.partNo} — ${p.description}`}
                        value={p.partNo}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            ) : null}

            {/* Part Preview */}
            {part ? (
              <View style={styles.previewCard}>
                {/* <Text style={styles.previewTitle}>Selected Part Preview</Text> */}
                <Image
                  source={
                    typeof part.img === 'string' || part.img?.uri
                      ? { uri: part.img?.uri || part.img }
                      : part.img
                  }
                  style={styles.previewImage}
                />
                <View style={styles.previewInfo}>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Part No:</Text>
                    <Text style={styles.previewValue}>{part.partNo}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Description:</Text>
                    <Text style={styles.previewValue}>{part.description}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Doc No:</Text>
                    <Text style={styles.previewValue}>{part.docNo}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Dimensions:</Text>
                    <Text style={styles.previewValue}>
                      {part.dimensions?.length || 0} items
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </>
        )}
      </View>

      {/* Continue Button */}
      {part ? (
        <TouchableOpacity style={styles.submitBtn} onPress={handleGoToReport}>
          <Text style={styles.submitBtnText}>Continue to Inspection Form</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export default AccordanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFE',
  },
  header: {
    backgroundColor: '#286DA6',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#DBEAFE',
    textAlign: 'center',
  },
  formCard: {
    marginTop: -10,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#0000000d',
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
  stepContainer: {
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#286DA6',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    // borderColor: "#E3F2FD",
    borderColor: '#00000053',
    // backgroundColor: "#F8FBFE",
    borderRadius: 12,
    paddingLeft: 12,
  },
  pickerIcon: {
    marginRight: 8,
    color: '#00000053',
  },
  picker: {
    flex: 1,
    color: '#1F2937',
  },
  previewCard: {
    // backgroundColor: '#F8FBFE',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    // borderColor: '#E3F2FD',
    borderColor: '#00000053',
  },
  previewTitle: {
    fontSize: 10,
    fontWeight: '700',
    // color: '#286DA6',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0000000d',
  },
  previewInfo: {
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  previewValue: {
    fontSize: 11,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#286DA6',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
