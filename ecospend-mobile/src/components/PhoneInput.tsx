import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme/colors';

export interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  editable?: boolean;
}

function sanitizePhoneInput(text: string): string {
  return text.replace(/\D/g, '').slice(0, 10);
}

export default function PhoneInput({
  value,
  onChangeText,
  label = 'Phone number',
  error,
  editable = true,
}: PhoneInputProps) {
  const handleChange = (text: string) => {
    onChangeText(sanitizePhoneInput(text));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined]}
        value={value}
        onChangeText={handleChange}
        keyboardType="phone-pad"
        placeholder="0241234567"
        placeholderTextColor={colors.textSecondary}
        editable={editable}
        maxLength={10}
      />
      <Text style={styles.hint}>e.g. 0241234567 or +233241234567</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
