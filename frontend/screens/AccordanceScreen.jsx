import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

// const reportsData = {
//   'Cutting Inspection Report': {
//     customers: {
//       Vestas: [
//         {
//           partNo: '29314225-2',
//           img: require('../assets/diagrams/1.png'),
//           description: 'DOOR PLATE BOTTOM RH',
//           docNo: 'AE – QA-IR-FCG- SC02',
//           revNo: '00',
//           date: '27-09-2024',
//           dimensions: [
//             { slNo: 1, desc: 'Total Length', spec: '647', actual: '' },
//             { slNo: 2, desc: 'Width 1', spec: '56-1', actual: '' },
//             { slNo: 3, desc: 'Width 2', spec: '115-1', actual: '' },
//           ],
//         },
//         {
//           partNo: '29314225-3',
//           img: require('../assets/diagrams/2.png'),
//           description: 'DOOR PLATE TOP RH',
//           docNo: 'AE – QA-IR-FCG-DF05',
//           revNo: '00',
//           date: '27-09-2024',
//           dimensions: [
//             { slNo: 1, desc: 'Total Length', spec: '789', actual: '' },
//             { slNo: 2, desc: 'Width 1', spec: '42-1', actual: '' },
//             { slNo: 3, desc: 'Width 2', spec: '115-1', actual: '' },
//           ],
//         },
//         {
//           partNo: '29314225-5',
//           img: require('../assets/diagrams/3.png'),
//           description: 'DOOR WELD SUPPORT TOP',
//           docNo: 'AE – QA-IR-FCG-DF05',
//           revNo: '00',
//           date: '27-09-2024',
//           dimensions: [
//             { slNo: 1, desc: 'Overall Length', spec: '1180-2', actual: '' },
//             { slNo: 2, desc: 'Width', spec: '50±1', actual: '' },
//             { slNo: 3, desc: 'Thickness', spec: '5', actual: '' },
//             { slNo: 4, desc: 'Angle', spec: '2x45°', actual: '' },
//             { slNo: 5, desc: 'Distance', spec: '2x10', actual: '' },
//           ],
//         },
//         {
//           partNo: '29314225-1',
//           img: require('../assets/diagrams/4.png'),
//           description: 'DOOR ACCESS MAIN PLATE',
//           docNo: 'AE – QA-IR-FCG- DF1',
//           revNo: '00',
//           date: '27-09-2024',
//           dimensions: [
//             { slNo: 1, desc: 'Length', spec: '2284±2', actual: '' },
//             { slNo: 2, desc: 'Width', spec: '1190±2', actual: '' },
//             { slNo: 3, desc: '7mm hole distance 1', spec: '905', actual: '' },
//             { slNo: 4, desc: '11mm hole distance 1', spec: '845', actual: '' },
//             { slNo: 5, desc: '7mm hole distance 2', spec: '792', actual: '' },
//             { slNo: 6, desc: '7mm hole distance 3', spec: '678', actual: '' },
//             { slNo: 7, desc: '7mm hole distance 4', spec: '565', actual: '' },
//             { slNo: 8, desc: '11mm hole distance 2', spec: '345', actual: '' },
//             { slNo: 9, desc: '40mm hole distance', spec: '234', actual: '' },
//             { slNo: 10, desc: 'Width', spec: '1180', actual: '' },
//             { slNo: 11, desc: 'Folding Distance', spec: '120', actual: '' },
//             {
//               slNo: 12,
//               desc: '11 mm hole distance 1',
//               spec: '164',
//               actual: '',
//             },
//             {
//               slNo: 13,
//               desc: '11 mm hole distance 2',
//               spec: '404',
//               actual: '',
//             },
//             {
//               slNo: 14,
//               desc: '11 mm hole distance 3',
//               spec: '644',
//               actual: '',
//             },
//             {
//               slNo: 15,
//               desc: '40mm Hole distance 1',
//               spec: '1097',
//               actual: '',
//             },
//             {
//               slNo: 16,
//               desc: '40mm Hole distance 2',
//               spec: '1208',
//               actual: '',
//             },
//             { slNo: 17, desc: '7mm hole distance', spec: '1516.5', actual: '' },
//             {
//               slNo: 18,
//               desc: '11 mm hole distance 4',
//               spec: '1574',
//               actual: '',
//             },
//             {
//               slNo: 19,
//               desc: '11 mm hole distance 5',
//               spec: '1814',
//               actual: '',
//             },
//             {
//               slNo: 20,
//               desc: '11 mm hole distance 6',
//               spec: '2045',
//               actual: '',
//             },
//             { slNo: 21, desc: 'Diameter Ø', spec: '11', actual: '' },
//             { slNo: 22, desc: 'Diameter Ø', spec: '7', actual: '' },
//             { slNo: 23, desc: 'Diameter Ø', spec: '40', actual: '' },
//             { slNo: 24, desc: 'Elliptical', spec: '590', actual: '' },
//             { slNo: 25, desc: 'Elliptical', spec: '590', actual: '' },
//           ],
//         },
//         {
//           partNo: '29314225-6',
//           img: require('../assets/diagrams/5.png'),
//           description: 'DOOR WELD SUPPORT BOTTOM',
//           docNo: 'AE – QA-IR-FCG- DF02',
//           revNo: '00',
//           date: '27-09-2024',
//           dimensions: [
//             { slNo: 1, desc: 'Overall Length', spec: '1180-2', actual: '' },
//             { slNo: 2, desc: 'Width 1', spec: '50±1', actual: '' },
//             { slNo: 3, desc: 'Width 2', spec: '34-1', actual: '' },
//             { slNo: 4, desc: 'Distance 1', spec: '370-1', actual: '' },
//             { slNo: 5, desc: 'Distance 2', spec: '440+1', actual: '' },
//             { slNo: 6, desc: 'Distance 3', spec: '170±1', actual: '' },
//             { slNo: 7, desc: 'Hole Diameter Ø', spec: '7±0.5', actual: '' },
//             { slNo: 8, desc: 'Hole Distance', spec: '25±1', actual: '' },
//             { slNo: 9, desc: 'Radius', spec: '2xR4', actual: '' },
//             { slNo: 10, desc: 'Angle', spec: '45°', actual: '' },
//             { slNo: 11, desc: 'Distance 4', spec: '2x10', actual: '' },
//             { slNo: 12, desc: 'Thickness', spec: '5', actual: '' },
//           ],
//         },
//       ],
//     },
//   },
// };

const AccordanceScreen = ({ navigation }) => {
  const [reportType, setReportType] = useState('');
  const [customer, setCustomer] = useState('');
  const [part, setPart] = useState(null);
  const [templates, setTemplates] = useState([]);
  useEffect(() => {
    const loadTemplates = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/admin/report-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(res.data);
    };
    loadTemplates();
  }, []);

  const handleGoToReport = () => {
    const selectedTemplate = templates.find(t => t.id === reportType);

    navigation.navigate('AddEntry', {
      templateId: selectedTemplate.id,
      templateSchema: selectedTemplate.template_schema,
      templateName: selectedTemplate.name,
    });
    // if (!reportType || !customer || !part) {
    //   alert('Please select all fields!');
    //   return;
    // }

    // navigation.navigate('AddEntry', {
    //   reportType,
    //   customer,
    //   part,
    // });
  };


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
              {/* {Object.keys(reportsData).map(r => (
                <Picker.Item key={r} label={r} value={r} />
              ))} */}
              {templates.map(t => (
                <Picker.Item key={t.id} label={t.name} value={t.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Step 2: Customer */}
        {/* {reportType ? (
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
        ) : null} */}

        {/* Step 3: Part */}
        {/* {customer ? (
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
        ) : null} */}

        {/* Part Preview */}
        {part ? (
          <View style={styles.previewCard}>
            {/* <Text style={styles.previewTitle}>Selected Part Preview</Text> */}
            <Image source={part.img} style={styles.previewImage} />
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
                  {part.dimensions.length} items
                </Text>
              </View>
            </View>
          </View>
        ) : null}
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
