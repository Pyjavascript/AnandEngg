import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomAlert = ({
  visible,
  type = 'success', // success | error | info
  title,
  message,
  onHide,
  duration = 2000,
}) => {
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
      color: '#286DA6',
    },
    error: {
      icon: 'close-circle',
      color: '#FF6B6B',
    },
    info: {
      icon: 'information-circle',
      color: '#5A8FBE',
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#286DA6',
    marginTop: 12,
  },
  message: {
    fontSize: 14,
    color: '#00000080',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CustomAlert;
