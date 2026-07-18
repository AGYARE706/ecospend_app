import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import ChatBubble from '../../components/coach/ChatBubble';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { Icon } from '../../components/ui/icons';
import { useAskCoach } from '../../hooks/useAskCoach';
import type { AppStackParamList } from '../../navigation/types';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';
import type { CoachMessage } from '../../api/coachApi';

type AskCoachNavProp = StackNavigationProp<AppStackParamList, 'AskCoach'>;

const SUGGESTED_PROMPTS = [
  "How's my Food budget this month?",
  'Am I saving enough?',
  'Any unusual spending recently?',
  'How much have I earned this month?',
];

export default function AskCoachScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<AskCoachNavProp>();
  const { messages, phase, error, send } = useAskCoach();
  const listRef = useRef<FlatList<CoachMessage>>(null);

  const handleSend = (text: string) => {
    if (!text.trim()) {
      return;
    }
    void send(text);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <ScreenWrapper background="page" padded={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Icon name="x" size={22} color={colors.textDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Ask EcoSpend</Text>
            <Text style={styles.headerSub}>Your AI financial coach</Text>
          </View>
          <View style={styles.headerBtn} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          {messages.length === 0 ? (
            <ChatEmptyState onSelectPrompt={handleSend} />
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          {phase === 'sending' ? (
            <View style={styles.typingRow}>
              <Text style={styles.typingText}>Ask EcoSpend is thinking…</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <ChatInputBar onSend={handleSend} disabled={phase === 'sending'} />
        </KeyboardAvoidingView>
      </View>
    </ScreenWrapper>
  );
}

function ChatEmptyState({ onSelectPrompt }: { onSelectPrompt: (text: string) => void }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBadge}>
        <Icon name="sparkles" size={28} color={colors.accent} strokeWidth={1.6} />
      </View>
      <Text style={styles.emptyTitle}>Ask me anything about your money</Text>
      <Text style={styles.emptySub}>
        I only answer using your real transactions, budgets and goals — never guesses.
      </Text>
      <View style={styles.promptChips}>
        {SUGGESTED_PROMPTS.map((prompt) => (
          <Pressable
            key={prompt}
            style={({ pressed }) => [styles.promptChip, pressed && styles.promptChipPressed]}
            onPress={() => onSelectPrompt(prompt)}
          >
            <Text style={styles.promptChipText}>{prompt}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ChatInputBar({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim() || disabled) {
      return;
    }
    onSend(value);
    setValue('');
  };

  return (
    <View style={styles.inputBar}>
      <TextInput
        style={styles.input}
        placeholder="Ask about your spending…"
        placeholderTextColor={colors.textLight}
        value={value}
        onChangeText={setValue}
        multiline
        maxLength={500}
        editable={!disabled}
      />
      <Pressable
        style={({ pressed }) => [
          styles.sendBtn,
          (!value.trim() || disabled) && styles.sendBtnDisabled,
          pressed && !disabled && value.trim() && styles.sendBtnPressed,
        ]}
        onPress={submit}
        disabled={!value.trim() || disabled}
        accessibilityRole="button"
        accessibilityLabel="Send"
      >
        <Icon name="arrow-up" size={18} color={colors.onPrimary} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    flex: {
      flex: 1,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    headerBtn: {
      alignItems: 'center',
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    headerBtnPressed: {
      opacity: 0.6,
    },
    headerCenter: {
      alignItems: 'center',
    },
    headerTitle: {
      color: colors.textDark,
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
    },
    headerSub: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      marginTop: 1,
    },
    listContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    typingRow: {
      paddingBottom: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    typingText: {
      ...typography.bodySm,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    errorRow: {
      paddingBottom: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    errorText: {
      ...typography.bodySm,
      color: colors.error,
    },
    inputBar: {
      alignItems: 'flex-end',
      borderTopColor: colors.borderSubtle,
      borderTopWidth: 1,
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    input: {
      ...typography.body,
      backgroundColor: colors.chipBg,
      borderRadius: radius.lg,
      color: colors.textDark,
      flex: 1,
      maxHeight: 120,
      paddingHorizontal: spacing.smd,
      paddingVertical: spacing.sm,
    },
    sendBtn: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    sendBtnDisabled: {
      opacity: 0.4,
    },
    sendBtnPressed: {
      opacity: 0.85,
    },
    emptyState: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    emptyIconBadge: {
      alignItems: 'center',
      backgroundColor: colors.accentLight,
      borderRadius: radius.xxl,
      height: 64,
      justifyContent: 'center',
      marginBottom: spacing.md,
      width: 64,
    },
    emptyTitle: {
      color: colors.textDark,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    emptySub: {
      ...typography.bodySm,
      color: colors.textMuted,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    promptChips: {
      gap: spacing.sm,
      width: '100%',
    },
    promptChip: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.lg,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.smd,
    },
    promptChipPressed: {
      opacity: 0.7,
    },
    promptChipText: {
      ...typography.bodySm,
      color: colors.textDark,
    },
  });
