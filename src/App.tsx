import React, { useState, useEffect, useCallback } from 'react';
import { Produto, Venda, TabType, SupabaseSettings } from './types';
import {
  fetchProdutos,
  createProduto,
  updateProduto,
  deleteProduto,
  fetchVendas,
  registrarVenda,
  getStoredSupabaseConfig,
} from './lib/supabase';
import { Header } from './components/Header';
import { DashboardModule } from './components/DashboardModule';
import { ProdutosModule } from './components/ProdutosModule';
import { VendasModule } from './components/VendasModule';
import { SupabaseModal } from './components/SupabaseModal';
import { Database, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseSettings>(getStoredSupabaseConfig());
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setSupabaseConfig(getStoredSupabaseConfig());

    try {
      const [resProdutos, resVendas] = await Promise.all([
        fetchProdutos(),
        fetchVendas(),
      ]);

      setProdutos(resProdutos.data);
      setVendas(resVendas.data);

      const live = resProdutos.isSupabase || resVendas.isSupabase;
      setIsSupabaseLive(live);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      showToast('Erro ao carregar dados do sistema', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Product CRUD
  const handleAddProduto = async (produtoData: Omit<Produto, 'id' | 'created_at'>) => {
    setIsSaving(true);
    try {
      const res = await createProduto(produtoData);
      if (res.error) {
        showToast(`Aviso: ${res.error}`, 'error');
      } else {
        showToast(`Produto "${produtoData.nome}" cadastrado com sucesso!`);
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao cadastrar produto', 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProduto = async (id: string, produtoData: Partial<Omit<Produto, 'id'>>) => {
    setIsSaving(true);
    try {
      const res = await updateProduto(id, produtoData);
      if (res.error) {
        showToast(`Aviso: ${res.error}`, 'error');
      } else {
        showToast('Produto atualizado com sucesso!');
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar produto', 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduto = async (id: string) => {
    setIsSaving(true);
    try {
      const res = await deleteProduto(id);
      if (res.error) {
        showToast(`Aviso: ${res.error}`, 'error');
      } else {
        showToast('Produto excluído com sucesso!');
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir produto', 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Vendas handler
  const handleRegistrarVenda = async (vendaData: {
    produto_id: string;
    produto_nome: string;
    quantidade: number;
    preco_unitario: number;
    valor_total: number;
    novo_estoque: number;
  }) => {
    setIsSaving(true);
    try {
      const res = await registrarVenda(vendaData);
      if (res.error) {
        showToast(`Aviso: ${res.error}`, 'error');
      } else {
        showToast(`Venda registrada e estoque atualizado!`);
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao registrar venda', 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        supabaseConfig={supabaseConfig}
        isSupabaseLive={isSupabaseLive}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium ${
              toastMessage.type === 'error'
                ? 'bg-red-900 text-red-100 border-red-700'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500 mt-4">Carregando dados do ERP...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardModule
                produtos={produtos}
                vendas={vendas}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'produtos' && (
              <ProdutosModule
                produtos={produtos}
                onAddProduto={handleAddProduto}
                onUpdateProduto={handleUpdateProduto}
                onDeleteProduto={handleDeleteProduto}
                isSaving={isSaving}
              />
            )}

            {activeTab === 'vendas' && (
              <VendasModule
                produtos={produtos}
                vendas={vendas}
                onRegistrarVenda={handleRegistrarVenda}
                onNavigateTab={(tab) => setActiveTab(tab)}
                isSaving={isSaving}
              />
            )}

            {activeTab === 'config' && (
              <SupabaseModal
                config={supabaseConfig}
                onReload={loadData}
                isSupabaseLive={isSupabaseLive}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ERP Didático com Integração Supabase e Baixa Automática de Estoque</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            Status: {isSupabaseLive ? 'Supabase Conectado' : 'Modo Armazenamento Local'}
          </span>
        </div>
      </footer>

    </div>
  );
}
