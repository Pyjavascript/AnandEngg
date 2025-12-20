import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AppLogo from '../assets/pictures/AppLogo.png';
import { Image } from 'react-native';

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Features');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ height: '50%', width: 100, position: 'relative' }}>
        <Image
          source={AppLogo}
          style={{
            width: 300,
            height: 100,
            position: 'absolute',
            bottom: 0,
            left: -100,
          }}
        />
      </View>
      <ActivityIndicator
        size="large"
        color="#22659c"
        style={{ marginBottom: 40 }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 100,
  },
});

export default SplashScreen;
