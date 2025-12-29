// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Pressable,
//   Image,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useState } from 'react';

// const DashboardScreen = ({ navigation }) => {
//   const [userData] = useState({
//     name: 'Rajesh Kumar',
//     employeeId: 'AE-2024-001',
//     role: 'Quality Inspector',
//     avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=286DA6&color=fff&size=200',
//   });

//   const stats = [
//     { id: 1, label: 'Approved', count: 0, icon: 'checkmark-circle', color: '#10B981', bgColor: '#D1FAE5' },
//     { id: 2, label: 'Pending', count: 0, icon: 'time', color: '#F59E0B', bgColor: '#FEF3C7' },
//     { id: 3, label: 'Rejected', count: 0, icon: 'close-circle', color: '#EF4444', bgColor: '#FEE2E2' },
//     { id: 4, label: 'Total', count: 0, icon: 'stats-chart', color: '#286DA6', bgColor: '#DBEAFE' },
//   ];

//   const recentActivities = [
//     { id: 1, title: 'Machine Inspection', date: '2 hours ago', status: 'pending' },
//     { id: 2, title: 'Quality Report Submitted', date: 'Yesterday', status: 'approved' },
//     { id: 3, title: 'Process Review', date: '2 days ago', status: 'pending' },
//   ];

//   return (
//     <View style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header with User Info */}
//         <View style={styles.header}>
//           <View style={styles.headerTop}>
//             <View>
//               <Text style={styles.greeting}>Welcome back,</Text>
//               <Text style={styles.userName}>{userData.name}</Text>
//               <Text style={styles.userRole}>{userData.role}</Text>
//             </View>
//             <Pressable
//               onPress={() => navigation.navigate('Profile')}
//               style={styles.avatarContainer}
//             >
//               <Image
//                 source={{ uri: userData.avatar }}
//                 style={styles.avatar}
//               />
//               <View style={styles.editBadge}>
//                 <Ionicons name="pencil" size={12} color="#FFFFFF" />
//               </View>
//             </Pressable>
//           </View>

//           {/* Employee ID Badge */}
//           <View style={styles.employeeIdBadge}>
//             <Ionicons name="card" size={16} color="#286DA6" />
//             <Text style={styles.employeeIdText}>{userData.employeeId}</Text>
//           </View>
//         </View>

//         {/* Stats Cards */}
//         <View style={styles.statsContainer}>
//           {stats.map((stat) => (
//             <View key={stat.id} style={styles.statCard}>
//               <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
//                 <Ionicons name={stat.icon} size={24} color={stat.color} />
//               </View>
//               <Text style={styles.statCount}>{stat.count}</Text>
//               <Text style={styles.statLabel}>{stat.label}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Quick Actions */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Quick Actions</Text>
//           <View style={styles.quickActionsGrid}>
//             <Pressable style={[styles.actionCard, styles.actionCardPrimary]}>
//               <View style={styles.actionIconContainer}>
//                 <Ionicons name="add-circle" size={28} color="#FFFFFF" />
//               </View>
//               <Text style={styles.actionCardTitle}>New Entry</Text>
//               <Text style={styles.actionCardSubtitle}>Create new record</Text>
//             </Pressable>

//             <Pressable style={[styles.actionCard, styles.actionCardSecondary]}>
//               <View style={styles.actionIconContainer}>
//                 <Ionicons name="document-text" size={28} color="#FFFFFF" />
//               </View>
//               <Text style={styles.actionCardTitle}>Submit Report</Text>
//               <Text style={styles.actionCardSubtitle}>Upload daily report</Text>
//             </Pressable>
//           </View>
//         </View>

//         {/* Recent Activity */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Recent Activity</Text>
//             <Pressable>
//               <Text style={styles.seeAllText}>See All</Text>
//             </Pressable>
//           </View>

//           {recentActivities.length > 0 ? (
//             recentActivities.map((activity) => (
//               <View key={activity.id} style={styles.activityCard}>
//                 <View style={[
//                   styles.activityIndicator,
//                   activity.status === 'approved' && styles.activityIndicatorApproved,
//                   activity.status === 'pending' && styles.activityIndicatorPending,
//                 ]} />
//                 <View style={styles.activityContent}>
//                   <Text style={styles.activityTitle}>{activity.title}</Text>
//                   <Text style={styles.activityDate}>{activity.date}</Text>
//                 </View>
//                 <View style={[
//                   styles.statusBadge,
//                   activity.status === 'approved' && styles.statusBadgeApproved,
//                   activity.status === 'pending' && styles.statusBadgePending,
//                 ]}>
//                   <Text style={[
//                     styles.statusText,
//                     activity.status === 'approved' && styles.statusTextApproved,
//                     activity.status === 'pending' && styles.statusTextPending,
//                   ]}>
//                     {activity.status}
//                   </Text>
//                 </View>
//               </View>
//             ))
//           ) : (
//             <View style={styles.emptyState}>
//               <Ionicons name="clipboard-outline" size={48} color="#B0C4D8" />
//               <Text style={styles.emptyStateText}>No recent activity</Text>
//               <Text style={styles.emptyStateSubtext}>Your activities will appear here</Text>
//             </View>
//           )}
//         </View>
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
//     backgroundColor: '#286DA6',
//     paddingTop: 60,
//     paddingBottom: 24,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   greeting: {
//     fontSize: 14,
//     color: '#DBEAFE',
//     marginBottom: 4,
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 2,
//   },
//   userRole: {
//     fontSize: 14,
//     color: '#DBEAFE',
//   },
//   avatarContainer: {
//     position: 'relative',
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     borderWidth: 3,
//     borderColor: '#FFFFFF',
//   },
//   editBadge: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: '#10B981',
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#FFFFFF',
//   },
//   employeeIdBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     alignSelf: 'flex-start',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     gap: 6,
//   },
//   employeeIdText: {
//     color: '#FFFFFF',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     padding: 20,
//     gap: 12,
//     marginTop: -30,
//   },
//   statCard: {
//     flex: 1,
//     minWidth: '47%',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     alignItems: 'center',
//     shadowColor: '#286DA6',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   statIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   statCount: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 13,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   section: {
//     paddingHorizontal: 20,
//     marginBottom: 24,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#286DA6',
//     marginBottom: 16,
//   },
//   seeAllText: {
//     fontSize: 14,
//     color: '#286DA6',
//     fontWeight: '600',
//   },
//   quickActionsGrid: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   actionCard: {
//     flex: 1,
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   actionCardPrimary: {
//     backgroundColor: '#286DA6',
//   },
//   actionCardSecondary: {
//     backgroundColor: '#F59E0B',
//   },
//   actionIconContainer: {
//     marginBottom: 12,
//   },
//   actionCardTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 4,
//   },
//   actionCardSubtitle: {
//     fontSize: 12,
//     color: 'rgba(255, 255, 255, 0.8)',
//   },
//   activityCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#286DA6',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   activityIndicator: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 12,
//   },
//   activityIndicatorApproved: {
//     backgroundColor: '#10B981',
//   },
//   activityIndicatorPending: {
//     backgroundColor: '#F59E0B',
//   },
//   activityContent: {
//     flex: 1,
//   },
//   activityTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   activityDate: {
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusBadgeApproved: {
//     backgroundColor: '#D1FAE5',
//   },
//   statusBadgePending: {
//     backgroundColor: '#FEF3C7',
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'capitalize',
//   },
//   statusTextApproved: {
//     color: '#059669',
//   },
//   statusTextPending: {
//     color: '#D97706',
//   },
//   emptyState: {
//     alignItems: 'center',
//     paddingVertical: 40,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//   },
//   emptyStateText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#6B7280',
//     marginTop: 12,
//   },
//   emptyStateSubtext: {
//     fontSize: 14,
//     color: '#9CA3AF',
//     marginTop: 4,
//   },
// });

// export default DashboardScreen;

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = ({ navigation }) => {
  // const [userData] = useState({
  //   name: 'Rajesh Kumar',
  //   employeeId: 'AE-2024-001',
  //   role: 'Quality Inspector',
  //   avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=286DA6&color=fff&size=200',
  // });
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    employeeId: '',
    avatar: '',
  });

useEffect(() => {
  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem('user');

    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    setUserData({
      name: user.name,
      role: user.role,
      employeeId: user.employee_id,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name
      )}&background=286DA6&color=fff&size=200`,
    });
  };

  loadUser();
}, []);


  // const quickActions = [
  //   { id: 1, icon: 'add-circle-outline', label: 'New Entry', color: '#286DA6', screen: 'Accordance' },
  //   { id: 2, icon: 'document-text-outline', label: 'Reports', color: '#10B981', screen: 'Reports' },
  //   // { id: 3, icon: 'calendar-outline', label: 'Schedule', color: '#F59E0B', screen: 'Schedule' },
  //   { id: 4, icon: 'bar-chart-outline', label: 'Analytics', color: '#8B5CF6', screen: 'Analytics' },
  // ];

  const todayStats = [
    // { id: 1, label: 'Tasks', value: '8', icon: 'checkbox-outline', color: '#286DA6' },
    {
      id: 1,
      label: 'Approved',
      value: '8',
      icon: 'checkbox',
      color: '#0fd15aff',
    },
    {
      id: 2,
      label: 'Pending',
      value: '3',
      icon: 'help-circle',
      color: '#F59E0B',
    },
    {
      id: 3,
      label: 'Rejected',
      value: '2',
      icon: 'close-circle',
      color: '#f5460bff',
    },
    {
      id: 4,
      label: 'Total',
      value: '13',
      icon: 'cellular',
      color: '#0b90f5ff',
    },
  ];

  const recentEntries = [
    {
      id: 1,
      title: 'Machine #45 Quality Check',
      time: '10:30 AM',
      type: 'inspection',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Production Line A Review',
      time: '09:15 AM',
      type: 'review',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Material Quality Report',
      time: 'Yesterday',
      type: 'report',
      status: 'pending',
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Weekly Quality Meeting',
      time: '2:00 PM',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Equipment Inspection',
      time: '3:30 PM',
      priority: 'medium',
    },
    { id: 3, title: 'Submit Daily Report', time: '5:00 PM', priority: 'high' },
  ];

  const getTypeIcon = type => {
    switch (type) {
      case 'inspection':
        return 'search-outline';
      case 'review':
        return 'eye-outline';
      case 'report':
        return 'document-text-outline';
      default:
        return 'document-outline';
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with User Info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              {userData && (
                <>
                  <Text style={styles.userName}>{userData.name}</Text>
                  <Text style={styles.userRole}>{userData.role}</Text>
                </>
              )}
            </View>
            <Pressable
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarContainer}
            >
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          {/* Employee ID Badge */}
          <View style={styles.employeeIdBadge}>
            <Ionicons name="card" size={16} color="#286DA6" />
            <Text style={styles.employeeIdText}>{userData.employeeId || '-'}</Text>
          </View>
        </View>

        {/* Today's Summary - Compact */}
        <View style={styles.todaySummary}>
          <Text style={styles.todayTitle}>Today's Summary</Text>
          <View style={styles.todayStatsRow}>
            {todayStats.map(stat => (
              <View key={stat.id} style={styles.todayStatItem}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
                <Text style={styles.todayStatValue}>{stat.value}</Text>
                <Text style={styles.todayStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions Grid */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <Pressable 
                key={action.id} 
                style={styles.quickActionItem}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View> */}

        {/* Recent Entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inspections</Text>
            <Pressable onPress={() => navigation.navigate('Entries')}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          {recentEntries.map(entry => (
            <Pressable key={entry.id} style={styles.entryCard}>
              <View style={styles.entryIconContainer}>
                <Ionicons
                  name={getTypeIcon(entry.type)}
                  size={20}
                  color="#286DA6"
                />
              </View>
              <View style={styles.entryContent}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryTime}>{entry.time}</Text>
              </View>
              <View
                style={[
                  styles.entryStatus,
                  entry.status === 'completed' && styles.entryStatusCompleted,
                  entry.status === 'pending' && styles.entryStatusPending,
                ]}
              >
                <Ionicons
                  name={
                    entry.status === 'completed' ? 'checkmark-circle' : 'time'
                  }
                  size={18}
                  color={entry.status === 'completed' ? '#10B981' : '#F59E0B'}
                />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Upcoming Tasks */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            <Pressable>
              <Text style={styles.seeAllText}>View All</Text>
            </Pressable>
          </View>

          {upcomingTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={[styles.priorityBar, { backgroundColor: getPriorityColor(task.priority) }]} />
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskTimeContainer}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.taskTime}>{task.time}</Text>
                </View>
              </View>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
            </View>
          ))}
        </View> */}

        {/* Bottom Padding */}
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
    backgroundColor: '#286DA6',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#DBEAFE',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#DBEAFE',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  employeeIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  employeeIdText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  todaySummary: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0000000d',
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  todayStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  todayStatItem: {
    alignItems: 'center',
    gap: 6,
  },
  todayStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  todayStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#286DA6',
    fontWeight: '600',
  },
  // quickActionsGrid: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   gap: 12,
  // },
  // quickActionItem: {
  //   width: '23%',
  //   alignItems: 'center',
  //   gap: 8,
  // },
  // quickActionIcon: {
  //   width: 56,
  //   height: 56,
  //   borderRadius: 16,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // quickActionLabel: {
  //   fontSize: 12,
  //   color: '#1F2937',
  //   fontWeight: '600',
  //   textAlign: 'center',
  // },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0000000d',
  },
  entryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  entryTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  entryStatus: {
    marginLeft: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  taskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

export default DashboardScreen;
