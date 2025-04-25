import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { MonthlyBalance, CategorySummary } from "@/types/finance";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type DashboardStatsProps = {
  monthlyBalance: MonthlyBalance;
};

export const DashboardStats = ({ monthlyBalance }: DashboardStatsProps) => {
  const { categories, getCategorySummary, currentMonth, currentYear } = useFinance();
  const expenseSummary = getCategorySummary(currentMonth, currentYear, 'expense');
  const incomeSummary = getCategorySummary(currentMonth, currentYear, 'income');
  
  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'Desconhecido';
  };
  
  const getCategoryColor = (id: string) => {
    return categories.find(c => c.id === id)?.color || '#6b7280';
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const expensePercentage = monthlyBalance.incomes > 0
    ? (monthlyBalance.expenses / monthlyBalance.incomes) * 100
    : 0;
  
  const expenseChartData = expenseSummary.map(item => ({
    name: getCategoryName(item.categoryId),
    value: item.amount,
    color: getCategoryColor(item.categoryId),
  }));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Resumo do mês</CardTitle>
          <CardDescription>Balanço de receitas e despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Receitas</span>
              <span className="text-lg font-medium text-finance-income">
                {formatCurrency(monthlyBalance.incomes)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Despesas</span>
              <span className="text-lg font-medium text-finance-expense">
                {formatCurrency(monthlyBalance.expenses)}
              </span>
            </div>
            <div className="h-px bg-border my-2"></div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Saldo</span>
              <span className={`text-xl font-bold ${
                monthlyBalance.balance >= 0 ? 'text-finance-income' : 'text-finance-expense'
              }`}>
                {formatCurrency(monthlyBalance.balance)}
              </span>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Despesas vs. Receitas</span>
                <span className="text-xs font-medium">{expensePercentage.toFixed(0)}%</span>
              </div>
              <Progress 
                value={expensePercentage} 
                className={cn(
                  "h-2",
                  expensePercentage > 100 ? "bg-finance-expense" : "bg-finance-primary"
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Despesas por categoria</CardTitle>
          <CardDescription>Distribuição dos seus gastos</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseChartData.length > 0 ? (
            <div className="flex flex-col h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(name) => `Categoria: ${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                {expenseSummary.slice(0, 4).map((item) => (
                  <div key={item.categoryId} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                    ></div>
                    <span className="text-xs truncate">{getCategoryName(item.categoryId)}</span>
                    <span className="text-xs ml-1 text-muted-foreground">
                      ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">Sem despesas registradas neste mês.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
