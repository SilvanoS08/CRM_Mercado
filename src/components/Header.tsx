import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TabType, SupabaseSettings } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  supabaseConfig: SupabaseSettings;
  isSupabaseLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  supabaseConfig,
  isSupabaseLive,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  ERP Simplificado
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Didático
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Sistema integrado de Gestão</p>
              </div>
            </div>

            {/* Supabase Status Button (Mobile) */}
            <button
              onClick={() => setActiveTab('config')}
              className="sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition border border-slate-700 bg-slate-800/80"
            >
              {isSupabaseLive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Supabase</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">Local</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('produtos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'produtos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Produtos & Estoque</span>
            </button>

            <button
              onClick={() => setActiveTab('vendas')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'vendas'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Vendas</span>
            </button>

            {/* Supabase Status (Desktop) */}
            <button
              onClick={() => setActiveTab('config')}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ml-2 ${
                activeTab === 'config'
                  ? 'bg-slate-800 border-emerald-500/50 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              {isSupabaseLive ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Supabase On
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Configurar Supabase
                </span>
              )}
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};
