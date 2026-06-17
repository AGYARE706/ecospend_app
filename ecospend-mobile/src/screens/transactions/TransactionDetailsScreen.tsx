import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { TransactionsStackParamList } from '../../navigation/types';
import StubScreen from '../stubs/StubScreen';

type TransactionDetailsRouteProp = RouteProp<
  TransactionsStackParamList,
  'TransactionDetails'
>;

export default function TransactionDetailsScreen() {
  const { params } = useRoute<TransactionDetailsRouteProp>();
  return <StubScreen title={`Transaction ${params.transactionId}`} />;
}
