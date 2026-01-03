// import React, { useEffect } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
// import AppLogo from '../assets/pictures/AppLogo.png';
// import { Image } from 'react-native';

// const SplashScreen = ({navigation}) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigation.replace('Features');
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <View style={styles.container}>
//       <View style={{ height: '50%', width: 100, position: 'relative' }}>
//         <Image
//           source={AppLogo}
//           style={{
//             width: 300,
//             height: 100,
//             position: 'absolute',
//             bottom: 0,
//             left: -100,
//           }}
//         />
//       </View>
//       <ActivityIndicator
//         size="large"
//         color="#22659c"
//         style={{ marginBottom: 40 }}
//       />
//     </View>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     height: 100,
//   },
// });

// export default SplashScreen;

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLogo from '../assets/pictures/AppLogo.png';
import { Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkAppState = async () => {
      try {
        const hasSeenFeatures = await AsyncStorage.getItem('hasSeenFeatures');
        const token = await AsyncStorage.getItem('token');

        // ⏱ small delay for splash feel
        setTimeout(() => {
          if (token) {
            // User already logged in
            navigation.replace('MainApp');
          } else if (hasSeenFeatures) {
            // Seen onboarding but not logged in
            navigation.replace('AuthScreen');
          } else {
            // First time user
            navigation.replace('Features');
          }
        }, 1500);
      } catch (err) {
        navigation.replace('AuthScreen');
      }
    };

    checkAppState();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="large" color="#22659c" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 220,
    height: 80,
    marginBottom: 40,
  },
});

export default SplashScreen;
