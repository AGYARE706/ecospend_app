import type { Vault, VaultSummary } from '../../types/vault';

export const mockVaults: Vault[] = [
  {
    id: 'vault-emergency',
    name: 'Emergency Fund',
    currentBalance: 8500,
    targetAmount: 15000,
    maturityDate: '2026-08-30',
    createdDate: '2026-01-10',
    estimatedWithdrawalFee: 170,
    status: 'active',
    accentColor: '#2E7D32',
    contributions: [
      { id: 'c1', date: '2026-01-10', amount: 5000, note: 'Initial deposit' },
      { id: 'c2', date: '2026-02-14', amount: 1500, note: 'February top-up' },
      { id: 'c3', date: '2026-03-28', amount: 1200 },
      { id: 'c4', date: '2026-05-01', amount: 800, note: 'Bonus savings' },
    ],
  },
  {
    id: 'vault-rent',
    name: 'Rent Vault',
    currentBalance: 4200,
    targetAmount: 6000,
    maturityDate: '2026-07-01',
    createdDate: '2026-02-01',
    estimatedWithdrawalFee: 84,
    status: 'active',
    accentColor: '#1565C0',
    contributions: [
      { id: 'c5', date: '2026-02-01', amount: 3000, note: 'Initial deposit' },
      { id: 'c6', date: '2026-04-15', amount: 1200 },
    ],
  },
  {
    id: 'vault-school',
    name: 'School Fees',
    currentBalance: 12000,
    targetAmount: 12000,
    maturityDate: '2026-06-20',
    createdDate: '2025-09-01',
    estimatedWithdrawalFee: 0,
    status: 'matured',
    accentColor: '#6A1B9A',
    contributions: [
      { id: 'c7', date: '2025-09-01', amount: 8000, note: 'Initial deposit' },
      { id: 'c8', date: '2025-11-10', amount: 2000 },
      { id: 'c9', date: '2026-01-22', amount: 2000, note: 'Final top-up' },
    ],
  },
  {
    id: 'vault-gadget',
    name: 'Gadget Upgrade',
    currentBalance: 1800,
    targetAmount: 5000,
    maturityDate: '2026-09-15',
    createdDate: '2026-04-20',
    estimatedWithdrawalFee: 36,
    status: 'locked',
    accentColor: '#E65100',
    contributions: [
      { id: 'c10', date: '2026-04-20', amount: 1500, note: 'Initial deposit' },
      { id: 'c11', date: '2026-05-20', amount: 300 },
    ],
  },
  {
    id: 'vault-holiday',
    name: 'Holiday Fund',
    currentBalance: 0,
    targetAmount: 8000,
    maturityDate: '2025-12-15',
    createdDate: '2025-04-01',
    estimatedWithdrawalFee: 0,
    status: 'withdrawn',
    accentColor: '#0277BD',
    withdrawalDate: '2025-12-16',
    feeCharged: 160,
    contributions: [
      { id: 'c12', date: '2025-04-01', amount: 4000, note: 'Initial deposit' },
      { id: 'c13', date: '2025-07-10', amount: 2500 },
      { id: 'c14', date: '2025-10-05', amount: 1500, note: 'Final top-up' },
    ],
  },
  {
    id: 'vault-car',
    name: 'Car Savings',
    currentBalance: 0,
    targetAmount: 25000,
    maturityDate: '2025-06-30',
    createdDate: '2024-06-01',
    estimatedWithdrawalFee: 0,
    status: 'withdrawn',
    accentColor: '#37474F',
    withdrawalDate: '2025-07-02',
    feeCharged: 1250,
    contributions: [
      { id: 'c15', date: '2024-06-01', amount: 10000, note: 'Initial deposit' },
      { id: 'c16', date: '2024-09-15', amount: 8000 },
      { id: 'c17', date: '2024-12-01', amount: 4000, note: 'Year-end bonus' },
      { id: 'c18', date: '2025-03-20', amount: 3000 },
    ],
  },
];

export function buildVaultSummary(vaults: Vault[]): VaultSummary {
  const activeVaults = vaults.filter((vault) => vault.status === 'active');

  const nextMaturityDate =
    activeVaults.length > 0
      ? activeVaults
          .map((vault) => vault.maturityDate)
          .sort(
            (left, right) =>
              new Date(left).getTime() - new Date(right).getTime(),
          )[0]
      : null;

  return {
    totalBalance: vaults.reduce((sum, vault) => sum + vault.currentBalance, 0),
    activeVaultCount: activeVaults.length,
    nextMaturityDate,
  };
}

export const mockVaultSummary = buildVaultSummary(mockVaults);
