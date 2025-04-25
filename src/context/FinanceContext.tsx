import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Transacao, Categoria, TipoTransacao, BalancoMensal, CategoriaSumario, 
  FrequenciaRecorrente, Usuario,
  categoriaToEnglish, transacaoToEnglish, balancoToEnglish, sumarioToEnglish,
  englishToCategoria, englishToTransacao, mapTypeToTipo, mapFrequencyToFrequencia
} from '@/types/finance';
import { useAuth } from './AuthContext';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';

type SupabaseCategoria = Database['public']['Tables']['categorias']['Row'];
type SupabaseTransacao = Database['public']['Tables']['transacoes']['Row'];

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
  transactions: Transacao[];
  addTransaction: (transaction: any) => Promise<void>;
  editTransaction: (id: string, transaction: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  categories: Categoria[];
  addCategory: (category: any) => Promise<void>;
  editCategory: (id: string, category: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getTransactionsByMonth: (month: number, year: number) => Transacao[];
  getMonthlyBalance: (month: number, year: number) => BalancoMensal;
  getCategorySummary: (month: number, year: number, type: TipoTransacao | 'income' | 'expense') => CategoriaSumario[];
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

        const categoriasConvertidas: Categoria[] = (data as SupabaseCategoria[]).map(c => ({
          id: c.id,
          nome: c.nome,
          cor: c.cor,
          icone: c.icone || undefined,
          tipo: c.tipo as TipoTransacao,
          padrao: c.padrao || false,
          usuario_id: c.usuario_id || undefined
        }));

        setCategorias(categoriasConvertidas);
      };

      carregarCategorias();
    }
  }, [user, toast]);

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

        const transacoesConvertidas: Transacao[] = (data as SupabaseTransacao[]).map(t => ({
          id: t.id,
          valor: Number(t.valor),
          tipo: t.tipo as TipoTransacao,
          descricao: t.descricao,
          data: new Date(t.data),
          categoria_id: t.categoria_id || '',
          recorrente: t.recorrente || false,
          frequencia_recorrente: t.frequencia_recorrente as FrequenciaRecorrente | undefined,
          usuario_id: t.usuario_id || undefined
        }));

        setTransacoes(transacoesConvertidas);
      };

      carregarTransacoes();
    }
  }, [user, toast]);

  const adicionarTransacao = async (transacao: Omit<Transacao, 'id' | 'usuario_id'>) => {
    if (!user) return;

    const transacaoParaInserir = {
      ...transacao,
      data: transacao.data.toISOString().split('T')[0],
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

    const novaTransacao: Transacao = {
      id: data.id,
      valor: Number(data.valor),
      tipo: data.tipo as TipoTransacao,
      descricao: data.descricao,
      data: new Date(data.data),
      categoria_id: data.categoria_id || '',
      recorrente: data.recorrente || false,
      frequencia_recorrente: data.frequencia_recorrente as FrequenciaRecorrente | undefined,
      usuario_id: data.usuario_id || undefined
    };

    setTransacoes(prev => [novaTransacao, ...prev]);
    
    toast({
      title: transacao.tipo === 'receita' ? "Receita adicionada" : "Despesa adicionada",
      description: `${transacao.descricao} - R$ ${transacao.valor.toFixed(2)}`,
    });
  };

  const editarTransacao = async (id: string, transacao: Partial<Omit<Transacao, 'id' | 'usuario_id'>>) => {
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
    
    const novaCategoria: Categoria = {
      id: data.id,
      nome: data.nome,
      cor: data.cor,
      icone: data.icone || undefined,
      tipo: data.tipo as TipoTransacao,
      padrao: data.padrao || false,
      usuario_id: data.usuario_id || undefined
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
    
    const valoresPorCategoria = new Map<string, number>();
    transacoesMensais.forEach(transacao => {
      const { categoria_id, valor } = transacao;
      const atual = valoresPorCategoria.get(categoria_id) || 0;
      valoresPorCategoria.set(categoria_id, atual + valor);
    });
    
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

  const addTransaction = async (transaction: any) => {
    const transacao = englishToTransacao(transaction);
    return await adicionarTransacao(transacao);
  };

  const editTransaction = async (id: string, transaction: any) => {
    const transacao: Partial<Omit<Transacao, 'id' | 'usuario_id'>> = {};
    
    if (transaction.amount !== undefined) transacao.valor = transaction.amount;
    if (transaction.type !== undefined) transacao.tipo = mapTypeToTipo(transaction.type);
    if (transaction.description !== undefined) transacao.descricao = transaction.description;
    if (transaction.date !== undefined) transacao.data = transaction.date;
    if (transaction.categoryId !== undefined) transacao.categoria_id = transaction.categoryId;
    if (transaction.isRecurring !== undefined) transacao.recorrente = transaction.isRecurring;
    if (transaction.recurringFrequency !== undefined) 
      transacao.frequencia_recorrente = mapFrequencyToFrequencia(transaction.recurringFrequency);
    
    return await editarTransacao(id, transacao);
  };

  const deleteTransaction = async (id: string) => {
    return await deletarTransacao(id);
  };

  const addCategory = async (category: any) => {
    const categoria: Omit<Categoria, 'id' | 'usuario_id'> = {
      nome: category.name,
      cor: category.color,
      tipo: mapTypeToTipo(category.type || 'expense'),
      padrao: category.isDefault || false,
      icone: category.icon
    };
    
    return await adicionarCategoria(categoria);
  };

  const editCategory = async (id: string, category: any) => {
    const categoria: Partial<Omit<Categoria, 'id' | 'usuario_id'>> = {};
    
    if (category.name !== undefined) categoria.nome = category.name;
    if (category.color !== undefined) categoria.cor = category.color;
    if (category.type !== undefined) categoria.tipo = mapTypeToTipo(category.type);
    if (category.isDefault !== undefined) categoria.padrao = category.isDefault;
    if (category.icon !== undefined) categoria.icone = category.icon;
    
    return await editarCategoria(id, categoria);
  };

  const deleteCategory = async (id: string) => {
    return await deletarCategoria(id);
  };

  const getCategorySummary = (month: number, year: number, type: TipoTransacao | 'income' | 'expense') => {
    const tipoTransacao = typeof type === 'string' && (type === 'income' || type === 'expense') 
      ? mapTypeToTipo(type) 
      : type as TipoTransacao;
    
    return getCategoriaSumario(month, year, tipoTransacao);
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
      transactions: transacoes,
      addTransaction,
      editTransaction,
      deleteTransaction,
      categories: categorias,
      addCategory,
      editCategory,
      deleteCategory,
      getTransactionsByMonth: getTransacoesPorMes,
      getMonthlyBalance: getBalancoMensal,
      getCategorySummary,
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
