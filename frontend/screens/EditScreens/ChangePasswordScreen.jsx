import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../config/api';
import CustomAlert from '../../components/CustomAlert';
import { useAppTheme } from '../../theme/ThemeProvider';

const ChangePasswordScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
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
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const showAlert = (type, title, message = '') => {
    setAlert({ visible: true, type, title, message });
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = form;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('error', 'Invalid Input', 'All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('error', 'Mismatch', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showAlert('error', 'Session Expired', 'Please login again');
        setLoading(false);
        return;
      }

      await axios.put(
        `${BASE_URL}/api/auth/change-password`,
        { currentPassword, newPassword, confirmPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      showAlert('success', 'Password Updated');

      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showAlert(
        'error',
        'Update Failed',
        err.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {['currentPassword', 'newPassword', 'confirmPassword'].map(
          (field, i) => (
            <View key={i} style={styles.inputGroup}>
              <Text style={styles.label}>
                {field === 'currentPassword'
                  ? 'Current Password'
                  : field === 'newPassword'
                  ? 'New Password'
                  : 'Confirm Password'}
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={C.textMuted}
                />
                <TextInput
                  style={styles.input}
                  value={form[field]}
                  onChangeText={v => setForm({ ...form, [field]: v })}
                  secureTextEntry={!showPassword[field]}
                  placeholderTextColor={C.textSubtle}
                />
                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(prev => ({
                      ...prev,
                      [field]: !prev[field],
                    }))
                  }
                >
                  <Ionicons
                    name={
                      showPassword[field] ? 'eye-outline' : 'eye-off-outline'
                    }
                    size={25}
                    color={C.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ),
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={C.surface} />
          ) : (
            <>
              <Ionicons name="key-outline" size={20} color={C.surface} />
              <Text style={styles.saveText}>Update Password</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        {...alert}
        onHide={() => setAlert(a => ({ ...a, visible: false }))}
      />
    </View>
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

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.surface,
  },

  inputGroup: {
    marginHorizontal: 20,
    marginTop: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textBody,
    marginBottom: 8,
  },
   backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    marginHorizontal: 20,
    marginTop: 32,
    padding: 16,
    borderRadius: 40,
    gap: 8,
  },

  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.surface,
  },
});

export default ChangePasswordScreen;
