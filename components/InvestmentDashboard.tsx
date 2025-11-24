// components/InvestmentDashboard.tsx
import { useState, useMemo, FormEvent } from 'react';
import { AppData, Investment, InvestmentType, InvestmentStrategy } from '../types';
import { INVESTMENT_TYPE_LABELS, INVESTMENT_STRATEGY_LABELS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, Trash2 } from 'lucide-react';

interface InvestmentDashboardProps {
  data: AppData;
  onAddInvestment: (i: Omit<Investment, 'id' | 'history'>) => void;
  onAddMovement: (invId: string, type: 'BUY' | 'SELL' | 'UPDATE', qty: number, price: number, date: string, notes?: string) => void;
  onDeleteInvestment: (id: string) => void;
  onAddTransaction: (t: any) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c'];

export const InvestmentDashboard = ({
  data,
  onAddInvestment,
  onAddMovement,
  onDeleteInvestment,
  onAddTransaction
}: InvestmentDashboardProps) => {

  // -----------------------
  // State
  // -----------------------
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState<Investment | null>(null);
  const [moveType, setMoveType] = useState<'BUY' | 'SELL' | 'UPDATE'>('UPDATE');

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<InvestmentType>('FIXED_INCOME');
  const [newBroker, setNewBroker] = useState('');
  const [newStrategy, setNewStrategy] = useState<InvestmentStrategy>('LONG_TERM');

  const [moveQty, setMoveQty] = useState('');
  const [movePrice, setMovePrice] = useState('');
  const [moveDate, setMoveDate] = useState(new Date().toISOString().split('T')[0]);
  const [moveAccount, setMoveAccount] = useState('');

  // -----------------------
  // Summary
  // -----------------------
  const summary = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;

    data.investments.forEach(i => {
      const qty = i.quantity ?? 0;
      const avg = i.averagePrice ?? 0;
      const cur = i.currentPrice ?? 0;

      totalInvested += qty * avg;
      totalCurrent += qty * cur;
    });

    const profit = totalCurrent - totalInvested;
    const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    return { totalInvested, totalCurrent, profit, profitPercent };
  }, [data.investments]);

  // -----------------------
  // Allocation
  // -----------------------
  const allocationData = useMemo(() => {
    const map = new Map<string, number>();
    data.investments.forEach(i => {
      const qty = i.quantity ?? 0;
      const cur = i.currentPrice ?? 0;
      const val = qty * cur;
      if (val > 0) map.set(i.type, (map.get(i.type) || 0) + val);
    });
    return Array.from(map.entries()).map(([key, value]) => ({
      name: (INVESTMENT_TYPE_LABELS as Record<string, string>)[key] || key,
      value
    }));
  }, [data.investments]);

  // -----------------------
  // Create Investment
  // -----------------------
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();

    onAddInvestment({
      name: newName,
      type: newType,
      broker: newBroker,
      strategy: newStrategy,
      quantity: 0,
      averagePrice: 0,
      currentPrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    });

    setIsNewModalOpen(false);
    setNewName('');
    setNewBroker('');
  };

  // -----------------------
  // Movements
  // -----------------------
  const handleMoveSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInv) return;

    const qty = parseFloat(moveQty) || 0;
    const price = parseFloat(movePrice) || 0;

    onAddMovement(selectedInv.id, moveType, qty, price, moveDate);

    if (moveAccount && (moveType === 'BUY' || moveType === 'SELL')) {
      const total = qty * price;

      onAddTransaction({
        type: moveType === 'BUY' ? 'investment' : 'income',
        description: `${moveType === 'BUY' ? 'Aporte' : 'Resgate'}: ${selectedInv.name}`,
        amount: total,
        category: 'Investimentos',
        date: moveDate,
        paid: true,
        paymentMethod: 'transfer',
        accountId: moveAccount,
        investmentId: selectedInv.id
      });
    }

    setIsMoveModalOpen(false);
    setMoveQty('');
    setMovePrice('');
    setMoveAccount('');
  };

  const openMoveModal = (inv: Investment, type: 'BUY' | 'SELL' | 'UPDATE') => {
    setSelectedInv(inv);
    setMoveType(type);
    setMovePrice((inv.currentPrice ?? 0).toString());
    setIsMoveModalOpen(true);
  };

  // -----------------------
  // Component
  // -----------------------
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
          <p className="text-2xl font-bold text-slate-800">
            R$ {summary.totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="text-xs text-slate-400 mt-2">
            Investido: R$ {summary.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Lucro / Prejuízo</p>
          <div className={`flex items-center text-2xl font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.profit >= 0 ? <ArrowUpRight className="mr-1" /> : <ArrowDownRight className="mr-1" />}
            R$ {Math.abs(summary.profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className={`text-xs mt-2 ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.profitPercent.toFixed(2)}% de rentabilidade
          </p>
        </div>

        {/* Allocation */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center h-40 md:h-auto">
          <p className="text-slate-500 text-sm mb-2">Alocação</p>
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                  {allocationData.map((_entry, index) => (
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
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Você ainda não cadastrou investimentos.
                  </td>
                </tr>
              )}

              {data.investments.map(inv => {
                const qty = inv.quantity ?? 0;
                const avg = inv.averagePrice ?? 0;
                const cur = inv.currentPrice ?? 0;

                const total = qty * cur;
                const profit = total - (qty * avg);
                const profitPerc = avg > 0 ? (profit / (qty * avg)) * 100 : 0;

                return (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-800">{inv.name}</div>
                      <div className="text-xs text-slate-400">
                        {(INVESTMENT_TYPE_LABELS as Record<string, string>)[inv.type]} • {inv.broker}
                      </div>
                    </td>

                    <td className="px-6 py-3 text-right">{qty}</td>
                    <td className="px-6 py-3 text-right">R$ {avg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-right text-slate-600">R$ {cur.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-800">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>

                    <td className={`px-6 py-3 text-right font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitPerc > 0 ? '+' : ''}{profitPerc.toFixed(2)}%
                    </td>

                    <td className="px-6 py-3 flex justify-center gap-2">
                      <button onClick={() => openMoveModal(inv, 'UPDATE')} title="Atualizar Cotação" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <RefreshCw size={16} />
                      </button>

                      <button onClick={() => openMoveModal(inv, 'BUY')} title="Registrar Aporte" className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                        <Plus size={16} />
                      </button>

                      <button onClick={() => openMoveModal(inv, 'SELL')} title="Registrar Venda" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded">
                        <DollarSign size={16} />
                      </button>

                      <button
                        onClick={() => { if (confirm('Excluir este ativo e todo histórico?')) onDeleteInvestment(inv.id) }}
                        title="Excluir"
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de novo ativo */}
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
                <input required className="w-full input-std px-3 py-2 border rounded-lg" value={newName}
                  onChange={e => setNewName(e.target.value)} placeholder="Ex: PETR4, CDB 100% CDI" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select className="w-full px-3 py-2 border rounded-lg bg-white" value={newType}
                    onChange={e => setNewType(e.target.value as InvestmentType)}>
                    {Object.entries(INVESTMENT_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estratégia</label>
                  <select className="w-full px-3 py-2 border rounded-lg bg-white" value={newStrategy}
                    onChange={e => setNewStrategy(e.target.value as InvestmentStrategy)}>
                    {Object.entries(INVESTMENT_STRATEGY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Corretora / Banco</label>
                <input className="w-full input-std px-3 py-2 border rounded-lg" value={newBroker}
                  onChange={e => setNewBroker(e.target.value)} placeholder="Ex: XP, Inter, Binance" />
              </div>

              <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700">
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal movimentação */}
      {isMoveModalOpen && selectedInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  {moveType === 'BUY' ? 'Novo Aporte' :
                   moveType === 'SELL' ? 'Realizar Venda' : 'Atualizar Preço'}
                </h3>
                <p className="text-xs text-slate-500">{selectedInv.name}</p>
              </div>

              <button onClick={() => setIsMoveModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleMoveSubmit} className="p-6 space-y-4">
              {moveType !== 'UPDATE' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                  <input required type="number" step="any" className="w-full px-3 py-2 border rounded-lg"
                    value={moveQty} onChange={e => setMoveQty(e.target.value)} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {moveType === 'UPDATE' ? 'Preço Atual' : 'Preço Unitário'}
                </label>
                <input required type="number" step="any" className="w-full px-3 py-2 border rounded-lg"
                  value={movePrice} onChange={e => setMovePrice(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input required type="date" className="w-full px-3 py-2 border rounded-lg"
                  value={moveDate} onChange={e => setMoveDate(e.target.value)} />
              </div>

              {(moveType === 'BUY' || moveType === 'SELL') && (
                <div className="bg-brand-50 p-3 rounded-lg border border-brand-100">
                  <label className="block text-xs font-bold text-brand-800 mb-1">
                    {moveType === 'BUY' ? 'Debitar da conta:' : 'Creditar na conta:'}
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={moveAccount} onChange={e => setMoveAccount(e.target.value)}
                  >
                    <option value="">Não vincular financeiro</option>
                    {data.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-bold text-white transition-colors 
                  ${moveType === 'BUY'
                    ? 'bg-green-600 hover:bg-green-700'
                    : moveType === 'SELL'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvestmentDashboard;
