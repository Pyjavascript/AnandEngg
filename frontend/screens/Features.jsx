import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLogo from '../assets/pictures/AppLogo.png';
import Slide01 from '../assets/pictures/slides/01.png';
import Slide02 from '../assets/pictures/slides/02.png';
import Slide03 from '../assets/pictures/slides/03.png';
import { Image } from 'react-native';
import { useState } from 'react';

const { width } = Dimensions.get('window');

const Features = ({ navigation }) => {  // Add navigation prop here
  const [count, setCount] = useState(0);
  
  const slides = [
    {
      head: 'Record Entries\nEasily',
      body: 'Employees can quickly add new entries for tasks, machine operations, work progress, or shift details.',
      image: Slide01,
    },
    {
      head: 'Track Processes\nEfficiently',
      body: 'Ensures transparency and keeps everyone aligned with the company\'s operational standards.',
      image: Slide02,
    },
    {
      head: 'Submit Reports\nInstantly',
      body: 'Digitize the entire reporting process by allowing employees to submit their daily, weekly, or process-related reports directly through the app.',
      image: Slide03,
    },
  ];
  const handleContinue = async () => {
  if (count < slides.length - 1) {
    setCount(count + 1);
  } else {
    await AsyncStorage.setItem('hasSeenFeatures', 'true');
    navigation.replace('AuthScreen');
  }
};
  const handleSkip = async () => {
  await AsyncStorage.setItem('hasSeenFeatures', 'true');
  navigation.replace('AuthScreen');
};
  return (
    <View style={styles.container}>
      {/* Decorative background elements */}
      {/* <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} /> */}
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={AppLogo}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {slides[count].head}
          </Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Illustration with card effect */}
        <View style={styles.imageCard}>
          <View style={styles.imageGlow} />
          <Image
            source={slides[count].image}
            resizeMode="contain"
            style={styles.image}
          />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          {slides[count].body}
        </Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === count && styles.dotActive,
                index < count && styles.dotPassed,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueButtonText}>
              {count === slides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
          </Pressable>

          {count < slides.length - 1 && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFBFD',
    flex: 1,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E3F2FD',
    opacity: 0.3,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 200,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#BBDEFB',
    opacity: 0.2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 45,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 40,
    // backgroundColor: 'red',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#286DA6',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  titleUnderline: {
    marginTop: 12,
    width: 60,
    height: 4,
    backgroundColor: '#286DA6',
    borderRadius: 2,
  },
  imageCard: {
    width: width - 80,
    height: 220,
    borderRadius: 30,
    padding: 20,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    opacity: 0.3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  description: {
    fontSize: 16,
    color: '#5A8FBE',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    maxWidth: 340
    
  },
  bottomContainer: {
    gap: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1E5F4',
  },
  dotActive: {
    width: 48,
    backgroundColor: '#286DA6',
  },
  dotPassed: {
    backgroundColor: '#87CEEB',
  },
  buttonsContainer: {
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#286DA6',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    // shadowColor: '#286DA6',
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.3,
    // shadowRadius: 10,
    // elevation: 6,
  },
  continueButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#5A8FBE',
    fontSize: 17,
    fontWeight: '500',
  },
});

export default Features;