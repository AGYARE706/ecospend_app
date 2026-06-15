import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import type { ProviderType } from '../../types';
import ProviderCard from './ProviderCard';

/**
 * Row of three equal-width MoMo provider selector cards.
 */
export interface ProviderCardRowProps {
  selectedProvider: ProviderType;
  onSelect: (provider: ProviderType) => void;
}

const PROVIDERS: Array<{
  provider: ProviderType;
  initials: string;
  circleColor: string;
}> = [
  { provider: 'MTN MoMo', initials: 'MTN', circleColor: colors.providerMtn },
  { provider: 'Telecel Cash', initials: 'TC', circleColor: colors.providerTelecel },
  { provider: 'AT Money', initials: 'AT', circleColor: colors.providerAt },
];

export default function ProviderCardRow({
  selectedProvider,
  onSelect,
}: ProviderCardRowProps) {
  return (
    <View style={styles.row}>
      {PROVIDERS.map((item) => (
        <ProviderCard
          key={item.provider}
          provider={item.provider}
          initials={item.initials}
          circleColor={item.circleColor}
          selected={selectedProvider === item.provider}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
