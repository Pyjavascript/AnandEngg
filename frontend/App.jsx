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
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator (only shows AFTER login)
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
        tabBarActiveTintColor: '#286DA6',
        tabBarInactiveTintColor: '#B0C4D8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E3F2FD',
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#286DA6',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
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

// Temporary Placeholder Screen (you can replace these later)
function PlaceholderScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FBFE' }}>
      <Ionicons name="construct-outline" size={64} color="#B0C4D8" />
      <Text style={{ fontSize: 18, color: '#286DA6', marginTop: 16, fontWeight: '600' }}>
        Coming Soon
      </Text>
      <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>
        This screen is under development
      </Text>
    </View>
  );
}

// Import these at the top if PlaceholderScreen is used
import { View, Text } from 'react-native';

// Main Stack Navigator
function App() {
  return (
    <>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="#FAFBFD"
      />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Features" component={Features} />
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen name="Accordance" component={AccordanceScreen} />
          <Stack.Screen name="AddEntry" component={AddEntryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;



// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { StatusBar } from 'react-native';
// import SplashScreen from './screens/SplashScreen';
// import Features from './screens/Features';
// import AuthScreen from './screens/AuthScreen';
// import DashboardScreen from './screens/DashboardScreen';
// import ReportsScreen from './screens/ReportsScreen';
// import EntriesScreen from './screens/EntriesScreen';
// import ProfileScreen from './screens/ProfileScreen';
// import { Ionicons } from '@expo/vector-icons';

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// // Bottom Tab Navigator
// function MainTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName;

//           if (route.name === 'Dashboard') {
//             iconName = focused ? 'home' : 'home-outline';
//           } else if (route.name === 'Entries') {
//             iconName = focused ? 'add-circle' : 'add-circle-outline';
//           } else if (route.name === 'Reports') {
//             iconName = focused ? 'document-text' : 'document-text-outline';
//           } else if (route.name === 'Profile') {
//             iconName = focused ? 'person' : 'person-outline';
//           }

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#286DA6',
//         tabBarInactiveTintColor: '#B0C4D8',
//         tabBarStyle: {
//           backgroundColor: '#FFFFFF',
//           borderTopWidth: 1,
//           borderTopColor: '#E3F2FD',
//           height: 60,
//           paddingBottom: 8,
//           paddingTop: 8,
//           elevation: 8,
//           shadowColor: '#286DA6',
//           shadowOffset: { width: 0, height: -2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           fontWeight: '600',
//         },
//       })}
//     >
//       <Tab.Screen name="Dashboard" component={DashboardScreen} />
//       <Tab.Screen name="Entries" component={EntriesScreen} />
//       <Tab.Screen name="Reports" component={ReportsScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// }

// // Main Stack Navigator
// export default function App() {
//   return (
//     <>
//       <StatusBar barStyle="dark-content" backgroundColor="#FAFBFD" />
//       <NavigationContainer>
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="Splash" component={SplashScreen} />
//           <Stack.Screen name="Features" component={Features} />
//           <Stack.Screen name="AuthScreen" component={AuthScreen} />
//           <Stack.Screen name="MainApp" component={MainTabs} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </>
//   );
// }