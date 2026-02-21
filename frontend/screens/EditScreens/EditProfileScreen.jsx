import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import BASE_URL from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView } from 'react-native';
import CustomAlert from '../../components/CustomAlert';
import { theme } from '../../theme/designSystem';

const EditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    role: '',
  });
  const [alert, setAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const showAlert = (type, title, message = '') => {
  setAlert({
    visible: true,
    type,
    title,
    message,
  });
};
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setForm({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          department: user.department || '',
          employeeId: user.employeeId || user.employee_id || '',
          role: user.role || '',
        });
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };
  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone) {
      showAlert('error', 'Invalid Input', 'All fields are required');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (!token || !storedUser) {
        // showAlert('Session expired', 'Please login again');
        showAlert('error', 'Session Expired', 'Please login again');
        setLoading(false);
        return;
      }

      // 🔹 API CALL (real update)
      const response = await axios.put(
        `${BASE_URL}/api/auth/profile`,
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // 🔹 Update local storage only AFTER backend success
      const user = JSON.parse(storedUser);
      const updatedUser = {
        ...user,
        name: form.name,
        email: form.email,
        phone: form.phone,
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // Alert.alert('Success', response.data.message, [
      //   { text: 'OK', onPress: () => navigation.goBack() },
      // ]);
      showAlert('success', 'Profile Updated');

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.log('FULL ERROR:', error);
      console.log('RESPONSE:', error.response);
      console.log('DATA:', error.response?.data);
      console.log('STATUS:', error.response?.status);

      // Alert.alert(
      //   'Error',
      //   JSON.stringify(error.response?.data || error.message),
      // );

      // Alert.alert(
      //   'Error',
      //   error.response?.data?.message || 'Failed to update profile',
      // );
      showAlert(
        'error',
        'Update Failed',
        error.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  form.name || 'User',
                )}&background=286DA6&color=fff&size=200`,
              }}
              style={styles.avatar}
            />
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={text => setForm({ ...form, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor="#B0C4D8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={form.email}
                  onChangeText={text => setForm({ ...form, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor="#B0C4D8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={text => setForm({ ...form, phone: text })}
                  placeholder="Enter your phone"
                  placeholderTextColor="#B0C4D8"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* <View style={styles.inputGroup}>
            <Text style={styles.label}>Department</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={form.department}
                onChangeText={(text) => setForm({ ...form, department: text })}
                placeholder="Enter your department"
                placeholderTextColor="#B0C4D8"
              />
            </View>
          </View> */}

            {/* Read-only fields */}
            <View style={styles.readOnlySection}>
              <Text style={styles.sectionTitle}>Company Information</Text>
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Employee ID</Text>
                <Text style={styles.readOnlyValue}>
                  {form.employeeId || '-'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.readOnlyItem}>
                <Text style={styles.readOnlyLabel}>Role</Text>
                <Text style={styles.readOnlyValue}>{form.role || '-'}</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onHide={() => setAlert(prev => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
};

const C = theme.colors;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 16,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#286DA6',
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 14,
  },
  readOnlySection: {
    marginTop: 10,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textStrong,
    marginBottom: 12,
  },
  readOnlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  readOnlyLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  readOnlyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 40,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default EditProfileScreen;
