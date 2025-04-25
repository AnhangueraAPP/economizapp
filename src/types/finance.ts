
export type TipoTransacao = 'receita' | 'despesa';

export type FrequenciaRecorrente = 'mensal' | 'semanal' | 'anual';

export type Categoria = {
  id: string;
  nome: string;
  cor: string;
  icone?: string;
  tipo: TipoTransacao;
  padrao?: boolean;
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
