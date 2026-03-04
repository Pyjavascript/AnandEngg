import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAppTheme } from '../theme/ThemeProvider';

const RoleSelector = ({ value, onChange, roles = [] }) => {
  const { theme } = useAppTheme();
  const C = theme.colors;
  const styles = React.useMemo(() => createStyles(C), [C]);

  return (
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={value}
        onValueChange={itemValue => onChange(itemValue)}
        style={styles.picker}
        dropdownIconColor={C.primarySoft}
      >
        <Picker.Item label="Select role" value="" />
        {roles
          .filter(role => role.name !== 'admin')
          .map(role => (
            <Picker.Item
              key={role.id}
              label={role.display_name || role.displayName || role.name}
              value={role.name}
            />
          ))}
      </Picker>
    </View>
  );
};

const createStyles = C =>
  StyleSheet.create({
    pickerWrapper: {
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 16,
      marginBottom: 20,
      overflow: 'hidden',
      backgroundColor: C.surface,
    },
    picker: {
      height: 55,
      color: C.textBody,
    },
  });

export default RoleSelector;
