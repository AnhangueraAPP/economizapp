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

export type Perfil = {
  id: string;
  nome: string | null;
  email: string;
  created_at: string;
};

export type CategoryType = Categoria;
export type Transaction = Transacao;
export type MonthlyBalance = BalancoMensal;
export type CategorySummary = CategoriaSumario;
export type User = Usuario;
export type TransactionType = TipoTransacao;
export type RecurringFrequency = FrequenciaRecorrente;

export type CategoryTypeEnglish = {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
  userId?: string;
};

export type TransactionEnglish = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: Date;
  categoryId: string;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  userId?: string;
};

export type MonthlyBalanceEnglish = {
  month: number;
  year: number;
  incomes: number;
  expenses: number;
  balance: number;
};

export type CategorySummaryEnglish = {
  categoryId: string;
  amount: number;
  percentage: number;
};

export const mapTipoToType = (tipo: TipoTransacao): 'income' | 'expense' => {
  return tipo === 'receita' ? 'income' : 'expense';
};

export const mapTypeToTipo = (type: 'income' | 'expense'): TipoTransacao => {
  return type === 'income' ? 'receita' : 'despesa';
};

export const mapFrequenciaToFrequency = (frequencia?: FrequenciaRecorrente): 'monthly' | 'weekly' | 'yearly' | undefined => {
  if (!frequencia) return undefined;
  const map: Record<FrequenciaRecorrente, 'monthly' | 'weekly' | 'yearly'> = {
    'mensal': 'monthly',
    'semanal': 'weekly',
    'anual': 'yearly'
  };
  return map[frequencia];
};

export const mapFrequencyToFrequencia = (frequency?: 'monthly' | 'weekly' | 'yearly'): FrequenciaRecorrente | undefined => {
  if (!frequency) return undefined;
  const map: Record<'monthly' | 'weekly' | 'yearly', FrequenciaRecorrente> = {
    'monthly': 'mensal',
    'weekly': 'semanal',
    'yearly': 'anual'
  };
  return map[frequency];
};

export const categoriaToEnglish = (categoria: Categoria): CategoryTypeEnglish => ({
  id: categoria.id,
  name: categoria.nome,
  color: categoria.cor,
  icon: categoria.icone,
  type: mapTipoToType(categoria.tipo),
  isDefault: categoria.padrao,
  userId: categoria.usuario_id
});

export const englishToCategoria = (category: CategoryTypeEnglish): Categoria => ({
  id: category.id,
  nome: category.name,
  cor: category.color,
  icone: category.icon,
  tipo: mapTypeToTipo(category.type),
  padrao: category.isDefault,
  usuario_id: category.userId
});

export const transacaoToEnglish = (transacao: Transacao): TransactionEnglish => ({
  id: transacao.id,
  amount: transacao.valor,
  type: mapTipoToType(transacao.tipo),
  description: transacao.descricao,
  date: transacao.data,
  categoryId: transacao.categoria_id,
  isRecurring: transacao.recorrente,
  recurringFrequency: mapFrequenciaToFrequency(transacao.frequencia_recorrente),
  userId: transacao.usuario_id
});

export const englishToTransacao = (transaction: TransactionEnglish): Transacao => ({
  id: transaction.id,
  valor: transaction.amount,
  tipo: mapTypeToTipo(transaction.type),
  descricao: transaction.description,
  data: transaction.date,
  categoria_id: transaction.categoryId,
  recorrente: transaction.isRecurring,
  frequencia_recorrente: mapFrequencyToFrequencia(transaction.recurringFrequency),
  usuario_id: transaction.userId
});

export const balancoToEnglish = (balanco: BalancoMensal): MonthlyBalanceEnglish => ({
  month: balanco.mes,
  year: balanco.ano,
  incomes: balanco.receitas,
  expenses: balanco.despesas,
  balance: balanco.saldo
});

export const sumarioToEnglish = (sumario: CategoriaSumario): CategorySummaryEnglish => ({
  categoryId: sumario.categoria_id,
  amount: sumario.valor,
  percentage: sumario.porcentagem
});
