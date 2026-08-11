export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  created_at?: string;
}

export interface Venda {
  id: string;
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
  created_at: string;
}

export interface SupabaseSettings {
  url: string;
  key: string;
  isConfigured: boolean;
}

export type TabType = 'dashboard' | 'produtos' | 'vendas' | 'config';
