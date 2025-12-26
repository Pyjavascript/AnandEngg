import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EntriesScreen = ({ navigation }) => {
  const quickActions = [
    {
      id: 1,
      title: 'New Inspection',
      subtitle: 'Create inspection report',
      icon: 'clipboard-outline',
      color: '#286DA6',
      bgColor: '#E3F2FD',
      onPress: () => navigation.navigate('Accordance'),
    },
    // {
    //   id: 2,
    //   title: 'Quality Check',
    //   subtitle: 'Quick quality inspection',
    //   icon: 'checkmark-circle-outline',
    //   color: '#10B981',
    //   bgColor: '#D1FAE5',
    //   onPress: () => {},
    // },
    // {
    //   id: 3,
    //   title: 'Process Review',
    //   subtitle: 'Review process status',
    //   icon: 'git-network-outline',
    //   color: '#F59E0B',
    //   bgColor: '#FEF3C7',
    //   onPress: () => {},
    // },
    // {
    //   id: 4,
    //   title: 'Safety Check',
    //   subtitle: 'Safety inspection form',
    //   icon: 'shield-checkmark-outline',
    //   color: '#EF4444',
    //   bgColor: '#FEE2E2',
    //   onPress: () => {},
    // },
  ];

  const recentTemplates = [
    { id: 1, name: 'Cutting Inspection', count: 12, icon: 'cut-outline' },
    { id: 2, name: 'Welding Quality', count: 8, icon: 'flame-outline' },
    { id: 3, name: 'Final Assembly', count: 5, icon: 'construct-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Create Entry</Text>
          <Text style={styles.headerSubtitle}>Start a new inspection or report</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.bgColor }]}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Templates */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Templates</Text>
          {recentTemplates.map((template) => (
            <TouchableOpacity key={template.id} style={styles.templateCard}>
              <View style={styles.templateIcon}>
                <Ionicons name={template.icon} size={24} color="#286DA6" />
              </View>
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateCount}>Used {template.count} times</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#B0C4D8" />
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color="#286DA6" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Need Help?</Text>
            <Text style={styles.infoSubtitle}>
              Select "New Inspection" to start creating your quality inspection report
            </Text>
          </View>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // templateCard: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#FFFFFF',
  //   borderRadius: 12,
  //   padding: 14,
  //   marginBottom: 10,
  //   borderWidth: 1,
  //   borderColor: '#E3F2FD',
  // },
  // templateIcon: {
  //   width: 48,
  //   height: 48,
  //   borderRadius: 24,
  //   backgroundColor: '#E3F2FD',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginRight: 12,
  // },
  // templateInfo: {
  //   flex: 1,
  // },
  // templateName: {
  //   fontSize: 15,
  //   fontWeight: '600',
  //   color: '#1F2937',
  //   marginBottom: 2,
  // },
  // templateCount: {
  //   fontSize: 12,
  //   color: '#6B7280',
  // },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#5A8FBE',
    lineHeight: 18,
  },
});

export default EntriesScreen;