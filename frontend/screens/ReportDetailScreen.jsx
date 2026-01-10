// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import BASE_URL from '../config/api';

// const ReportDetailScreen = ({ route }) => {
//   const { reportId } = route.params;
//   const [report, setReport] = useState(null);

//   useEffect(() => {
//     fetchReport();
//   }, []);

//   const fetchReport = async () => {
//     const token = await AsyncStorage.getItem('token');
//     const res = await axios.get(`${BASE_URL}/api/report/${reportId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setReport(res.data);
//   };

//   if (!report) return null;

//   const data = report.report_data; // JSON

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>{report.title}</Text>

//       <View style={styles.metaRow}>
//         <Text style={styles.meta}>Part No: {report.part_no}</Text>
//         <Text style={styles.meta}>Status: {report.status}</Text>
//       </View>

//       <Text style={styles.section}>Inspection Details</Text>

//       {Object.entries(data).map(([key, value]) => (
//         <View key={key} style={styles.row}>
//           <Text style={styles.label}>{key}</Text>
//           <Text style={styles.value}>
//             {typeof value === 'object' ? JSON.stringify(value) : value}
//           </Text>
//         </View>
//       ))}
//     </ScrollView>
//   );
// };

// export default ReportDetailScreen;


// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: '#F8FBFE',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#286DA6',
//     marginBottom: 12,
//   },
//   metaRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   meta: {
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   section: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   row: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//   },
//   label: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   value: {
//     fontSize: 14,
//     color: '#1F2937',
//   },
// });

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';

export default function ReportDetailScreen({ route, navigation }) {
  const { reportId } = route.params;

  const [report, setReport] = useState(null);
  const [role, setRole] = useState(null);
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const token = await AsyncStorage.getItem('token');
    const user = JSON.parse(await AsyncStorage.getItem('user'));

    setRole(user.role);
    setEditable(user.role !== 'operator');

    const res = await axios.get(`${BASE_URL}/api/report/${reportId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setReport(res.data);
  };

  if (!report) return null;

  const data = report.report_data;

  const updateField = (key, value) => {
    setReport(prev => ({
      ...prev,
      report_data: {
        ...prev.report_data,
        [key]: value,
      },
    }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Report</Text>
      </View>

      {/* Meta */}
      <View style={styles.card}>
        <Text style={styles.title}>{report.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>Part No: {report.part_no}</Text>
          <Text style={styles.meta}>Status: {report.status}</Text>
        </View>
      </View>
      {/* Part Information */}
<View style={styles.card}>
  <Text style={styles.cardTitle}>Part Information</Text>

  <View style={styles.infoGrid}>
    <InfoItem label="Customer" value={data.customer} />
    <InfoItem label="Part No" value={data.partNumber} />
    <InfoItem label="Doc No" value={data.docNo} />
    <InfoItem label="Rev No" value={data.revNo} />
  </View>

  <View style={styles.descriptionBox}>
    <Text style={styles.infoLabel}>Description</Text>
    <Text style={styles.infoValue}>{data.partDescription}</Text>
  </View>
</View>

      {/* Observations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Visual Observation</Text>

        <TextInput
          style={[styles.textArea, !editable && styles.readOnly]}
          editable={editable}
          value={data.visualObservation || ''}
          onChangeText={t => updateField('visualObservation', t)}
        />
      </View>

      {/* Remarks */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Remarks</Text>

        <TextInput
          style={[styles.textArea, !editable && styles.readOnly]}
          editable={editable}
          value={data.remarks || ''}
          onChangeText={t => updateField('remarks', t)}
        />
      </View>

      {/* Approvals */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Approvals</Text>

        <DetailRow label="QA Inspector" value={data.qa} />
        <DetailRow label="Reviewed By" value={data.reviewedBy} />
        <DetailRow label="Approved By" value={data.approvedBy} />
      </View>

      {/* Actions */}
      {editable && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.approveBtn}>
            <Ionicons name="checkmark-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn}>
            <Ionicons name="close-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '-'}</Text>
  </View>
);

const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '-'}</Text>
  </View>
);


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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E3F2FD',
    backgroundColor: '#F8FBFE',
    padding: 14,
    borderRadius: 12,
    minHeight: 100,
    color: '#1F2937',
  },
  readOnly: {
    backgroundColor: '#EEF4FA',
    color: '#6B7280',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginHorizontal: 20,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#1F7A8C',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#9B4D4D',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
});
