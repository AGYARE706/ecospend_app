import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useThemedStyles } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { CoachMessageRole } from '../../api/coachApi';

export interface ChatBubbleProps {
  role: CoachMessageRole;
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const styles = useThemedStyles(createStyles);
  const isUser = role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={isUser ? styles.textUser : styles.textAssistant}>{content}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    rowUser: {
      justifyContent: 'flex-end',
    },
    rowAssistant: {
      justifyContent: 'flex-start',
    },
    bubble: {
      borderRadius: radius.lg,
      maxWidth: '82%',
      paddingHorizontal: spacing.smd,
      paddingVertical: spacing.sm,
    },
    bubbleUser: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: radius.xs,
    },
    bubbleAssistant: {
      backgroundColor: colors.chipBg,
      borderBottomLeftRadius: radius.xs,
    },
    textUser: {
      ...typography.body,
      color: colors.onPrimary,
    },
    textAssistant: {
      ...typography.body,
      color: colors.textDark,
    },
  });
