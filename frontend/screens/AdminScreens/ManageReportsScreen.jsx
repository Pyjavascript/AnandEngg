// // import React, { useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   Pressable,
// //   ActivityIndicator,
// //   FlatList,
// //   Modal,
// //   TextInput,
// //   Dimensions,

// // } from 'react-native';
// // import Ionicons from 'react-native-vector-icons/Ionicons';
// // import { useFocusEffect } from '@react-navigation/native';
// // import reportApi from '../../utils/reportApi';
// // import ConfirmationDialog from '../../components/ConfirmationDialog';
// // import CustomAlert from '../../components/CustomAlert';

// // const { width } = Dimensions.get('window');

// // const ManageReportsScreen = ({ navigation }) => {
// //   const [activeTab, setActiveTab] = useState('types'); // 'types' or 'submissions'
// //   const [reportTypes, setReportTypes] = useState([]);
// //   const [allReports, setAllReports] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [alert, setAlert] = useState({
// //     visible: false,
// //     type: 'success',
// //     title: '',
// //     message: '',
// //   });
// //   const [addReportModal, setAddReportModal] = useState({
// //     visible: false,
// //     name: '',
// //     code: '',
// //     description: '',
// //     frequency: 'Daily',
// //     isLoading: false,
// //     fields: [],
// //   });
// //   // fields: array of { label, specification, unit, position }
// //   const [confirmDialog, setConfirmDialog] = useState({
// //     visible: false,
// //     reportId: null,
// //     reportName: '',
// //     isLoading: false,
// //   });

// //   const showAlert = (type, title, message = '') => {
// //     setAlert({ visible: true, type, title, message });
// //   };

// //   // Load data
// //   useFocusEffect(
// //     React.useCallback(() => {
// //       loadAll();
// //       // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, []),
// //   );

// //   const loadAll = async () => {
// //     setLoading(true);
// //     try {
// //       const [typesData, submissionsData] = await Promise.all([
// //         reportApi.getCategories(),
// //         reportApi.getAllSubmissions().catch(() => []),
// //       ]);
// //       const mapped = (typesData || []).map(c => ({
// //         id: c.id,
// //         name: c.name,
// //         code: c.code || '',
// //         description: c.description || '',
// //         frequency: c.frequency || 'Custom',
// //         status: c.status || 'active',
// //         submittedCount: 0,
// //       }));
// //       setReportTypes(mapped);

// //       const mappedSubs = (submissionsData || []).map(s => ({
// //         id: s.id,
// //         title: s.template_label || 'Submission',
// //         submittedBy: s.submitted_by_name || s.submitted_by || 'Unknown',
// //         type: s.template_label || '',
// //         submittedDate: s.created_at ? new Date(s.created_at).toLocaleString() : '',
// //         status: s.status || 'pending',
// //         approvedBy: s.manager_id ? 'Manager' : s.inspector_id ? 'Inspector' : null,
// //       }));
// //       setAllReports(mappedSubs);
// //     } catch (err) {
// //       showAlert('error', 'Failed to load data');
// //       console.log('Failed to load', err);
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   const onRefresh = async () => {
// //     setRefreshing(true);
// //     await loadAll();
// //   };

// //   const handleAddReportType = async () => {
// //     if (!addReportModal.name || !addReportModal.code) {
// //       showAlert('error', 'Validation Error', 'Name and Code are required');
// //       return;
// //     }

// //     setAddReportModal(prev => ({ ...prev, isLoading: true }));

// //     try {
// //       // create category first
// //       const catRes = await reportApi.createCategory(addReportModal.name);
// //       const categoryId = catRes.id || catRes.insertId;

// //       // create template referencing the new category
// //       const tplRes = await reportApi.createTemplate({
// //         category_id: categoryId,
// //         doc_no: addReportModal.code.toUpperCase(),
// //         customer: '',
// //         part_no: '',
// //         part_description: addReportModal.description,
// //         rev_no: '',
// //       });
// //       const templateId = tplRes.id || tplRes.insertId;

// //       // create fields if any
// //       if (Array.isArray(addReportModal.fields) && addReportModal.fields.length > 0) {
// //         for (const f of addReportModal.fields) {
// //           if (!f.label) continue;
// //           try {
// //             await reportApi.createField(templateId, {
// //               label: f.label,
// //               specification: f.specification || null,
// //               unit: f.unit || null,
// //               position: f.position || null,
// //             });
// //           } catch (err) {
// //             console.warn('Failed to create field', f, err);
// //           }
// //         }
// //       }

// //       // update UI list by reloading categories
// //       const typesData = await reportApi.getCategories();
// //       const mapped = typesData.map(c => ({
// //         id: c.id,
// //         name: c.name,
// //         code: c.code || '',
// //         description: '',
// //         frequency: 'Custom',
// //         status: 'active',
// //         submittedCount: 0,
// //       }));
// //       setReportTypes(mapped);
// //       showAlert('success', 'Success', 'Report template created');
// //       setAddReportModal({
// //         visible: false,
// //         name: '',
// //         code: '',
// //         description: '',
// //         frequency: 'Daily',
// //         isLoading: false,
// //         fields: [],
// //       });
// //     } catch (err) {
// //       showAlert('error', 'Error', 'Failed to add report type');
// //       console.log('Error:', err);
// //     } finally {
// //       setAddReportModal(prev => ({ ...prev, isLoading: false }));
// //     }
// //   };

// //   const handleDeleteReportType = async () => {
// //     if (!confirmDialog.reportId) return;

// //     setConfirmDialog(prev => ({ ...prev, isLoading: true }));
// //     try {
// //       await reportApi.deleteCategory(confirmDialog.reportId);
// //       setReportTypes(reportTypes.filter(r => r.id !== confirmDialog.reportId));
// //       showAlert('success', 'Success', 'Report type deleted successfully');
// //     } catch (err) {
// //       showAlert('error', 'Error', 'Failed to delete');
// //       console.log('Error:', err);
// //     } finally {
// //       setConfirmDialog({
// //         visible: false,
// //         reportId: null,
// //         reportName: '',
// //         isLoading: false,
// //       });
// //     }
// //   };

// //   const openDeleteConfirm = (reportId, reportName) => {
// //     setConfirmDialog({
// //       visible: true,
// //       reportId,
// //       reportName,
// //       isLoading: false,
// //     });
// //   };

// //   const renderReportTypeItem = ({ item }) => {
// //     return (
// //       <View style={styles.reportTypeCard}>
// //         <View style={styles.reportTypeHeader}>
// //           <View style={styles.reportTypeIcon}>
// //             <Ionicons name="document-text" size={22} color="#286DA6" />
// //           </View>

// //           <View style={styles.reportTypeInfo}>
// //             <Text style={styles.reportTypeName}>{item.name}</Text>
// //             <Text style={styles.reportTypeCode}>{item.code}</Text>
// //             <Text style={styles.reportTypeDesc} numberOfLines={1}>
// //               {item.description}
// //             </Text>
// //           </View>
// //         </View>

// //         <View style={styles.reportTypeMeta}>
// //           <View style={styles.metaItem}>
// //             <Ionicons name="repeat" size={14} color="#6B7280" />
// //             <Text style={styles.metaText}>{item.frequency}</Text>
// //           </View>
// //           <View style={styles.metaItem}>
// //             <Ionicons name="checkmark-circle" size={14} color="#10B981" />
// //             <Text style={styles.metaText}>{item.submittedCount} submitted</Text>
// //           </View>
// //           <View
// //             style={[
// //               styles.statusTag,
// //               {
// //                 backgroundColor: item.status === 'active' ? '#DCFCE7' : '#F3F4F6',
// //               },
// //             ]}
// //           >
// //             <Text
// //               style={[
// //                 styles.statusTagText,
// //                 {
// //                   color: item.status === 'active' ? '#059669' : '#6B7280',
// //                 },
// //               ]}
// //             >
// //               {item.status}
// //             </Text>
// //           </View>
// //         </View>

// //         <Pressable
// //           style={({ pressed }) => [
// //             styles.deleteReportBtn,
// //             pressed && styles.deleteReportBtnPressed,
// //           ]}
// //           onPress={() => openDeleteConfirm(item.id, item.name)}
// //         >
// //           <Ionicons name="trash-outline" size={16} color="#EF4444" />
// //           <Text style={styles.deleteReportBtnText}>Delete</Text>
// //         </Pressable>
// //       </View>
// //     );
// //   };

// //   const renderReportSubmissionItem = ({ item }) => {
// //     const statusColor =
// //       item.status === 'approved'
// //         ? '#10B981'
// //         : item.status === 'pending'
// //         ? '#F59E0B'
// //         : '#EF4444';

// //     return (
// //       <View style={styles.submissionCard}>
// //         <View style={styles.submissionHeader}>
// //           <View
// //             style={[
// //               styles.submissionStatusDot,
// //               { backgroundColor: statusColor },
// //             ]}
// //           />
// //           <Text style={styles.submissionTitle}>{item.title}</Text>
// //         </View>

// //         <View style={styles.submissionDetails}>
// //           <View style={styles.detailRow}>
// //             <Ionicons name="person" size={14} color="#6B7280" />
// //             <Text style={styles.detailText}>{item.submittedBy}</Text>
// //           </View>
// //           <View style={styles.detailRow}>
// //             <Ionicons name="document-outline" size={14} color="#6B7280" />
// //             <Text style={styles.detailText}>{item.type}</Text>
// //           </View>
// //           <View style={styles.detailRow}>
// //             <Ionicons name="calendar" size={14} color="#6B7280" />
// //             <Text style={styles.detailText}>{item.submittedDate}</Text>
// //           </View>
// //         </View>

// //         <View style={styles.submissionFooter}>
// //           <View
// //             style={[
// //               styles.statusBadge,
// //               { backgroundColor: `${statusColor}20` },
// //             ]}
// //           >
// //             <Text style={[styles.statusBadgeText, { color: statusColor }]}>
// //               {item.status.toUpperCase()}
// //             </Text>
// //           </View>
// //           {item.approvedBy && (
// //             <Text style={styles.approvedByText}>
// //               by {item.approvedBy}
// //             </Text>
// //           )}
// //         </View>
// //       </View>
// //     );
// //   };

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#286DA6" />
// //         <Text style={styles.loadingText}>Loading reports...</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={styles.container}>
// //       {/* Header */}
// //       <View style={styles.header}>
// //         <View style={styles.headerLeft}>
// //           <Pressable
// //             onPress={() => navigation.goBack()}
// //             style={({ pressed }) => [
// //               styles.backButton,
// //               pressed && styles.backButtonPressed,
// //             ]}
// //           >
// //             <Ionicons name="chevron-back" size={24} color="#286DA6" />
// //           </Pressable>
// //           <Text style={styles.headerTitle}>Manage Reports</Text>
// //         </View>

// //         {activeTab === 'types' && (
// //           <Pressable
// //             style={({ pressed }) => [
// //               styles.addButton,
// //               pressed && styles.addButtonPressed,
// //             ]}
// //             onPress={() => setAddReportModal({ ...addReportModal, visible: true, fields: addReportModal.fields || [] })}
// //           >
// //             <Ionicons name="add" size={20} color="#FFFFFF" />
// //           </Pressable>
// //         )}
// //       </View>

// //       {/* Tabs */}
// //       <View style={styles.tabsContainer}>
// //         <Pressable
// //           style={[styles.tab, activeTab === 'types' && styles.tabActive]}
// //           onPress={() => setActiveTab('types')}
// //         >
// //           <Ionicons
// //             name="layers-outline"
// //             size={18}
// //             color={activeTab === 'types' ? '#286DA6' : '#B0C4D8'}
// //           />
// //           <Text
// //             style={[
// //               styles.tabText,
// //               activeTab === 'types' && styles.tabTextActive,
// //             ]}
// //           >
// //             Report Types
// //           </Text>
// //           <View
// //             style={[
// //               styles.tabBadge,
// //               activeTab !== 'types' && styles.tabBadgeInactive,
// //             ]}
// //           >
// //             <Text
// //               style={[
// //                 styles.tabBadgeText,
// //                 activeTab !== 'types' && styles.tabBadgeTextInactive,
// //               ]}
// //             >
// //               {reportTypes.length}
// //             </Text>
// //           </View>
// //         </Pressable>

// //         <Pressable
// //           style={[styles.tab, activeTab === 'submissions' && styles.tabActive]}
// //           onPress={() => setActiveTab('submissions')}
// //         >
// //           <Ionicons
// //             name="document-text-outline"
// //             size={18}
// //             color={activeTab === 'submissions' ? '#286DA6' : '#B0C4D8'}
// //           />
// //           <Text
// //             style={[
// //               styles.tabText,
// //               activeTab === 'submissions' && styles.tabTextActive,
// //             ]}
// //           >
// //             All Submissions
// //           </Text>
// //           <View
// //             style={[
// //               styles.tabBadge,
// //               activeTab !== 'submissions' && styles.tabBadgeInactive,
// //             ]}
// //           >
// //             <Text
// //               style={[
// //                 styles.tabBadgeText,
// //                 activeTab !== 'submissions' && styles.tabBadgeTextInactive,
// //               ]}
// //             >
// //               {allReports.length}
// //             </Text>
// //           </View>
// //         </Pressable>
// //       </View>

// //       {/* Content */}
// //       {activeTab === 'types' ? (
// //         <FlatList
// //           data={reportTypes}
// //           renderItem={renderReportTypeItem}
// //           keyExtractor={item => String(item.id)}
// //           contentContainerStyle={styles.listContent}
// //           refreshing={refreshing}
// //           onRefresh={onRefresh}
// //           ListEmptyComponent={
// //             <View style={styles.emptyState}>
// //               <Ionicons name="layers-outline" size={48} color="#B0C4D8" />
// //               <Text style={styles.emptyStateText}>No report types</Text>
// //             </View>
// //           }
// //         />
// //       ) : (
// //         <FlatList
// //           data={allReports}
// //           renderItem={renderReportSubmissionItem}
// //           keyExtractor={item => String(item.id)}
// //           contentContainerStyle={styles.listContent}
// //           refreshing={refreshing}
// //           onRefresh={onRefresh}
// //           ListEmptyComponent={
// //             <View style={styles.emptyState}>
// //               <Ionicons name="document-outline" size={48} color="#B0C4D8" />
// //               <Text style={styles.emptyStateText}>No submissions</Text>
// //             </View>
// //           }
// //         />
// //       )}

// //       {/* Add Report Type Modal */}
// //       <Modal
// //         visible={addReportModal.visible}
// //         transparent={true}
// //         animationType="slide"
// //         onRequestClose={() =>
// //           setAddReportModal({
// //             visible: false,
// //             name: '',
// //             code: '',
// //             description: '',
// //             frequency: 'Daily',
// //             isLoading: false,
// //             fields: [],
// //           })
// //         }
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContent}>
// //             {/* Modal Header */}
// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>Create Report Type</Text>
// //               <Pressable
// //                 onPress={() =>
// //                   setAddReportModal({
// //                     visible: false,
// //                     name: '',
// //                     code: '',
// //                     description: '',
// //                     frequency: 'Daily',
// //                     isLoading: false,
// //                     fields: [],
// //                   })
// //                 }
// //                 style={({ pressed }) => [
// //                   styles.closeButton,
// //                   pressed && styles.closeButtonPressed,
// //                 ]}
// //               >
// //                 <Ionicons name="close" size={24} color="#6B7280" />
// //               </Pressable>
// //             </View>

// //             <ScrollView style={styles.modalScrollView}>
// //               {/* Report Name */}
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Report Name *</Text>
// //                 <TextInput
// //                   style={styles.formInput}
// //                   placeholder="e.g., Daily Production Report"
// //                   placeholderTextColor="#B0C4D8"
// //                   value={addReportModal.name}
// //                   onChangeText={(text) =>
// //                     setAddReportModal({ ...addReportModal, name: text })
// //                   }
// //                   editable={!addReportModal.isLoading}
// //                 />
// //               </View>

// //               {/* Report Code */}
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Report Code *</Text>
// //                 <TextInput
// //                   style={styles.formInput}
// //                   placeholder="e.g., RPT_PROD_001"
// //                   placeholderTextColor="#B0C4D8"
// //                   value={addReportModal.code}
// //                   onChangeText={(text) =>
// //                     setAddReportModal({ ...addReportModal, code: text })
// //                   }
// //                   editable={!addReportModal.isLoading}
// //                 />
// //                 <Text style={styles.formHelp}>
// //                   Unique identifier for this report type
// //                 </Text>
// //               </View>

// //               {/* Description */}
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Description</Text>
// //                 <TextInput
// //                   style={[styles.formInput, styles.textAreaInput]}
// //                   placeholder="Enter report description..."
// //                   placeholderTextColor="#B0C4D8"
// //                   value={addReportModal.description}
// //                   onChangeText={(text) =>
// //                     setAddReportModal({ ...addReportModal, description: text })
// //                   }
// //                   multiline={true}
// //                   numberOfLines={3}
// //                   editable={!addReportModal.isLoading}
// //                 />
// //               </View>

// //               {/* Frequency */}
// //               <View style={styles.formGroup}>
// //                 <Text style={styles.formLabel}>Frequency</Text>
// //                 <View style={styles.frequencyButtons}>
// //                   {['Daily', 'Weekly', 'Monthly', 'Per Batch', 'As Needed'].map(
// //                     freq => (
// //                       <Pressable
// //                         key={freq}
// //                         style={[
// //                           styles.frequencyButton,
// //                           addReportModal.frequency === freq &&
// //                             styles.frequencyButtonActive,
// //                         ]}
// //                         onPress={() =>
// //                           setAddReportModal({
// //                             ...addReportModal,
// //                             frequency: freq,
// //                           })
// //                         }
// //                       >
// //                         <Text
// //                           style={[
// //                             styles.frequencyButtonText,
// //                             addReportModal.frequency === freq &&
// //                               styles.frequencyButtonTextActive,
// //                           ]}
// //                         >
// //                           {freq}
// //                         </Text>
// //                       </Pressable>
// //                     ),
// //                   )}
// //                 </View>
// //               </View>

// //               {/* Fields */}
// //               <View style={styles.formGroup}>
// //                 <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
// //                   <Text style={styles.formLabel}>Fields</Text>
// //                   <Pressable
// //                     onPress={() => {
// //                       setAddReportModal(prev => ({
// //                         ...prev,
// //                         fields: [ ...(prev.fields || []), { label: '', specification: '', unit: '', position: (prev.fields||[]).length + 1 } ]
// //                       }));
// //                     }}
// //                     style={{padding: 6}}
// //                   >
// //                     <Ionicons name="add-circle" size={22} color="#286DA6" />
// //                   </Pressable>
// //                 </View>

// //                 {(addReportModal.fields || []).map((f, idx) => (
// //                   <View key={idx} style={{marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB', padding: 8, borderRadius: 8}}>
// //                     <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
// //                       <Text style={{fontWeight: '600'}}>Field {idx + 1}</Text>
// //                       <Pressable onPress={() => {
// //                         setAddReportModal(prev => ({ ...prev, fields: prev.fields.filter((_,i)=>i!==idx) }));
// //                       }} style={{padding:4}}>
// //                         <Ionicons name="trash-outline" size={18} color="#EF4444" />
// //                       </Pressable>
// //                     </View>
// //                     <TextInput
// //                       style={[styles.formInput, {marginTop:8}]}
// //                       placeholder="Label (e.g., Length)"
// //                       value={f.label}
// //                       onChangeText={(text) => {
// //                         setAddReportModal(prev => {
// //                           const fields = [...(prev.fields||[])];
// //                           fields[idx] = { ...fields[idx], label: text };
// //                           return { ...prev, fields };
// //                         });
// //                       }}
// //                       editable={!addReportModal.isLoading}
// //                     />
// //                     <TextInput
// //                       style={[styles.formInput, {marginTop:8}]}
// //                       placeholder="Specification (optional)"
// //                       value={f.specification}
// //                       onChangeText={(text) => {
// //                         setAddReportModal(prev => {
// //                           const fields = [...(prev.fields||[])];
// //                           fields[idx] = { ...fields[idx], specification: text };
// //                           return { ...prev, fields };
// //                         });
// //                       }}
// //                       editable={!addReportModal.isLoading}
// //                     />
// //                     <View style={{flexDirection:'row', gap:8, marginTop:8}}>
// //                       <TextInput
// //                         style={[styles.formInput, {flex:1}]}
// //                         placeholder="Unit (e.g., mm)"
// //                         value={f.unit}
// //                         onChangeText={(text) => {
// //                           setAddReportModal(prev => {
// //                             const fields = [...(prev.fields||[])];
// //                             fields[idx] = { ...fields[idx], unit: text };
// //                             return { ...prev, fields };
// //                           });
// //                         }}
// //                         editable={!addReportModal.isLoading}
// //                       />
// //                       <TextInput
// //                         style={[styles.formInput, {width:70}]}
// //                         placeholder="Pos"
// //                         keyboardType="numeric"
// //                         value={String(f.position || idx+1)}
// //                         onChangeText={(text) => {
// //                           const num = parseInt(text,10) || idx+1;
// //                           setAddReportModal(prev => {
// //                             const fields = [...(prev.fields||[])];
// //                             fields[idx] = { ...fields[idx], position: num };
// //                             return { ...prev, fields };
// //                           });
// //                         }}
// //                         editable={!addReportModal.isLoading}
// //                       />
// //                     </View>
// //                   </View>
// //                 ))}
// //               </View>
// //             </ScrollView>

// //             {/* Modal Buttons */}
// //             <View style={styles.modalFooter}>
// //               <Pressable
// //                 style={({ pressed }) => [
// //                   styles.modalCancelButton,
// //                   pressed && styles.modalButtonPressed,
// //                 ]}
// //                 onPress={() =>
// //                   setAddReportModal({
// //                     visible: false,
// //                     name: '',
// //                     code: '',
// //                     description: '',
// //                     frequency: 'Daily',
// //                     isLoading: false,
// //                   })
// //                 }
// //                 disabled={addReportModal.isLoading}
// //               >
// //                 <Text style={styles.modalCancelText}>Cancel</Text>
// //               </Pressable>

// //               <Pressable
// //                 style={({ pressed }) => [
// //                   styles.modalSaveButton,
// //                   pressed && styles.modalButtonPressed,
// //                   addReportModal.isLoading && styles.modalButtonDisabled,
// //                 ]}
// //                 onPress={handleAddReportType}
// //                 disabled={addReportModal.isLoading}
// //               >
// //                 {addReportModal.isLoading ? (
// //                   <ActivityIndicator size="small" color="#FFFFFF" />
// //                 ) : (
// //                   <Text style={styles.modalSaveText}>Create Report Type</Text>
// //                 )}
// //               </Pressable>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Confirmation Dialog */}
// //       <ConfirmationDialog
// //         visible={confirmDialog.visible}
// //         title="Delete Report Type?"
// //         message={`Are you sure you want to delete "${confirmDialog.reportName}"? This action cannot be undone.`}
// //         confirmText="Delete"
// //         cancelText="Cancel"
// //         onConfirm={handleDeleteReportType}
// //         onCancel={() =>
// //           setConfirmDialog({
// //             visible: false,
// //             reportId: null,
// //             reportName: '',
// //             isLoading: false,
// //           })
// //         }
// //         isLoading={confirmDialog.isLoading}
// //         isDangerous={true}
// //       />

// //       {/* Alert */}
// //       <CustomAlert
// //         visible={alert.visible}
// //         type={alert.type}
// //         title={alert.title}
// //         message={alert.message}
// //         onClose={() =>
// //           setAlert({ visible: false, type: 'success', title: '', message: '' })
// //         }
// //       />
// //     </View>
// //   );
// // };

// // export default ManageReportsScreen;

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F8FBFE',
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#F8FBFE',
// //   },
// //   loadingText: {
// //     marginTop: 12,
// //     fontSize: 14,
// //     color: '#6B7280',
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingHorizontal: 16,
// //     paddingTop: 50,
// //     paddingBottom: 16,
// //     backgroundColor: '#FFFFFF',
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#E3F2FD',
// //   },
// //   headerLeft: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 12,
// //   },
// //   backButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 8,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   backButtonPressed: {
// //     backgroundColor: '#F3F4F6',
// //   },
// //   headerTitle: {
// //     fontSize: 18,
// //     fontWeight: '700',
// //     color: '#1F2937',
// //   },
// //   addButton: {
// //     width: 34,
// //     height: 34,
// //     borderRadius: 10,
// //     backgroundColor: '#286DA6',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   addButtonPressed: {
// //     opacity: 0.8,
// //   },
// //   tabsContainer: {
// //     flexDirection: 'row',
// //     backgroundColor: '#FFFFFF',
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#E3F2FD',
// //     paddingHorizontal: 8,
// //   },
// //   tab: {
// //     flex: 1,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     gap: 6,
// //     paddingVertical: 12,
// //     borderBottomWidth: 2,
// //     borderBottomColor: 'transparent',
// //   },
// //   tabActive: {
// //     borderBottomColor: '#286DA6',
// //   },
// //   tabText: {
// //     fontSize: 13,
// //     fontWeight: '600',
// //     color: '#B0C4D8',
// //   },
// //   tabTextActive: {
// //     color: '#286DA6',
// //   },
// //   tabBadge: {
// //     paddingHorizontal: 6,
// //     paddingVertical: 2,
// //     borderRadius: 4,
// //     backgroundColor: '#286DA6',
// //   },
// //   tabBadgeInactive: {
// //     backgroundColor: '#E3F2FD',
// //   },
// //   tabBadgeText: {
// //     fontSize: 10,
// //     fontWeight: '600',
// //     color: '#FFFFFF',
// //   },
// //   tabBadgeTextInactive: {
// //     color: '#286DA6',
// //   },
// //   listContent: {
// //     paddingHorizontal: 16,
// //     paddingVertical: 16,
// //   },
// //   reportTypeCard: {
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 12,
// //     padding: 14,
// //     marginBottom: 12,
// //     shadowColor: '#286DA6',
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.04,
// //     shadowRadius: 4,
// //     elevation: 1,
// //   },
// //   reportTypeHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //     gap: 12,
// //     marginBottom: 12,
// //   },
// //   reportTypeIcon: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 8,
// //     backgroundColor: '#E3F2FD',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   reportTypeInfo: {
// //     flex: 1,
// //   },
// //   reportTypeName: {
// //     fontSize: 14,
// //     fontWeight: '700',
// //     color: '#1F2937',
// //   },
// //   reportTypeCode: {
// //     fontSize: 11,
// //     color: '#9CA3AF',
// //     marginTop: 2,
// //     fontFamily: 'monospace',
// //   },
// //   reportTypeDesc: {
// //     fontSize: 12,
// //     color: '#6B7280',
// //     marginTop: 4,
// //     lineHeight: 16,
// //   },
// //   reportTypeMeta: {
// //     flexDirection: 'row',
// //     gap: 8,
// //     marginBottom: 10,
// //     flexWrap: 'wrap',
// //   },
// //   metaItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     backgroundColor: '#F9FAFB',
// //     borderRadius: 6,
// //   },
// //   metaText: {
// //     fontSize: 11,
// //     color: '#6B7280',
// //     fontWeight: '500',
// //   },
// //   statusTag: {
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 6,
// //   },
// //   statusTagText: {
// //     fontSize: 10,
// //     fontWeight: '600',
// //     textTransform: 'capitalize',
// //   },
// //   deleteReportBtn: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     gap: 6,
// //     paddingVertical: 8,
// //     paddingHorizontal: 12,
// //     backgroundColor: '#FEE2E2',
// //     borderRadius: 8,
// //   },
// //   deleteReportBtnPressed: {
// //     opacity: 0.8,
// //   },
// //   deleteReportBtnText: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: '#EF4444',
// //   },
// //   submissionCard: {
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 12,
// //     padding: 14,
// //     marginBottom: 12,
// //     shadowColor: '#286DA6',
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.04,
// //     shadowRadius: 4,
// //     elevation: 1,
// //   },
// //   submissionHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 10,
// //     marginBottom: 12,
// //   },
// //   submissionStatusDot: {
// //     width: 10,
// //     height: 10,
// //     borderRadius: 5,
// //   },
// //   submissionTitle: {
// //     flex: 1,
// //     fontSize: 14,
// //     fontWeight: '700',
// //     color: '#1F2937',
// //   },
// //   submissionDetails: {
// //     gap: 6,
// //     marginBottom: 10,
// //   },
// //   detailRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 8,
// //   },
// //   detailText: {
// //     fontSize: 12,
// //     color: '#6B7280',
// //   },
// //   submissionFooter: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     gap: 10,
// //   },
// //   statusBadge: {
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 6,
// //   },
// //   statusBadgeText: {
// //     fontSize: 10,
// //     fontWeight: '600',
// //   },
// //   approvedByText: {
// //     fontSize: 11,
// //     color: '#9CA3AF',
// //     fontStyle: 'italic',
// //   },
// //   emptyState: {
// //     alignItems: 'center',
// //     paddingVertical: 60,
// //   },
// //   emptyStateText: {
// //     fontSize: 14,
// //     color: '#9CA3AF',
// //     marginTop: 12,
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalContent: {
// //     backgroundColor: '#FFFFFF',
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     maxHeight: '85%',
// //   },
// //   modalHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingHorizontal: 20,
// //     paddingTop: 16,
// //     paddingBottom: 12,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#E3F2FD',
// //   },
// //   modalTitle: {
// //     fontSize: 18,
// //     fontWeight: '700',
// //     color: '#1F2937',
// //   },
// //   closeButton: {
// //     width: 36,
// //     height: 36,
// //     borderRadius: 8,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   closeButtonPressed: {
// //     backgroundColor: '#F3F4F6',
// //   },
// //   modalScrollView: {
// //     paddingHorizontal: 20,
// //     paddingVertical: 16,
// //   },
// //   formGroup: {
// //     marginBottom: 20,
// //   },
// //   formLabel: {
// //     fontSize: 13,
// //     fontWeight: '600',
// //     color: '#1F2937',
// //     marginBottom: 8,
// //   },
// //   formInput: {
// //     paddingHorizontal: 12,
// //     paddingVertical: 10,
// //     borderWidth: 1,
// //     borderColor: '#E3F2FD',
// //     borderRadius: 8,
// //     fontSize: 14,
// //     color: '#1F2937',
// //     backgroundColor: '#F9FAFB',
// //   },
// //   textAreaInput: {
// //     minHeight: 80,
// //     textAlignVertical: 'top',
// //     paddingTop: 12,
// //   },
// //   formHelp: {
// //     fontSize: 11,
// //     color: '#9CA3AF',
// //     marginTop: 6,
// //   },
// //   frequencyButtons: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     gap: 8,
// //   },
// //   frequencyButton: {
// //     paddingHorizontal: 12,
// //     paddingVertical: 8,
// //     borderRadius: 8,
// //     backgroundColor: '#F3F4F6',
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //   },
// //   frequencyButtonActive: {
// //     backgroundColor: '#286DA6',
// //     borderColor: '#286DA6',
// //   },
// //   frequencyButtonText: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: '#6B7280',
// //   },
// //   frequencyButtonTextActive: {
// //     color: '#FFFFFF',
// //   },
// //   modalFooter: {
// //     flexDirection: 'row',
// //     gap: 12,
// //     paddingHorizontal: 20,
// //     paddingTop: 12,
// //     paddingBottom: 30,
// //     borderTopWidth: 1,
// //     borderTopColor: '#E3F2FD',
// //   },
// //   modalCancelButton: {
// //     flex: 1,
// //     paddingVertical: 12,
// //     borderRadius: 8,
// //     backgroundColor: '#F3F4F6',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   modalSaveButton: {
// //     flex: 1,
// //     paddingVertical: 12,
// //     borderRadius: 8,
// //     backgroundColor: '#286DA6',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   modalButtonPressed: {
// //     opacity: 0.8,
// //   },
// //   modalButtonDisabled: {
// //     opacity: 0.6,
// //   },
// //   modalCancelText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#6B7280',
// //   },
// //   modalSaveText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#FFFFFF',
// //   },
// // });

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Pressable,
//   FlatList,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useFocusEffect } from '@react-navigation/native';
// import DocumentPicker from 'react-native-document-picker';

// import reportApi from '../../utils/reportApi';
// import CustomAlert from '../../components/CustomAlert';

// const ManageReportsScreen = () => {
//   /* ================= CATEGORY ================= */
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [newCategory, setNewCategory] = useState('');

//   /* ================= TEMPLATE ================= */
//   const [templateForm, setTemplateForm] = useState({
//     doc_no: '',
//     rev_no: '',
//     customer: '',
//     part_no: '',
//     part_description: '',
//   });
//   const [templateId, setTemplateId] = useState(null);
//   const [diagramFile, setDiagramFile] = useState(null);

//   /* ================= FIELDS ================= */
//   const [fields, setFields] = useState([]);
//   const [fieldForm, setFieldForm] = useState({
//     label: '',
//     specification: '',
//     unit: 'mm',
//   });

//   /* ================= SUBMISSIONS ================= */
//   const [submissions, setSubmissions] = useState([]);

//   /* ================= UI ================= */
//   const [loading, setLoading] = useState(true);
//   const [alert, setAlert] = useState({ visible: false });

//   const showAlert = (type, title, message = '') =>
//     setAlert({ visible: true, type, title, message });

//   /* ================= LOAD ================= */
//   const loadAll = async () => {
//     setLoading(true);
//     try {
//       const [cats, subs] = await Promise.all([
//         reportApi.getCategories(),
//         reportApi.getAllSubmissions(),
//       ]);
//       setCategories(cats || []);
//       setSubmissions(subs || []);
//     } catch {
//       showAlert('error', 'Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       loadAll();
//     }, [])
//   );

//   /* ================= CATEGORY ================= */
//   const createCategory = async () => {
//     if (!newCategory.trim()) return;
//     const res = await reportApi.createCategory(newCategory.trim());
//     setCategories(prev => [...prev, res]);
//     setSelectedCategory(res);
//     setNewCategory('');
//   };

//   /* ================= TEMPLATE ================= */
//   const createTemplate = async () => {
//     if (!selectedCategory) {
//       showAlert('error', 'Select category first');
//       return;
//     }

//     if (!templateForm.doc_no || !templateForm.part_description) {
//       showAlert('error', 'Doc No & Description required');
//       return;
//     }

//     const res = await reportApi.createTemplate({
//       category_id: selectedCategory.id,
//       ...templateForm,
//     });

//     const tid = res.id || res.insertId;
//     setTemplateId(tid);

//     if (diagramFile) {
//       await reportApi.uploadDiagram(tid, diagramFile);
//     }

//     showAlert('success', 'Template created');
//   };

//   /* ================= DIAGRAM ================= */
//   const pickDiagram = async () => {
//     try {
//       const file = await DocumentPicker.pickSingle({
//         type: DocumentPicker.types.images,
//       });
//       setDiagramFile(file);
//     } catch (err) {
//       if (!DocumentPicker.isCancel(err)) {
//         showAlert('error', 'Failed to pick diagram');
//       }
//     }
//   };

//   /* ================= FIELD ================= */
//   const addField = async () => {
//     if (!fieldForm.label || !templateId) return;

//     const payload = {
//       ...fieldForm,
//       position: fields.length + 1,
//     };

//     await reportApi.createField(templateId, payload);
//     setFields(prev => [...prev, payload]);
//     setFieldForm({ label: '', specification: '', unit: 'mm' });
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#286DA6" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>

//       {/* ================= CATEGORY ================= */}
//       <Text style={styles.section}>Categories</Text>

//       {categories.map(cat => (
//         <Pressable
//           key={cat.id}
//           style={[
//             styles.card,
//             selectedCategory?.id === cat.id && styles.cardActive,
//           ]}
//           onPress={() => {
//             setSelectedCategory(cat);
//             setTemplateId(null);
//             setFields([]);
//           }}
//         >
//           <Text style={styles.cardTitle}>{cat.name}</Text>
//         </Pressable>
//       ))}

//       <View style={styles.row}>
//         <TextInput
//           placeholder="New Category"
//           value={newCategory}
//           onChangeText={setNewCategory}
//           style={styles.input}
//         />
//         <Pressable style={styles.addBtn} onPress={createCategory}>
//           <Ionicons name="add" size={20} color="#fff" />
//         </Pressable>
//       </View>

//       {/* ================= TEMPLATE ================= */}
//       {selectedCategory && (
//         <>
//           <Text style={styles.section}>
//             Template – {selectedCategory.name}
//           </Text>

//           {['doc_no', 'rev_no', 'customer', 'part_no', 'part_description'].map(k => (
//             <TextInput
//               key={k}
//               placeholder={k}
//               value={templateForm[k]}
//               onChangeText={t =>
//                 setTemplateForm(p => ({ ...p, [k]: t }))
//               }
//               style={styles.input}
//             />
//           ))}

//           <Pressable style={styles.secondaryBtn} onPress={pickDiagram}>
//             <Text style={styles.secondaryText}>
//               {diagramFile ? 'Diagram Selected' : 'Upload Diagram'}
//             </Text>
//           </Pressable>

//           <Pressable style={styles.primaryBtn} onPress={createTemplate}>
//             <Text style={styles.primaryText}>
//               {templateId ? 'Template Created' : 'Create Template'}
//             </Text>
//           </Pressable>
//         </>
//       )}

//       {/* ================= FIELDS ================= */}
//       {templateId && (
//         <>
//           <Text style={styles.section}>Fields</Text>

//           {fields.map((f, i) => (
//             <Text key={i} style={styles.fieldItem}>
//               {i + 1}. {f.label} ({f.specification})
//             </Text>
//           ))}

//           <TextInput
//             placeholder="Field label"
//             value={fieldForm.label}
//             onChangeText={t => setFieldForm(p => ({ ...p, label: t }))}
//             style={styles.input}
//           />

//           <TextInput
//             placeholder="Specification"
//             value={fieldForm.specification}
//             onChangeText={t =>
//               setFieldForm(p => ({ ...p, specification: t }))
//             }
//             style={styles.input}
//           />

//           <Pressable style={styles.primaryBtn} onPress={addField}>
//             <Text style={styles.primaryText}>Add Field</Text>
//           </Pressable>
//         </>
//       )}

//       {/* ================= SUBMISSIONS ================= */}
//       <Text style={styles.section}>Submissions</Text>

//       <FlatList
//         data={submissions}
//         keyExtractor={i => String(i.id)}
//         renderItem={({ item }) => (
//           <View style={styles.subCard}>
//             <Text style={{ fontWeight: '600' }}>
//               {item.template_label || 'Report'}
//             </Text>
//             <Text>Status: {item.status}</Text>
//           </View>
//         )}
//       />

//       <CustomAlert
//         visible={alert.visible}
//         type={alert.type}
//         title={alert.title}
//         message={alert.message}
//         onClose={() => setAlert({ visible: false })}
//       />
//     </ScrollView>
//   );
// };

// export default ManageReportsScreen;

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#F8FBFE' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   section: { fontSize: 18, fontWeight: '700', marginTop: 20 },
//   input: {
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 10,
//     backgroundColor: '#fff',
//   },
//   row: { flexDirection: 'row', gap: 10, marginTop: 10 },
//   addBtn: {
//     backgroundColor: '#286DA6',
//     padding: 12,
//     borderRadius: 8,
//     justifyContent: 'center',
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   cardActive: { borderWidth: 2, borderColor: '#286DA6' },
//   cardTitle: { fontWeight: '600' },
//   primaryBtn: {
//     backgroundColor: '#286DA6',
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 14,
//     alignItems: 'center',
//   },
//   primaryText: { color: '#fff', fontWeight: '700' },
//   secondaryBtn: {
//     backgroundColor: '#E3F2FD',
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   secondaryText: { color: '#286DA6', fontWeight: '600' },
//   fieldItem: { marginTop: 6 },
//   subCard: {
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 10,
//   },
// });

import React, { useState } from 'react';
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
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { pick, isCancel, types } from '@react-native-documents/picker';

import reportApi from '../../utils/reportApi';
import CustomAlert from '../../components/CustomAlert';

const { width } = Dimensions.get('window');

const ManageReportsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('types'); // 'types' or 'submissions'
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
  const [step, setStep] = useState(1); // 1: Category, 2: Template, 3: Fields
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [createdTemplateId, setCreatedTemplateId] = useState(null);

  const [newCatName, setNewCatName] = useState('');
  const [templateForm, setTemplateForm] = useState({
    doc_no: '',
    rev_no: '',
    customer: '',
    part_no: '',
    part_description: '',
  });
  const [diagramFile, setDiagramFile] = useState(null);
  const [fields, setFields] = useState([]);
  const [fieldInput, setFieldInput] = useState({
    label: '',
    specification: '',
    unit: 'mm',
  });

  const [alert, setAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };

  // Load Data on Focus
  useFocusEffect(
    React.useCallback(() => {
      loadAll();
    }, []),
  );

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cats, subs, stats] = await Promise.all([
        reportApi.getCategories(),
        reportApi.getAllInspectionReports().catch(() => []),
        reportApi.getReportTypesWithStats().catch(() => []),
      ]);
      setCategories(cats || []);
      setSubmissions(subs || []);

      // Merge stats into categories (keep original category list if present)
      if (Array.isArray(stats) && stats.length > 0) {
        // create a lookup from report_type -> stat
        const statMap = stats.reduce((acc, s) => {
          acc[s.report_type] = s;
          return acc;
        }, {});

        // Start with original categories if available
        const baseCats = Array.isArray(cats) ? cats.slice() : [];

        // Map existing category names for quick lookup
        const nameSet = new Set(baseCats.map(c => (c.name || String(c.id)).toString()));

        // Attach stats to existing categories where names match
        const merged = baseCats.map(cat => {
          const key = cat.name || cat.code || String(cat.id);
          const s = statMap[key];
          return {
            ...cat,
            submission_count: s ? s.submission_count : cat.submission_count || 0,
            first_created: s ? s.first_created : cat.first_created || null,
            last_created: s ? s.last_created : cat.last_created || null,
          };
        });

        // Add stats-only report types that don't exist as categories yet
        for (const s of stats) {
          if (!nameSet.has(s.report_type)) {
            merged.push({
              id: s.report_type,
              name: s.report_type,
              submission_count: s.submission_count || 0,
              first_created: s.first_created,
              last_created: s.last_created,
            });
          }
        }

        setCategories(merged);
      }
    } catch (err) {
      showAlert('error', 'Failed to load data');
      console.log('Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= LOGIC FUNCTIONS ================= */

  const handleCreateCategory = async () => {
    if (!newCatName.trim())
      return showAlert(
        'error',
        'Validation Error',
        'Category name is required',
      );
    try {
      const res = await reportApi.createCategory(newCatName.trim());
      setSelectedCatId(res.id || res.insertId);
      setStep(2);
    } catch (err) {
      showAlert('error', 'Error', 'Category creation failed');
    }
  };

  const handleCategoryPress = async category => {
    setSelectedCategory(category);
    setLoadingTemplates(true);

    try {
      const data = await reportApi.getTemplatesByCategory(category.id);
      setTemplates(data || []);
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
        'Doc No and Description are required',
      );
    }
    try {
      const res = await reportApi.createTemplate({
        category_id: selectedCatId,
        ...templateForm,
      });
      const tid = res.id || res.insertId;
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

  const handleAddField = async () => {
    if (!fieldInput.label)
      return showAlert('error', 'Field Label', 'Label is required');
    try {
      const payload = { ...fieldInput, position: fields.length + 1 };
      await reportApi.createField(createdTemplateId, payload);
      setFields([...fields, payload]);
      setFieldInput({ label: '', specification: '', unit: 'mm' });
    } catch (err) {
      showAlert('error', 'Error', 'Failed to add field');
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
    setDiagramFile(null);
    loadAll(); // Refresh main list
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
  const renderCategoryItem = ({ item }) => (
    <Pressable
      style={[
        styles.card,
        selectedCategory?.id === item.id && {
          borderColor: '#286DA6',
          borderWidth: 2,
        },
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="layers" size={20} color="#286DA6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 }}>
            <Text style={styles.cardSubtitle}>
              📊 {item.submission_count || 0} submissions
            </Text>
            {item.first_created && (
              <Text style={styles.cardSubtitle}>
                📅 {new Date(item.first_created).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#B0C4D8" />
      </View>
    </Pressable>
  );

  const renderSubmissionItem = ({ item }) => {
    const isApproved = item.status === 'approved';
    const isPending = item.status === 'pending';
    const statusColor = isApproved
      ? '#10B981'
      : isPending
      ? '#F59E0B'
      : '#EF4444';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {item.title || item.report_type || 'Inspection Report'}
            </Text>
            <Text style={styles.cardSubtitle}>
              Part: {item.part_no || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>
            {item.submitted_by || item.name || 'Anonymous'}
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
            {item.status?.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#286DA6" />
          </Pressable>
          <Text style={styles.headerTitle}>Manage Reports</Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => { 
           console.log("Add button clicked!"); 
          setShowAddModal(true)

        }}>
          <Ionicons name="add" size={26} color="#FFF" />
        </Pressable>
      </View> */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#286DA6" />
          </Pressable>
          <Text style={styles.headerTitle}>Manage Reports</Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            setStep(1); // Always reset to step 1 when opening
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={26} color="#FFF" />
        </Pressable>
      </View>
      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'types' && styles.tabActive]}
          onPress={() => setActiveTab('types')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'types' && styles.tabTextActive,
            ]}
          >
            Report Types
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'submissions' && styles.tabActive]}
          onPress={() => setActiveTab('submissions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'submissions' && styles.tabTextActive,
            ]}
          >
            Submissions
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#286DA6" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'types' ? categories : submissions}
          renderItem={
            activeTab === 'types' ? renderCategoryItem : renderSubmissionItem
          }
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshing={refreshing}
          onRefresh={loadAll}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No data found</Text>
            </View>
          }
        />
      )}

      {activeTab === 'types' && selectedCategory && (
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
      )}

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
                {step === 1
                  ? 'Step 1: Create Category'
                  : step === 2
                  ? 'Step 2: Template Details'
                  : 'Step 3: Add Fields'}
              </Text>
              <Pressable onPress={resetModal}>
                <Ionicons name="close" size={26} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {step === 1 && (
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
              )}

              {step === 2 && (
                <View>
                  {[
                    'doc_no',
                    'rev_no',
                    'customer',
                    'part_no',
                    'part_description',
                  ].map(key => (
                    <View key={key} style={{ marginBottom: 12 }}>
                      <Text style={styles.label}>
                        {key.replace('_', ' ').toUpperCase()}
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder={`Enter ${key}...`}
                        value={templateForm[key]}
                        onChangeText={t =>
                          setTemplateForm({ ...templateForm, [key]: t })
                        }
                      />
                    </View>
                  ))}
                  <Pressable style={styles.secondaryBtn} onPress={pickDiagram}>
                    <Ionicons name="image-outline" size={20} color="#286DA6" />
                    <Text style={styles.secondaryBtnText}>
                      {diagramFile
                        ? 'Diagram Attached ✅'
                        : 'Pick Diagram Image'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={handleCreateTemplate}
                  >
                    <Text style={styles.primaryBtnText}>
                      Next: Define Fields
                    </Text>
                  </Pressable>
                </View>
              )}

              {step === 3 && (
                <View>
                  <Text style={styles.label}>
                    Existing Fields ({fields.length})
                  </Text>
                  {fields.map((f, i) => (
                    <View key={i} style={styles.fieldBadge}>
                      <Text style={styles.fieldBadgeText}>
                        {i + 1}. {f.label} — {f.specification || 'No Spec'}
                      </Text>
                    </View>
                  ))}

                  <View style={styles.fieldForm}>
                    <Text style={[styles.label, { marginTop: 15 }]}>
                      New Field Label
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Outer Diameter"
                      value={fieldInput.label}
                      onChangeText={t =>
                        setFieldInput({ ...fieldInput, label: t })
                      }
                    />
                    <Text style={styles.label}>Specification</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 20mm +/- 0.5"
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
                      <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>
                        Add Field to Template
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={[
                      styles.primaryBtn,
                      { backgroundColor: '#10B981', marginTop: 40 },
                    ]}
                    onPress={resetModal}
                  >
                    <Text style={styles.primaryBtnText}>Finish & Close</Text>
                  </Pressable>
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
    </View>
  );
};

export default ManageReportsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FBFE' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  backBtn: { padding: 4 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#286DA6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#286DA6' },
  tabText: { fontWeight: '700', color: '#B0C4D8', fontSize: 13 },
  tabTextActive: { color: '#286DA6' },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#286DA6',
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  cardSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
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
});
