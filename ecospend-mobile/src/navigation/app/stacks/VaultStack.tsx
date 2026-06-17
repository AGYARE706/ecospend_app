import { createStackNavigator } from '@react-navigation/stack';

import GroupVaultDashboardScreen from '../../../screens/group-vault/GroupVaultDashboardScreen';
import GroupVaultDetailsScreen from '../../../screens/group-vault/GroupVaultDetailsScreen';
import WithdrawalApprovalScreen from '../../../screens/group-vault/WithdrawalApprovalScreen';
import VaultDashboardScreen from '../../../screens/vault/VaultDashboardScreen';
import VaultDetailsScreen from '../../../screens/vault/VaultDetailsScreen';
import VaultHistoryScreen from '../../../screens/vault/VaultHistoryScreen';
import type { VaultStackParamList } from '../../types';

const Stack = createStackNavigator<VaultStackParamList>();

export default function VaultStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VaultDashboard" component={VaultDashboardScreen} />
      <Stack.Screen name="VaultDetails" component={VaultDetailsScreen} />
      <Stack.Screen name="VaultHistory" component={VaultHistoryScreen} />
      <Stack.Screen
        name="GroupVaultDashboard"
        component={GroupVaultDashboardScreen}
      />
      <Stack.Screen
        name="GroupVaultDetails"
        component={GroupVaultDetailsScreen}
      />
      <Stack.Screen
        name="WithdrawalApproval"
        component={WithdrawalApprovalScreen}
      />
    </Stack.Navigator>
  );
}
