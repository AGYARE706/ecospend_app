import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { AppStackParamList } from '../../navigation/types';
import StubScreen from '../stubs/StubScreen';

type AddGoalContributionRouteProp = RouteProp<
  AppStackParamList,
  'AddGoalContribution'
>;

export default function AddGoalContributionScreen() {
  const { params } = useRoute<AddGoalContributionRouteProp>();
  return <StubScreen title={`Add Contribution (${params.goalId})`} />;
}
