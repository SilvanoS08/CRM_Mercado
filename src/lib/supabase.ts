import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Produto, Venda, SupabaseSettings } from '../types';

const STORAGE_KEYS = {
  PRODUTOS: 'erp_didatico_produtos',
  VENDAS: 'erp_didatico_vendas',
  SUPABASE_URL: 'erp_supabase_url',
  SUPABASE_KEY: 'erp_supabase_key',
};

// SQL script provided for easy database setup in Supabase
export const SUPABASE_SQL_SCRIPT = `-- EXECUTE ESTE CÓDIGO NO SQL EDITOR DO SEU SUPABASE

-- 1. Criar Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  preco NUMERIC(10, 2) NOT NULL DEFAULT 0,
  estoque INTEGER NOT NULL DEFAULT 0
);

-- 2. Criar Tabela de Vendas
CREATE TABLE IF NOT EXISTS vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(10, 2) NOT NULL,
  valor_total NUMERIC(10, 2) NOT NULL
);

-- 3. Habilitar RLS (Row Level Security) e permitir acesso anônimo para testes
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total publico produtos" ON produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico vendas" ON vendas FOR ALL USING (true) WITH CHECK (true);
`;

export function getStoredSupabaseConfig(): SupabaseSettings {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';

  const url = envUrl || localUrl;
  const key = envKey || localKey;

  return {
    url,
    key,
    isConfigured: Boolean(url && key && url.startsWith('http')),
  };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.isConfigured) return null;

  const currentConfigKey = `${config.url}_${config.key}`;
  if (cachedClient && cachedConfigKey === currentConfigKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.key);
    cachedConfigKey = currentConfigKey;
    return cachedClient;
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
}

// Local Storage Fallback Data Handlers
function getLocalProdutos(): Produto[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalProdutos(produtos: Produto[]) {
  localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(produtos));
}

function getLocalVendas(): Venda[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VENDAS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalVendas(vendas: Venda[]) {
  localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(vendas));
}

// Database API Operations
export async function fetchProdutos(): Promise<{ data: Produto[]; isSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: (data as Produto[]) || [], isSupabase: true };
    } catch (err: any) {
      console.warn('Falha na consulta Supabase, utilizando modo local:', err.message);
      return { data: getLocalProdutos(), isSupabase: false, error: err.message };
    }
  }
  return { data: getLocalProdutos(), isSupabase: false };
}

export async function createProduto(produto: Omit<Produto, 'id' | 'created_at'>): Promise<{ data: Produto | null; isSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('produtos')
        .insert([{ ...produto }])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Produto, isSupabase: true };
    } catch (err: any) {
      console.warn('Erro ao inserir no Supabase, salvando em storage local:', err.message);
    }
  }

  // Local fallback
  const localList = getLocalProdutos();
  const newProduto: Produto = {
    ...produto,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  localList.unshift(newProduto);
  saveLocalProdutos(localList);
  return { data: newProduto, isSupabase: false };
}

export async function updateProduto(id: string, produto: Partial<Omit<Produto, 'id'>>): Promise<{ success: boolean; isSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('produtos')
        .update(produto)
        .eq('id', id);

      if (error) throw error;
      return { success: true, isSupabase: true };
    } catch (err: any) {
      console.warn('Erro ao atualizar no Supabase, usando local:', err.message);
    }
  }

  // Local fallback
  const localList = getLocalProdutos();
  const index = localList.findIndex((p) => p.id === id);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...produto };
    saveLocalProdutos(localList);
    return { success: true, isSupabase: false };
  }
  return { success: false, isSupabase: false, error: 'Produto não encontrado' };
}

export async function deleteProduto(id: string): Promise<{ success: boolean; isSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, isSupabase: true };
    } catch (err: any) {
      console.warn('Erro ao deletar no Supabase, usando local:', err.message);
    }
  }

  // Local fallback
  const localList = getLocalProdutos().filter((p) => p.id !== id);
  saveLocalProdutos(localList);
  return { success: true, isSupabase: false };
}

export async function fetchVendas(): Promise<{ data: Venda[]; isSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('vendas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: (data as Venda[]) || [], isSupabase: true };
    } catch (err: any) {
      console.warn('Falha no Supabase ao buscar vendas:', err.message);
      return { data: getLocalVendas(), isSupabase: false, error: err.message };
    }
  }
  return { data: getLocalVendas(), isSupabase: false };
}

export async function registrarVenda(vendaData: {
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
  novo_estoque: number;
}): Promise<{ data: Venda | null; isSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();

  // Step 1: Update product stock
  const updateRes = await updateProduto(vendaData.produto_id, { estoque: vendaData.novo_estoque });
  if (!updateRes.success && updateRes.error) {
    console.error('Falha ao atualizar estoque:', updateRes.error);
  }

  // Step 2: Record sale
  if (client) {
    try {
      const { data, error } = await client
        .from('vendas')
        .insert([{
          produto_id: vendaData.produto_id,
          produto_nome: vendaData.produto_nome,
          quantidade: vendaData.quantidade,
          preco_unitario: vendaData.preco_unitario,
          valor_total: vendaData.valor_total,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Venda, isSupabase: true };
    } catch (err: any) {
      console.warn('Erro ao gravar venda no Supabase, salvando localmente:', err.message);
    }
  }

  // Local Fallback for sales
  const localVendas = getLocalVendas();
  const newVenda: Venda = {
    id: crypto.randomUUID(),
    produto_id: vendaData.produto_id,
    produto_nome: vendaData.produto_nome,
    quantidade: vendaData.quantidade,
    preco_unitario: vendaData.preco_unitario,
    valor_total: vendaData.valor_total,
    created_at: new Date().toISOString(),
  };
  localVendas.unshift(newVenda);
  saveLocalVendas(localVendas);
  return { data: newVenda, isSupabase: false };
}
