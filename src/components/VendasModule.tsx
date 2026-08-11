import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, CheckCircle2, AlertCircle, ArrowRight, Package } from 'lucide-react';
import { Produto, Venda } from '../types';

interface VendasModuleProps {
  produtos: Produto[];
  vendas: Venda[];
  onRegistrarVenda: (vendaData: {
    produto_id: string;
    produto_nome: string;
    quantidade: number;
    preco_unitario: number;
    valor_total: number;
    novo_estoque: number;
  }) => Promise<void>;
  onNavigateTab: (tab: 'produtos') => void;
  isSaving: boolean;
}

export const VendasModule: React.FC<VendasModuleProps> = ({
  produtos,
  vendas,
  onRegistrarVenda,
  onNavigateTab,
  isSaving,
}) => {
  // Form fields
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selected product object
  const selectedProduto = produtos.find((p) => p.id === selectedProdutoId);

  // Auto calculated sale total
  const quantidadeNum = parseInt(quantidade, 10) || 0;
  const precoUnitario = selectedProduto ? selectedProduto.preco : 0;
  const valorTotalCalculado = quantidadeNum * precoUnitario;

  // Reset form messages when selection changes
  useEffect(() => {
    setFormError('');
    setSuccessMessage('');
  }, [selectedProdutoId, quantidade]);

  const handleSubmitVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!selectedProduto) {
      setFormError('Por favor, selecione um produto cadastrado.');
      return;
    }

    if (quantidadeNum <= 0) {
      setFormError('A quantidade vendida deve ser maior que zero.');
      return;
    }

    if (quantidadeNum > selectedProduto.estoque) {
      setFormError(
        `Estoque insuficiente! Você tentou vender ${quantidadeNum} unidade(s), mas existem apenas ${selectedProduto.estoque} disponível(is).`
      );
      return;
    }

    const novoEstoque = selectedProduto.estoque - quantidadeNum;

    try {
      await onRegistrarVenda({
        produto_id: selectedProduto.id,
        produto_nome: selectedProduto.nome,
        quantidade: quantidadeNum,
        preco_unitario: selectedProduto.preco,
        valor_total: valorTotalCalculado,
        novo_estoque: novoEstoque,
      });

      setSuccessMessage(
        `Venda de ${quantidadeNum}x "${selectedProduto.nome}" registrada com sucesso! Estoque atualizado para ${novoEstoque} un.`
      );

      // Reset form
      setSelectedProdutoId('');
      setQuantidade('1');
    } catch (err: any) {
      setFormError(err.message || 'Erro ao registrar venda.');
    }
  };

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

  return (
    <div className="space-y-6">
      
      {/* Title & Intro Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-emerald-600" />
          Módulo de Vendas
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Registre saídas e vendas de produtos. O estoque do produto selecionado é reduzido automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Nova Venda Form Column */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm sticky top-20">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Registrar Nova Venda
            </h3>

            {produtos.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">Nenhum produto em estoque</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Você precisa cadastrar um produto antes de realizar vendas.
                </p>
                <button
                  onClick={() => onNavigateTab('produtos')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
                >
                  Ir para Cadastro de Produtos <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitVenda} className="space-y-4 mt-4">
                
                {/* Alert Messages */}
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Seleção do Produto */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Selecionar Produto *
                  </label>
                  <select
                    value={selectedProdutoId}
                    onChange={(e) => setSelectedProdutoId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="">-- Escolha um produto --</option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.estoque <= 0}>
                        {p.nome} — {formatCurrency(p.preco)} (Estoque: {p.estoque} un)
                        {p.estoque <= 0 ? ' [ESGOTADO]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Information Badge for selected product */}
                {selectedProduto && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Preço Unitário:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {formatCurrency(selectedProduto.preco)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estoque Atual:</span>
                      <span
                        className={`font-semibold ${
                          selectedProduto.estoque <= 0
                            ? 'text-red-600'
                            : selectedProduto.estoque <= 5
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {selectedProduto.estoque} unidades
                      </span>
                    </div>
                  </div>
                )}

                {/* Quantidade Vendida */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Quantidade Vendida *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduto ? selectedProduto.estoque : undefined}
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    disabled={!selectedProduto}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Cálculo Automático do Valor */}
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                      Valor Total da Venda
                    </span>
                    <span className="text-xs text-emerald-600">Calculado automaticamente</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {formatCurrency(valorTotalCalculado)}
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedProduto || isSaving || selectedProduto.estoque <= 0}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isSaving ? 'Registrando Venda...' : 'Finalizar e Baixar Estoque'}
                </button>

              </form>
            )}

          </div>
        </div>

        {/* Histórico de Vendas Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Histórico de Vendas Realizadas</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lista de todas as transações efetuadas e registradas.
              </p>
            </div>

            {vendas.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-slate-800">Nenhuma venda efetuada</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                  Selecione um produto no formulário ao lado e registre sua primeira venda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Produto</th>
                      <th className="py-3 px-4 text-center">Qtd</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {vendas.map((venda) => (
                      <tr key={venda.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 text-slate-500 text-xs font-mono">
                          {formatDate(venda.created_at)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {venda.produto_nome}
                          <span className="block text-xs font-normal text-slate-400 font-mono">
                            {formatCurrency(venda.preco_unitario)} / un
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                            {venda.quantidade}x
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 font-mono">
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

      </div>

    </div>
  );
};
