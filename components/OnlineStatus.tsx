import React from 'react';
import { usePWA } from '../hooks/usePWA';

export const OnlineStatus: React.FC = () => {
  const { isOnline, showUpdatePrompt, updateApp } = usePWA();

  return (
    <>
      {/* Indicador de Status Online/Offline */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm z-40 animate-in slide-in-from-top">
          <div className="flex items-center justify-center space-x-2">
            <span>⚠️</span>
            <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
          </div>
        </div>
      )}

      {/* Prompt de Atualização */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50 max-w-sm animate-in slide-in-from-bottom-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm">🔄</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Nova versão!</h3>
                <p className="text-xs text-slate-600">Atualize para a versão mais recente.</p>
              </div>
            </div>
            <button
              onClick={updateApp}
              className="bg-brand-600 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
            >
              Atualizar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
