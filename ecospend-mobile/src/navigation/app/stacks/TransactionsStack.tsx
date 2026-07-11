import { createStackNavigator } from '@react-navigation/stack';

import EditTransactionScreen from '../../../screens/transactions/EditTransactionScreen';
import TransactionDetailsScreen from '../../../screens/transactions/TransactionDetailsScreen';
import TransactionsListScreen from '../../../screens/transactions/TransactionsListScreen';
import type { TransactionsStackParamList } from '../../types';

const Stack = createStackNavigator<TransactionsStackParamList>();

export default function TransactionsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransactionsList" component={TransactionsListScreen} />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        getId={({ params }) => params.transactionId}
      />
      <Stack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        getId={({ params }) => params.transactionId}
      />
    </Stack.Navigator>
  );
}
