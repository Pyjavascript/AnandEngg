import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';

export default function SectionCard({ title, image, children }) {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);

  return (
    <View style={styles.wrapper}>
      {image && <Image source={image} style={styles.image} />}
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const createStyles = C => StyleSheet.create({
  wrapper: {
    backgroundColor: C.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'contain',
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.primarySoft,
    marginBottom: 12,
  },
});
