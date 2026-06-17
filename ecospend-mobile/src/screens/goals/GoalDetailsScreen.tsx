import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import type { GoalsStackParamList } from '../../navigation/types';
import StubScreen from '../stubs/StubScreen';

type GoalDetailsRouteProp = RouteProp<GoalsStackParamList, 'GoalDetails'>;

export default function GoalDetailsScreen() {
  const { params } = useRoute<GoalDetailsRouteProp>();
  return <StubScreen title={`Goal ${params.goalId}`} />;
}
