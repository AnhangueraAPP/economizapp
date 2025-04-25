
export type TransactionType = 'income' | 'expense';

export type CategoryType = {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: Date;
  categoryId: string;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  userId: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  categories: CategoryType[];
};

export type MonthlyBalance = {
  month: number;
  year: number;
  incomes: number;
  expenses: number;
  balance: number;
};

export type CategorySummary = {
  categoryId: string;
  amount: number;
  percentage: number;
};
