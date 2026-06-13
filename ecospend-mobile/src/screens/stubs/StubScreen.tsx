import { StyleSheet, Text, View } from 'react-native';

import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { colors, fontSize, fontWeight } from '../../theme';

interface StubScreenProps {
  title: string;
}

export default function StubScreen({ title }: StubScreenProps) {
  return (
    <ScreenWrapper background="page">
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
