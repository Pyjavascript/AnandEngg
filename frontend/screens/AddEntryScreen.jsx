// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image,
//   Alert,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import axios from 'axios';
// import { BASE_URL } from '../config/api';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// export default function AddEntryScreen({ route, navigation }) {
//   const { part, customer, reportType } = route.params;

//   // User data (Rajesh Kumar)
//   const userData = {
//     name: 'Rajesh Kumar',
//     employeeId: 'AE-2024-001',
//   };

//   // Initialize Dimensions
//   const initDimensions = part.dimensions.map(d => ({
//     ...d,
//     actual: Array.isArray(d.actual) ? d.actual : [d.actual || ''],
//   }));

//   // Initialize Form with current date
//   const [form, setForm] = useState({
//     customer: customer,
//     partNumber: part.partNo,
//     partDescription: part.description,
//     docNo: part.docNo,
//     revNo: part.revNo,
//     inspectionDate: new Date(), // Current date
//     shift: '',
//     dimensions: initDimensions,
//     visualObservation: '',
//     remarks: '',
//     qa: userData.name, // Pre-filled with Rajesh Kumar
//     reviewedBy: '',
//     approvedBy: '',
//   });

//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     // Validation
//     if (!form.shift) {
//       Alert.alert('Missing Information', 'Please select a shift');
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.post(`${BASE_URL}api/report/create`, form);
//       Alert.alert('Success', 'Inspection report submitted successfully!', [
//         { text: 'OK', onPress: () => navigation.goBack() }
//       ]);
//       setLoading(false);
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message;
//       console.log('Submission Error:', errorMessage);
//       Alert.alert('Error', 'Failed to submit report: ' + errorMessage);
//       setLoading(false);
//     }
//   };

//   const handleDimensionChange = (dimIndex, actualIndex, value) => {
//     const updated = [...form.dimensions];
//     if (updated[dimIndex] && updated[dimIndex].actual) {
//       updated[dimIndex].actual[actualIndex] = value;
//       setForm({ ...form, dimensions: updated });
//     }
//   };

//   const addSample = (dimIndex) => {
//     const updated = [...form.dimensions];
//     if (updated[dimIndex] && updated[dimIndex].actual) {
//       updated[dimIndex].actual.push('');
//       setForm({ ...form, dimensions: updated });
//     }
//   };

//   const formatDate = (date) => {
//     return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//         <View style={styles.headerContent}>
//           <Text style={styles.headerTitle}>Inspection Report</Text>
//           <Text style={styles.headerSubtitle}>{reportType}</Text>
//         </View>
//       </View>

//       {/* Inspector Info Card */}
//       <View style={styles.inspectorCard}>
//         <View style={styles.inspectorHeader}>
//           <Ionicons name="person-circle-outline" size={24} color="#286DA6" />
//           <Text style={styles.inspectorTitle}>Inspector Details</Text>
//         </View>
//         <View style={styles.inspectorInfo}>
//           <View style={styles.inspectorRow}>
//             <Text style={styles.inspectorLabel}>Name:</Text>
//             <Text style={styles.inspectorValue}>{userData.name}</Text>
//           </View>
//           <View style={styles.inspectorRow}>
//             <Text style={styles.inspectorLabel}>Employee ID:</Text>
//             <Text style={styles.inspectorValue}>{userData.employeeId}</Text>
//           </View>
//           <View style={styles.inspectorRow}>
//             <Text style={styles.inspectorLabel}>Date:</Text>
//             <Text style={styles.inspectorValue}>{formatDate(form.inspectionDate)}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Part Info Card */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Part Information</Text>
//         <Image source={part.img} style={styles.partImage} />
        
//         <View style={styles.infoGrid}>
//           <View style={styles.infoItem}>
//             <Text style={styles.infoLabel}>Customer</Text>
//             <Text style={styles.infoValue}>{form.customer}</Text>
//           </View>
//           <View style={styles.infoItem}>
//             <Text style={styles.infoLabel}>Part No</Text>
//             <Text style={styles.infoValue}>{form.partNumber}</Text>
//           </View>
//           <View style={styles.infoItem}>
//             <Text style={styles.infoLabel}>Doc No</Text>
//             <Text style={styles.infoValue}>{form.docNo}</Text>
//           </View>
//           <View style={styles.infoItem}>
//             <Text style={styles.infoLabel}>Rev No</Text>
//             <Text style={styles.infoValue}>{form.revNo}</Text>
//           </View>
//         </View>
        
//         <View style={styles.descriptionBox}>
//           <Text style={styles.descriptionLabel}>Description</Text>
//           <Text style={styles.descriptionValue}>{form.partDescription}</Text>
//         </View>
//       </View>

//       {/* Shift Selection */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Shift Details</Text>
//         <View style={styles.pickerWrapper}>
//           <Ionicons name="time-outline" size={20} color="#286DA6" style={styles.pickerIcon} />
//           <Picker
//             selectedValue={form.shift}
//             onValueChange={(v) => setForm({ ...form, shift: v })}
//             style={styles.picker}
//             dropdownIconColor="#286DA6"
//           >
//             <Picker.Item label="Select Shift" value="" />
//             <Picker.Item label="Day Shift" value="day" />
//             <Picker.Item label="Evening Shift" value="evening" />
//             <Picker.Item label="Night Shift" value="night" />
//           </Picker>
//         </View>
//       </View>

//       {/* Dimensions Section */}
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Ionicons name="resize-outline" size={24} color="#286DA6" />
//           <Text style={styles.cardTitle}>Dimensions Inspection</Text>
//         </View>
        
//         {form.dimensions.map((d, i) => (
//           <View key={i} style={styles.dimensionCard}>
//             <View style={styles.dimensionHeader}>
//               <View style={styles.dimensionNumber}>
//                 <Text style={styles.dimensionNumberText}>{d.slNo}</Text>
//               </View>
//               <View style={styles.dimensionInfo}>
//                 <Text style={styles.dimensionDesc}>{d.desc}</Text>
//                 <Text style={styles.dimensionSpec}>Specification: {d.spec}</Text>
//               </View>
//             </View>

//             {Array.isArray(d.actual) &&
//               d.actual.map((val, idx) => (
//                 <View key={idx} style={styles.actualInputContainer}>
//                   <Text style={styles.actualLabel}>Sample {idx + 1}</Text>
//                   <TextInput
//                     style={styles.actualInput}
//                     placeholder="Enter actual value"
//                     placeholderTextColor="#B0C4D8"
//                     value={val}
//                     keyboardType="numeric"
//                     onChangeText={(newVal) => handleDimensionChange(i, idx, newVal)}
//                   />
//                 </View>
//               ))}

//             <TouchableOpacity
//               style={styles.addSampleBtn}
//               onPress={() => addSample(i)}
//             >
//               <Ionicons name="add-circle-outline" size={18} color="#286DA6" />
//               <Text style={styles.addSampleText}>Add Sample</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </View>

//       {/* Observations */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Visual Observation</Text>
//         <TextInput
//           style={styles.textArea}
//           placeholder="Enter visual observations..."
//           placeholderTextColor="#B0C4D8"
//           value={form.visualObservation}
//           multiline
//           numberOfLines={4}
//           onChangeText={(t) => setForm({ ...form, visualObservation: t })}
//         />
//       </View>

//       {/* Remarks */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Remarks</Text>
//         <TextInput
//           style={styles.textArea}
//           placeholder="Enter any remarks..."
//           placeholderTextColor="#B0C4D8"
//           value={form.remarks}
//           multiline
//           numberOfLines={4}
//           onChangeText={(t) => setForm({ ...form, remarks: t })}
//         />
//       </View>

//       {/* Approvals */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Approvals</Text>
        
//         <View style={styles.inputContainer}>
//           <Text style={styles.inputLabel}>QA Inspector</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="QA Name"
//             placeholderTextColor="#B0C4D8"
//             value={form.qa}
//             onChangeText={(t) => setForm({ ...form, qa: t })}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Text style={styles.inputLabel}>Reviewed By</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Reviewer Name"
//             placeholderTextColor="#B0C4D8"
//             value={form.reviewedBy}
//             onChangeText={(t) => setForm({ ...form, reviewedBy: t })}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Text style={styles.inputLabel}>Approved By</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Approver Name"
//             placeholderTextColor="#B0C4D8"
//             value={form.approvedBy}
//             onChangeText={(t) => setForm({ ...form, approvedBy: t })}
//           />
//         </View>
//       </View>

//       {/* Submit Button */}
//       <TouchableOpacity
//         style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
//         onPress={handleSubmit}
//         disabled={loading}
//       >
//         {loading ? (
//           <Text style={styles.submitBtnText}>Submitting...</Text>
//         ) : (
//           <>
//             <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
//             <Text style={styles.submitBtnText}>Submit Inspection Report</Text>
//           </>
//         )}
//       </TouchableOpacity>

//       <View style={{ height: 30 }} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FBFE',
//   },
//   header: {
//     backgroundColor: '#286DA6',
//     paddingTop: 60,
//     paddingBottom: 24,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   headerContent: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#DBEAFE',
//   },
//   inspectorCard: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 20,
//     marginTop: -10,
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor:'#0000000d',
//   },
//   inspectorHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 12,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E3F2FD',
//   },
//   inspectorTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#286DA6',
//   },
//   inspectorInfo: {
//     gap: 8,
//   },
//   inspectorRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   inspectorLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   inspectorValue: {
//     fontSize: 14,
//     color: '#1F2937',
//     fontWeight: '600',
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 20,
//     marginTop: 16,
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor:'#0000000d',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#286DA6',
//     marginBottom: 16,
//   },
//   partImage: {
//     width: '100%',
//     height: 200,
//     resizeMode: 'contain',
//     backgroundColor: '#F8FBFE',
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   infoGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//     marginBottom: 12,
//   },
//   infoItem: {
//     flex: 1,
//     minWidth: '45%',
//     backgroundColor: '#F8FBFE',
//     padding: 12,
//     borderRadius: 10,
//   },
//   infoLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   infoValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   descriptionBox: {
//     backgroundColor: '#F8FBFE',
//     padding: 12,
//     borderRadius: 10,
//   },
//   descriptionLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   descriptionValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   pickerWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#E3F2FD',
//     backgroundColor: '#F8FBFE',
//     borderRadius: 12,
//     paddingLeft: 12,
//   },
//   pickerIcon: {
//     marginRight: 8,
//   },
//   picker: {
//     flex: 1,
//     color: '#1F2937',
//   },
//   dimensionCard: {
//     backgroundColor: '#F8FBFE',
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//   },
//   dimensionHeader: {
//     flexDirection: 'row',
//     marginBottom: 12,
//     gap: 12,
//   },
//   dimensionNumber: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#286DA6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   dimensionNumberText: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
//   dimensionInfo: {
//     flex: 1,
//   },
//   dimensionDesc: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   dimensionSpec: {
//     fontSize: 13,
//     color: '#286DA6',
//     fontWeight: '500',
//   },
//   actualInputContainer: {
//     marginBottom: 8,
//   },
//   actualLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 4,
//     fontWeight: '500',
//   },
//   actualInput: {
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//     backgroundColor: '#FFFFFF',
//     padding: 12,
//     borderRadius: 10,
//     fontSize: 15,
//     color: '#1F2937',
//   },
//   addSampleBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingVertical: 8,
//   },
//   addSampleText: {
//     fontSize: 14,
//     color: '#286DA6',
//     fontWeight: '600',
//   },
//   inputContainer: {
//     marginBottom: 16,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//     backgroundColor: '#F8FBFE',
//     padding: 14,
//     borderRadius: 12,
//     fontSize: 15,
//     color: '#1F2937',
//   },
//   textArea: {
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//     backgroundColor: '#F8FBFE',
//     padding: 14,
//     borderRadius: 12,
//     fontSize: 15,
//     color: '#1F2937',
//     minHeight: 100,
//     textAlignVertical: 'top',
//   },
//   submitBtn: {
//     flexDirection: 'row',
//     backgroundColor: '#286DA6',
//     marginHorizontal: 20,
//     marginTop: 24,
//     padding: 18,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     shadowColor: '#286DA6',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   submitBtnDisabled: {
//     opacity: 0.6,
//   },
//   submitBtnText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BASE_URL } from '../config/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AddEntryScreen({ route, navigation }) {
  const { part, customer, reportType } = route.params;

  const userData = {
    name: 'Rajesh Kumar',
    employeeId: 'AE-2024-001',
  };

  const initDimensions = part.dimensions.map(d => ({
    ...d,
    actual: Array.isArray(d.actual) ? d.actual : [d.actual || ''],
  }));

  const [form, setForm] = useState({
    customer: customer,
    partNumber: part.partNo,
    partDescription: part.description,
    docNo: part.docNo,
    revNo: part.revNo,
    inspectionDate: new Date(),
    shift: '',
    dimensions: initDimensions,
    visualObservation: '',
    remarks: '',
    qa: userData.name,
    reviewedBy: '',
    approvedBy: '',
  });

  const [loading, setLoading] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  const handleSubmit = async () => {
    if (!form.shift) {
      Alert.alert('Missing Information', 'Please select a shift');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}api/report/create`, form);
      Alert.alert('Success', 'Inspection report submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.log('Submission Error:', errorMessage);
      Alert.alert('Error', 'Failed to submit report: ' + errorMessage);
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

  const addSample = (dimIndex) => {
    const updated = [...form.dimensions];
    if (updated[dimIndex] && updated[dimIndex].actual) {
      updated[dimIndex].actual.push('');
      setForm({ ...form, dimensions: updated });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
            <Text style={styles.inspectorValue}>{formatDate(form.inspectionDate)}</Text>
          </View>
        </View>
      </View>

      {/* Part Info Card - Compact */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Part Information</Text>
        
        {/* Image with Zoom Icon */}
        <View style={styles.imageContainer}>
          <Image source={part.img} style={styles.partImage} />
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={() => setImageZoomed(true)}
          >
            <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Compact Info Grid */}
        <View style={styles.compactGrid}>
          <View style={styles.compactRow}>
            <Text style={styles.compactLabel}>Customer</Text>
            <Text style={styles.compactValue}>{form.customer}</Text>
          </View>
          <View style={styles.compactRow}>
            <Text style={styles.compactLabel}>Part No</Text>
            <Text style={styles.compactValue}>{form.partNumber}</Text>
          </View>
          <View style={styles.compactRow}>
            <Text style={styles.compactLabel}>Doc No</Text>
            <Text style={styles.compactValue}>{form.docNo}</Text>
          </View>
          <View style={styles.compactRow}>
            <Text style={styles.compactLabel}>Rev No</Text>
            <Text style={styles.compactValue}>{form.revNo}</Text>
          </View>
          <View style={[styles.compactRow, styles.fullWidth]}>
            <Text style={styles.compactLabel}>Description</Text>
            <Text style={styles.compactValue}>{form.partDescription}</Text>
          </View>
        </View>
      </View>

      {/* Shift Selection - Compact */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shift</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.shift}
            onValueChange={(v) => setForm({ ...form, shift: v })}
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

      {/* Dimensions Section - Compact */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dimensions ({form.dimensions.length})</Text>
        
        {form.dimensions.map((d, i) => (
          <View key={i} style={styles.dimensionCard}>
            {/* Compact Header */}
            <View style={styles.dimensionHeader}>
              <View style={styles.dimensionBadge}>
                <Text style={styles.dimensionBadgeText}>{d.slNo}</Text>
              </View>
              <View style={styles.dimensionInfo}>
                <Text style={styles.dimensionDesc}>{d.desc}</Text>
                <Text style={styles.dimensionSpec}>Spec: {d.spec}</Text>
              </View>
            </View>

            {/* Samples - Horizontal when single, vertical when multiple */}
            <View style={styles.samplesWrapper}>
              {Array.isArray(d.actual) &&
                d.actual.map((val, idx) => (
                  <View key={idx} style={styles.sampleInputWrapper}>
                    <TextInput
                      style={styles.sampleInput}
                      placeholder={`Sample ${idx + 1}`}
                      placeholderTextColor="#B0C4D8"
                      value={val}
                      keyboardType="numeric"
                      onChangeText={(newVal) => handleDimensionChange(i, idx, newVal)}
                    />
                  </View>
                ))}
            </View>

            <TouchableOpacity
              style={styles.addSampleBtn}
              onPress={() => addSample(i)}
            >
              <Ionicons name="add-circle-outline" size={16} color="#286DA6" />
              <Text style={styles.addSampleText}>Add Sample</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Observations & Remarks - Combined */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Observations & Remarks</Text>
        
        <Text style={styles.inputLabel}>Visual Observation</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter visual observations..."
          placeholderTextColor="#B0C4D8"
          value={form.visualObservation}
          multiline
          numberOfLines={3}
          onChangeText={(t) => setForm({ ...form, visualObservation: t })}
        />

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>Remarks</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter remarks..."
          placeholderTextColor="#B0C4D8"
          value={form.remarks}
          multiline
          numberOfLines={3}
          onChangeText={(t) => setForm({ ...form, remarks: t })}
        />
      </View>

      {/* Approvals - Compact */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Approvals</Text>
        
        <View style={styles.approvalRow}>
          <Text style={styles.approvalLabel}>QA</Text>
          <TextInput
            style={styles.approvalInput}
            placeholder="QA Name"
            placeholderTextColor="#B0C4D8"
            value={form.qa}
            onChangeText={(t) => setForm({ ...form, qa: t })}
          />
        </View>

        <View style={styles.approvalRow}>
          <Text style={styles.approvalLabel}>Reviewed</Text>
          <TextInput
            style={styles.approvalInput}
            placeholder="Reviewer Name"
            placeholderTextColor="#B0C4D8"
            value={form.reviewedBy}
            onChangeText={(t) => setForm({ ...form, reviewedBy: t })}
          />
        </View>

        <View style={styles.approvalRow}>
          <Text style={styles.approvalLabel}>Approved</Text>
          <TextInput
            style={styles.approvalInput}
            placeholder="Approver Name"
            placeholderTextColor="#B0C4D8"
            value={form.approvedBy}
            onChangeText={(t) => setForm({ ...form, approvedBy: t })}
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
            <Text style={styles.submitBtnText}>Submit Report</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 30 }} />

      {/* Image Zoom Modal */}
      <Modal
        visible={imageZoomed}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageZoomed(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setImageZoomed(false)}
          >
            <View style={styles.zoomedImageContainer}>
              <Image source={part.img} style={styles.zoomedImage} resizeMode="contain" />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setImageZoomed(false)}
              >
                <Ionicons name="close-circle" size={40} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
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
    borderWidth: 1,
    borderColor:'#0000000d',
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
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor:'#0000000d',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  partImage: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    backgroundColor: '#F8FBFE',
    borderRadius: 12,
  },
  zoomButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#286DA6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  compactGrid: {
    gap: 8,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FBFE',
    padding: 10,
    borderRadius: 8,
  },
  fullWidth: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  compactLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  compactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E3F2FD',
    backgroundColor: '#F8FBFE',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    color: '#1F2937',
  },
  dimensionCard: {
    backgroundColor: '#F8FBFE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  dimensionHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  dimensionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#286DA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dimensionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dimensionInfo: {
    flex: 1,
  },
  dimensionDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  dimensionSpec: {
    fontSize: 12,
    color: '#286DA6',
    fontWeight: '500',
  },
  samplesWrapper: {
    gap: 6,
    marginBottom: 6,
  },
  sampleInputWrapper: {
    flexDirection: 'row',
  },
  sampleInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  addSampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  addSampleText: {
    fontSize: 13,
    color: '#286DA6',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E3F2FD',
    backgroundColor: '#F8FBFE',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  approvalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    width: 70,
  },
  approvalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    backgroundColor: '#F8FBFE',
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#286DA6',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: '95%',
    height: '95%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});