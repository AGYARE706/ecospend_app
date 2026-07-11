import { useCallback, useMemo, useState } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';
import { MOCK_SAVE_DELAY_MS } from '../data/mock/mockData';
import type { ProfileStackParamList } from '../navigation/types';
import { useProfile } from './useProfile';

type EditProfileNavProp = StackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;

export interface EditProfileFormErrors {
  fullName?: string;
}

export function useEditProfile(navigation: EditProfileNavProp) {
  const { updateProfile } = useAuth();
  const { name, phone, formattedPhone } = useProfile();

  const [fullName, setFullName] = useState(name);
  const [errors, setErrors] = useState<EditProfileFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const hasChanges = useMemo(
    () => fullName.trim() !== name.trim(),
    [fullName, name],
  );

  const validate = useCallback((): EditProfileFormErrors => {
    const next: EditProfileFormErrors = {};
    const trimmed = fullName.trim();

    if (!trimmed) {
      next.fullName = 'Full name is required';
    } else if (trimmed.length < 3) {
      next.fullName = 'Name must be at least 3 characters';
    }

    return next;
  }, [fullName]);

  const handleSave = useCallback(async () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_SAVE_DELAY_MS));

    updateProfile({ name: fullName.trim() });
    setIsLoading(false);
    navigation.goBack();
  }, [fullName, navigation, updateProfile, validate]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const setFullNameField = useCallback((value: string) => {
    setFullName(value);
    setErrors((prev) => ({ ...prev, fullName: undefined }));
  }, []);

  return {
    fullName,
    phone,
    formattedPhone,
    errors,
    isLoading,
    hasChanges,
    setFullNameField,
    handleSave,
    handleCancel,
  };
}
