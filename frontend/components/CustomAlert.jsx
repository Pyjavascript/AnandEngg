import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../theme/ThemeProvider';

const CustomAlert = ({
  visible,
  type = 'success', // success | error | info
  title,
  message,
  onHide,
  duration = 2000,
}) => {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const config = {
    success: {
      icon: 'checkmark-circle',
      color: C.primarySoft,
    },
    error: {
      icon: 'close-circle',
      color: C.danger,
    },
    info: {
      icon: 'information-circle',
      color: C.primary,
    },
  };

  const { icon, color } = config[type];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Ionicons name={icon} size={60} color={color} />
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = C => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: C.surface,
    width: '80%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textStrong,
    marginTop: 12,
  },
  message: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CustomAlert;
