export type VaultStatus = 'active' | 'locked' | 'matured' | 'pending' | 'withdrawn';

export interface VaultContribution {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

export interface Vault {
  id: string;
  name: string;
  currentBalance: number;
  targetAmount: number;
  maturityDate: string;
  createdDate: string;
  estimatedWithdrawalFee: number;
  status: VaultStatus;
  accentColor: string;
  contributions: VaultContribution[];
  /** ISO date when funds were withdrawn — only present for withdrawn vaults */
  withdrawalDate?: string;
  /** Actual fee paid at withdrawal — only present for withdrawn vaults */
  feeCharged?: number;
}

export interface VaultSummary {
  totalBalance: number;
  activeVaultCount: number;
  nextMaturityDate: string | null;
}
