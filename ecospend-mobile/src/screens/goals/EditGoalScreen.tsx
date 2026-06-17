import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { GoalsStackParamList } from '../../navigation/types';
import StubScreen from '../stubs/StubScreen';

type EditGoalRouteProp = RouteProp<GoalsStackParamList, 'EditGoal'>;

export default function EditGoalScreen() {
  const { params } = useRoute<EditGoalRouteProp>();
  return <StubScreen title={`Edit Goal ${params.goalId}`} />;
}
