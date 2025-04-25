
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transacao, Categoria, TipoTransacao, BalancoMensal, CategoriaSumario, Transaction, CategoryType, MonthlyBalance, CategorySummary } from '@/types/finance';
import { useAuth } from './AuthContext';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type FinanceContextType = {
  transacoes: Transacao[];
  adicionarTransacao: (transacao: Omit<Transacao, 'id' | 'usuario_id'>) => Promise<void>;
  editarTransacao: (id: string, transacao: Partial<Omit<Transacao, 'id' | 'usuario_id'>>) => Promise<void>;
  deletarTransacao: (id: string) => Promise<void>;
  categorias: Categoria[];
  adicionarCategoria: (categoria: Omit<Categoria, 'id' | 'usuario_id'>) => Promise<void>;
  editarCategoria: (id: string, categoria: Partial<Omit<Categoria, 'id' | 'usuario_id'>>) => Promise<void>;
  deletarCategoria: (id: string) => Promise<void>;
  getTransacoesPorMes: (mes: number, ano: number) => Transacao[];
  getBalancoMensal: (mes: number, ano: number) => BalancoMensal;
  getCategoriaSumario: (mes: number, ano: number, tipo: TipoTransacao) => CategoriaSumario[];
  mesAtual: number;
  anoAtual: number;
  setMesAtual: (mes: number) => void;
  setAnoAtual: (ano: number) => void;
  getTransacoesRecorrentes: () => Transacao[];
  // Aliases para compatibilidade com código existente
  transactions: Transacao[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'usuario_id'>) => Promise<void>;
  editTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id' | 'usuario_id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  categories: Categoria[];
  addCategory: (category: Omit<CategoryType, 'id' | 'usuario_id'>) => Promise<void>;
  editCategory: (id: string, category: Partial<Omit<CategoryType, 'id' | 'usuario_id'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getTransactionsByMonth: (month: number, year: number) => Transacao[];
  getMonthlyBalance: (month: number, year: number) => BalancoMensal;
  getCategorySummary: (month: number, year: number, type: TipoTransacao) => CategoriaSumario[];
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  getRecurringTransactions: () => Transacao[];
};

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const hoje = new Date();
  
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Carregar categorias do usuário
  useEffect(() => {
    if (user) {
      const carregarCategorias = async () => {
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .order('nome');

        if (error) {
          console.error('Erro ao carregar categorias:', error);
          toast({
            title: "Erro ao carregar categorias",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        // Converter os dados do banco para o formato das categorias
        const categoriasConvertidas = data.map(c => ({
          ...c,
          tipo: c.tipo as TipoTransacao
        }));

        setCategorias(categoriasConvertidas);
      };

      carregarCategorias();
    }
  }, [user, toast]);

  // Carregar transações do usuário
  useEffect(() => {
    if (user) {
      const carregarTransacoes = async () => {
        const { data, error } = await supabase
          .from('transacoes')
          .select('*')
          .order('data', { ascending: false });

        if (error) {
          console.error('Erro ao carregar transações:', error);
          toast({
            title: "Erro ao carregar transações",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        const transacoesConvertidas = data.map(t => ({
          ...t,
          data: new Date(t.data),
          tipo: t.tipo as TipoTransacao,
          frequencia_recorrente: t.frequencia_recorrente as FrequenciaRecorrente | undefined
        }));

        setTransacoes(transacoesConvertidas);
      };

      carregarTransacoes();
    }
  }, [user, toast]);

  const adicionarTransacao = async (transacao: Omit<Transacao, 'id' | 'usuario_id'>) => {
    if (!user) return;

    // Converter data para formato ISO string para o Supabase
    const transacaoParaInserir = {
      ...transacao,
      data: transacao.data.toISOString().split('T')[0], // formato YYYY-MM-DD
      usuario_id: user.id
    };

    const { data, error } = await supabase
      .from('transacoes')
      .insert([transacaoParaInserir])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao adicionar transação",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Converter data de volta para objeto Date para a UI
    const novaTransacao = {
      ...data,
      data: new Date(data.data),
      tipo: data.tipo as TipoTransacao,
      frequencia_recorrente: data.frequencia_recorrente as FrequenciaRecorrente | undefined
    };

    setTransacoes(prev => [novaTransacao, ...prev]);
    
    toast({
      title: transacao.tipo === 'receita' ? "Receita adicionada" : "Despesa adicionada",
      description: `${transacao.descricao} - R$ ${transacao.valor.toFixed(2)}`,
    });
  };

  const editarTransacao = async (id: string, transacao: Partial<Omit<Transacao, 'id' | 'usuario_id'>>) => {
    // Se tiver data, converter para formato ISO string
    const transacaoParaAtualizar = {
      ...transacao,
      ...(transacao.data && { data: transacao.data.toISOString().split('T')[0] })
    };

    const { error } = await supabase
      .from('transacoes')
      .update(transacaoParaAtualizar)
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao atualizar transação",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setTransacoes(prev => 
      prev.map(t => {
        if (t.id === id) {
          return { ...t, ...transacao };
        }
        return t;
      })
    );
    
    toast({
      title: "Transação atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const deletarTransacao = async (id: string) => {
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setTransacoes(prev => prev.filter(t => t.id !== id));
    
    toast({
      title: "Transação excluída",
      description: "A transação foi removida com sucesso.",
    });
  };

  const adicionarCategoria = async (categoria: Omit<Categoria, 'id' | 'usuario_id'>) => {
    if (!user) return;
    
    const categoriaParaInserir = {
      ...categoria,
      usuario_id: user.id
    };
    
    const { data, error } = await supabase
      .from('categorias')
      .insert([categoriaParaInserir])
      .select()
      .single();
      
    if (error) {
      toast({
        title: "Erro ao adicionar categoria",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    const novaCategoria = {
      ...data,
      tipo: data.tipo as TipoTransacao
    };
    
    setCategorias(prev => [...prev, novaCategoria]);
    
    toast({
      title: "Categoria adicionada",
      description: `A categoria ${categoria.nome} foi criada com sucesso.`,
    });
  };

  const editarCategoria = async (id: string, categoria: Partial<Omit<Categoria, 'id' | 'usuario_id'>>) => {
    const { error } = await supabase
      .from('categorias')
      .update(categoria)
      .eq('id', id);
      
    if (error) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    setCategorias(prev => 
      prev.map(c => {
        if (c.id === id) {
          return { ...c, ...categoria };
        }
        return c;
      })
    );
    
    toast({
      title: "Categoria atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const deletarCategoria = async (id: string) => {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);
      
    if (error) {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    setCategorias(prev => prev.filter(c => c.id !== id));
    
    toast({
      title: "Categoria excluída",
      description: "A categoria foi removida com sucesso.",
    });
  };

  const getTransacoesPorMes = (mes: number, ano: number) => {
    return transacoes.filter(transacao => {
      const data = new Date(transacao.data);
      return data.getMonth() === mes && data.getFullYear() === ano;
    });
  };

  const getBalancoMensal = (mes: number, ano: number) => {
    const transacoesMensais = getTransacoesPorMes(mes, ano);
    
    const receitas = transacoesMensais
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
      
    const despesas = transacoesMensais
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
      
    return {
      mes,
      ano,
      receitas,
      despesas,
      saldo: receitas - despesas
    };
  };

  const getCategoriaSumario = (mes: number, ano: number, tipo: TipoTransacao): CategoriaSumario[] => {
    const transacoesMensais = getTransacoesPorMes(mes, ano)
      .filter(t => t.tipo === tipo);
    
    const valorTotal = transacoesMensais.reduce((sum, t) => sum + t.valor, 0);
    
    // Agrupar por categoria
    const valoresPorCategoria = new Map<string, number>();
    transacoesMensais.forEach(transacao => {
      const { categoria_id, valor } = transacao;
      const atual = valoresPorCategoria.get(categoria_id) || 0;
      valoresPorCategoria.set(categoria_id, atual + valor);
    });
    
    // Converter para array e calcular porcentagens
    const sumario: CategoriaSumario[] = Array.from(valoresPorCategoria.entries())
      .map(([categoria_id, valor]) => ({
        categoria_id,
        valor,
        porcentagem: valorTotal ? (valor / valorTotal) * 100 : 0
      }))
      .sort((a, b) => b.valor - a.valor);
    
    return sumario;
  };

  const getTransacoesRecorrentes = () => {
    return transacoes.filter(t => t.recorrente);
  };

  return (
    <FinanceContext.Provider value={{
      transacoes,
      adicionarTransacao,
      editarTransacao,
      deletarTransacao,
      categorias,
      adicionarCategoria,
      editarCategoria,
      deletarCategoria,
      getTransacoesPorMes,
      getBalancoMensal,
      getCategoriaSumario,
      mesAtual,
      anoAtual,
      setMesAtual,
      setAnoAtual,
      getTransacoesRecorrentes,
      // Aliases para compatibilidade
      transactions: transacoes,
      addTransaction: adicionarTransacao,
      editTransaction: editarTransacao,
      deleteTransaction: deletarTransacao,
      categories: categorias,
      addCategory: adicionarCategoria,
      editCategory: editarCategoria,
      deleteCategory: deletarCategoria,
      getTransactionsByMonth: getTransacoesPorMes,
      getMonthlyBalance: getBalancoMensal,
      getCategorySummary: getCategoriaSumario,
      currentMonth: mesAtual,
      currentYear: anoAtual,
      setCurrentMonth: setMesAtual,
      setCurrentYear: setAnoAtual,
      getRecurringTransactions: getTransacoesRecorrentes
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};
