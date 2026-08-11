import React from 'react';
import { Package, Layers, ShoppingCart, DollarSign, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { Produto, Venda } from '../types';

interface DashboardModuleProps {
  produtos: Produto[];
  vendas: Venda[];
  onNavigateTab: (tab: 'produtos' | 'vendas') => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  produtos,
  vendas,
  onNavigateTab,
}) => {
  // Calculated stats
  const totalProdutos = produtos.length;
  const totalEstoque = produtos.reduce((sum, p) => sum + (Number(p.estoque) || 0), 0);
  const totalVendasCount = vendas.length;
  const valorTotalVendido = vendas.reduce((sum, v) => sum + (Number(v.valor_total) || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Low stock alert (< 5 items)
  const produtosBaixoEstoque = produtos.filter((p) => p.estoque <= 5);

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Gerencial</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Visão consolidada do catálogo, estoque atual e histórico de vendas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('produtos')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Package className="w-4 h-4 text-slate-600" />
            Cadastrar Produto
          </button>
          <button
            onClick={() => onNavigateTab('vendas')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Nova Venda
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Produtos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total de Produtos</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalProdutos}
            </span>
            <p className="text-xs text-slate-400 mt-1">Produtos cadastrados</p>
          </div>
        </div>

        {/* Quantidade em Estoque */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Itens em Estoque</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalEstoque}
            </span>
            <p className="text-xs text-slate-400 mt-1">Unidades físicas totais</p>
          </div>
        </div>

        {/* Total de Vendas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Vendas Realizadas</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalVendasCount}
            </span>
            <p className="text-xs text-slate-400 mt-1">Transações concluídas</p>
          </div>
        </div>

        {/* Valor Total Vendido */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Faturamento Total</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrency(valorTotalVendido)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Valor acumulado de vendas</p>
          </div>
        </div>

      </div>

      {/* Low Stock Warning Alert if needed */}
      {produtosBaixoEstoque.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900">Alerta de Estoque Baixo</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              {produtosBaixoEstoque.length} produto(s) possuem 5 ou menos unidades em estoque:{' '}
              <span className="font-medium">
                {produtosBaixoEstoque.map((p) => `${p.nome} (${p.estoque} un)`).join(', ')}
              </span>
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('produtos')}
            className="text-xs font-semibold text-amber-800 hover:underline shrink-0"
          >
            Ver Estoque
          </button>
        </div>
      )}

      {/* Relatório de Vendas Realizadas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Relatório de Vendas Realizadas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Histórico detalhado de movimentações e registros de vendas.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('vendas')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
          >
            Ir para Módulo de Vendas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {vendas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">Nenhuma venda registrada ainda</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Cadastre seus produtos no módulo de Produtos e realize a primeira venda para visualizar o relatório.
            </p>
            <button
              onClick={() => onNavigateTab('vendas')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
            >
              Registrar Primeira Venda
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4 text-center">Qtd Vendida</th>
                  <th className="py-3 px-4 text-right">Preço Unitário</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">
                      {formatDate(venda.created_at)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {venda.produto_nome}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {venda.quantidade} un
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono">
                      {formatCurrency(venda.preco_unitario)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(venda.valor_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
