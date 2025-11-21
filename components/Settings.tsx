
import React, { useRef, useState } from 'react';
import { AppData, Language } from '../types';
import { Download, Upload, AlertTriangle, Globe, Save } from 'lucide-react';

interface SettingsProps {
  data: AppData;
  onRestore: (data: AppData) => void;
  onUpdateLanguage: (lang: Language) => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onRestore, onUpdateLanguage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<Language>(data.language || 'PT');

  const handleBackup = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-dois-no-bolso-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.transactions && json.goals) {
            if(window.confirm("Tem certeza? Isso substituirá todos os dados atuais.")) {
                onRestore(json);
                alert("Dados restaurados com sucesso!");
            }
        } else {
            alert("Arquivo de backup inválido.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao ler arquivo.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveSettings = () => {
      onUpdateLanguage(lang);
      alert("Configurações salvas com sucesso!");
  }

  return (
    <div className="pb-20 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
        
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
             <div className="flex items-center mb-4 text-slate-800 font-semibold">
                 <Globe className="mr-2" size={20}/>
                 <h3>Geral</h3>
             </div>
             
             <div className="space-y-4">
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Idioma do Aplicativo</label>
                     <select 
                        value={lang} 
                        onChange={(e) => setLang(e.target.value as Language)}
                        className="w-full md:w-1/2 px-3 py-2 border border-slate-300 rounded-lg bg-white"
                     >
                         <option value="PT">Português (Brasil)</option>
                         <option value="EN">English (US)</option>
                         <option value="ES">Español</option>
                     </select>
                     <p className="text-xs text-slate-500 mt-1">Altera os textos principais da interface (Simulado).</p>
                 </div>

                 <button 
                    onClick={handleSaveSettings}
                    className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                 >
                     <Save size={18} className="mr-2" />
                     Salvar Preferências
                 </button>
             </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
             <h3 className="text-lg font-semibold text-slate-800 mb-2">Segurança dos Dados</h3>
             <p className="text-slate-500 text-sm mb-6">
                 Seus dados ficam salvos apenas neste dispositivo/navegador. Faça backups regulares para não perder suas informações.
             </p>

             <div className="flex flex-col sm:flex-row gap-4">
                 <button 
                    onClick={handleBackup}
                    className="flex-1 flex items-center justify-center bg-brand-50 text-brand-700 border border-brand-200 py-3 px-4 rounded-lg hover:bg-brand-100 transition-colors font-medium"
                 >
                     <Download className="mr-2" size={20} />
                     Baixar Backup (JSON)
                 </button>
                 
                 <button 
                    onClick={handleRestoreClick}
                    className="flex-1 flex items-center justify-center bg-white text-slate-700 border border-slate-300 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                 >
                     <Upload className="mr-2" size={20} />
                     Restaurar Backup
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json" 
                    className="hidden" 
                 />
             </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl border border-red-100 p-6 flex items-start">
            <AlertTriangle className="text-red-500 mr-3 flex-shrink-0" />
            <div>
                <h4 className="text-red-800 font-bold text-sm">Zona de Perigo</h4>
                <p className="text-red-700 text-sm mt-1">
                    Limpar os dados do navegador apagará todas as suas transações se você não tiver um backup salvo.
                </p>
            </div>
        </div>
    </div>
  );
};
