
import React, { useState, useMemo } from 'react';
import { AppData, Investment, InvestmentType, InvestmentStrategy, TransactionType, PaymentMethod } from '../types';
import { INVESTMENT_TYPE_LABELS, INVESTMENT_STRATEGY_LABELS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Plus, DollarSign, ArrowUpRight, ArrowDownRight, MoreHorizontal, RefreshCw, History, Trash2 } from 'lucide-react';

interface InvestmentDashboardProps {
  data: AppData;
  onAddInvestment: (i: Omit<Investment, 'id' | 'history'>) => void;
  onAddMovement: (invId: string, type: 'BUY' | 'SELL' | 'UPDATE', qty: number, price: number, date: string, notes?: string) => void;
  onDeleteInvestment: (id: string) => void;
  onAddTransaction: (t: any) => void; // Link to cash flow
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c'];

export const InvestmentDashboard: React.FC<InvestmentDashboardProps> = ({ data, onAddInvestment, onAddMovement, onDeleteInvestment, onAddTransaction }) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<Investment | null>(null);
  const [moveType, setMoveType] = useState<'BUY' | 'SELL' | 'UPDATE'>('UPDATE');
  
  // New Investment Form
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<InvestmentType>(InvestmentType.FIXED_INCOME);
  const [newBroker, setNewBroker] = useState('');
  const [newStrategy, setNewStrategy] = useState<InvestmentStrategy>(InvestmentStrategy.LONG_TERM);
  
  // Movement Form
  const [moveQty, setMoveQty] = useState('');
  const [movePrice, setMovePrice] = useState('');
  const [moveDate, setMoveDate] = useState(new Date().toISOString().split('T')[0]);
  const [moveAccount, setMoveAccount] = useState(''); // To link with cash flow

  const summary = useMemo(() => {
      let totalInvested = 0;
      let totalCurrent = 0;
      
      data.investments.forEach(i => {
          totalInvested += i.quantity * i.averagePrice;
          totalCurrent += i.quantity * i.currentPrice;
      });

      const profit = totalCurrent - totalInvested;
      const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

      return { totalInvested, totalCurrent, profit, profitPercent };
  }, [data.investments]);

  const allocationData = useMemo(() => {
      const map = new Map<string, number>();
      data.investments.forEach(i => {
          const val = i.quantity * i.currentPrice;
          if (val > 0) map.set(i.type, (map.get(i.type) || 0) + val);
      });
      return Array.from(map.entries()).map(([key, value]) => ({ 
          name: INVESTMENT_TYPE_LABELS[key as InvestmentType] || key, 
          value 
      }));
  }, [data.investments]);

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      onAddInvestment({
          name: newName,
          type: newType,
          broker: newBroker,
          strategy: newStrategy,
          quantity: 0,
          averagePrice: 0,
          currentPrice: 0,
          notes: ''
      });
      setIsNewModalOpen(false);
      // Reset
      setNewName(''); setNewBroker('');
  };

  const handleMoveSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedInv) return;

      const qty = parseFloat(moveQty) || 0;
      const price = parseFloat(movePrice) || 0;

      // 1. Update Investment State
      onAddMovement(selectedInv.id, moveType, qty, price, moveDate);

      // 2. Create Cash Flow Transaction (if Buying or Selling and account selected)
      if (moveAccount && (moveType === 'BUY' || moveType === 'SELL')) {
          const total = qty * price;
          onAddTransaction({
              type: moveType === 'BUY' ? TransactionType.INVESTMENT : TransactionType.INCOME,
              description: `${moveType === 'BUY' ? 'Aporte' : 'Resgate'}: ${selectedInv.name}`,
              amount: total,
              category: 'Investimentos',
              date: moveDate,
              paid: true,
              paymentMethod: PaymentMethod.BANK_TRANSFER,
              accountId: moveAccount,
              investmentId: selectedInv.id
          });
      }

      setIsMoveModalOpen(false);
      setMoveQty(''); setMovePrice(''); setMoveAccount('');
  };

  const openMoveModal = (inv: Investment, type: 'BUY' | 'SELL' | 'UPDATE') => {
      setSelectedInv(inv);
      setMoveType(type);
      setMovePrice(inv.currentPrice.toString()); // Default to current price
      setIsMoveModalOpen(true);
  };

  return (
    <div className="pb-20 space-y-6">
       {/* Header */}
       <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Carteira de Investimentos</h2>
            <p className="text-slate-500 text-sm">Gerencie seu patrimônio e acompanhe a rentabilidade.</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Novo Ativo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Patrimônio Total</p>
              <p className="text-2xl font-bold text-slate-800">R$ {summary.totalCurrent.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
              <div className="text-xs text-slate-400 mt-2">
                  Investido: R$ {summary.totalInvested.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Lucro / Prejuízo</p>
              <div className={`flex items-center text-2xl font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.profit >= 0 ? <ArrowUpRight className="mr-1"/> : <ArrowDownRight className="mr-1"/>}
                  R$ {Math.abs(summary.profit).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
              <p className={`text-xs mt-2 ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.profitPercent.toFixed(2)}% de rentabilidade
              </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center h-40 md:h-auto">
             <p className="text-slate-500 text-sm mb-2">Alocação</p>
             {allocationData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={allocationData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                            {allocationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    </PieChart>
                 </ResponsiveContainer>
             ) : (
                 <p className="text-center text-slate-300 text-xs">Sem dados</p>
             )}
          </div>
      </div>

      {/* Asset List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-800">Meus Ativos</div>
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                  <tr>
                      <th className="px-6 py-3 font-medium">Ativo</th>
                      <th className="px-6 py-3 font-medium text-right">Qtd.</th>
                      <th className="px-6 py-3 font-medium text-right">Preço Médio</th>
                      <th className="px-6 py-3 font-medium text-right">Preço Atual</th>
                      <th className="px-6 py-3 font-medium text-right">Total</th>
                      <th className="px-6 py-3 font-medium text-right">Rentab.</th>
                      <th className="px-6 py-3 font-medium text-center">Ações</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {data.investments.length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Você ainda não cadastrou investimentos.</td></tr>
                  )}
                  {data.investments.map(inv => {
                      const total = inv.quantity * inv.currentPrice;
                      const profit = total - (inv.quantity * inv.averagePrice);
                      const profitPerc = inv.averagePrice > 0 ? (profit / (inv.quantity * inv.averagePrice)) * 100 : 0;
                      
                      return (
                          <tr key={inv.id} className="hover:bg-slate-50">
                              <td className="px-6 py-3">
                                  <div className="font-bold text-slate-800">{inv.name}</div>
                                  <div className="text-xs text-slate-400">{INVESTMENT_TYPE_LABELS[inv.type]} • {inv.broker}</div>
                              </td>
                              <td className="px-6 py-3 text-right">{inv.quantity}</td>
                              <td className="px-6 py-3 text-right">R$ {inv.averagePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                              <td className="px-6 py-3 text-right text-slate-600">R$ {inv.currentPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                              <td className="px-6 py-3 text-right font-medium text-slate-800">R$ {total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                              <td className={`px-6 py-3 text-right font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {profitPerc > 0 ? '+' : ''}{profitPerc.toFixed(2)}%
                              </td>
                              <td className="px-6 py-3 flex justify-center gap-2">
                                  <button onClick={() => openMoveModal(inv, 'UPDATE')} title="Atualizar Cotação" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><RefreshCw size={16}/></button>
                                  <button onClick={() => openMoveModal(inv, 'BUY')} title="Registrar Aporte" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Plus size={16}/></button>
                                  <button onClick={() => openMoveModal(inv, 'SELL')} title="Registrar Venda" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><DollarSign size={16}/></button>
                                  <button onClick={() => {if(confirm('Excluir este ativo e todo histórico?')) onDeleteInvestment(inv.id)}} title="Excluir" className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                              </td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
          </div>
      </div>

      {/* New Investment Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Novo Ativo</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Ativo / Ticker</label>
                    <input required className="w-full input-std px-3 py-2 border rounded-lg" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: PETR4, CDB Nubank 100% CDI" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                        <select className="w-full px-3 py-2 border rounded-lg bg-white" value={newType} onChange={e => setNewType(e.target.value as InvestmentType)}>
                            {Object.entries(INVESTMENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Estratégia</label>
                         <select className="w-full px-3 py-2 border rounded-lg bg-white" value={newStrategy} onChange={e => setNewStrategy(e.target.value as InvestmentStrategy)}>
                            {Object.entries(INVESTMENT_STRATEGY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Corretora / Instituição</label>
                    <input className="w-full input-std px-3 py-2 border rounded-lg" value={newBroker} onChange={e => setNewBroker(e.target.value)} placeholder="Ex: XP, Binance, Banco Inter" />
                </div>
                <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700">Cadastrar</button>
            </form>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {isMoveModalOpen && selectedInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                  <h3 className="font-bold text-lg text-slate-800">
                      {moveType === 'BUY' ? 'Novo Aporte' : moveType === 'SELL' ? 'Realizar Venda' : 'Atualizar Preço'}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedInv.name}</p>
              </div>
              <button onClick={() => setIsMoveModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleMoveSubmit} className="p-6 space-y-4">
                {moveType !== 'UPDATE' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                        <input required type="number" step="any" className="w-full px-3 py-2 border rounded-lg" value={moveQty} onChange={e => setMoveQty(e.target.value)} />
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {moveType === 'UPDATE' ? 'Preço de Mercado Atual (Unitário)' : 'Preço Unitário da Operação'}
                    </label>
                    <input required type="number" step="any" className="w-full px-3 py-2 border rounded-lg" value={movePrice} onChange={e => setMovePrice(e.target.value)} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                    <input required type="date" className="w-full px-3 py-2 border rounded-lg" value={moveDate} onChange={e => setMoveDate(e.target.value)} />
                </div>

                {(moveType === 'BUY' || moveType === 'SELL') && (
                     <div className="bg-brand-50 p-3 rounded-lg border border-brand-100">
                        <label className="block text-xs font-bold text-brand-800 mb-1">
                            {moveType === 'BUY' ? 'Debitar da Conta:' : 'Creditar na Conta:'}
                        </label>
                        <select 
                            className="w-full px-3 py-2 border border-brand-200 rounded-lg bg-white text-sm"
                            value={moveAccount}
                            onChange={e => setMoveAccount(e.target.value)}
                        >
                            <option value="">Não vincular financeiro</option>
                            {data.accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-brand-600 mt-1">Se selecionado, criará uma transação no seu extrato.</p>
                    </div>
                )}

                <button type="submit" className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                    moveType === 'BUY' ? 'bg-green-600 hover:bg-green-700' :
                    moveType === 'SELL' ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-blue-600 hover:bg-blue-700'
                }`}>
                    Confirmar
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
