import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useAuth } from '../context/AuthContext';

/** Square, small, and compressed — keeps the base64 payload well under the backend's cap. */
const TARGET_DIMENSION = 400;
const JPEG_COMPRESSION = 0.5;

/** Lets the user pick a photo from their library and uploads it as their profile picture. */
export function useProfilePhoto() {
  const { updatePhoto } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const pickAndUpload = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo library access to choose a profile picture.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    setIsUploading(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: TARGET_DIMENSION, height: TARGET_DIMENSION } }],
        {
          compress: JPEG_COMPRESSION,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );

      if (!manipulated.base64) {
        throw new Error('Could not process the image');
      }

      await updatePhoto(`data:image/jpeg;base64,${manipulated.base64}`);
    } catch (error) {
      Alert.alert(
        'Could not update photo',
        getApiErrorMessage(error, 'Please try a different image'),
      );
    } finally {
      setIsUploading(false);
    }
  }, [updatePhoto]);

  return { pickAndUpload, isUploading };
}
