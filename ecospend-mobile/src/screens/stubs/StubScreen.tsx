import { StyleSheet, Text, View } from 'react-native';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { fontSize, fontWeight, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

interface StubScreenProps {
  title: string;
}

export default function StubScreen({ title }: StubScreenProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <ScreenWrapper background="page">
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.textDark,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
});
