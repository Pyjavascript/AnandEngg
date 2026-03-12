import React, { useEffect, useRef, useState } from 'react';
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
  Alert,
  Animated,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { pick, isCancel, types } from '@react-native-documents/picker';

import BASE_URL from '../../config/api';
import reportApi from '../../utils/reportApi';
import CustomAlert from '../../components/CustomAlert';
import ZoomableImageModal from '../../components/ZoomableImageModal';
import { useAppTheme } from '../../theme/ThemeProvider';

const resolveDiagramUri = imageUri => {
  if (!imageUri || typeof imageUri !== 'string') return null;
  if (/^https?:\/\//i.test(imageUri)) return imageUri;
  const normalizedBase = BASE_URL.replace(/\/+$/, '');
  const normalizedPath = imageUri.startsWith('/') ? imageUri : `/${imageUri}`;
  return `${normalizedBase}${normalizedPath}`;
};

const ManageReportsScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Data States
  const [categories, setCategories] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Modal & Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState('category'); // category | report
  const [step, setStep] = useState(1); // 1: Category, 2: Template, 3: Fields
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [createdTemplateId, setCreatedTemplateId] = useState(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [loadingTemplateDetail, setLoadingTemplateDetail] = useState(false);

  const [newCatName, setNewCatName] = useState('');
  const [templateForm, setTemplateForm] = useState({
    doc_no: '',
    rev_no: '',
    customer: '',
    part_no: '',
    part_description: '',
  });
  const [diagramFile, setDiagramFile] = useState(null);
  const [currentDiagramUri, setCurrentDiagramUri] = useState(null);
  const [diagramViewerVisible, setDiagramViewerVisible] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldInput, setFieldInput] = useState({
    label: '',
    specification: '',
    unit: 'mm',
    type: 'measurement',
  });

  const [alert, setAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const drawerProgress = useRef(new Animated.Value(0)).current;

  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };

  const diagramPreviewUri =
    (diagramFile && typeof diagramFile.uri === 'string' && diagramFile.uri) ||
    resolveDiagramUri(currentDiagramUri);
  const diagramPreviewSource = diagramPreviewUri ? { uri: diagramPreviewUri } : null;
  const filteredSubmissions = submissions.filter(item => {
    const query = submissionSearch.trim().toLowerCase();
    const reportName = String(
      item.template_label || item.part_description || item.title || item.report_type || '',
    ).toLowerCase();
    const categoryName = String(item.category_name || '').toLowerCase();
    const matchesSearch =
      !query || reportName.includes(query) || categoryName.includes(query);

    const status = String(item.status || '').toLowerCase();
    const matchesFilter =
      submissionFilter === 'all' ||
      (submissionFilter === 'approved' &&
        (status === 'manager_approved' || status === 'inspector_reviewed')) ||
      (submissionFilter === 'pending' && status === 'submitted') ||
      (submissionFilter === 'rejected' && status === 'rejected');

    return matchesSearch && matchesFilter;
  });
  const filteredTemplates = templates.filter(item => {
    const query = templateSearch.trim().toLowerCase();
    if (!query) return true;

    const name = String(item.partDescription || '').toLowerCase();
    const docNo = String(item.docNo || '').toLowerCase();
    const customer = String(item.customer || '').toLowerCase();

    return (
      name.includes(query) || docNo.includes(query) || customer.includes(query)
    );
  });
  const approvedSubmissionsCount = submissions.filter(
    item => item.status === 'manager_approved' || item.status === 'inspector_reviewed',
  ).length;
  const pendingSubmissionsCount = submissions.filter(
    item => item.status === 'submitted',
  ).length;
  const rejectedSubmissionsCount = submissions.filter(
    item => item.status === 'rejected',
  ).length;
  const totalTemplatesCount = categories.reduce(
    (sum, item) => sum + Number(item.report_count || 0),
    0,
  );
  const sectionItems = [
    {
      key: 'overview',
      label: 'Overview',
      icon: 'grid-outline',
      count: categories.length + submissions.length,
    },
    {
      key: 'types',
      label: 'Categories',
      icon: 'layers-outline',
      count: categories.length,
    },
    {
      key: 'submissions',
      label: 'Submissions',
      icon: 'document-text-outline',
      count: submissions.length,
    },
  ];
  const overviewCards = [
    {
      key: 'categories',
      label: 'Categories',
      value: categories.length,
      icon: 'layers-outline',
      tone: '#1D4ED8',
    },
    {
      key: 'templates',
      label: 'Templates',
      value: totalTemplatesCount,
      icon: 'albums-outline',
      tone: '#0F766E',
    },
    {
      key: 'pending',
      label: 'Pending',
      value: pendingSubmissionsCount,
      icon: 'time-outline',
      tone: '#B45309',
    },
    {
      key: 'approved',
      label: 'Approved',
      value: approvedSubmissionsCount,
      icon: 'checkmark-done-outline',
      tone: '#15803D',
    },
  ];

  const openCategoryModal = () => {
    setModalMode('category');
    setStep(1);
    setShowAddModal(true);
    setNewCatName('');
  };

  const openCreateReportModal = category => {
    if (!category?.id || Number.isNaN(Number(category.id))) {
      showAlert(
        'error',
        'Invalid Category',
        'Please create/select a valid category first.',
      );
      return;
    }
    setModalMode('report');
    setSelectedCatId(category.id);
    setStep(2);
    setCreatedTemplateId(null);
    setIsEditingTemplate(false);
    setTemplateForm({
      doc_no: '',
      rev_no: '',
      customer: '',
      part_no: '',
      part_description: '',
    });
    setFields([]);
    setFieldInput({
      label: '',
      specification: '',
      unit: 'mm',
      type: 'measurement',
    });
    setDiagramFile(null);
    setCurrentDiagramUri(null);
    setTemplateSearch('');
    setShowAddModal(true);
  };

  const openEditTemplateModal = async templateId => {
    if (!templateId) return;
    setLoadingTemplateDetail(true);
    try {
      const res = await reportApi.getTemplateById(templateId);
      const template = res?.template;
      const templateFields = Array.isArray(res?.fields) ? res.fields : [];
      if (!template) {
        showAlert('error', 'Not Found', 'Template details not found.');
        return;
      }

      setModalMode('report');
      setIsEditingTemplate(true);
      setSelectedCatId(template.category_id);
      setCreatedTemplateId(template.id);
      setTemplateForm({
        doc_no: template.doc_no || '',
        rev_no: template.rev_no || '',
        customer: template.customer || '',
        part_no: template.part_no || '',
        part_description: template.part_description || '',
      });
      setFields(
        templateFields.map((f, idx) => ({
          id: f.id,
          label: f.label || '',
          specification: f.specification || '',
          unit: f.unit || 'mm',
          type: 'measurement',
          position: Number(f.position || idx + 1),
        })),
      );
      setFieldInput({
        label: '',
        specification: '',
        unit: 'mm',
        type: 'measurement',
      });
      setDiagramFile(null);
      setCurrentDiagramUri(template.diagram_url || null);
      setStep(2);
      setShowAddModal(true);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load template details';
      showAlert('error', 'Error', apiMessage);
    } finally {
      setLoadingTemplateDetail(false);
    }
  };

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [cats, subs, templatesWithParts] = await Promise.all([
        reportApi.getCategories(),
        reportApi.getAllSubmissions().catch(() => []),
        reportApi.getTemplatesWithParts().catch(() => ({})),
      ]);
      const safeCats = Array.isArray(cats) ? cats : [];
      const safeSubs = Array.isArray(subs) ? subs : [];
      setSubmissions(safeSubs);
      const templateMap = Object.entries(templatesWithParts || {}).reduce(
        (acc, [categoryName, categoryData]) => {
          const ids = new Set();
          const customers = categoryData?.customers || {};
          Object.values(customers).forEach(parts => {
            (Array.isArray(parts) ? parts : []).forEach(part => {
              const templateId = Number(part?.templateId);
              if (!Number.isNaN(templateId) && templateId > 0) {
                ids.add(templateId);
              }
            });
          });
          acc[String(categoryName || '').trim().toLowerCase()] = ids;
          return acc;
        },
        {},
      );
      const merged = safeCats.map(cat => {
        const key = String(cat.name || cat.code || cat.id || '')
          .trim()
          .toLowerCase();
        const templateIds = templateMap[key] || new Set();
        const matchedSubs = safeSubs.filter(sub => {
          const subTemplateId = Number(sub?.template_id);
          const byTemplate =
            !Number.isNaN(subTemplateId) && templateIds.has(subTemplateId);
          const byCategoryName =
            String(sub?.category_name || '')
              .trim()
              .toLowerCase() === key;
          return byTemplate || byCategoryName;
        });

        const createdDates = matchedSubs
          .map(sub => sub?.created_at)
          .filter(Boolean);

        return {
          ...cat,
          report_count: templateIds.size,
          submission_count: matchedSubs.length,
          first_created: createdDates.length ? createdDates.reduce((a, b) => (a < b ? a : b)) : null,
          last_created: createdDates.length ? createdDates.reduce((a, b) => (a > b ? a : b)) : null,
        };
      });

      setCategories(merged);
    } catch (err) {
      showAlert('error', 'Failed to load data');
      console.log('Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load Data on Focus
  useFocusEffect(
    React.useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  /* ================= LOGIC FUNCTIONS ================= */

  const handleCreateCategory = async () => {
    if (!newCatName.trim())
      return showAlert(
        'error',
        'Validation Error',
        'Category name is required',
      );
    try {
      await reportApi.createCategory(newCatName.trim());
      showAlert('success', 'Category Created', 'You can now add reports inside this category.');
      setShowAddModal(false);
      setNewCatName('');
      await loadAll();
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message || err?.message || 'Category creation failed';
      showAlert('error', 'Error', apiMessage);
    }
  };

  const handleCategoryPress = async category => {
    setSelectedCategory(category);
    setLoadingTemplates(true);
    setTemplateSearch('');

    try {
      const data = await reportApi.getTemplatesWithParts();
      const categoryData = data?.[category.name];
      const customers = categoryData?.customers || {};
      const mappedTemplates = Object.values(customers)
        .flat()
        .map((part, idx) => ({
          id: Number(part.templateId || idx),
          templateId: Number(part.templateId || 0),
          docNo: part.docNo || '',
          partDescription: part.description || '',
          customer: part.customer || '',
        }));
      setTemplates(mappedTemplates);
    } catch (err) {
      showAlert('error', 'Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.doc_no || !templateForm.part_description) {
      return showAlert(
        'error',
        'Required Fields',
        'Doc No and Part Description are required',
      );
    }
    try {
      const res = await reportApi.createTemplate({
        category_id: selectedCatId,
        ...templateForm,
      });
      const tid = res.id || res.insertId || res.template_id || res.templateId;
      if (!tid) {
        throw new Error('Template created but template id not returned from API');
      }
      setCreatedTemplateId(tid);

      // Upload diagram if selected
      if (diagramFile) {
        await reportApi.uploadDiagram(tid, diagramFile);
      }
      setStep(3);
    } catch (err) {
      showAlert('error', 'Error', 'Template creation failed');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!createdTemplateId) {
      return showAlert('error', 'Template Missing', 'Unable to edit this template.');
    }
    if (!templateForm.doc_no || !templateForm.part_description) {
      return showAlert(
        'error',
        'Required Fields',
        'Doc No and Part Description are required',
      );
    }
    try {
      const payload = {
        category_id: selectedCatId,
        ...templateForm,
        fields: fields
          .filter(f => String(f.label || '').trim())
          .map((f, idx) => ({
            id: f.id,
            label: String(f.label || '').trim(),
            specification: String(f.specification || '').trim(),
            unit: f.unit || 'mm',
            position: idx + 1,
          })),
      };
      await reportApi.updateTemplate(createdTemplateId, payload);
      if (diagramFile) {
        await reportApi.uploadDiagram(createdTemplateId, diagramFile);
      }
      showAlert('success', 'Template Updated', 'Report template updated successfully.');
      resetModal();
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update template';
      showAlert('error', 'Update Failed', apiMessage);
    }
  };

  const handleProceedTemplateStep = async () => {
    if (isEditingTemplate) {
      if (!templateForm.doc_no || !templateForm.part_description) {
        return showAlert(
          'error',
          'Required Fields',
          'Doc No and Part Description are required',
        );
      }
      setStep(3);
      return;
    }
    await handleCreateTemplate();
  };

  const handleAddField = async () => {
    if (!fieldInput.label)
      return showAlert('error', 'Field Label', 'Label is required');
    if (!createdTemplateId) {
      return showAlert(
        'error',
        'Template Missing',
        'Template ID is missing. Please recreate template and try again.',
      );
    }
    try {
      const payload = {
        label: fieldInput.label.trim(),
        specification: fieldInput.specification?.trim() || '',
        unit: fieldInput.unit || 'mm',
        position: Number(fields.length + 1),
        type: fieldInput.type || 'measurement',
      };

      const res = await reportApi.createField(createdTemplateId, payload);
      const createdId = res?.id || res?.insertId;

      setFields([
        ...fields,
        {
          ...payload,
          id: createdId || `${createdTemplateId}-${payload.position}`,
        },
      ]);
      setFieldInput({
        label: '',
        specification: '',
        unit: 'mm',
        type: 'measurement',
      });
      showAlert('success', 'Field Added', `${payload.label} added successfully`);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message || err?.message || 'Failed to add field';
      showAlert('error', 'Error', apiMessage);
    }
  };

  const pickDiagram = async () => {
    try {
      const [pickResult] = await pick({
        type: [types.images],
        mode: 'import',
      });

      if (pickResult) {
        setDiagramFile({
          uri: pickResult.uri,
          name: pickResult.name,
          type: pickResult.type,
        });
      }
    } catch (err) {
      if (!isCancel(err)) {
        showAlert('error', 'Picker Error', 'Failed to select image');
      }
    }
  };

  const resetModal = () => {
    setShowAddModal(false);
    setModalMode('category');
    setIsEditingTemplate(false);
    setStep(1);
    setNewCatName('');
    setTemplateForm({
      doc_no: '',
      rev_no: '',
      customer: '',
      part_no: '',
      part_description: '',
    });
    setFields([]);
    setSelectedCatId(null);
    setCreatedTemplateId(null);
    setLoadingTemplateDetail(false);
    setFieldInput({
      label: '',
      specification: '',
      unit: 'mm',
      type: 'measurement',
    });
    setDiagramFile(null);
    setCurrentDiagramUri(null);
    setDiagramViewerVisible(false);
    loadAll(); // Refresh main list
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Delete Category?',
      `Deleting "${category.name}" will permanently delete all reports and submissions inside it from MySQL. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportApi.deleteCategory(category.id);
              showAlert(
                'success',
                'Category Deleted',
                'Category and all related reports were deleted.',
              );
              if (selectedCategory?.id === category.id) {
                setSelectedCategory(null);
                setTemplates([]);
              }
              await loadAll();
            } catch (err) {
              const apiMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to delete category';
              showAlert('error', 'Delete Failed', apiMessage);
            }
          },
        },
      ],
    );
  };

  /* ================= RENDER COMPONENTS ================= */

  // const renderCategoryItem = ({ item }) => (
  //   <View style={styles.card}>
  //     <View style={styles.cardHeader}>
  //       <View style={styles.iconContainer}>
  //         <Ionicons name="layers" size={20} color="#286DA6" />
  //       </View>
  //       <View style={{ flex: 1 }}>
  //         <Text style={styles.cardTitle}>{item.name}</Text>
  //         <Text style={styles.cardSubtitle}>
  //           ID: {item.id} • Created: {new Date().toLocaleDateString()}
  //         </Text>
  //       </View>
  //       <Ionicons name="chevron-forward" size={18} color="#B0C4D8" />
  //     </View>
  //   </View>
  // );
  // const renderCategoryItem = ({ item }) => (
  //   <Pressable
  //     style={[
  //       styles.card,
  //       selectedCategory?.id === item.id && {
  //         borderColor: '#286DA6',
  //         borderWidth: 2,
  //       },
  //     ]}
  //     onPress={() => handleCategoryPress(item)}
  //   >
  //     <View style={styles.cardHeader}>
  //       <View style={styles.iconContainer}>
  //         <Ionicons name="layers" size={20} color="#286DA6" />
  //       </View>
  //       <View style={{ flex: 1 }}>
  //         <Text style={styles.cardTitle}>{item.name}</Text>
  //         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 }}>
  //           <Text style={styles.cardSubtitle}>
  //             📊 {item.submission_count || 0} submissions
  //           </Text>
  //           {item.first_created && (
  //             <Text style={styles.cardSubtitle}>
  //               📅 {new Date(item.first_created).toLocaleDateString()}
  //             </Text>
  //           )}
  //         </View>
  //       </View>
  //       <Ionicons name="chevron-forward" size={18} color="#B0C4D8" />
  //     </View>
  //   </Pressable>
  // );
  const renderCategoryItem = ({ item }) => {
    const isExpanded = selectedCategory?.id === item.id;

    return (
      <View style={styles.card}>
        <Pressable
          style={styles.cardHeader}
          onPress={() => {
            if (isExpanded) {
              setSelectedCategory(null);
              setTemplates([]);
            } else {
              handleCategoryPress(item);
            }
          }}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="layers" size={20} color="#286DA6" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.categoryMetaRow}>
              {/* <View style={styles.metaChip}>
                <Ionicons name="layers-outline" size={12} color="#1D4D77" />
                <Text style={styles.metaChipText}>Category</Text>
              </View> */}
              <View style={styles.metaChip}>
                <Ionicons name="document-text-outline" size={12} color="#1D4D77" />
                <Text style={styles.metaChipText}>
                  {item.report_count || 0} reports
                </Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="stats-chart-outline" size={12} color="#1D4D77" />
                <Text style={styles.metaChipText}>
                  {item.submission_count || 0} submissions
                </Text>
              </View>
            </View>
          </View>

          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={20}
            color="#9CA3AF"
          />
        </Pressable>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.expandedSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIconBadge, styles.sectionIconBadgeBlue]}>
                    <Ionicons name="albums-outline" size={16} color="#1D4ED8" />
                  </View>
                  <View>
                    <Text style={styles.inlineSectionTitle}>Report Templates</Text>
                    <Text style={styles.sectionSubtitle}>
                      {templates.length} template{templates.length === 1 ? '' : 's'} available in this category
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.categorySearchWrap}>
                <View style={styles.categorySearchInputWrap}>
                  <Ionicons name="search-outline" size={16} color="#64748B" />
                  <TextInput
                    style={styles.categorySearchInput}
                    placeholder="Search report, doc no, or company"
                    value={templateSearch}
                    onChangeText={setTemplateSearch}
                    placeholderTextColor="#94A3B8"
                  />
                  {templateSearch ? (
                    <Pressable onPress={() => setTemplateSearch('')}>
                      <Ionicons name="close-circle" size={17} color="#94A3B8" />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {loadingTemplates ? (
                <View style={styles.loadingInlineState}>
                  <ActivityIndicator color="#286DA6" />
                </View>
              ) : templates.length === 0 ? (
                <View style={styles.emptyInlineState}>
                  <Ionicons name="documents-outline" size={22} color="#94A3B8" />
                  <Text style={styles.emptyInlineText}>No reports created yet</Text>
                </View>
              ) : filteredTemplates.length === 0 ? (
                <View style={styles.emptyInlineState}>
                  <Ionicons name="search-outline" size={22} color="#94A3B8" />
                  <Text style={styles.emptyInlineText}>No reports match this filter</Text>
                </View>
              ) : (
                filteredTemplates.map(tpl => (
                  <Pressable
                    key={tpl.id}
                    style={styles.templateListRow}
                    onPress={() => openEditTemplateModal(tpl.templateId)}
                  >
                    <View style={styles.templateListIndex}>
                      <Ionicons name="document-text-outline" size={15} color="#286DA6" />
                    </View>
                    <View style={styles.templateListContent}>
                      <Text style={styles.templateListTitle} numberOfLines={1}>
                        {tpl.partDescription || 'Untitled Report'}
                      </Text>
                      <Text style={styles.templateListMeta} numberOfLines={1}>
                        {[
                          tpl.docNo || 'No doc no',
                          tpl.customer ? tpl.customer : null,
                          `ID ${tpl.templateId || tpl.id}`,
                        ]
                          .filter(Boolean)
                          .join(' | ')}
                      </Text>
                    </View>
                    <View style={styles.templateListActions}>
                      <Ionicons name="create-outline" size={16} color="#64748B" />
                    </View>
                  </Pressable>
                ))
              )}
            </View>

            <Pressable
              style={styles.createReportBtn}
              onPress={() => openCreateReportModal(item)}
            >
              <Ionicons name="add-circle" size={18} color="#286DA6" />
              <Text style={styles.createReportBtnText}>Create Report</Text>
            </Pressable>
            <Pressable
              style={styles.deleteCategoryBtn}
              onPress={() => handleDeleteCategory(item)}
            >
              <Ionicons name="trash-outline" size={17} color="#DC2626" />
              <Text style={styles.deleteCategoryBtnText}>Delete Category</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderSubmissionItem = ({ item }) => {
    const isApproved = item.status === 'manager_approved';
    const isPending =
      item.status === 'submitted' || item.status === 'inspector_reviewed';
    const statusColor = isApproved
      ? '#10B981'
      : isPending
      ? '#F59E0B'
      : '#EF4444';

    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {item.template_label || item.title || item.report_type || 'Inspection Report'}
            </Text>
            <Text style={styles.cardSubtitle}>
              Template ID: {item.template_id || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            {item.submitted_by_name || item.submitted_by || item.name || 'Anonymous'}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={14}
            color="#6B7280"
            style={{ marginLeft: 12 }}
          />
          <Text style={styles.metaText}>
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}
        >
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
            {item.status === 'manager_approved'
              ? 'APPROVED BY MANAGER'
              : item.status === 'inspector_reviewed'
              ? 'APPROVED BY INSPECTOR'
              : item.status === 'rejected' && item.manager_id
              ? 'REJECTED BY MANAGER'
              : item.status === 'rejected' && item.inspector_id
              ? 'REJECTED BY INSPECTOR'
              : (item.status || '').toUpperCase()}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderOverviewSection = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.sectionScrollContent}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroEyebrow}>Report Control Room</Text>
          <Text style={styles.heroTitle}>Manage report sections from one place</Text>
          <Text style={styles.heroSubtitle}>
            Create categories, maintain templates, and monitor submissions without
            jumping between screens.
          </Text>
        </View>
        <View style={styles.heroActions}>
          <Pressable style={styles.heroPrimaryBtn} onPress={openCategoryModal}>
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.heroPrimaryBtnText}>New Category</Text>
          </Pressable>
          <Pressable
            style={styles.heroSecondaryBtn}
            onPress={() => setActiveSection('submissions')}
          >
            <Ionicons name="reader-outline" size={18} color="#114A76" />
            <Text style={styles.heroSecondaryBtnText}>View Submissions</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.overviewGrid}>
        {overviewCards.map(card => (
          <View key={card.key} style={styles.overviewCard}>
            <View
              style={[
                styles.overviewIconWrap,
                { backgroundColor: `${card.tone}15` },
              ]}
            >
              <Ionicons name={card.icon} size={18} color={card.tone} />
            </View>
            <Text style={styles.overviewValue}>{card.value}</Text>
            <Text style={styles.overviewLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.workspaceCard}>
        <Text style={styles.workspaceTitle}>Sections</Text>
        <Text style={styles.workspaceSubtitle}>
          Each area is separated so admin tasks stay clearer and faster.
        </Text>
        {sectionItems
          .filter(item => item.key !== 'overview')
          .map(item => (
            <Pressable
              key={item.key}
              style={styles.workspaceRow}
              onPress={() => setActiveSection(item.key)}
            >
              <View style={styles.workspaceRowLeft}>
                <View style={styles.workspaceRowIcon}>
                  <Ionicons name={item.icon} size={16} color="#114A76" />
                </View>
                <View>
                  <Text style={styles.workspaceRowTitle}>{item.label}</Text>
                  <Text style={styles.workspaceRowMeta}>
                    {item.count} item{item.count === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </Pressable>
          ))}
      </View>

      <View style={styles.workspaceCard}>
        <Text style={styles.workspaceTitle}>Submission status</Text>
        <View style={styles.statusSummaryRow}>
          <View style={styles.statusSummaryChip}>
            <View style={[styles.statusSummaryDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusSummaryText}>{pendingSubmissionsCount} pending</Text>
          </View>
          <View style={styles.statusSummaryChip}>
            <View style={[styles.statusSummaryDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusSummaryText}>{approvedSubmissionsCount} approved</Text>
          </View>
          <View style={styles.statusSummaryChip}>
            <View style={[styles.statusSummaryDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.statusSummaryText}>{rejectedSubmissionsCount} rejected</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const handleSectionChange = sectionKey => {
    setActiveSection(sectionKey);
    setSidebarVisible(false);
  };

  const renderSectionNav = () => (
    <View style={styles.sidebar}>
      {sectionItems.map(item => {
        const isActive = activeSection === item.key;
        return (
          <Pressable
            key={item.key}
            style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
            onPress={() => handleSectionChange(item.key)}
          >
            <View style={[styles.sidebarIconWrap, isActive && styles.sidebarIconWrapActive]}>
              <Ionicons
                name={item.icon}
                size={18}
                color={isActive ? '#FFFFFF' : '#114A76'}
              />
            </View>
            <View style={styles.sidebarTextWrap}>
              <Text style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive]}>
                {item.label}
              </Text>
              <Text style={[styles.sidebarMeta, isActive && styles.sidebarMetaActive]}>
                {item.count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  useEffect(() => {
    if (sidebarVisible) {
      setDrawerMounted(true);
      Animated.timing(drawerProgress, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!drawerMounted) {
      return;
    }

    Animated.timing(drawerProgress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setDrawerMounted(false);
      }
    });
  }, [drawerMounted, drawerProgress, sidebarVisible]);

  const drawerTranslateX = drawerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 0],
  });

  const drawerBackdropOpacity = drawerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => setSidebarVisible(true)}
            style={styles.menuButton}
          >
            <Ionicons name="menu-outline" size={22} color="#114A76" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Reports</Text>
            <Text style={styles.headerSubtitle}>Admin report workspace</Text>
          </View>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={openCategoryModal}
        >
          <Ionicons name="add" size={26} color="#FFF" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#286DA6" />
        </View>
      ) : (
        <View style={styles.workspaceShell}>
          <View style={styles.sectionPanel}>
            <View style={styles.mobileSectionBar}>
              <Pressable
                style={styles.mobileSectionTrigger}
                onPress={() => setSidebarVisible(true)}
              >
                <Text style={styles.mobileSectionTriggerText}>
                  {sectionItems.find(item => item.key === activeSection)?.label || 'Sections'}
                </Text>
              </Pressable>
            </View>
            {activeSection === 'overview' ? (
              renderOverviewSection()
            ) : (
              <View style={{ flex: 1 }}>
                {activeSection === 'submissions' && (
                  <View style={styles.searchPanel}>
                    <View style={styles.searchInputWrap}>
                      <Ionicons name="search-outline" size={18} color="#64748B" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search by category or report name"
                        value={submissionSearch}
                        onChangeText={setSubmissionSearch}
                        placeholderTextColor="#94A3B8"
                      />
                      {submissionSearch ? (
                        <Pressable onPress={() => setSubmissionSearch('')}>
                          <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </Pressable>
                      ) : null}
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterRow}
                    >
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'approved', label: 'Approved' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'rejected', label: 'Rejected' },
                      ].map(filter => (
                        <Pressable
                          key={filter.key}
                          style={[
                            styles.filterChip,
                            submissionFilter === filter.key && styles.filterChipActive,
                          ]}
                          onPress={() => setSubmissionFilter(filter.key)}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              submissionFilter === filter.key && styles.filterChipTextActive,
                            ]}
                          >
                            {filter.label}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <FlatList
                  data={activeSection === 'types' ? categories : filteredSubmissions}
                  renderItem={
                    activeSection === 'types' ? renderCategoryItem : renderSubmissionItem
                  }
                  keyExtractor={item => String(item.id)}
                  contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                  refreshing={refreshing}
                  onRefresh={loadAll}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="document-outline" size={48} color="#D1D5DB" />
                      <Text style={styles.emptyText}>
                        {activeSection === 'submissions'
                          ? 'No submissions match your search'
                          : 'No data found'}
                      </Text>
                    </View>
                  }
                />
              </View>
            )}
          </View>
        </View>
      )}

      <Modal
        visible={drawerMounted}
        transparent
        animationType="none"
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.drawerModalRoot}>
          <Pressable style={styles.drawerDismissArea} onPress={() => setSidebarVisible(false)}>
            <Animated.View
              pointerEvents="none"
              style={[styles.drawerBackdrop, { opacity: drawerBackdropOpacity }]}
            />
          </Pressable>
          <Animated.View
            style={[
              styles.drawerSheet,
              { transform: [{ translateX: drawerTranslateX }] },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Sections</Text>
              <Pressable onPress={() => setSidebarVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>
            {renderSectionNav()}
          </Animated.View>
        </View>
      </Modal>

      {/* {activeTab === 'types' && selectedCategory && (
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={[styles.headerTitle, { fontSize: 16, marginBottom: 12 }]}
          >
            Templates – {selectedCategory.name}
          </Text>

          {loadingTemplates ? (
            <ActivityIndicator color="#286DA6" />
          ) : templates.length === 0 ? (
            <Text style={{ color: '#6B7280' }}>No templates found</Text>
          ) : (
            templates.map(tpl => (
              <Pressable
                key={tpl.id}
                style={styles.card}
                onPress={() => {
                  // later: open preview modal
                  console.log('Template clicked:', tpl.id);
                }}
              >
                <Text style={styles.cardTitle}>{tpl.doc_no}</Text>
                <Text style={styles.cardSubtitle}>{tpl.part_description}</Text>
              </Pressable>
            ))
          )}
        </View>
      )} */}

      {/* STEPPED CREATION MODAL */}
      {/* <Modal
        visible={console.log('Modal visibility is:', showAddModal)}
        animationType="slide"
        transparent
      > */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        // transparent={true}
        presentationStyle="overFullScreen"
        onRequestClose={resetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'category'
                  ? 'Create Report Type'
                  : step === 2
                  ? isEditingTemplate
                    ? 'View / Edit Template'
                    : 'Step 1: Template Details'
                  : isEditingTemplate
                  ? 'Edit Template Fields'
                  : 'Step 2: Add Fields'}
              </Text>
              <Pressable onPress={resetModal}>
                <Ionicons name="close" size={26} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {loadingTemplateDetail && (
                <View style={styles.center}>
                  <ActivityIndicator size="small" color="#286DA6" />
                </View>
              )}
              {/* {step === 1 && (
                <View>
                  <Text style={styles.label}>Category Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Daily Quality Check"
                    value={newCatName}
                    onChangeText={setNewCatName}
                  />
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={handleCreateCategory}
                  >
                    <Text style={styles.primaryBtnText}>
                      Next: Template Info
                    </Text>
                  </Pressable>
                </View>
              )} */}
              {modalMode === 'category' && (
                <View>
                  <Text style={styles.label}>Report Type Name</Text>

                  <Text
                    style={{
                      color: '#6B7280',
                      fontSize: 12,
                      marginBottom: 10,
                      marginLeft: 2,
                    }}
                  >
                    This creates a report category. Example: Cutting, Welding,
                    Assembly.
                  </Text>

                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Cutting"
                    value={newCatName}
                    onChangeText={setNewCatName}
                  />

                  <Pressable
                    style={styles.primaryBtn}
                    onPress={handleCreateCategory}
                  >
                    <Text style={styles.primaryBtnText}>Create Category</Text>
                  </Pressable>
                </View>
              )}

              {modalMode === 'report' && step === 2 && (
                <View style={styles.builderWrap}>
                  <View style={styles.builderSection}>
                    <Text style={styles.builderSectionTitle}>Report Information</Text>
                    <View style={styles.doubleColRow}>
                      <View style={styles.col}>
                        <Text style={styles.label}>Doc No</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. No.AE-QA-FR-FCG-SC02"
                          value={templateForm.doc_no}
                          onChangeText={t =>
                            setTemplateForm({ ...templateForm, doc_no: t })
                          }
                        />
                      </View>
                      <View style={styles.col}>
                        <Text style={styles.label}>Part Description</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. DOOR PLATE BOTTOM RH"
                          value={templateForm.part_description}
                          onChangeText={t =>
                            setTemplateForm({
                              ...templateForm,
                              part_description: t,
                            })
                          }
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.builderSection}>
                    <Text style={styles.builderSectionTitle}>Project Details</Text>
                    <Text style={styles.label}>Customer</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Vestas"
                      value={templateForm.customer}
                      onChangeText={t =>
                        setTemplateForm({ ...templateForm, customer: t })
                      }
                    />
                  </View>

                  <View style={styles.builderSection}>
                    <Text style={styles.builderSectionTitle}>Part Specification</Text>
                    <View style={styles.doubleColRow}>
                      <View style={styles.col}>
                        <Text style={styles.label}>Part / Drawing No</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. 29314225-2"
                          value={templateForm.part_no}
                          onChangeText={t =>
                            setTemplateForm({ ...templateForm, part_no: t })
                          }
                        />
                      </View>
                      <View style={styles.col}>
                        <Text style={styles.label}>Rev No</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. 00"
                          value={templateForm.rev_no}
                          onChangeText={t =>
                            setTemplateForm({ ...templateForm, rev_no: t })
                          }
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.builderSection}>
                    <Text style={styles.builderSectionTitle}>Report Header Preview</Text>
                    <View style={styles.previewWrap}>
                      <Text style={styles.previewTitle}>
                        {(templateForm.part_description || 'CUTTING INSPECTION REPORT').toUpperCase()}
                      </Text>
                      <View style={styles.previewRow}>
                        <Text style={styles.previewKey}>CUSTOMER :</Text>
                        <Text style={styles.previewValue}>{templateForm.customer || '-'}</Text>
                      </View>
                      <View style={styles.previewRow}>
                        <Text style={styles.previewKey}>PART / DRAWING NO :</Text>
                        <Text style={styles.previewValue}>{templateForm.part_no || '-'}</Text>
                      </View>
                      <View style={styles.previewRow}>
                        <Text style={styles.previewKey}>DOC. NO :</Text>
                        <Text style={styles.previewValue}>{templateForm.doc_no || '-'}</Text>
                      </View>
                      <View style={styles.previewRow}>
                        <Text style={styles.previewKey}>REV. NO :</Text>
                        <Text style={styles.previewValue}>{templateForm.rev_no || '-'}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.builderSection}>
                    <Text style={styles.builderSectionTitle}>Part Diagram</Text>
                    <Pressable style={styles.uploadBox} onPress={pickDiagram}>
                      <Ionicons
                        name={diagramFile ? 'checkmark-circle-outline' : 'image-outline'}
                        size={26}
                        color={diagramFile ? '#16A34A' : '#94A3B8'}
                      />
                      <Text style={styles.uploadTitle}>
                        {diagramFile ? 'Diagram attached' : 'Click to upload part diagram'}
                      </Text>
                      <Text style={styles.uploadSub}>PNG, JPG up to 5MB</Text>
                    </Pressable>

                    {diagramPreviewSource ? (
                      <View style={styles.diagramPreviewCard}>
                        <View style={styles.diagramPreviewHeader}>
                          <View style={styles.diagramPreviewTitleWrap}>
                            <Ionicons name="image-outline" size={16} color="#286DA6" />
                            <Text style={styles.diagramPreviewTitle}>
                              {diagramFile ? 'Selected Diagram Preview' : 'Uploaded Diagram'}
                            </Text>
                          </View>
                          <Pressable
                            style={styles.diagramReuploadBtn}
                            onPress={pickDiagram}
                          >
                            <Ionicons name="cloud-upload-outline" size={15} color="#286DA6" />
                            <Text style={styles.diagramReuploadText}>Reupload</Text>
                          </Pressable>
                        </View>

                        <Pressable
                          onPress={() => setDiagramViewerVisible(true)}
                          style={styles.diagramImageWrap}
                        >
                          <Image
                            source={diagramPreviewSource}
                            style={styles.diagramImage}
                            resizeMode="contain"
                          />
                        </Pressable>

                        <Text style={styles.diagramHint}>Tap diagram to enlarge and zoom</Text>
                      </View>
                    ) : null}
                  </View>

                  <Pressable
                    style={styles.primaryBtn}
                    onPress={handleProceedTemplateStep}
                  >
                    <Text style={styles.primaryBtnText}>
                      {isEditingTemplate ? 'Next: Edit Fields' : 'Next: Add Fields'}
                    </Text>
                  </Pressable>
                </View>
              )}

              {modalMode === 'report' && step === 3 && (
                <View style={styles.builderWrap}>
                  <View style={styles.builderSection}>
                    <View style={styles.tableHead}>
                      <Text style={styles.builderSectionTitle}>Dimensions & Measurements</Text>
                      <Text style={styles.tableHeadCount}>({fields.length} rows)</Text>
                    </View>
                    <View style={styles.measureHeaderRow}>
                      <Text style={styles.measureHeadText}>Dimension</Text>
                      <Text style={styles.measureHeadText}>Specification</Text>
                    </View>
                    {fields.length === 0 ? (
                      <View style={styles.emptyMeasure}>
                        <Text style={styles.emptyMeasureText}>No fields added yet</Text>
                      </View>
                    ) : (
                      fields.map((f, i) => (
                        <View key={i} style={styles.measureRow}>
                          <TextInput
                            style={styles.measureInput}
                            placeholder="Dimension"
                            value={f.label}
                            onChangeText={value =>
                              setFields(prev =>
                                prev.map((row, idx) =>
                                  idx === i ? { ...row, label: value } : row,
                                ),
                              )
                            }
                          />
                          <TextInput
                            style={styles.measureInput}
                            placeholder="Specification"
                            value={f.specification}
                            onChangeText={value =>
                              setFields(prev =>
                                prev.map((row, idx) =>
                                  idx === i ? { ...row, specification: value } : row,
                                ),
                              )
                            }
                          />
                        </View>
                      ))
                    )}
                  </View>

                  <View style={styles.builderSection}>
                    <Text style={styles.builderSectionTitle}>Add Row</Text>
                    <Text style={styles.label}>Dimension</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Length"
                      value={fieldInput.label}
                      onChangeText={t =>
                        setFieldInput({ ...fieldInput, label: t })
                      }
                    />
                    <Text style={styles.label}>Specification</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 100 +/- 0.5 mm"
                      value={fieldInput.specification}
                      onChangeText={t =>
                        setFieldInput({ ...fieldInput, specification: t })
                      }
                    />
                    <Pressable
                      style={styles.primaryBtn}
                      onPress={handleAddField}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color="#FFF"
                      />
                      <Text style={styles.primaryBtnTextWithGap}>
                        Add Field to Template
                      </Text>
                    </Pressable>
                  </View>

                  {isEditingTemplate ? (
                    <Pressable style={styles.finishBtn} onPress={handleUpdateTemplate}>
                      <Text style={styles.primaryBtnText}>Save Template</Text>
                    </Pressable>
                  ) : (
                    <Pressable style={styles.finishBtn} onPress={resetModal}>
                      <Text style={styles.primaryBtnText}>Finish & Close</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alert.visible}
        {...alert}
        onHide={() => setAlert(prev => ({ ...prev, visible: false }))}
      />

      <ZoomableImageModal
        visible={diagramViewerVisible}
        onClose={() => setDiagramViewerVisible(false)}
        imageSource={diagramPreviewSource}
        title={`${templateForm.part_no || templateForm.part_description || 'Part'} Diagram`}
      />
    </View>
  );
};

export default ManageReportsScreen;

const createStyles = C => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 18,
    backgroundColor: C.headerBg,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.textStrong },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#648197',
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspaceShell: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  sidebar: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    gap: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  sidebarItemActive: {
    backgroundColor: '#114A76',
  },
  sidebarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#D8E8F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  sidebarTextWrap: {
    alignItems: 'flex-start',
    gap: 2,
  },
  sidebarLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#114A76',
    textAlign: 'left',
  },
  sidebarLabelActive: {
    color: '#FFFFFF',
  },
  sidebarMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#648197',
  },
  sidebarMetaActive: {
    color: '#D7E8F5',
  },
  sectionPanel: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 24,
    overflow: 'hidden',
  },
  mobileSectionBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: '#F7FAFC',
  },
  mobileSectionTrigger: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#EAF2F8',
    borderWidth: 1,
    borderColor: '#D5E4EF',
  },
  mobileSectionTriggerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#114A76',
  },
  sectionScrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  drawerModalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerDismissArea: {
    flex: 1,
  },
  drawerSheet: {
    width: 240,
    paddingTop: 92,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#123A59',
  },
  heroCard: {
    backgroundColor: '#114A76',
    borderRadius: 24,
    padding: 18,
    gap: 16,
  },
  heroTextWrap: {
    gap: 6,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B7D9F1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#D7E8F5',
    fontWeight: '500',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2C7FBA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#114A76',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  overviewIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  workspaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  workspaceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#123A59',
  },
  workspaceSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
    fontWeight: '600',
  },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  workspaceRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  workspaceRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E8F1F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspaceRowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#123A59',
  },
  workspaceRowMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  statusSummaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusSummaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusSummaryDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusSummaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  searchPanel: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: '#F8FBFE',
    gap: 10,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E4EF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },
  filterRow: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E8EFF5',
  },
  filterChipActive: {
    backgroundColor: '#114A76',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C7488',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#123A59' },
  cardSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  categoryMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECF5FD',
    borderWidth: 1,
    borderColor: '#D5E8F8',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaChipText: {
    fontSize: 11,
    color: '#1D4D77',
    fontWeight: '600',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  metaText: { fontSize: 12, color: '#6B7280', marginLeft: 6 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 12,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  modalBody: {
    padding: 20,
  },
  builderWrap: {
    gap: 14,
  },
  builderSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAF0',
    borderRadius: 14,
    padding: 14,
  },
  builderSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  doubleColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  uploadSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  diagramPreviewCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D7E3EF',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FAFCFF',
  },
  diagramPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  diagramPreviewTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  diagramPreviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#123A59',
  },
  diagramReuploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E8F1F8',
  },
  diagramReuploadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#286DA6',
  },
  diagramImageWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  diagramImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#FFFFFF',
  },
  diagramHint: {
    marginTop: 8,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  previewWrap: {
    borderWidth: 1,
    borderColor: '#D7E3EF',
    borderRadius: 10,
    backgroundColor: '#FAFCFF',
    padding: 12,
    gap: 6,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#123A59',
    marginBottom: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewKey: {
    width: 128,
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  previewValue: {
    flex: 1,
    fontSize: 11,
    color: '#1F2937',
    fontWeight: '600',
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableHeadCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  measureHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 6,
  },
  measureHeadText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  measureRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  measureCell: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  measureInput: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  emptyMeasure: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyMeasureText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  primaryBtnTextWithGap: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 8,
  },
  finishBtn: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    fontSize: 14,
    color: '#1F2937',
  },
  primaryBtn: {
    backgroundColor: '#286DA6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  secondaryBtn: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#286DA6',
    marginBottom: 20,
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  secondaryBtnText: { color: '#286DA6', fontWeight: '700' },
  fieldBadge: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  fieldBadgeText: { color: '#1E40AF', fontWeight: '600', fontSize: 13 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#9CA3AF', marginTop: 12, fontWeight: '600' },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },

  templateText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  templateEditHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  createReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#286DA6',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FBFE',
  },
  createReportBtnText: {
    color: '#286DA6',
    fontSize: 13,
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: 12,
    gap: 12,
  },
  expandedSection: {
    backgroundColor: '#F8FBFE',
    borderWidth: 1,
    borderColor: '#DCE7F2',
    borderRadius: 14,
    padding: 12,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIconBadgeBlue: {
    backgroundColor: '#DBEAFE',
  },
  inlineSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#123A59',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  categorySearchWrap: {
    gap: 8,
    marginBottom: 8,
  },
  categorySearchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E4EF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    paddingVertical: 0,
  },
  templateListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  templateListIndex: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateListContent: {
    flex: 1,
  },
  templateListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  templateListMeta: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  templateListActions: {
    width: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  emptyInlineState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  loadingInlineState: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyInlineText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  deleteCategoryBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  deleteCategoryBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});


