import { Image } from 'react-native';
import type { ImageStyle, StyleProp } from 'react-native';

export interface GoalIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}

/** The app's savings-goal mark (target + arrow) — a raster brand asset, not part of the vector Icon set. */
export default function GoalIcon({ size = 24, color, style }: GoalIconProps) {
  return (
    <Image
      source={require('../../../assets/goal.png')}
      style={[{ height: size, tintColor: color, width: size }, style]}
      resizeMode="contain"
    />
  );
}
