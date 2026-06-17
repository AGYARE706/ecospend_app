import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { AuthStackParamList } from '../../navigation/types';
import StubScreen from '../stubs/StubScreen';

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const { params } = useRoute<ResetPasswordRouteProp>();
  return <StubScreen title={`Reset Password (${params.phone})`} />;
}
