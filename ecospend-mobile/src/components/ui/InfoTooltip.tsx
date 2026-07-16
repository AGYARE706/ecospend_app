import { ReactNode, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import BottomSheet from './BottomSheet';
import IconButton from './IconButton';
import { typography, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * A small "i" trigger that opens a bottom sheet explaining something —
 * the app's one consistent way to clarify a confusing feature (fee
 * rules, voting thresholds, what a number means) without cluttering the
 * screen with permanent paragraphs of copy.
 */
export interface InfoTooltipProps {
  title: string;
  /** Plain-text explanation. Ignored if `children` is provided. */
  body?: string;
  /** Richer content (bullet lists, etc.) — takes priority over `body`. */
  children?: ReactNode;
  size?: 'sm' | 'md';
}

export default function InfoTooltip({ title, body, children, size = 'sm' }: InfoTooltipProps) {
  const styles = useThemedStyles(createStyles);
  const [visible, setVisible] = useState(false);

  return (
    <>
      <IconButton
        icon="info"
        variant="ghost"
        size={size}
        onPress={() => setVisible(true)}
        accessibilityLabel={`About ${title}`}
      />
      <BottomSheet visible={visible} onClose={() => setVisible(false)} title={title}>
        {children ?? <Text style={styles.body}>{body}</Text>}
      </BottomSheet>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    body: {
      ...typography.body,
      color: colors.textSecondary,
    },
  });
