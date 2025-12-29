// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const ReportsScreen = () => {
//   const [activeFilter, setActiveFilter] = useState('all');

//   const filters = [
//     { id: 'all', label: 'All', count: 24 },
//     { id: 'pending', label: 'Pending', count: 5 },
//     { id: 'approved', label: 'Approved', count: 15 },
//     { id: 'rejected', label: 'Rejected', count: 4 },
//   ];

//   const reports = [
//     {
//       id: 1,
//       title: 'Cutting Inspection - Vestas',
//       partNo: '29314225-2',
//       date: '22/12/2024',
//       status: 'approved',
//       inspector: 'Rajesh Kumar',
//     },
//     {
//       id: 2,
//       title: 'Welding Quality Check',
//       partNo: '29314225-5',
//       date: '21/12/2024',
//       status: 'pending',
//       inspector: 'Rajesh Kumar',
//     },
//     {
//       id: 3,
//       title: 'Final Assembly Review',
//       partNo: '29314225-1',
//       date: '20/12/2024',
//       status: 'approved',
//       inspector: 'Rajesh Kumar',
//     },
//     {
//       id: 4,
//       title: 'Material Quality Report',
//       partNo: '29314225-6',
//       date: '19/12/2024',
//       status: 'rejected',
//       inspector: 'Rajesh Kumar',
//     },
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'approved':
//         return { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' };
//       case 'pending':
//         return { bg: '#FEF3C7', text: '#D97706', icon: 'time' };
//       case 'rejected':
//         return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
//       default:
//         return { bg: '#E5E7EB', text: '#6B7280', icon: 'help-circle' };
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.headerTitle}>Reports</Text>
//           <Text style={styles.headerSubtitle}>View and manage your reports</Text>
//         </View>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
//         {/* Search Bar */}
//         <View style={styles.searchSection}>
//           <View style={styles.searchBar}>
//             <Ionicons name="search-outline" size={20} color="#6B7280" />
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search reports..."
//               placeholderTextColor="#B0C4D8"
//             />
//           </View>
//         </View>

//         {/* Filters */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.filtersContainer}
//           contentContainerStyle={styles.filtersContent}
//         >
//           {filters.map((filter) => (
//             <TouchableOpacity
//               key={filter.id}
//               style={[
//                 styles.filterChip,
//                 activeFilter === filter.id && styles.filterChipActive,
//               ]}
//               onPress={() => setActiveFilter(filter.id)}
//             >
//               <Text
//                 style={[
//                   styles.filterLabel,
//                   activeFilter === filter.id && styles.filterLabelActive,
//                 ]}
//               >
//                 {filter.label}
//               </Text>
//               <View
//                 style={[
//                   styles.filterBadge,
//                   activeFilter === filter.id && styles.filterBadgeActive,
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.filterCount,
//                     activeFilter === filter.id && styles.filterCountActive,
//                   ]}
//                 >
//                   {filter.count}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {/* Reports List */}
//         <View style={styles.reportsSection}>
//           {reports.map((report) => {
//             const statusStyle = getStatusColor(report.status);
//             return (
//               <TouchableOpacity key={report.id} style={styles.reportCard}>
//                 <View style={styles.reportHeader}>
//                   <View style={styles.reportTitleSection}>
//                     <Text style={styles.reportTitle}>{report.title}</Text>
//                     <Text style={styles.reportPartNo}>Part No: {report.partNo}</Text>
//                   </View>
//                   <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
//                     <Ionicons name={statusStyle.icon} size={14} color={statusStyle.text} />
//                     <Text style={[styles.statusText, { color: statusStyle.text }]}>
//                       {report.status}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.reportFooter}>
//                   <View style={styles.reportInfo}>
//                     <Ionicons name="person-outline" size={14} color="#6B7280" />
//                     <Text style={styles.reportInfoText}>{report.inspector}</Text>
//                   </View>
//                   <View style={styles.reportInfo}>
//                     <Ionicons name="calendar-outline" size={14} color="#6B7280" />
//                     <Text style={styles.reportInfoText}>{report.date}</Text>
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         <View style={{ height: 20 }} />
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FBFE',
//   },
//   header: {
//     backgroundColor: '#FFFFFF',
//     paddingTop: 60,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E3F2FD',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#286DA6',
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   content: {
//     flex: 1,
//   },
//   searchSection: {
//     padding: 20,
//     paddingBottom: 12,
//   },
//   searchBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 10,
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 15,
//     color: '#1F2937',
//   },
//   filtersContainer: {
//     paddingLeft: 20,
//     marginBottom: 12,
//   },
//   filtersContent: {
//     paddingRight: 20,
//     gap: 8,
//   },
//   filterChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     gap: 8,
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//   },
//   filterChipActive: {
//     backgroundColor: '#286DA6',
//     borderColor: '#286DA6',
//   },
//   filterLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#6B7280',
//   },
//   filterLabelActive: {
//     color: '#FFFFFF',
//   },
//   filterBadge: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     minWidth: 24,
//     alignItems: 'center',
//   },
//   filterBadgeActive: {
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   filterCount: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#6B7280',
//   },
//   filterCountActive: {
//     color: '#FFFFFF',
//   },
//   reportsSection: {
//     paddingHorizontal: 20,
//     gap: 12,
//   },
//   reportCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//   },
//   reportHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//     gap: 12,
//   },
//   reportTitleSection: {
//     flex: 1,
//   },
//   reportTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   reportPartNo: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'capitalize',
//   },
//   reportFooter: {
//     flexDirection: 'row',
//     gap: 16,
//   },
//   reportInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   reportInfoText: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
// });

// export default ReportsScreen;

// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BASE_URL } from '../config/api';

// export default function ReportsScreen({ navigation }) {
//   const [reports, setReports] = useState([]);
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [sortOrder, setSortOrder] = useState('latest');
//   const [loading, setLoading] = useState(true);

//   const filters = [
//     { id: 'all', label: 'All' },
//     { id: 'pending', label: 'Pending' },
//     { id: 'approved', label: 'Approved' },
//     { id: 'rejected', label: 'Rejected' },
//   ];

//   // ================= FETCH =================
//   const fetchReports = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         navigation.replace('Login');
//         return;
//       }

//       const res = await axios.get(`${BASE_URL}/api/report/my-reports`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setReports(res.data);
//     } catch (err) {
//       console.log('Fetch reports error:', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReports();
//   }, []);

//   // ================= FILTER + SORT =================
//   const visibleReports = useMemo(() => {
//     let data =
//       activeFilter === 'all'
//         ? reports
//         : reports.filter(r => r.status === activeFilter);

//     if (sortOrder === 'latest') {
//       data = [...data].sort(
//         (a, b) => new Date(b.created_at) - new Date(a.created_at)
//       );
//     } else {
//       data = [...data].sort(
//         (a, b) => new Date(a.created_at) - new Date(b.created_at)
//       );
//     }

//     return data;
//   }, [reports, activeFilter, sortOrder]);

//   // ================= STATUS UI =================
//   const statusUI = status => {
//     switch (status) {
//       case 'approved':
//         return { bg: '#D1FAE5', color: '#059669', icon: 'checkmark-circle' };
//       case 'pending':
//         return { bg: '#FEF3C7', color: '#D97706', icon: 'time' };
//       case 'rejected':
//         return { bg: '#FEE2E2', color: '#DC2626', icon: 'close-circle' };
//       default:
//         return { bg: '#E5E7EB', color: '#6B7280', icon: 'help-circle' };
//     }
//   };

//   // ================= UI =================
//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#286DA6" />
//         <Text style={styles.loaderText}>Loading reports…</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Reports</Text>
//         <Text style={styles.headerSubtitle}>
//           Your inspection reports
//         </Text>
//       </View>

//       {/* Filters */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={styles.filterRow}
//       >
//         {filters.map(f => (
//           <TouchableOpacity
//             key={f.id}
//             style={[
//               styles.filterChip,
//               activeFilter === f.id && styles.filterChipActive,
//             ]}
//             onPress={() => setActiveFilter(f.id)}
//           >
//             <Text
//               style={[
//                 styles.filterText,
//                 activeFilter === f.id && styles.filterTextActive,
//               ]}
//             >
//               {f.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Sort */}
//       <View style={styles.sortRow}>
//         <Text style={styles.sortLabel}>Sort:</Text>
//         <TouchableOpacity onPress={() => setSortOrder('latest')}>
//           <Text
//             style={[
//               styles.sortOption,
//               sortOrder === 'latest' && styles.sortActive,
//             ]}
//           >
//             Latest
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => setSortOrder('oldest')}>
//           <Text
//             style={[
//               styles.sortOption,
//               sortOrder === 'oldest' && styles.sortActive,
//             ]}
//           >
//             Oldest
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* List */}
//       <ScrollView
//         style={styles.list}
//         showsVerticalScrollIndicator={false}
//       >
//         {visibleReports.length === 0 ? (
//           <Text style={styles.emptyText}>No reports found</Text>
//         ) : (
//           visibleReports.map(report => {
//             const ui = statusUI(report.status);

//             return (
//               <TouchableOpacity
//                 key={report.id}
//                 style={styles.card}
//                 onPress={() =>
//                   navigation.navigate('ReportDetail', { id: report.id })
//                 }
//               >
//                 <View style={styles.cardHeader}>
//                   <View>
//                     <Text style={styles.title}>{report.title}</Text>
//                     <Text style={styles.partNo}>
//                       Part No: {report.part_no}
//                     </Text>
//                   </View>

//                   <View
//                     style={[
//                       styles.statusBadge,
//                       { backgroundColor: ui.bg },
//                     ]}
//                   >
//                     <Ionicons
//                       name={ui.icon}
//                       size={14}
//                       color={ui.color}
//                     />
//                     <Text style={[styles.statusText, { color: ui.color }]}>
//                       {report.status}
//                     </Text>
//                   </View>
//                 </View>

//                 <Text style={styles.date}>
//                   {new Date(report.created_at).toLocaleDateString('en-GB')}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })
//         )}

//         <View style={{ height: 20 }} />
//       </ScrollView>
//     </View>
//   );
// }

// // ================= STYLES =================
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FBFE',
//   },
//   header: {
//     backgroundColor: '#FFF',
//     paddingTop: 60,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E3F2FD',
//   },
//   headerTitle: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: '#286DA6',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//   },

//   filterRow: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//   },
//   filterChip: {
//     backgroundColor: '#FFF',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//   },
//   filterChipActive: {
//     backgroundColor: '#286DA6',
//     borderColor: '#286DA6',
//   },
//   filterText: {
//     fontSize: 14,
//     color: '#6B7280',
//     fontWeight: '600',
//   },
//   filterTextActive: {
//     color: '#FFF',
//   },

//   sortRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     marginBottom: 8,
//   },
//   sortLabel: {
//     fontWeight: '600',
//     marginRight: 10,
//     color: '#1F2937',
//   },
//   sortOption: {
//     marginRight: 12,
//     color: '#6B7280',
//   },
//   sortActive: {
//     color: '#286DA6',
//     fontWeight: '700',
//   },

//   list: {
//     paddingHorizontal: 20,
//   },

//   card: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E3F2FD',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   title: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#1F2937',
//   },
//   partNo: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'capitalize',
//   },
//   date: {
//     marginTop: 8,
//     fontSize: 12,
//     color: '#6B7280',
//   },

//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loaderText: {
//     marginTop: 10,
//     color: '#6B7280',
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 40,
//     color: '#6B7280',
//   },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ReportsScreen = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', count: 24 },
    { id: 'pending', label: 'Pending', count: 5 },
    { id: 'approved', label: 'Approved', count: 15 },
    { id: 'rejected', label: 'Rejected', count: 4 },
  ];

  const reports = [
    {
      id: 1,
      title: 'Cutting Inspection - Vestas',
      partNo: '29314225-2',
      date: '22/12/2024',
      status: 'approved',
      inspector: 'Rajesh Kumar',
    },
    {
      id: 2,
      title: 'Welding Quality Check',
      partNo: '29314225-5',
      date: '21/12/2024',
      status: 'pending',
      inspector: 'Rajesh Kumar',
    },
    {
      id: 3,
      title: 'Final Assembly Review',
      partNo: '29314225-1',
      date: '20/12/2024',
      status: 'approved',
      inspector: 'Rajesh Kumar',
    },
    {
      id: 4,
      title: 'Material Quality Report',
      partNo: '29314225-6',
      date: '19/12/2024',
      status: 'rejected',
      inspector: 'Rajesh Kumar',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'time' };
      case 'rejected':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
      default:
        return { bg: '#E5E7EB', text: '#6B7280', icon: 'help-circle' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSubtitle}>View and manage your reports</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reports..."
              placeholderTextColor="#B0C4D8"
            />
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  activeFilter === filter.id && styles.filterLabelActive,
                ]}
              >
                {filter.label}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  activeFilter === filter.id && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterCount,
                    activeFilter === filter.id && styles.filterCountActive,
                  ]}
                >
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reports List */}
        <View style={styles.reportsSection}>
          {reports.map((report) => {
            const statusStyle = getStatusColor(report.status);
            return (
              <TouchableOpacity key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportTitleSection}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportPartNo}>Part No: {report.partNo}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Ionicons name={statusStyle.icon} size={14} color={statusStyle.text} />
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {report.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.reportFooter}>
                  <View style={styles.reportInfo}>
                    <Ionicons name="person-outline" size={14} color="#6B7280" />
                    <Text style={styles.reportInfoText}>{report.inspector}</Text>
                  </View>
                  <View style={styles.reportInfo}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.reportInfoText}>{report.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFE',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  filtersContainer: {
    paddingLeft: 20,
    marginBottom: 12,
  },
  filtersContent: {
    paddingRight: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  filterChipActive: {
    backgroundColor: '#286DA6',
    borderColor: '#286DA6',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  filterCountActive: {
    color: '#FFFFFF',
  },
  reportsSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  reportTitleSection: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportPartNo: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reportFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  reportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ReportsScreen;