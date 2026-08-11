import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Search, AlertCircle, Check, X } from 'lucide-react';
import { Produto } from '../types';

interface ProdutosModuleProps {
  produtos: Produto[];
  onAddProduto: (produto: Omit<Produto, 'id' | 'created_at'>) => Promise<void>;
  onUpdateProduto: (id: string, produto: Partial<Omit<Produto, 'id'>>) => Promise<void>;
  onDeleteProduto: (id: string) => Promise<void>;
  isSaving: boolean;
}

export const ProdutosModule: React.FC<ProdutosModuleProps> = ({
  produtos,
  onAddProduto,
  onUpdateProduto,
  onDeleteProduto,
  isSaving,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [formError, setFormError] = useState('');

  // Confirm delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Categories extraction for filter dropdown
  const categoriasExistentes = Array.from(new Set(produtos.map((p) => p.categoria))).filter(Boolean);

  const resetForm = () => {
    setNome('');
    setCategoria('');
    setPreco('');
    setEstoque('');
    setFormError('');
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (produto: Produto) => {
    resetForm();
    setEditingId(produto.id);
    setNome(produto.nome);
    setCategoria(produto.categoria);
    setPreco(produto.preco.toString());
    setEstoque(produto.estoque.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nome.trim()) {
      setFormError('Por favor, informe o nome do produto.');
      return;
    }

    if (!categoria.trim()) {
      setFormError('Por favor, informe a categoria.');
      return;
    }

    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum < 0) {
      setFormError('Informe um preço válido maior ou igual a zero.');
      return;
    }

    const estoqueNum = parseInt(estoque, 10);
    if (isNaN(estoqueNum) || estoqueNum < 0) {
      setFormError('Informe uma quantidade de estoque válida.');
      return;
    }

    try {
      if (editingId) {
        await onUpdateProduto(editingId, {
          nome: nome.trim(),
          categoria: categoria.trim(),
          preco: precoNum,
          estoque: estoqueNum,
        });
      } else {
        await onAddProduto({
          nome: nome.trim(),
          categoria: categoria.trim(),
          preco: precoNum,
          estoque: estoqueNum,
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar o produto.');
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await onDeleteProduto(id);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir o produto.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  // Filtered List
  const filteredProdutos = produtos.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoria === 'todas' || p.categoria === selectedCategoria;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Produtos & Estoque
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Cadastre novos itens, atualize preços e gerencie o estoque disponível.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Produto
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {categoriasExistentes.length > 0 && (
          <div className="w-full md:w-56">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="todas">Todas as Categorias</option>
              {categoriasExistentes.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredProdutos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">Nenhum produto encontrado</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || selectedCategoria !== 'todas'
                ? 'Nenhum item corresponde aos filtros selecionados.'
                : 'Você ainda não cadastrou nenhum produto no sistema.'}
            </p>
            {!searchTerm && selectedCategoria === 'todas' && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Primeiro Produto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nome do Produto</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4 text-right">Preço Un.</th>
                  <th className="py-3.5 px-4 text-center">Qtd Estoque</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProdutos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.nome}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      {formatCurrency(p.preco)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.estoque === 0
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : p.estoque <= 5
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.estoque === 0 ? 'Esgotado' : `${p.estoque} un`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {deletingId === p.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs text-red-600 font-medium mr-1">Excluir?</span>
                          <button
                            onClick={() => handleDeleteConfirm(p.id)}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            title="Confirmar exclusão"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Editar produto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(p.id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cadastrar/Editar Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Teclado Mecânico RGB"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Periféricos, Eletrônicos, Bebidas"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Qtd Estoque *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : editingId ? 'Atualizar Produto' : 'Cadastrar Produto'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
