import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { TransactionsStackParamList } from '../../navigation/types';
import StubScreen from '../stubs/StubScreen';

type EditTransactionRouteProp = RouteProp<
  TransactionsStackParamList,
  'EditTransaction'
>;

export default function EditTransactionScreen() {
  const { params } = useRoute<EditTransactionRouteProp>();
  return <StubScreen title={`Edit Transaction ${params.transactionId}`} />;
}
