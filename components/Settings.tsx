import React, { useRef } from 'react';
import { AppData } from '../types';

interface SettingsProps {
  data: AppData;
  onDataUpdate: (data: AppData) => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onDataUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dois-no-bolso-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as AppData;
        // Validar minimamente a estrutura dos dados?
        if (importedData && typeof importedData === 'object') {
          if (window.confirm('Isso substituirá todos os seus dados atuais. Tem certeza?')) {
            onDataUpdate(importedData);
          }
        } else {
          alert('Arquivo inválido.');
        }
      } catch (error) {
        alert('Erro ao ler o arquivo. Certifique-se de que é um JSON válido.');
      }
    };
    reader.readAsText(file);
    // Resetar o input para permitir importar o mesmo arquivo novamente
    event.target.value = '';
  };

  const handleClearData = () => {
    if (window.confirm('Isso removerá permanentemente todos os seus dados. Tem certeza?')) {
      const emptyData: AppData = {
        transactions: [],
        goals: [],
        accounts: [],
        creditCards: [],
        investments: [],
        properties: [],
        debts: [],
        customCategories: [],
        userMode: 'INDIVIDUAL',
        language: 'PT'
      };
      onDataUpdate(emptyData);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
          <button 
            onClick={handleExportData}
            className="w-full text-left p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <div className="font-bold">Exportar Dados</div>
            <div className="text-sm">Baixe backup dos seus dados</div>
          </button>

          <button 
            onClick={triggerFileInput}
            className="w-full text-left p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
          >
            <div className="font-bold">Importar Dados</div>
            <div className="text-sm">Restaurar de um backup</div>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportData}
            accept=".json"
            className="hidden"
          />
          
          <button 
            onClick={handleClearData}
            className="w-full text-left p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
          >
            <div className="font-bold">Limpar Dados</div>
            <div className="text-sm">Remove todas as informações (irreversível)</div>
          </button>
        </div>
      </div>
    </div>
  );
};
