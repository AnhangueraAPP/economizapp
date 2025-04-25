
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, CategoryType, TransactionType, MonthlyBalance, CategorySummary } from '@/types/finance';
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";

type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  editTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  categories: CategoryType[];
  addCategory: (category: Omit<CategoryType, 'id'>) => void;
  editCategory: (id: string, category: Partial<CategoryType>) => void;
  deleteCategory: (id: string) => void;
  getTransactionsByMonth: (month: number, year: number) => Transaction[];
  getMonthlyBalance: (month: number, year: number) => MonthlyBalance;
  getCategorySummary: (month: number, year: number, type: TransactionType) => CategorySummary[];
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  getRecurringTransactions: () => Transaction[];
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);

  // Load transactions from localStorage
  useEffect(() => {
    if (user) {
      const savedTransactions = localStorage.getItem(`transactions_${user.id}`);
      if (savedTransactions) {
        const parsedTransactions = JSON.parse(savedTransactions).map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(parsedTransactions);
      }
      
      // Set categories from user
      setCategories(user.categories || []);
    }
  }, [user]);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (user && transactions.length > 0) {
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      userId: user.id
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    toast({
      title: transaction.type === 'income' ? "Receita adicionada" : "Despesa adicionada",
      description: `${transaction.description} - R$ ${transaction.amount.toFixed(2)}`,
    });
  };

  const editTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => (t.id === id ? { ...t, ...transaction } : t))
    );
    
    toast({
      title: "Transação atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    
    toast({
      title: "Transação excluída",
      description: "A transação foi removida com sucesso.",
    });
  };

  const addCategory = (category: Omit<CategoryType, 'id'>) => {
    if (!user) return;
    
    const newCategory = {
      ...category,
      id: Date.now().toString()
    };
    
    setCategories(prev => [...prev, newCategory]);
    
    // Update user's categories in localStorage
    const updatedUser = {
      ...user,
      categories: [...categories, newCategory]
    };
    
    localStorage.setItem('financeUser', JSON.stringify(updatedUser));
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('financeUsers') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === user.id ? { ...u, categories: [...categories, newCategory] } : u
    );
    localStorage.setItem('financeUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "Categoria adicionada",
      description: `A categoria ${category.name} foi criada com sucesso.`,
    });
  };

  const editCategory = (id: string, category: Partial<CategoryType>) => {
    if (!user) return;
    
    const updatedCategories = categories.map(c => 
      c.id === id ? { ...c, ...category } : c
    );
    
    setCategories(updatedCategories);
    
    // Update user's categories in localStorage
    const updatedUser = {
      ...user,
      categories: updatedCategories
    };
    
    localStorage.setItem('financeUser', JSON.stringify(updatedUser));
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('financeUsers') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === user.id ? { ...u, categories: updatedCategories } : u
    );
    localStorage.setItem('financeUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "Categoria atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const deleteCategory = (id: string) => {
    if (!user) return;
    
    // Check if category is used in any transaction
    const isUsed = transactions.some(t => t.categoryId === id);
    if (isUsed) {
      toast({
        title: "Não foi possível excluir",
        description: "Esta categoria está sendo usada em transações.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if it's a default category
    const isDefault = categories.find(c => c.id === id)?.isDefault;
    if (isDefault) {
      toast({
        title: "Não foi possível excluir",
        description: "Categorias padrão não podem ser excluídas.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedCategories = categories.filter(c => c.id !== id);
    setCategories(updatedCategories);
    
    // Update user's categories in localStorage
    const updatedUser = {
      ...user,
      categories: updatedCategories
    };
    
    localStorage.setItem('financeUser', JSON.stringify(updatedUser));
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('financeUsers') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === user.id ? { ...u, categories: updatedCategories } : u
    );
    localStorage.setItem('financeUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "Categoria excluída",
      description: "A categoria foi removida com sucesso.",
    });
  };

  const getTransactionsByMonth = (month: number, year: number) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === month && 
        transactionDate.getFullYear() === year
      );
    });
  };

  const getMonthlyBalance = (month: number, year: number) => {
    const monthlyTransactions = getTransactionsByMonth(month, year);
    
    const incomes = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      month,
      year,
      incomes,
      expenses,
      balance: incomes - expenses
    };
  };

  const getCategorySummary = (month: number, year: number, type: TransactionType): CategorySummary[] => {
    const monthlyTransactions = getTransactionsByMonth(month, year)
      .filter(t => t.type === type);
    
    const totalAmount = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    const categoryAmounts = new Map<string, number>();
    monthlyTransactions.forEach(transaction => {
      const { categoryId, amount } = transaction;
      const current = categoryAmounts.get(categoryId) || 0;
      categoryAmounts.set(categoryId, current + amount);
    });
    
    // Convert to array and calculate percentages
    const summary: CategorySummary[] = Array.from(categoryAmounts.entries())
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        percentage: totalAmount ? (amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
    
    return summary;
  };

  const getRecurringTransactions = () => {
    return transactions.filter(t => t.isRecurring);
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      addTransaction,
      editTransaction,
      deleteTransaction,
      categories,
      addCategory,
      editCategory,
      deleteCategory,
      getTransactionsByMonth,
      getMonthlyBalance,
      getCategorySummary,
      currentMonth,
      currentYear,
      setCurrentMonth,
      setCurrentYear,
      getRecurringTransactions
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
