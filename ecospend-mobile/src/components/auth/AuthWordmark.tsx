import { Image, StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';

const LOGO_ASPECT_RATIO = 531 / 484;
const LOGO_HEIGHT = 36;

export default function AuthWordmark() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="EcoSpend"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    height: LOGO_HEIGHT,
    width: LOGO_HEIGHT * LOGO_ASPECT_RATIO,
  },
});
