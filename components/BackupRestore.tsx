import React, { useRef } from 'react';
import { AppData } from '../types';
import { Download, Upload, AlertTriangle } from 'lucide-react';

interface BackupRestoreProps {
  data: AppData;
  onRestore: (data: AppData) => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ data, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // reset input
    e.target.value = '';
  };

  return (
    <div className="pb-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Configurações & Backup</h2>
        
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
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
