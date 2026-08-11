import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { SupabaseSettings } from '../types';
import { SUPABASE_SQL_SCRIPT, saveSupabaseConfig } from '../lib/supabase';

interface SupabaseModalProps {
  config: SupabaseSettings;
  onReload: () => void;
  isSupabaseLive: boolean;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  config,
  onReload,
  isSupabaseLive,
}) => {
  const [url, setUrl] = useState(config.url);
  const [key, setKey] = useState(config.key);
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    setSaveMessage('Configurações salvas no armazenamento local!');
    onReload();
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            Integração com Supabase
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Conecte o ERP ao banco de dados do Supabase para persistência permanente em nuvem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSupabaseLive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Conectado ao Supabase
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Modo Local (In-Browser Storage)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step 1: SQL Script Generator */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">1</span>
                Criar Tabelas no Supabase (SQL Editor)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Copie o script abaixo e execute-o no menu <span className="font-semibold text-slate-700">SQL Editor</span> do seu painel do Supabase.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition shadow-sm shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Código SQL
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
              {SUPABASE_SQL_SCRIPT}
            </pre>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Tabelas que serão criadas: <strong className="text-slate-700">produtos</strong> e <strong className="text-slate-700">vendas</strong></span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
            >
              Abrir Dashboard Supabase <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Step 2: Credentials Input */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">2</span>
            Configurar Credenciais
          </h3>
          <p className="text-xs text-slate-500">
            Insira a URL do projeto e a Anon Key fornecidas em <span className="font-medium text-slate-700">Project Settings &gt; API</span>.
          </p>

          {saveMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{saveMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                Salvar Credenciais
              </button>

              <button
                type="button"
                onClick={onReload}
                className="p-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl transition text-slate-600"
                title="Testar Conexão"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Dica das Variáveis de Ambiente:</p>
            <p className="text-slate-500">
              Você também pode definir <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> e <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> no arquivo <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded">.env</code> para carregar automaticamente.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
