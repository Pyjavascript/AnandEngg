import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'react-native';
import AppLogo from '../assets/pictures/AppLogo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
  });
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    console.log('BASE_URL =>', BASE_URL);
    setLoading(true);

    if (isLogin) {
      if (!formData.employeeId || !formData.password) {
        Alert.alert('Error', 'Please fill in all fields');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: formData.employeeId,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          Alert.alert('Login Failed', data.message);
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        Alert.alert('Success', 'Login successful');
        navigation.replace('MainApp');
      } catch (err) {
        Alert.alert('Error', 'Backend not reachable');
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else {
      if (
        !formData.name ||
        !formData.employeeId ||
        !role ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        Alert.alert('Error', 'Please fill in all fields');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            employeeId: formData.employeeId,
            role,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          Alert.alert('Registration Failed', data.message);
          setLoading(false);
          return;
        }

        Alert.alert('Success', 'Account created');
        setIsLogin(true);
      } catch (err) {
        Alert.alert('Error', 'Backend not reachable');
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
  };

  //   const handleSubmit = async () => {
  //     console.log('BASE_URL =>', BASE_URL);

  //     if (isLogin) {
  //   if (!formData.employeeId || !formData.password) {
  //     Alert.alert('Error', 'Please fill in all fields');
  //     return;
  //   }

  //   try {
  //     const res = await fetch(`${BASE_URL}/api/auth/login`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         employeeId: formData.employeeId,
  //         password: formData.password,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       Alert.alert('Login Failed', data.message);
  //       return;
  //     }

  //     await AsyncStorage.setItem('token', data.token);
  //     await AsyncStorage.setItem('user', JSON.stringify(data.user));

  //     Alert.alert('Success', 'Login successful');
  //     navigation.replace('MainApp');
  //   } catch (err) {
  //     Alert.alert('Error', 'Backend not reachable');
  //     console.log(err);
  //   }
  // } else {
  //   if (
  //     !formData.name ||
  //     !formData.employeeId ||
  //     !role ||
  //     !formData.password ||
  //     !formData.confirmPassword
  //   ) {
  //     Alert.alert('Error', 'Please fill in all fields');
  //     return;
  //   }

  //   if (formData.password !== formData.confirmPassword) {
  //     Alert.alert('Error', 'Passwords do not match');
  //     return;
  //   }

  //   try {
  //     const res = await fetch(`${BASE_URL}/api/auth/register`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         name: formData.name,
  //         employeeId: formData.employeeId,
  //         role,
  //         password: formData.password,
  //         confirmPassword: formData.confirmPassword,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       Alert.alert('Registration Failed', data.message);
  //       return;
  //     }

  //     Alert.alert('Success', 'Account created');
  //     setIsLogin(true);
  //   } catch (err) {
  //     Alert.alert('Error', 'Backend not reachable');
  //     console.log(err);
  //   }
  // }

  //   };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      employeeId: '',
      password: '',
      confirmPassword: '',
    });
    setFocusedField(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative Background Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.welcomeText}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>
          <Text style={styles.subtitleText}>
            {isLogin
              ? 'Sign in to continue to Anand Engineering'
              : 'Join Anand Engineering team'}
          </Text>
        </View>

        {/* Form Card */}
        <View style={{ flex: 1, alignItems: 'stretch', width: '100%' }}>
          <View style={styles.formCard}>
            {/* Name Input (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'name' && styles.inputWrapperFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#B0C4D8"
                    value={formData.name}
                    onChangeText={value => handleInputChange('name', value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Employee ID Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Employee ID</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'employeeId' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Enter your employee ID"
                  placeholderTextColor="#B0C4D8"
                  value={formData.employeeId}
                  onChangeText={value => handleInputChange('employeeId', value)}
                  onFocus={() => setFocusedField('employeeId')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                />
              </View>
            </View>
            {/* Role Picker (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Role</Text>

                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'role' && styles.inputWrapperFocused,
                  ]}
                >
                  <Picker
                    selectedValue={role}
                    onValueChange={itemValue => setRole(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#286DA6"
                    onFocus={() => setFocusedField('role')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <Picker.Item label="Select role" value="" color="#B0C4D8" />
                    <Picker.Item
                      label="Machine Operator"
                      value="machine_operator"
                    />
                    <Picker.Item
                      label="Quality Inspector"
                      value="quality_inspector"
                    />
                    <Picker.Item
                      label="Quality Manager"
                      value="quality_manager"
                    />
                  </Picker>
                </View>
              </View>
            )}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="Enter your password"
                  placeholderTextColor="#B0C4D8"
                  value={formData.password}
                  onChangeText={value => handleInputChange('password', value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={styles.eyeIconText}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Confirm Password Input (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'confirmPassword' &&
                      styles.inputWrapperFocused,
                    formData.confirmPassword &&
                      formData.password !== formData.confirmPassword &&
                      styles.inputWrapperError,
                  ]}
                >
                  <TextInput
                    style={[styles.input, styles.inputWithIcon]}
                    placeholder="Re-enter your password"
                    placeholderTextColor="#B0C4D8"
                    value={formData.confirmPassword}
                    onChangeText={value =>
                      handleInputChange('confirmPassword', value)
                    }
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Text style={styles.eyeIconText}>
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </Pressable>
                </View>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <Text style={styles.errorText}>Passwords do not match</Text>
                  )}
              </View>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <Pressable style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitButton,
                (pressed || loading) && styles.submitButtonPressed,
                loading && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.submitButtonText}>
                {loading
                  ? 'Loading...'
                  : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
              </Text>
            </Pressable>

            {/* Toggle Auth Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Don't have an account? "
                  : 'Already have an account? '}
              </Text>
              <Pressable onPress={toggleAuthMode}>
                <Text style={styles.toggleLink}>
                  {isLogin ? 'Register' : 'Sign In'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFE',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E3F2FD',
    opacity: 0.4,
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 150,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#BBDEFB',
    opacity: 0.3,
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: 100,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    opacity: 0.3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    marginBottom: 20,
    padding: 20,
  },
  logo: {
    width: 160,
    height: 50,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 15,
    color: '#5A8FBE',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#286DA6',
    borderWidth: 1,
    borderColor: '#0000000d',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#286DA6',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    backgroundColor: '#F8FBFE',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapperFocused: {
    borderColor: '#286DA6',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: '#FF6B6B',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#286DA6',
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 6,
    marginLeft: 4,
  },
  picker: {
    flex: 1,
    color: '#286DA6',
    height: 56,
    marginLeft: 8,
  },

  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#286DA6',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#286DA6',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#286DA6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 8,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  toggleText: {
    fontSize: 15,
    color: '#5A8FBE',
  },
  toggleLink: {
    fontSize: 15,
    color: '#286DA6',
    fontWeight: '700',
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#B0C4D8',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AuthScreen;
