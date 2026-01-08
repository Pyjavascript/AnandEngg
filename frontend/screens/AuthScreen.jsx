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
  ActivityIndicator
} from 'react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'react-native';
import AppLogo from '../assets/pictures/AppLogo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RoleSelector from '../components/RoleSelector';
import CustomAlert from '../components/CustomAlert';

const AuthScreen = ({ navigation }) => {
  const [alert, setAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
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
        // Alert.alert('Error', 'Please fill in all fields');
         showAlert('error', 'Login Failed', 'Please fill in all fields');
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
        console.log('LOGIN RESPONSE:', data);
        console.log('TOKEN TO SAVE:', data.token);

        if (!res.ok) {
          // Alert.alert('Login Failed', data.message);
          showAlert('error', 'Login Failed', data.message);

          setLoading(false);
          return;
        }

        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        // Alert.alert('Success', 'Login successful');
        // navigation.replace('MainApp');
        showAlert('success', 'Login Successful');

        setTimeout(() => {
          navigation.replace('MainApp');
        }, 1500);
      } catch (err) {
        // Alert.alert('Error', 'Backend not reachable');
        showAlert('error', 'Login Failed', 'Backend not reachable');

        console.log(err);
      } finally {
        setLoading(false);
      }
    } else {
      if (
        !formData.name ||
        !formData.employeeId ||
        !formData.email ||
        !formData.phone ||
        !role ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        // Alert.alert('Error', 'Please fill in all fields');
        showAlert('error', 'Invalid Input', 'Please fill all fields');

        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        // Alert.alert('Error', 'Passwords do not match');
        showAlert('error', 'Invalid Input', 'Passwords do not match');
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
            email: formData.email,
            phone: formData.phone,
            role,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Alert.alert('Registration Failed', data.message);
          showAlert('error', 'Error', 'Registration Failed: ' + data.message);
          setLoading(false);
          return;
        }

        // Alert.alert('Success', 'Account created');
        // showAlert('success', 'Login Successful');
        showAlert('success', 'Account Created', 'You can now sign in');
        setIsLogin(true);
      } catch (err) {
        showAlert('error', 'Registration Failed', 'Backend not reachable');
        // showAlert('error', 'Login Failed', data.message);

        console.log(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(prev => !prev);
    setRole('');
    setFocusedField(null);
    setFormData({
      name: '',
      employeeId: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
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
        {/* <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} /> */}

        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.welcomeText}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>
          <Text style={styles.subtitleText}>
            {isLogin ? 'Sign in to continue' : 'Join Anand Engineering team'}
          </Text>
        </View>

        {/* Form Card */}
        <View style={{ flex: 1, alignItems: 'stretch', width: '100%' }}>
          <View style={styles.formCard}>
            {/* Name Input (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                {/* <Text style={styles.inputLabel}>Full Name</Text> */}
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'name' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons name="person-outline" size={25} color="#00000053" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    // placeholderTextColor="#B0C4D8"
                    placeholderTextColor="#00000053"
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
              {/* <Text style={styles.inputLabel}>Employee ID</Text> */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'employeeId' && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons name="id-card-outline" size={25} color="#00000053" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your employee ID"
                  // placeholderTextColor="#B0C4D8"
                  placeholderTextColor="#00000053"
                  value={formData.employeeId}
                  onChangeText={value => handleInputChange('employeeId', value)}
                  onFocus={() => setFocusedField('employeeId')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                />
              </View>
            </View>
            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  {/* <Text style={styles.inputLabel}>Email</Text> */}
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={25} color="#00000053" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter email"
                      // placeholderTextColor="#B0C4D8"
                      placeholderTextColor="#00000053"
                      value={formData.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={v => handleInputChange('email', v)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  {/* <Text style={styles.inputLabel}>Phone</Text> */}

                  <View style={styles.inputWrapper}>
                    <Ionicons name="call-outline" size={25} color="#00000053" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter phone number"
                      // placeholderTextColor="#B0C4D8"
                      placeholderTextColor="#00000053"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={v => handleInputChange('phone', v)}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Role Picker (Register only) */}
            {/* {!isLogin && (
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
            )} */}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              {/* <Text style={styles.inputLabel}>Password</Text> */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={25}
                  color="#00000053"
                />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="Enter your password"
                  // placeholderTextColor="#B0C4D8"
                  placeholderTextColor="#00000053"
                  value={formData.password}
                  onChangeText={value => handleInputChange('password', value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword(prev => !prev)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={25}
                    color="#00000053"
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password Input (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                {/* <Text style={styles.inputLabel}>Confirm Password</Text> */}
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
                  <Ionicons
                    name="lock-closed-outline"
                    size={25}
                    color="#00000053"
                  />
                  <TextInput
                    style={[styles.input, styles.inputWithIcon]}
                    placeholder="Re-enter your password"
                    // placeholderTextColor="#B0C4D8"
                    placeholderTextColor="#00000053"
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
                    onPress={() => setShowConfirmPassword(prev => !prev)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? 'eye-outline' : 'eye-off-outline'
                      }
                      size={25}
                      color="#00000053"
                    />
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
            {!isLogin && (
              <RoleSelector
                value={role}
                onChange={setRole}
                error={!role ? 'Please select a role' : ''}
              />
            )}
            {/* Submit Button */}
            {/* <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitButton,
                (pressed || loading) && styles.submitButtonPressed,
                loading && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.submitButtonText}>
                {loading ? (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="key-outline" size={20} color="#FFF" />
                        <Text style={styles.saveText}>Update Password</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Text>
            </Pressable> */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitButton,
                (pressed || loading) && styles.submitButtonPressed,
                
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
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
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Use These Account's for testing:{' '}
              </Text>
              <Text style={styles.footerText}>
                Machine Operator - EMP001: test1234
              </Text>
              <Text style={styles.footerText}>
                Quality Inspector - EMP002: test1234
              </Text>
              <Text style={styles.footerText}>
                Quality Manager - EMP003: test1234
              </Text>
            </View>
          </View>
        </View>
        <CustomAlert
          visible={alert.visible}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onHide={() => setAlert(prev => ({ ...prev, visible: false }))}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F8FBFE',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingTop: 60,
    paddingBottom: 40,
  },
  // decorativeCircle1: {
  //   position: 'absolute',
  //   top: -50,
  //   right: -50,
  //   width: 200,
  //   height: 200,
  //   borderRadius: 100,
  //   backgroundColor: '#E3F2FD',
  //   opacity: 0.4,
  // },
  // decorativeCircle2: {
  //   position: 'absolute',
  //   top: 150,
  //   left: -80,
  //   width: 160,
  //   height: 160,
  //   borderRadius: 80,
  //   backgroundColor: '#BBDEFB',
  //   opacity: 0.3,
  // },
  // decorativeCircle3: {
  //   position: 'absolute',
  //   bottom: 100,
  //   right: -40,
  //   width: 120,
  //   height: 120,
  //   borderRadius: 60,
  //   backgroundColor: '#E3F2FD',
  //   opacity: 0.3,
  // },
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
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 15,
    // color: '#5A8FBE',
    textAlign: 'center',
    color: '#00000053',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#286DA6',
    // borderWidth: 1,
    // borderColor: '#0000000d',
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
    // backgroundColor: '#F8FBFE',
    borderRadius: 16,
    borderWidth: 1,
    // borderColor: '#E3F2FD',
    borderColor: '#00000053',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    borderRadius: 40,
    alignItems: 'center',
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
    fontSize: 13,
    color: '#B0C4D8',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AuthScreen;
