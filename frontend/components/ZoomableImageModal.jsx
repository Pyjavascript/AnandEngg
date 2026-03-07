import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../theme/ThemeProvider';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

const clampZoom = value => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

export default function ZoomableImageModal({
  visible,
  onClose,
  imageSource,
  title = 'Part Diagram',
}) {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = useMemo(() => createStyles(C), [C]);
  const { width, height } = useWindowDimensions();
  const [zoom, setZoom] = useState(1);

  const baseWidth = Math.max(width - 24, 260);
  const baseHeight = Math.max(height * 0.7, 260);

  const handleClose = () => {
    setZoom(1);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={C.textStrong} />
          </Pressable>
        </View>

        <View style={styles.zoomRow}>
          <Pressable
            onPress={() => setZoom(prev => clampZoom(prev - ZOOM_STEP))}
            style={styles.zoomBtn}
          >
            <Ionicons name="remove" size={18} color={C.textStrong} />
          </Pressable>
          <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
          <Pressable
            onPress={() => setZoom(prev => clampZoom(prev + ZOOM_STEP))}
            style={styles.zoomBtn}
          >
            <Ionicons name="add" size={18} color={C.textStrong} />
          </Pressable>
          <Pressable onPress={() => setZoom(1)} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.viewer}
          contentContainerStyle={styles.viewerContent}
          horizontal
          maximumZoomScale={MAX_ZOOM}
          minimumZoomScale={MIN_ZOOM}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            contentContainerStyle={styles.viewerContent}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={imageSource}
              resizeMode="contain"
              style={{
                width: baseWidth * zoom,
                height: baseHeight * zoom,
              }}
            />
          </ScrollView>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = C =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      paddingTop: 48,
      paddingHorizontal: 12,
      paddingBottom: 24,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    title: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
      marginRight: 10,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: C.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    zoomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 14,
    },
    zoomBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: C.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    zoomText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      minWidth: 52,
      textAlign: 'center',
    },
    resetBtn: {
      backgroundColor: C.surface,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 18,
    },
    resetText: {
      color: C.textStrong,
      fontSize: 12,
      fontWeight: '700',
    },
    viewer: {
      flex: 1,
    },
    viewerContent: {
      minWidth: '100%',
      minHeight: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
