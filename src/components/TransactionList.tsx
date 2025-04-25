
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction, CategoryType } from "@/types/finance";
import { useFinance } from "@/context/FinanceContext";
import { 
  Trash2, 
  Edit, 
  Search,
  ArrowUp,
  ArrowDown,
  Calendar,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "./TransactionForm";

type TransactionListProps = {
  transactions: Transaction[];
  title?: string;
};

export const TransactionList = ({ 
  transactions, 
  title = "Transações" 
}: TransactionListProps) => {
  const { categories, deleteTransaction, editTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };
  
  const handleUpdate = (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (editingTransaction) {
      editTransaction(editingTransaction.id, data);
      setEditingTransaction(null);
    }
  };
  
  const getCategoryById = (id: string): CategoryType | undefined => {
    return categories.find(category => category.id === id);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transação..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredTransactions.length > 0 ? (
        <ul className="divide-y">
          {filteredTransactions.map(transaction => {
            const category = getCategoryById(transaction.categoryId);
            return (
              <li key={transaction.id} className="transaction-card">
                <div className="flex items-center">
                  <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center mr-3
                    ${transaction.type === 'income' ? 'bg-finance-income/20' : 'bg-finance-expense/20'}
                  `}>
                    {transaction.type === 'income' ? (
                      <ArrowUp className="h-5 w-5 text-finance-income" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-finance-expense" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                      
                      {transaction.isRecurring && (
                        <div className="flex items-center ml-2">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          <span>{transaction.recurringFrequency === 'monthly' ? 'Mensal' : 
                                transaction.recurringFrequency === 'weekly' ? 'Semanal' : 'Anual'}</span>
                        </div>
                      )}
                      
                      {category && (
                        <div className="ml-2 flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-1" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span>{category.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`text-lg font-semibold mr-4 ${
                    transaction.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    R$ {transaction.amount.toFixed(2)}
                  </span>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir transação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTransaction(transaction.id)}
                          >
                            Sim, excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "Nenhuma transação encontrada para esta busca." : "Nenhuma transação registrada."}
        </div>
      )}
      
      {/* Edit transaction dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar transação</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              initialData={editingTransaction}
              onSubmit={handleUpdate}
              title="Editar transação"
              submitLabel="Atualizar"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
