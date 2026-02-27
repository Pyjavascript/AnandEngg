import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import SplashScreen from './screens/SplashScreen';
import Features from './screens/Features';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import AccordanceScreen from './screens/AccordanceScreen';
import AddEntryScreen from './screens/AddEntryScreen';
import EntriesScreen from './screens/EntriesScreen';
import ReportsScreen from './screens/ReportsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditScreens/EditProfileScreen';
import ChangePasswordScreen from './screens/EditScreens/ChangePasswordScreen';
import ReportDetailScreen from './screens/ReportDetailScreen';
import DownloadReportsScreen from './screens/DownloadReportsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AdminDashboardScreen from './screens/AdminScreens/AdminDashboardScreen'
import ManageUsersScreen from './screens/AdminScreens/ManageUsersScreen'
import ManageRolesScreen from './screens/AdminScreens/ManageRolesScreen'
import ManageReportsScreen from './screens/AdminScreens/ManageReportsScreen'
import UserDetailScreen from './screens/AdminScreens/UserDetailScreen'
import { theme } from './theme/designSystem';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Entries') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primarySoft,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Entries" component={EntriesScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'grid-outline';

          if (route.name === 'AdminHome') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'ManageUsers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ManageRoles') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'ManageReports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#286DA6',
        tabBarInactiveTintColor: '#7B8595',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 74,
          paddingTop: 8,
          paddingBottom: 8,
        },
      })}
    >
      <Tab.Screen
        name="AdminHome"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="ManageUsers"
        component={ManageUsersScreen}
        options={{ tabBarLabel: 'Users' }}
      />
      <Tab.Screen
        name="ManageRoles"
        component={ManageRolesScreen}
        options={{ tabBarLabel: 'Roles' }}
      />
      <Tab.Screen
        name="ManageReports"
        component={ManageReportsScreen}
        options={{ tabBarLabel: 'Reports' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.bg} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Features" component={Features} />
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen name="Accordance" component={AccordanceScreen} />
          <Stack.Screen name="AddEntry" component={AddEntryScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
          />
          <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
          <Stack.Screen
            name="DownloadReports"
            component={DownloadReportsScreen}
          />
          <Stack.Screen name="AdminDashboard" component={AdminTabs} />
          <Stack.Screen name="UserDetail" component={UserDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;
