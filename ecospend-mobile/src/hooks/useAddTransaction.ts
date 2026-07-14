import { useCallback, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import { useFinance } from '../context/FinanceContext';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import type { AppStackParamList } from '../navigation/types';
import type {
  AddTransactionFormErrors,
  Provider,
  TransactionCategory,
  TransactionType,
} from '../types';

type AddTransactionNavigationProp = StackNavigationProp<
  AppStackParamList,
  'AddTransaction'
>;

interface AddTransactionFormState {
  type: TransactionType;
  amount: string;
  provider: Provider | null;
  category: TransactionCategory | null;
  notes: string;
  date: Date;
}

type FormField = keyof AddTransactionFormState;

export function useAddTransaction(navigation: AddTransactionNavigationProp) {
  const { addTransaction } = useFinance();
  const [formState, setFormState] = useState<AddTransactionFormState>({
    type: 'expense',
    amount: '',
    provider: null,
    category: null,
    notes: '',
    date: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<AddTransactionFormErrors>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const parsedAmount = parseFloat(formState.amount);

  const setField = useCallback(<K extends FormField>(
    field: K,
    value: AddTransactionFormState[K],
  ) => {
    setFormState((current) => {
      const next = { ...current, [field]: value };

      if (field === 'type' && value === 'income') {
        next.provider = null;
      }

      return next;
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  const validate = useCallback((): AddTransactionFormErrors => {
    const nextErrors: AddTransactionFormErrors = {};

    if (!parsedAmount || parsedAmount <= 0) {
      nextErrors.amount = 'Amount must be greater than 0';
    }

    if (!formState.category) {
      nextErrors.category = 'Please select a category';
    }

    return nextErrors;
  }, [formState.category, parsedAmount]);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !formState.category) {
      return false;
    }

    setIsLoading(true);

    try {
      await addTransaction({
        type: formState.type,
        amount: parsedAmount,
        category: formState.category,
        provider:
          formState.type === 'expense' ? formState.provider ?? undefined : undefined,
        notes: formState.notes.trim() || undefined,
        date: formState.date.toISOString(),
      });

      setShowSuccessToast(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1200);
      return true;
    } catch (error) {
      setErrors({
        amount: getApiErrorMessage(error, 'Could not save transaction'),
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    addTransaction,
    formState.category,
    formState.date,
    formState.notes,
    formState.provider,
    formState.type,
    navigation,
    parsedAmount,
    validate,
  ]);

  const dismissSuccessToast = useCallback(() => {
    setShowSuccessToast(false);
  }, []);

  return {
    formState,
    setField,
    handleSubmit,
    isLoading,
    errors,
    showSuccessToast,
    dismissSuccessToast,
  };
}
