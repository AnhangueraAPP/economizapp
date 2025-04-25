
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFinance } from "@/context/FinanceContext";
import { MonthSelector } from "@/components/MonthSelector";
import { TransactionList } from "@/components/TransactionList";
import { DashboardStats } from "@/components/DashboardStats";
import { TransactionForm } from "@/components/TransactionForm";
import { CategoryManager } from "@/components/CategoryManager";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Plus, 
  LogOut, 
  User,
  ChevronDown,
  Home,
  BarChart3,
  PieChart,
  Settings as SettingsIcon,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { 
    addTransaction,
    getTransactionsByMonth,
    getMonthlyBalance,
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear
  } = useFinance();
  
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const handleCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };
  
  const monthlyTransactions = getTransactionsByMonth(currentMonth, currentYear);
  const monthlyBalance = getMonthlyBalance(currentMonth, currentYear);
  
  const sidebarItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'transactions', label: 'Transações', icon: BarChart3 },
    { id: 'categories', label: 'Categorias', icon: PieChart },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="flex items-center py-4">
                    <DollarSign className="h-6 w-6 text-finance-primary mr-2" />
                    <h1 className="text-xl font-bold">FinClaro</h1>
                  </div>
                  <div className="flex-1">
                    <nav className="space-y-1 py-4">
                      {sidebarItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={activeTab === item.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </Button>
                      ))}
                    </nav>
                  </div>
                  <div className="py-4">
                    <Button variant="outline" className="w-full" onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-finance-primary mr-2" />
              <h1 className="text-xl font-bold hidden md:block">FinClaro</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="default"
              size="sm"
              className="mr-2"
              onClick={() => setIsAddTransactionOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Nova Transação</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{user.name || user.email.split('@')[0]}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <aside className="hidden md:block w-64 bg-white border-r">
          <div className="p-4 space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-auto">
          <div className="container mx-auto">
            <div className="mb-6">
              <MonthSelector
                currentMonth={currentMonth}
                currentYear={currentYear}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToday={handleCurrentMonth}
              />
            </div>

            {activeTab === 'overview' && (
              <>
                <DashboardStats monthlyBalance={monthlyBalance} />
                <TransactionList 
                  transactions={monthlyTransactions.slice(0, 5)} 
                  title="Transações recentes"
                />
              </>
            )}

            {activeTab === 'transactions' && (
              <TransactionList 
                transactions={monthlyTransactions}
                title="Todas as transações" 
              />
            )}

            {activeTab === 'categories' && (
              <CategoryManager />
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Configurações</h2>
                <p className="text-muted-foreground mb-4">
                  Gerenciamento de conta e preferências do aplicativo.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Conta</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 rounded-md border">
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-md border">
                        <div>
                          <p className="font-medium">Nome</p>
                          <p className="text-sm text-muted-foreground">{user.name || 'Não configurado'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sessão</h3>
                    <Button variant="destructive" onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair da conta
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Add Transaction Dialog */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            onSubmit={(data) => {
              addTransaction(data);
              setIsAddTransactionOpen(false);
            }}
            onCancel={() => setIsAddTransactionOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
