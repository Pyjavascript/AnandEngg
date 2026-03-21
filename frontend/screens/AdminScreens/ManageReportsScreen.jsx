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
  useWindowDimensions,
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
  const { theme, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const showDesktopSidebar = width >= 980;
  const C = theme.colors;
  const styles = React.useMemo(
    () => createStyles(C, isDark, showDesktopSidebar),
    [C, isDark, showDesktopSidebar],
  );

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
  const submissionSearchQuery = submissionSearch.trim().toLowerCase();
  const templateSearchQuery = templateSearch.trim().toLowerCase();
  const approvedSubmissionsCount = React.useMemo(
    () =>
      submissions.filter(
        item => item.status === 'manager_approved' || item.status === 'inspector_reviewed',
      ).length,
    [submissions],
  );
  const pendingSubmissionsCount = React.useMemo(
    () => submissions.filter(item => item.status === 'submitted').length,
    [submissions],
  );
  const rejectedSubmissionsCount = React.useMemo(
    () => submissions.filter(item => item.status === 'rejected').length,
    [submissions],
  );
  const totalTemplatesCount = React.useMemo(
    () =>
      categories.reduce(
        (sum, item) => sum + Number(item.report_count || 0),
        0,
      ),
    [categories],
  );
  const filteredSubmissions = React.useMemo(
    () =>
      submissions.filter(item => {
        const reportName = String(
          item.template_label || item.part_description || item.title || item.report_type || '',
        ).toLowerCase();
        const categoryName = String(item.category_name || '').toLowerCase();
        const matchesSearch =
          !submissionSearchQuery
          || reportName.includes(submissionSearchQuery)
          || categoryName.includes(submissionSearchQuery);

        const status = String(item.status || '').toLowerCase();
        const matchesFilter =
          submissionFilter === 'all' ||
          (submissionFilter === 'approved' &&
            (status === 'manager_approved' || status === 'inspector_reviewed')) ||
          (submissionFilter === 'pending' && status === 'submitted') ||
          (submissionFilter === 'rejected' && status === 'rejected');

        return matchesSearch && matchesFilter;
      }),
    [submissionFilter, submissionSearchQuery, submissions],
  );
  const filteredTemplates = React.useMemo(
    () =>
      templates.filter(item => {
        if (!templateSearchQuery) return true;

        const name = String(item.partDescription || '').toLowerCase();
        const docNo = String(item.docNo || '').toLowerCase();
        const customer = String(item.customer || '').toLowerCase();

        return (
          name.includes(templateSearchQuery)
          || docNo.includes(templateSearchQuery)
          || customer.includes(templateSearchQuery)
        );
      }),
    [templateSearchQuery, templates],
  );
  const sectionItems = React.useMemo(
    () => [
      {
        key: 'overview',
        label: 'Report Overview',
        icon: 'grid-outline',
        count: categories.length + submissions.length,
      },
      {
        key: 'types',
        label: 'Report Categories',
        icon: 'layers-outline',
        count: categories.length,
      },
      {
        key: 'submissions',
        label: 'Report Submissions',
        icon: 'document-text-outline',
        count: submissions.length,
      },
    ],
    [categories.length, submissions.length],
  );
  const overviewCards = React.useMemo(
    () => [
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
    ],
    [
      approvedSubmissionsCount,
      categories.length,
      pendingSubmissionsCount,
      totalTemplatesCount,
    ],
  );

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
      const submissionsByCategoryKey = safeSubs.reduce((acc, sub) => {
        const key = String(sub?.category_name || '')
          .trim()
          .toLowerCase();
        if (!key) return acc;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(sub);
        return acc;
      }, {});

      const submissionsByTemplateId = safeSubs.reduce((acc, sub) => {
        const templateId = Number(sub?.template_id);
        if (Number.isNaN(templateId) || templateId <= 0) return acc;
        if (!acc[templateId]) {
          acc[templateId] = [];
        }
        acc[templateId].push(sub);
        return acc;
      }, {});

      const merged = safeCats.map(cat => {
        const key = String(cat.name || cat.code || cat.id || '')
          .trim()
          .toLowerCase();
        const templateIds = templateMap[key] || new Set();
        const matchedSubsMap = new Map();

        (submissionsByCategoryKey[key] || []).forEach(sub => {
          matchedSubsMap.set(Number(sub.id), sub);
        });
        templateIds.forEach(templateId => {
          (submissionsByTemplateId[templateId] || []).forEach(sub => {
            matchedSubsMap.set(Number(sub.id), sub);
          });
        });
        const matchedSubs = Array.from(matchedSubsMap.values());

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

  const handleDeleteTemplate = template => {
    const templateId = Number(template?.templateId || template?.id);
    if (!templateId) {
      showAlert('error', 'Delete Failed', 'Template id is missing.');
      return;
    }

    const templateName =
      template?.partDescription || template?.docNo || `Report ${templateId}`;

    Alert.alert(
      'Delete Report?',
      `Delete "${templateName}" from this category? This will also delete its related submissions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportApi.deleteTemplate(templateId);
              setTemplates(current =>
                current.filter(
                  item => Number(item.templateId || item.id) !== templateId,
                ),
              );
              showAlert(
                'success',
                'Report Deleted',
                'The selected report was removed successfully.',
              );
              await loadAll();
            } catch (err) {
              const apiMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to delete report';
              showAlert('error', 'Delete Failed', apiMessage);
            }
          },
        },
      ],
    );
  };
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
            <Ionicons name="layers" size={20} color={C.primary} />
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
            color={C.textSubtle}
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
                  <Ionicons name="search-outline" size={16} color={C.textMuted} />
                  <TextInput
                    style={styles.categorySearchInput}
                    placeholder="Search report, doc no, or company"
                    value={templateSearch}
                    onChangeText={setTemplateSearch}
                    placeholderTextColor={C.textSubtle}
                  />
                  {templateSearch ? (
                    <Pressable onPress={() => setTemplateSearch('')}>
                      <Ionicons name="close-circle" size={17} color={C.textSubtle} />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {loadingTemplates ? (
                <View style={styles.loadingInlineState}>
                  <ActivityIndicator color={C.primary} />
                </View>
              ) : templates.length === 0 ? (
                <View style={styles.emptyInlineState}>
                  <Ionicons name="documents-outline" size={22} color={C.textSubtle} />
                  <Text style={styles.emptyInlineText}>No reports created yet</Text>
                </View>
              ) : filteredTemplates.length === 0 ? (
                <View style={styles.emptyInlineState}>
                  <Ionicons name="search-outline" size={22} color={C.textSubtle} />
                  <Text style={styles.emptyInlineText}>No reports match this filter</Text>
                </View>
              ) : (
                filteredTemplates.map(tpl => (
                  <View key={tpl.id} style={styles.templateListRow}>
                    <View style={styles.templateListIndex}>
                      <Ionicons name="document-text-outline" size={15} color={C.primary} />
                    </View>
                    <Pressable
                      style={styles.templateListContent}
                      onPress={() => openEditTemplateModal(tpl.templateId)}
                    >
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
                    </Pressable>
                    <View style={styles.templateListActions}>
                      <Pressable
                        style={styles.templateActionBtn}
                        onPress={() => openEditTemplateModal(tpl.templateId)}
                      >
                        <Ionicons name="create-outline" size={16} color={C.textMuted} />
                      </Pressable>
                      <Pressable
                        style={[styles.templateActionBtn, styles.templateDeleteBtn]}
                        onPress={() => handleDeleteTemplate(tpl)}
                      >
                        <Ionicons name="trash-outline" size={16} color={C.danger} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

            <Pressable
              style={styles.createReportBtn}
              onPress={() => openCreateReportModal(item)}
            >
              <Ionicons name="add-circle" size={18} color={C.primary} />
              <Text style={styles.createReportBtnText}>Create Report</Text>
            </Pressable>
            <Pressable
              style={styles.deleteCategoryBtn}
              onPress={() => handleDeleteCategory(item)}
            >
              <Ionicons name="trash-outline" size={17} color={C.danger} />
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
          <Ionicons name="person-outline" size={14} color={C.textMuted} />
          <Text style={styles.metaText}>
            {item.submitted_by_name || item.submitted_by || item.name || 'Anonymous'}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={C.textMuted}
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
    <View style={styles.sidebarShell}>
      <View style={styles.sidebarHero}>
        <View style={styles.sidebarHeroBadge}>
          <Ionicons name="analytics-outline" size={16} color="#DCEFFC" />
        </View>
        <Text style={styles.sidebarHeroEyebrow}>Admin Navigation</Text>
        <Text style={styles.sidebarHeroTitle}>Report control workspace</Text>
        <Text style={styles.sidebarHeroSubtitle}>
          Switch between overview, categories, and live submission tracking.
        </Text>
      </View>

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
                  {item.count} item{item.count === 1 ? '' : 's'}
                </Text>
              </View>
              <View style={[styles.sidebarCountPill, isActive && styles.sidebarCountPillActive]}>
                <Text style={[styles.sidebarCountText, isActive && styles.sidebarCountTextActive]}>
                  {item.count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sidebarFooter}>
        <View style={styles.sidebarFooterChip}>
          <View style={[styles.sidebarFooterDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.sidebarFooterText}>{pendingSubmissionsCount} pending</Text>
        </View>
        <View style={styles.sidebarFooterChip}>
          <View style={[styles.sidebarFooterDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.sidebarFooterText}>{approvedSubmissionsCount} approved</Text>
        </View>
      </View>
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
            disabled={showDesktopSidebar}
          >
            <Ionicons
              name={showDesktopSidebar ? 'grid-outline' : 'menu-outline'}
              size={22}
              color={C.primary}
            />
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
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <View style={styles.workspaceShell}>
          {showDesktopSidebar ? (
            <View style={styles.desktopSidebarDock}>{renderSectionNav()}</View>
          ) : null}
          <View style={styles.sectionPanel}>
            {!showDesktopSidebar ? (
            <View style={styles.mobileSectionBar}>
              <Pressable
                style={styles.mobileSectionTrigger}
                onPress={() => setSidebarVisible(true)}
              >
                <Ionicons name="grid-outline" size={16} color={C.primary} />
                <Text style={styles.mobileSectionTriggerText}>
                  {sectionItems.find(item => item.key === activeSection)?.label || 'Sections'}
                </Text>
                <View style={styles.mobileSectionTriggerBadge}>
                  <Text style={styles.mobileSectionTriggerBadgeText}>
                    {sectionItems.find(item => item.key === activeSection)?.count || 0}
                  </Text>
                </View>
              </Pressable>
            </View>
            ) : null}
            {activeSection === 'overview' ? (
              renderOverviewSection()
            ) : (
              <View style={{ flex: 1 }}>
                {activeSection === 'submissions' && (
                  <View style={styles.searchPanel}>
                    <View style={styles.searchInputWrap}>
                      <Ionicons name="search-outline" size={18} color={C.textMuted} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search by category or report name"
                        value={submissionSearch}
                        onChangeText={setSubmissionSearch}
                        placeholderTextColor={C.textSubtle}
                      />
                      {submissionSearch ? (
                        <Pressable onPress={() => setSubmissionSearch('')}>
                          <Ionicons name="close-circle" size={18} color={C.textSubtle} />
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
                  key={activeSection}
                  data={activeSection === 'types' ? categories : filteredSubmissions}
                  renderItem={
                    activeSection === 'types' ? renderCategoryItem : renderSubmissionItem
                  }
                  keyExtractor={item => String(item.id)}
                  initialNumToRender={8}
                  maxToRenderPerBatch={8}
                  windowSize={7}
                  removeClippedSubviews
                  contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                  refreshing={refreshing}
                  onRefresh={loadAll}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="document-outline" size={48} color={C.textSubtle} />
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
          <Animated.View
            pointerEvents="none"
            style={[styles.drawerBackdrop, { opacity: drawerBackdropOpacity }]}
          />
          <Animated.View
            style={[
              styles.drawerSheet,
              { transform: [{ translateX: drawerTranslateX }] },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Sections</Text>
              <Pressable onPress={() => setSidebarVisible(false)}>
                <Ionicons name="close" size={22} color={C.textMuted} />
              </Pressable>
            </View>
            {renderSectionNav()}
          </Animated.View>
          <Pressable
            style={styles.drawerDismissArea}
            onPress={() => setSidebarVisible(false)}
          />
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
                <Ionicons name="close" size={26} color={C.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {loadingTemplateDetail && (
                <View style={styles.center}>
                  <ActivityIndicator size="small" color={C.primary} />
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
                      color: C.textMuted,
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
                        color={diagramFile ? C.success : C.textSubtle}
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
                            <Ionicons name="image-outline" size={16} color={C.primary} />
                            <Text style={styles.diagramPreviewTitle}>
                              {diagramFile ? 'Selected Diagram Preview' : 'Uploaded Diagram'}
                            </Text>
                          </View>
                          <Pressable
                            style={styles.diagramReuploadBtn}
                            onPress={pickDiagram}
                          >
                            <Ionicons name="cloud-upload-outline" size={15} color={C.primary} />
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

const createStyles = (C, isDark = false, showDesktopSidebar = false) => {
  const panelBg = C.surface;
  const panelAlt = C.surfaceAlt;
  const panelSoft = isDark ? '#1A2835' : '#F7FAFC';
  const primaryTint = isDark ? 'rgba(105,179,242,0.16)' : '#EAF2F8';
  const primaryTintStrong = isDark ? 'rgba(105,179,242,0.22)' : '#D8E8F4';
  const primaryBorder = isDark ? 'rgba(105,179,242,0.24)' : '#D5E4EF';
  const chipBg = isDark ? '#203142' : '#F5F9FC';
  const heroBg = isDark ? '#12344C' : '#114A76';
  const heroAccent = isDark ? '#2F78B5' : '#2C7FBA';
  const heroTextMuted = isDark ? '#BDD9F2' : '#D7E8F5';
  const textInverseSoft = isDark ? '#D3E8FA' : '#DCEFFC';
  const dangerSoft = isDark ? 'rgba(248,113,113,0.14)' : '#FEF2F2';
  const dangerBorder = isDark ? 'rgba(248,113,113,0.26)' : '#FECACA';
  const modalGlass = isDark
    ? 'rgba(22,33,45,0.84)'
    : 'rgba(255,255,255,0.78)';

  return StyleSheet.create({
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
    color: C.textMuted,
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: primaryTint,
    borderWidth: 1,
    borderColor: primaryBorder,
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
    flexDirection: showDesktopSidebar ? 'row' : 'column',
    gap: showDesktopSidebar ? 14 : 0,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  desktopSidebarDock: {
    width: 292,
  },
  sidebarShell: {
    backgroundColor: panelBg,
    borderRadius: 26,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0F172A',
    shadowOpacity: isDark ? 0.22 : 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    gap: 14,
  },
  sidebarHero: {
    backgroundColor: heroBg,
    borderRadius: 22,
    padding: 16,
    gap: 6,
  },
  sidebarHeroBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  sidebarHeroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: heroTextMuted,
  },
  sidebarHeroTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sidebarHeroSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: textInverseSoft,
    fontWeight: '500',
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: panelSoft,
  },
  sidebarItemActive: {
    backgroundColor: heroBg,
    borderColor: heroBg,
  },
  sidebarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: primaryTintStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  sidebarTextWrap: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 2,
  },
  sidebarLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
    textAlign: 'left',
  },
  sidebarLabelActive: {
    color: '#FFFFFF',
  },
  sidebarMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
  },
  sidebarMetaActive: {
    color: '#D7E8F5',
  },
  sidebarCountPill: {
    minWidth: 34,
    height: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: primaryTintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarCountPillActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  sidebarCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.primary,
  },
  sidebarCountTextActive: {
    color: '#FFFFFF',
  },
  sidebarFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sidebarFooterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: chipBg,
    borderWidth: 1,
    borderColor: C.border,
  },
  sidebarFooterDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  sidebarFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
  },
  sectionPanel: {
    flex: 1,
    backgroundColor: panelSoft,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  mobileSectionBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: panelSoft,
  },
  mobileSectionTrigger: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: primaryTint,
    borderWidth: 1,
    borderColor: primaryBorder,
  },
  mobileSectionTriggerText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.primary,
  },
  mobileSectionTriggerBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: heroBg,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileSectionTriggerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
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
    width: 292,
    paddingTop: 84,
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: panelBg,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
    shadowColor: '#000000',
    shadowOpacity: isDark ? 0.3 : 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textStrong,
  },
  heroCard: {
    backgroundColor: heroBg,
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
    color: heroTextMuted,
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
    color: textInverseSoft,
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
    backgroundColor: heroAccent,
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
    backgroundColor: panelBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: C.primary,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    width: '47%',
    backgroundColor: panelBg,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.textStrong,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
  },
  workspaceCard: {
    backgroundColor: panelBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  workspaceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textStrong,
  },
  workspaceSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: C.textMuted,
    fontWeight: '600',
  },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
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
    backgroundColor: primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspaceRowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.textStrong,
  },
  workspaceRowMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
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
    backgroundColor: panelAlt,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.textMuted,
  },
  searchPanel: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: panelSoft,
    gap: 10,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: panelBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textBody,
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
    backgroundColor: primaryTint,
  },
  filterChipActive: {
    backgroundColor: heroBg,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: panelBg,
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
    backgroundColor: primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textStrong },
  cardSubtitle: { fontSize: 11, color: C.textSubtle, marginTop: 2 },
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
    backgroundColor: primaryTint,
    borderWidth: 1,
    borderColor: primaryBorder,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaChipText: {
    fontSize: 11,
    color: C.primary,
    fontWeight: '600',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  metaText: { fontSize: 12, color: C.textMuted, marginLeft: 6 },
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
    backgroundColor: modalGlass,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.textStrong },
  modalBody: {
    padding: 20,
  },
  builderWrap: {
    gap: 14,
  },
  builderSection: {
    backgroundColor: panelBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
  },
  builderSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textStrong,
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
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: panelAlt,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textBody,
  },
  uploadSub: {
    fontSize: 11,
    color: C.textSubtle,
  },
  diagramPreviewCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: panelAlt,
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
    color: C.textStrong,
  },
  diagramReuploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: primaryTint,
  },
  diagramReuploadText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },
  diagramImageWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: panelBg,
    borderWidth: 1,
    borderColor: C.border,
  },
  diagramImage: {
    width: '100%',
    height: 220,
    backgroundColor: panelBg,
  },
  diagramHint: {
    marginTop: 8,
    fontSize: 11,
    color: C.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  previewWrap: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: panelAlt,
    padding: 12,
    gap: 6,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: C.textStrong,
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
    color: C.textMuted,
  },
  previewValue: {
    flex: 1,
    fontSize: 11,
    color: C.textBody,
    fontWeight: '600',
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableHeadCount: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '600',
  },
  measureHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 8,
    marginBottom: 6,
  },
  measureHeadText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
  },
  measureRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 8,
  },
  measureCell: {
    flex: 1,
    fontSize: 13,
    color: C.textBody,
    fontWeight: '500',
  },
  measureInput: {
    flex: 1,
    fontSize: 13,
    color: C.textBody,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: panelBg,
    marginRight: 6,
  },
  emptyMeasure: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyMeasureText: {
    color: C.textSubtle,
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
    color: C.textMuted,
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: panelAlt,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    fontSize: 14,
    color: C.textBody,
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
    borderColor: C.primary,
    marginBottom: 20,
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  secondaryBtnText: { color: C.primary, fontWeight: '700' },
  fieldBadge: {
    backgroundColor: primaryTint,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: primaryBorder,
  },
  fieldBadgeText: { color: C.primary, fontWeight: '600', fontSize: 13 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: C.textSubtle, marginTop: 12, fontWeight: '600' },
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
    borderColor: C.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: primaryTint,
  },
  createReportBtnText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: 12,
    gap: 12,
  },
  expandedSection: {
    backgroundColor: panelAlt,
    borderWidth: 1,
    borderColor: C.border,
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
    color: C.textStrong,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: C.textMuted,
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
    backgroundColor: panelBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: 13,
    color: C.textBody,
    paddingVertical: 0,
  },
  templateListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
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
    color: C.textStrong,
  },
  templateListMeta: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  templateListActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: panelAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  templateDeleteBtn: {
    backgroundColor: dangerSoft,
    borderColor: dangerBorder,
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
    color: C.textSubtle,
    fontWeight: '700',
  },
  deleteCategoryBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: dangerBorder,
    backgroundColor: dangerSoft,
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  deleteCategoryBtnText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  });
};


