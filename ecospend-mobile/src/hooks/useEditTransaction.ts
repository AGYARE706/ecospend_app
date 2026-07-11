import { useCallback, useEffect, useMemo, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';

import { useFinance } from '../context/FinanceContext';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import type { TransactionsStackParamList } from '../navigation/types';
import type {
  AddTransactionFormErrors,
  Provider,
  TransactionCategory,
  TransactionType,
} from '../types';
import { calculateMoMoFee } from '../utils/fees';

type EditTransactionNavigationProp = StackNavigationProp<
  TransactionsStackParamList,
  'EditTransaction'
>;

interface EditTransactionFormState {
  type: TransactionType;
  amount: string;
  provider: Provider | null;
  category: TransactionCategory | null;
  notes: string;
  date: Date;
}

type FormField = keyof EditTransactionFormState;

export function useEditTransaction(
  transactionId: string,
  navigation: EditTransactionNavigationProp,
) {
  const {
    getTransactionById,
    updateTransaction,
    deleteTransaction,
  } = useFinance();
  const existing = getTransactionById(transactionId);

  const [formState, setFormState] = useState<EditTransactionFormState>({
    type: 'expense',
    amount: '',
    provider: null,
    category: null,
    notes: '',
    date: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<AddTransactionFormErrors>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!existing || initialized) {
      return;
    }

    setFormState({
      type: existing.type,
      amount: String(existing.amount),
      provider: existing.provider ?? null,
      category: existing.category,
      notes: existing.notes ?? '',
      date: new Date(existing.date),
    });
    setInitialized(true);
  }, [existing, initialized]);

  const parsedAmount = parseFloat(formState.amount);

  const feePreview = useMemo(() => {
    if (
      formState.type !== 'expense' ||
      !formState.provider ||
      !parsedAmount ||
      parsedAmount <= 0
    ) {
      return null;
    }

    const providerFee = calculateMoMoFee(parsedAmount, formState.provider);
    return {
      providerFee,
      totalCost: parsedAmount + providerFee,
    };
  }, [formState.provider, formState.type, parsedAmount]);

  const setField = useCallback(
    <K extends FormField>(field: K, value: EditTransactionFormState[K]) => {
      setFormState((current) => {
        const next = { ...current, [field]: value };

        if (field === 'type' && value === 'income') {
          next.provider = null;
        }

        return next;
      });
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    [],
  );

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
    if (!existing) {
      return false;
    }

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !formState.category) {
      return false;
    }

    setIsLoading(true);
    try {
      await updateTransaction(existing.id, {
        type: formState.type,
        amount: parsedAmount,
        category: formState.category,
        provider:
          formState.type === 'expense'
            ? formState.provider ?? undefined
            : undefined,
        notes: formState.notes.trim() || undefined,
        date: formState.date.toISOString(),
      });

      setShowSuccessToast(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
      return true;
    } catch (error) {
      setErrors({
        amount: getApiErrorMessage(error, 'Could not update transaction'),
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    existing,
    formState.category,
    formState.date,
    formState.notes,
    formState.provider,
    formState.type,
    navigation,
    parsedAmount,
    updateTransaction,
    validate,
  ]);

  const handleDelete = useCallback(async () => {
    if (!existing) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTransaction(existing.id);
      navigation.popToTop();
    } catch (error) {
      setErrors({
        amount: getApiErrorMessage(error, 'Could not delete transaction'),
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTransaction, existing, navigation]);

  return {
    isFound: Boolean(existing),
    formState,
    setField,
    handleSubmit,
    handleDelete,
    isLoading,
    isDeleting,
    errors,
    feePreview,
    showSuccessToast,
  };
}
