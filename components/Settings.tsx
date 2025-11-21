import React from 'react';
import { AppData } from '../types';
// import { Language } from '../types'; // Comentado - tipo não existe

interface SettingsProps {
  data: AppData;
  onDataUpdate: (data: AppData) => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onDataUpdate }) => {
  const handleUserModeChange = (mode: 'INDIVIDUAL' | 'COUPLE') => {
    onDataUpdate({
      ...data,
      userMode: mode
    });
  };

  const handleLanguageChange = (language: string) => {
    onDataUpdate({
      ...data,
      language: language as any
    });
  };

  return (
    <div className="pb-20 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
      
      {/* User Mode */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Modo de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleUserModeChange('INDIVIDUAL')}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              data.userMode === 'INDIVIDUAL'
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="font-bold mb-1">Individual</div>
            <div className="text-sm text-slate-500">Uso pessoal para uma única pessoa</div>
          </button>
          
          <button
            onClick={() => handleUserModeChange('COUPLE')}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              data.userMode === 'COUPLE'
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="font-bold mb-1">Casal</div>
            <div className="text-sm text-slate-500">Compartilhado entre duas pessoas</div>
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Idioma</h3>
        <select
          value={data.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
        >
          <option value="PT">Português (Brasil)</option>
          <option value="EN">English</option>
        </select>
      </div>

      {/* Data Management */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Gerenciamento de Dados</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
            <div className="font-bold">Exportar Dados</div>
            <div className="text-sm">Baixe backup dos seus dados</div>
          </button>
          
          <button className="w-full text-left p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
            <div className="font-bold">Limpar Dados</div>
            <div className="text-sm">Remove todas as informações (irreversível)</div>
          </button>
        </div>
      </div>
    </div>
  );
};
