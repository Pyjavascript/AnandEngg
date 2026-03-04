import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reportApi from '../utils/reportApi';
import BASE_URL from '../config/api';
import { useAppTheme } from '../theme/ThemeProvider';

const resolveImageUri = imageUri => {
  if (!imageUri || typeof imageUri !== 'string') return null;
  if (/^https?:\/\//i.test(imageUri)) return imageUri;
  const normalizedBase = BASE_URL.replace(/\/+$/, '');
  const normalizedPath = imageUri.startsWith('/') ? imageUri : `/${imageUri}`;
  return `${normalizedBase}${normalizedPath}`;
};

const AccordanceScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);

  const [category, setCategory] = useState('');
  const [customer, setCustomer] = useState('');
  const [part, setPart] = useState(null);
  const [reportsData, setReportsData] = useState({});
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTemplatesData = useCallback(async () => {
    try {
      setLoading(true);
      const [data, userRaw] = await Promise.all([
        reportApi.getTemplatesWithParts(),
        AsyncStorage.getItem('user'),
      ]);
      const user = JSON.parse(userRaw || '{}');
      const allSubmissions = await reportApi.getAllSubmissions();
      const myDrafts = (Array.isArray(allSubmissions) ? allSubmissions : []).filter(
        s => s.status === 'draft' && Number(s.submitted_by) === Number(user.id),
      );
      setReportsData(data || {});
      setDrafts(myDrafts);
    } catch (error) {
      console.log('Error loading templates:', error);
      setReportsData({});
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTemplatesData();
    }, [loadTemplatesData]),
  );

  const handleGoToReport = () => {
    if (!category || !customer || !part) {
      alert('Please select all fields!');
      return;
    }

    navigation.navigate('AddEntry', {
      reportType: category,
      customer,
      part,
    });
  };

  const findPartByTemplateId = templateId => {
    for (const categoryKey of Object.keys(reportsData || {})) {
      const customers = reportsData?.[categoryKey]?.customers || {};
      for (const customerKey of Object.keys(customers)) {
        const match = (customers[customerKey] || []).find(
          p => Number(p.templateId) === Number(templateId),
        );
        if (match) {
          return { categoryKey, customerKey, partData: match };
        }
      }
    }
    return null;
  };

  const handleContinueDraft = draft => {
    const found = findPartByTemplateId(draft.template_id);
    if (!found) return;
    navigation.navigate('AddEntry', {
      reportType: found.categoryKey,
      customer: found.customerKey,
      part: found.partData,
      draftSubmissionId: draft.id,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={C.primarySoft} />
          </Pressable>
          <Text style={styles.loadingHeaderText}>Create Inspection Report</Text>
          <View style={styles.backButtonGhost} />
        </View>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={C.primarySoft} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={C.primarySoft} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Create Inspection Report</Text>
          <Text style={styles.subtitle}>Generate detailed inspection report</Text>
        </View>
        <View style={styles.backButtonGhost} />
      </View>

      <View style={styles.pageWrap}>
        <View style={styles.savedReportsCard}>
          <Text style={styles.savedReportsTitle}>Saved Reports</Text>
          <Text style={styles.savedReportsSub}>Continue previous drafts</Text>
          {drafts.length === 0 ? (
            <Text style={styles.savedEmptyText}>No drafts available</Text>
          ) : (
            drafts.slice(0, 3).map(draft => (
              <Pressable
                key={draft.id}
                style={styles.savedDraftItem}
                onPress={() => handleContinueDraft(draft)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.savedDraftTitle} numberOfLines={1}>
                    {draft.template_label || `Draft #${draft.id}`}
                  </Text>
                  <Text style={styles.savedDraftMeta}>
                    {new Date(draft.created_at).toLocaleDateString('en-GB')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
              </Pressable>
            ))
          )}
        </View>

        {Object.keys(reportsData).length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="document-outline" size={48} color={C.textSubtle} />
            <Text style={styles.emptyTitle}>No inspection templates available</Text>
            <Text style={styles.emptySub}>Ask your admin to create templates</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Report Information</Text>
              <Text style={styles.fieldLabel}>Report Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={category}
                  onValueChange={value => {
                    setCategory(value);
                    setCustomer('');
                    setPart(null);
                  }}
                  style={styles.picker}
                  dropdownIconColor={C.primarySoft}
                >
                  <Picker.Item label="Select report type" value="" />
                  {Object.keys(reportsData).map(r => (
                    <Picker.Item key={r} label={r} value={r} />
                  ))}
                </Picker>
              </View>
            </View>

            {category ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Project Details</Text>
                <Text style={styles.fieldLabel}>Select Customer</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={customer}
                    onValueChange={value => {
                      setCustomer(value);
                      setPart(null);
                    }}
                    style={styles.picker}
                    dropdownIconColor={C.primarySoft}
                  >
                    <Picker.Item label="Choose customer" value="" />
                    {Object.keys(reportsData[category].customers).map(c => (
                      <Picker.Item key={c} label={c} value={c} />
                    ))}
                  </Picker>
                </View>
              </View>
            ) : null}

            {customer ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Part Specification</Text>
                <Text style={styles.fieldLabel}>Select Part</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={part?.partNo || ''}
                    onValueChange={value => {
                      const selected = reportsData[category].customers[customer].find(
                        p => p.partNo === value,
                      );
                      setPart(selected);
                    }}
                    style={styles.picker}
                    dropdownIconColor={C.primarySoft}
                  >
                    <Picker.Item label="Choose part specification" value="" />
                    {reportsData[category].customers[customer].map(p => (
                      <Picker.Item
                        key={p.partNo}
                        label={`${p.partNo} - ${p.description}`}
                        value={p.partNo}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            ) : null}

            {part ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Part Diagram</Text>
                <Image
                  source={
                    resolveImageUri(part?.img?.uri)
                      ? { uri: resolveImageUri(part.img.uri) }
                      : require('../assets/pictures/AppLogo.png')
                  }
                  style={styles.previewImage}
                  onError={e =>
                    console.log('Part preview image load error:', e.nativeEvent)
                  }
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

      {part ? (
        <Pressable style={styles.submitBtn} onPress={handleGoToReport}>
          <Ionicons name="add-circle" size={22} color={C.surface} />
          <Text style={styles.submitBtnText}>Create Report</Text>
        </Pressable>
      ) : null}

      <View style={styles.bottomGap} />
    </ScrollView>
  );
};

export default AccordanceScreen;

const createStyles = C => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    backgroundColor: C.surface,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: C.textStrong,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: C.textMuted,
  },
  pageWrap: {
    paddingTop: 14,
    marginHorizontal: 20,
    gap: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  backButtonGhost: {
    width: 40,
    height: 40,
  },
  loadingHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textStrong,
    flex: 1,
    textAlign: 'center',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedReportsCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
  },
  savedReportsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textStrong,
  },
  savedReportsSub: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 4,
  },
  savedEmptyText: {
    marginTop: 10,
    fontSize: 12,
    color: C.textSubtle,
  },
  savedDraftItem: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savedDraftTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textStrong,
  },
  savedDraftMeta: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textStrong,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 2,
    backgroundColor: C.surfaceAlt,
  },
  picker: {
    width: '100%',
    color: C.textBody,
  },
  previewImage: {
    width: '100%',
    height: 190,
    resizeMode: 'contain',
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
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
    color: C.textMuted,
    fontWeight: '500',
  },
  previewValue: {
    fontSize: 12,
    color: C.textBody,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: C.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyWrap: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
  },
  emptyTitle: {
    marginTop: 16,
    color: C.textStrong,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    marginTop: 8,
    color: C.textSubtle,
    fontSize: 14,
  },
  bottomGap: {
    height: 30,
  },
});
