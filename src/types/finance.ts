
export type TipoTransacao = 'receita' | 'despesa';

export type FrequenciaRecorrente = 'mensal' | 'semanal' | 'anual';

export type Categoria = {
  id: string;
  nome: string;
  cor: string;
  icone?: string;
  tipo: TipoTransacao;
  padrao?: boolean;
  usuario_id?: string;
};

export type Transacao = {
  id: string;
  valor: number;
  tipo: TipoTransacao;
  descricao: string;
  data: Date;
  categoria_id: string;
  recorrente: boolean;
  frequencia_recorrente?: FrequenciaRecorrente;
  usuario_id?: string;
};

export type Usuario = {
  id: string;
  email: string;
  nome?: string;
};

export type BalancoMensal = {
  mes: number;
  ano: number;
  receitas: number;
  despesas: number;
  saldo: number;
};

export type CategoriaSumario = {
  categoria_id: string;
  valor: number;
  porcentagem: number;
};

// Adicionando aliases para compatibilidade com código existente
export type CategoryType = Categoria;
export type Transaction = Transacao;
export type MonthlyBalance = BalancoMensal;
export type CategorySummary = CategoriaSumario;
export type User = Usuario;
export type TransactionType = TipoTransacao;
export type RecurringFrequency = FrequenciaRecorrente;
