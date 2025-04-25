import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transacao, Categoria, TipoTransacao, BalancoMensal, CategoriaSumario } from '@/types/finance';
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type FinanceContextType = {
  transacoes: Transacao[];
  adicionarTransacao: (transacao: Omit<Transacao, 'id'>) => Promise<void>;
  editarTransacao: (id: string, transacao: Partial<Transacao>) => Promise<void>;
  deletarTransacao: (id: string) => Promise<void>;
  categorias: Categoria[];
  adicionarCategoria: (categoria: Omit<Categoria, 'id'>) => Promise<void>;
  editarCategoria: (id: string, categoria: Partial<Categoria>) => Promise<void>;
  deletarCategoria: (id: string) => Promise<void>;
  getTransacoesPorMes: (mes: number, ano: number) => Transacao[];
  getBalancoMensal: (mes: number, ano: number) => BalancoMensal;
  getCategoriaSumario: (mes: number, ano: number, tipo: TipoTransacao) => CategoriaSumario[];
  mesAtual: number;
  anoAtual: number;
  setMesAtual: (mes: number) => void;
  setAnoAtual: (ano: number) => void;
  getTransacoesRecorrentes: () => Transacao[];
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

        setCategorias(data);
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

        setTransacoes(data.map(t => ({
          ...t,
          data: new Date(t.data)
        })));
      };

      carregarTransacoes();
    }
  }, [user, toast]);

  const adicionarTransacao = async (transacao: Omit<Transacao, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transacoes')
      .insert([transacao])
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

    setTransacoes(prev => [{ ...data, data: new Date(data.data) }, ...prev]);
    
    toast({
      title: transacao.tipo === 'receita' ? "Receita adicionada" : "Despesa adicionada",
      description: `${transacao.descricao} - R$ ${transacao.valor.toFixed(2)}`,
    });
  };

  const editarTransacao = async (id: string, transacao: Partial<Transacao>) => {
    const { error } = await supabase
      .from('transacoes')
      .update(transacao)
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
      prev.map(t => (t.id === id ? { ...t, ...transacao } : t))
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

  const adicionarCategoria = async (categoria: Omit<Categoria, 'id'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('categorias')
      .insert([
        { ...categoria, usuario_id: user.id }
      ])
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
    
    setCategorias(prev => [...prev, data]);
    
    toast({
      title: "Categoria adicionada",
      description: `A categoria ${categoria.nome} foi criada com sucesso.`,
    });
  };

  const editarCategoria = async (id: string, categoria: Partial<Categoria>) => {
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
      prev.map(c => (c.id === id ? { ...c, ...categoria } : c))
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
      getTransacoesRecorrentes
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
