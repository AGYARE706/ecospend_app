import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { AppStackParamList } from '../../navigation/types';
import StubScreen from '../stubs/StubScreen';

type EditBudgetEnvelopeRouteProp = RouteProp<
  AppStackParamList,
  'EditBudgetEnvelope'
>;

export default function EditBudgetEnvelopeScreen() {
  const { params } = useRoute<EditBudgetEnvelopeRouteProp>();
  return <StubScreen title={`Edit Envelope ${params.envelopeId}`} />;
}
