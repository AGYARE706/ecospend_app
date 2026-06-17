import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import { useEditProfile } from '../../hooks/useEditProfile';
import type { ProfileStackParamList } from '../../navigation/types';
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  shadowMd,
  shadowSm,
  spacing,
} from '../../theme';

type EditProfileNavProp = StackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export default function EditProfileScreen() {
  const navigation = useNavigation<EditProfileNavProp>();
  const {
    fullName,
    formattedPhone,
    errors,
    isLoading,
    hasChanges,
    setFullNameField,
    handleSave,
    handleCancel,
  } = useEditProfile(navigation);

  return (
    <ScreenWrapper background="page" keyboardAvoiding padded={false}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backBtnPressed,
            ]}
            hitSlop={spacing.sm}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <Text style={styles.headerSub}>Update your account details</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <View style={styles.photoRing}>
              <LinearGradient
                colors={[colors.primaryDark, colors.primary]}
                style={styles.photoAvatar}
              >
                <Text style={styles.photoInitials}>
                  {getInitials(fullName || 'User')}
                </Text>
              </LinearGradient>
              <Pressable
                style={({ pressed }) => [
                  styles.cameraBtn,
                  pressed && styles.cameraBtnPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                <Ionicons name="camera" size={16} color={colors.white} />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.changePhotoBtn,
                pressed && styles.changePhotoBtnPressed,
              ]}
            >
              <Ionicons name="image-outline" size={16} color={colors.primary} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
            <Text style={styles.photoHint}>
              JPG or PNG. Max size 5 MB.
            </Text>
          </View>

          {/* Form */}
          <Text style={styles.sectionLabel}>Personal Information</Text>
          <View style={styles.formCard}>
            <AppInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullNameField}
              placeholder="Enter your full name"
              error={errors.fullName}
            />

            <View style={styles.fieldSpacer} />

            <Text style={styles.readonlyLabel}>Phone Number</Text>
            <View style={styles.readonlyField}>
              <View style={styles.readonlyLeft}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={colors.textMuted}
                />
                <Text style={styles.readonlyValue}>{formattedPhone}</Text>
              </View>
              <View style={styles.readonlyBadge}>
                <Ionicons name="lock-closed" size={11} color={colors.textMuted} />
                <Text style={styles.readonlyBadgeText}>Read-only</Text>
              </View>
            </View>
            <Text style={styles.readonlyHint}>
              Phone number is linked to your account and cannot be changed here.
            </Text>
          </View>

          {/* Info card */}
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Your profile name appears across vaults, goals, and group savings
              activity.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Sticky footer */}
        <View style={styles.footer}>
          <AppButton
            title="Save Changes"
            icon="checkmark-circle-outline"
            onPress={() => {
              void handleSave();
            }}
            loading={isLoading}
            disabled={!hasChanges}
          />
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && styles.cancelBtnPressed,
            ]}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backBtnPressed: {
    backgroundColor: colors.chipBg,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
    ...shadowSm,
  },
  photoRing: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  photoAvatar: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 96,
    justifyContent: 'center',
    width: 96,
    ...shadowMd,
  },
  photoInitials: {
    color: colors.white,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  cameraBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 3,
    bottom: 0,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 34,
  },
  cameraBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  changePhotoBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.full,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  changePhotoBtnPressed: {
    opacity: 0.85,
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  photoHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  sectionLabel: {
    color: colors.textDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  formCard: {
    backgroundColor: colors.white,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadowSm,
  },
  fieldSpacer: {
    height: spacing.md,
  },
  readonlyLabel: {
    color: colors.textDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  readonlyField: {
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  readonlyLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  readonlyValue: {
    color: colors.textGrey,
    flex: 1,
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
  },
  readonlyBadge: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  readonlyBadgeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    marginLeft: 4,
  },
  readonlyHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  infoCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.primaryBackground,
    borderColor: `${colors.primary}33`,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  infoText: {
    color: colors.textGrey,
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginLeft: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadowMd,
  },
  cancelBtn: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  cancelBtnPressed: {
    opacity: 0.6,
  },
  cancelBtnText: {
    color: colors.textGrey,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
