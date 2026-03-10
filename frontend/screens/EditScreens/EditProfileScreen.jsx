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
import { useAppTheme } from '../../theme/ThemeProvider';

const EditProfileScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    role: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
      const token = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        let liveUser = user;

        if (token && (user.employee_id || user.employeeId)) {
          try {
            const res = await axios.get(
              `${BASE_URL}/api/users/${user.employee_id || user.employeeId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
            liveUser = res.data || user;
          } catch (err) {
            console.log('Failed to fetch latest profile', err?.response?.data || err?.message);
          }
        }

        setForm({
          name: liveUser.name || '',
          email: liveUser.email || '',
          phone: liveUser.phone || '',
          department: liveUser.department || '',
          employeeId: liveUser.employeeId || liveUser.employee_id || '',
          role: liveUser.role || '',
        });
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };
  const handleSave = async () => {
    const hasPasswordInput =
      passwordForm.currentPassword ||
      passwordForm.newPassword ||
      passwordForm.confirmPassword;
    if (hasPasswordInput) {
      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        showAlert('error', 'Password Incomplete', 'Fill current, new, and confirm password fields.');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        showAlert('error', 'Password Mismatch', 'New password and confirm password must match.');
        return;
      }
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
      const user = JSON.parse(storedUser);
      const profilePayload = {};
      if (form.name !== (user.name || '')) profilePayload.name = form.name;
      if (form.email !== (user.email || '')) profilePayload.email = form.email;
      if (form.phone !== (user.phone || '')) profilePayload.phone = form.phone;
      if (form.department !== (user.department || '')) {
        profilePayload.department = form.department;
      }

      if (!Object.keys(profilePayload).length && !hasPasswordInput) {
        showAlert('info', 'No Changes', 'Update one or more fields to save.');
        setLoading(false);
        return;
      }

      let response = { data: { user } };
      if (Object.keys(profilePayload).length) {
        response = await axios.put(
          `${BASE_URL}/api/auth/profile`,
          profilePayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
      }

      // 🔹 Update local storage only AFTER backend success
      const updatedFromApi = response.data?.user || {};
      const updatedUser = {
        ...user,
        ...updatedFromApi,
        name:
          updatedFromApi.name !== undefined ? updatedFromApi.name : form.name,
        email:
          updatedFromApi.email !== undefined ? updatedFromApi.email : form.email,
        phone:
          updatedFromApi.phone !== undefined ? updatedFromApi.phone : form.phone,
        department:
          updatedFromApi.department !== undefined
            ? updatedFromApi.department
            : form.department,
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      if (hasPasswordInput) {
        await axios.put(
          `${BASE_URL}/api/auth/change-password`,
          {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
            confirmPassword: passwordForm.confirmPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
      }

      showAlert('success', 'Profile Updated', 'Your profile changes were saved successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

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
            <Ionicons name="arrow-back" size={24} color={C.surface} />
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
                <Ionicons name="person-outline" size={20} color={C.textMuted} />
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={text => setForm({ ...form, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor={C.textSubtle}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={C.textMuted} />
                <TextInput
                  style={styles.input}
                  value={form.email}
                  onChangeText={text => setForm({ ...form, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor={C.textSubtle}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color={C.textMuted} />
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={text => setForm({ ...form, phone: text })}
                  placeholder="Enter your phone"
                  placeholderTextColor={C.textSubtle}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="briefcase-outline" size={20} color={C.textMuted} />
                <TextInput
                  style={styles.input}
                  value={form.department}
                  onChangeText={text => setForm({ ...form, department: text })}
                  placeholder="Enter your department"
                  placeholderTextColor={C.textSubtle}
                />
              </View>
            </View>

            <View style={styles.readOnlySection}>
              <Text style={styles.sectionTitle}>Password</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={C.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={passwordForm.currentPassword}
                    onChangeText={text =>
                      setPasswordForm(prev => ({ ...prev, currentPassword: text }))
                    }
                    placeholder="Enter current password"
                    placeholderTextColor={C.textSubtle}
                    secureTextEntry
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={20} color={C.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={passwordForm.newPassword}
                    onChangeText={text =>
                      setPasswordForm(prev => ({ ...prev, newPassword: text }))
                    }
                    placeholder="Enter new password"
                    placeholderTextColor={C.textSubtle}
                    secureTextEntry
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={C.textMuted} />
                  <TextInput
                    style={styles.input}
                    value={passwordForm.confirmPassword}
                    onChangeText={text =>
                      setPasswordForm(prev => ({ ...prev, confirmPassword: text }))
                    }
                    placeholder="Confirm new password"
                    placeholderTextColor={C.textSubtle}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

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
              <ActivityIndicator color={C.surface} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={C.surface} />
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

const createStyles = C => StyleSheet.create({
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
    color: C.surface,
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
    borderColor: C.surface,
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
    color: C.textBody,
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
    color: C.textBody,
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
    color: C.textMuted,
  },
  readOnlyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textBody,
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
    color: C.surface,
  },
});

export default EditProfileScreen;
