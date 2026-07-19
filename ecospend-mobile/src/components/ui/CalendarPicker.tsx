import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from './icons';
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  useTheme,
  useThemedStyles,
} from '../../theme';
import type { ThemeColors } from '../../theme';

/**
 * Inline month-grid calendar for picking a date — no native dependency,
 * consistent on every platform. Dates before `minDate` (default: today)
 * are disabled, so past deadlines simply cannot be entered.
 */
export interface CalendarPickerProps {
  /** Selected date as YYYY-MM-DD (local). */
  value?: string | null;
  onSelect: (isoDate: string) => void;
  /** Earliest selectable day (inclusive). Defaults to today. */
  minDate?: Date;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPicker({ value, onSelect, minDate }: CalendarPickerProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const min = startOfDay(minDate ?? new Date());
  const today = startOfDay(new Date());

  const selected = useMemo(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  const [viewYear, setViewYear] = useState(
    (selected ?? min).getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    (selected ?? min).getMonth(),
  );

  const canGoBack =
    viewYear > min.getFullYear() ||
    (viewYear === min.getFullYear() && viewMonth > min.getMonth());

  const goMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => goMonth(-1)}
          disabled={!canGoBack}
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          accessibilityLabel="Previous month"
        >
          <Icon
            name="chevron-left"
            size={16}
            color={canGoBack ? colors.textDark : colors.textDisabled}
            strokeWidth={2.2}
          />
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <Pressable
          onPress={() => goMonth(1)}
          style={styles.navButton}
          accessibilityLabel="Next month"
        >
          <Icon name="chevron-right" size={16} color={colors.textDark} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (day === null) {
            return <View key={`blank-${index}`} style={styles.cell} />;
          }

          const cellDate = new Date(viewYear, viewMonth, day);
          const disabled = cellDate < min;
          const isSelected =
            selected !== null && cellDate.getTime() === selected.getTime();
          const isToday = cellDate.getTime() === today.getTime();

          return (
            <Pressable
              key={day}
              disabled={disabled}
              onPress={() => onSelect(toIso(viewYear, viewMonth, day))}
              style={[
                styles.cell,
                isToday && !isSelected && styles.todayCell,
                isSelected && { backgroundColor: colors.primary },
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected: isSelected }}
            >
              <Text
                style={[
                  styles.dayText,
                  disabled && styles.dayTextDisabled,
                  isSelected && styles.dayTextSelected,
                ]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderSubtle,
      borderRadius: radius.md,
      borderWidth: 1,
      padding: spacing.sm,
    },
    headerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    navButton: {
      alignItems: 'center',
      backgroundColor: colors.chipBg,
      borderRadius: radius.sm,
      height: 30,
      justifyContent: 'center',
      width: 30,
    },
    navButtonDisabled: {
      opacity: 0.4,
    },
    monthLabel: {
      color: colors.textDark,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    weekRow: {
      flexDirection: 'row',
      marginBottom: spacing.xxs,
    },
    weekday: {
      color: colors.textLight,
      flexBasis: `${100 / 7}%`,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      alignItems: 'center',
      borderRadius: radius.sm,
      flexBasis: `${100 / 7}%`,
      justifyContent: 'center',
      minHeight: 36,
    },
    todayCell: {
      borderColor: colors.primary,
      borderWidth: 1,
    },
    dayText: {
      color: colors.textDark,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
    },
    dayTextDisabled: {
      color: colors.textDisabled,
    },
    dayTextSelected: {
      color: colors.onPrimary,
      fontWeight: fontWeight.bold,
    },
  });
