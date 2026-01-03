import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SectionCard({ title, image, children }) {
  return (
    <View style={styles.wrapper}>
      {image && <Image source={image} style={styles.image} />}
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#286DA6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'contain',
    backgroundColor: '#F8FBFE',
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#286DA6',
    marginBottom: 12,
  },
});
