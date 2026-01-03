import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const roles = [
  {
    key: 'machine_operator',
    label: 'Machine Operator',
    icon: 'settings-outline',
  },
  {
    key: 'quality_inspector',
    label: 'Quality Inspector',
    icon: 'search-outline',
  },
  {
    key: 'quality_manager',
    label: 'Quality Manager',
    icon: 'checkmark-done-outline',
  },
];

const RoleSelector = ({ value, onChange, error }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      {/* <Text style={styles.label}>Role</Text> */}

      {roles.map(role => {
        const selected = value === role.key;

        return (
          <Pressable
            key={role.key}
            onPress={() => onChange(role.key)}
            style={[
              styles.card,
              selected && styles.cardSelected,
              error && styles.cardError,
            ]}
          >
            <View style={styles.row}>
              <Ionicons
                name={role.icon}
                size={20}
                color={selected ? '#286DA6' : '#00000053'}
              />
              <Text
                style={[
                  styles.text,
                  selected && styles.textSelected,
                ]}
              >
                {role.label}
              </Text>
            </View>

            {selected && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#286DA6"
              />
            )}
          </Pressable>
        );
      })}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
//   label: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#286DA6',
//     marginBottom: 8,
//   },
  card: {
    borderWidth: 1,
    borderColor: '#00000053',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: '#286DA6',
    backgroundColor: '#EAF3FF',
  },
  cardError: {
    borderColor: '#FF6B6B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontSize: 16,
    color: '#00000099',
    fontWeight: '500',
  },
  textSelected: {
    color: '#286DA6',
    fontWeight: '700',
  },
  error: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default RoleSelector;
