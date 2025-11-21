import React, { useMemo } from 'react';
import { AppData } from '../types';
import { Landmark, Home, TrendingUp, CreditCard, Scale, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BalanceSheetProps {
  data: AppData;
  onAddProperty: (p: any) => void;
  onDeleteProperty: (id: string) => void;
  onAddDebt: (d: any) => void;
  onDeleteDebt: (id: string) => void;
}

export const BalanceSheet: React.FC<BalanceSheetProps> = ({ data, onAddProperty, onDeleteProperty, onAddDebt, onDeleteDebt }) => {
  const assets = useMemo(() => {
    const totalCash = data.accounts.reduce((sum, acc) => sum + acc.initialBalance, 0);
    const totalInvestments = data.investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    const totalProperties = data.properties.reduce((sum, prop) => sum + (prop.currentValue || prop.value), 0);
    
    return [
      { name: 'Dinheiro em Contas', value: totalCash, icon: <Landmark className="text-blue-500" /> },
      { name: 'Investimentos', value: totalInvestments, icon: <TrendingUp className="text-green-500" /> },
      { name: 'Imóveis', value: totalProperties, icon: <Home className="text-purple-500" /> },
    ].filter(item => item.value > 0);
  }, [data.accounts, data.investments, data.properties]);

  const liabilities = useMemo(() => {
    const totalCreditCard = data.creditCards.reduce((sum, card) => sum + (card.currentBalance || 0), 0);
    const totalDebts = data.debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    
    return [
      { name: 'Cartões de Crédito', value: totalCreditCard, icon: <CreditCard className="text-red-500" /> },
      { name: 'Empréstimos/Dívidas', value: totalDebts, icon: <DollarSign className="text-orange-500" /> },
    ].filter(item => item.value > 0);
  }, [data.creditCards, data.debts]);

  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Scale className="mr-2 text-brand-600" />
            Balanço Patrimonial
          </h2>
          <p className="text-slate-500 text-sm">Visão geral do seu patrimônio líquido</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-slate-500">Patrimônio Líquido</p>
          <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {Math.abs(netWorth).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Net Worth Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Total de Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <ArrowUpRight className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Total de Passivos</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalLiabilities.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <ArrowDownRight className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Situação</p>
              <p className={`text-lg font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netWorth >= 0 ? 'Positiva' : 'Negativa'}
              </p>
              <p className="text-xs text-slate-400">
                {netWorth >= 0 ? 'Patrimônio saudável' : 'Atenção às dívidas'}
              </p>
            </div>
            <Scale className={netWorth >= 0 ? 'text-green-500' : 'text-red-500'} size={24} />
          </div>
        </div>
      </div>

      {/* Assets and Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Ativos</h3>
            <p className="text-sm text-slate-500">O que você possui</p>
          </div>
          <div className="p-6">
            {assets.length === 0 ? (
              <p className="text-center text-slate-400 py-4">Nenhum ativo cadastrado</p>
            ) : (
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-white rounded-lg mr-3">
                        {asset.icon}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{asset.name}</p>
                        <p className="text-sm text-slate-500">
                          {((asset.value / totalAssets) * 100).toFixed(1)}% do total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Passivos</h3>
            <p className="text-sm text-slate-500">O que você deve</p>
          </div>
          <div className="p-6">
            {liabilities.length === 0 ? (
              <p className="text-center text-slate-400 py-4">Nenhum passivo cadastrado</p>
            ) : (
              <div className="space-y-4">
                {liabilities.map((liability) => (
                  <div key={liability.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-white rounded-lg mr-3">
                        {liability.icon}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{liability.name}</p>
                        <p className="text-sm text-slate-500">
                          {((liability.value / totalLiabilities) * 100).toFixed(1)}% do total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        R$ {liability.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
