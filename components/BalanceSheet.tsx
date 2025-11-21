
import React, { useState, useMemo } from 'react';
import { AppData, TransactionType, Property, Debt } from '../types';
import { Scale, TrendingUp, TrendingDown, Building2, Car, BadgeDollarSign, Wallet, Landmark, CreditCard, FileDown, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface BalanceSheetProps {
  data: AppData;
  onAddProperty: (p: Omit<Property, 'id'>) => void;
  onDeleteProperty: (id: string) => void;
  onAddDebt: (d: Omit<Debt, 'id'>) => void;
  onDeleteDebt: (id: string) => void;
}

type Period = 'MONTHLY' | 'SEMIANNUAL' | 'ANNUAL';

const COLORS_ASSETS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
const COLORS_LIABILITIES = ['#ef4444', '#f87171', '#fca5a5', '#fecaca'];

export const BalanceSheet: React.FC<BalanceSheetProps> = ({ data, onAddProperty, onDeleteProperty, onAddDebt, onDeleteDebt }) => {
  const [period, setPeriod] = useState<Period>('MONTHLY');
  
  // Modal States
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  
  // Form States
  const [propName, setPropName] = useState('');
  const [propValue, setPropValue] = useState('');
  const [propType, setPropType] = useState<'REAL_ESTATE' | 'VEHICLE' | 'OTHER'>('OTHER');
  
  const [debtName, setDebtName] = useState('');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtRemaining, setDebtRemaining] = useState('');

  // --- CALCULATIONS ---

  // 1. Assets
  const assets = useMemo(() => {
      const cash = data.accounts.reduce((acc, a) => {
           // Calculate current balance of account
           const accountTrans = data.transactions.filter(t => t.accountId === a.id);
           const inc = accountTrans.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
           const exp = accountTrans.filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN || t.type === TransactionType.INVESTMENT).reduce((sum, t) => sum + t.amount, 0);
           return acc + (a.initialBalance + inc - exp);
      }, 0);

      const investments = data.investments.reduce((acc, i) => acc + (i.quantity * i.currentPrice), 0);
      const properties = data.properties.reduce((acc, p) => acc + p.value, 0);

      return {
          cash: Math.max(0, cash),
          investments,
          properties,
          total: Math.max(0, cash) + investments + properties
      };
  }, [data]);

  // 2. Liabilities
  const liabilities = useMemo(() => {
      // Credit Cards (Approximation: Total unpaid expenses on cards)
      const creditCardDebt = data.transactions
        .filter(t => t.paymentMethod === 'CREDIT_CARD' && t.type === TransactionType.EXPENSE && !t.paid)
        .reduce((acc, t) => acc + t.amount, 0);
      
      const longTermDebt = data.debts.reduce((acc, d) => acc + d.remainingAmount, 0);

      return {
          shortTerm: creditCardDebt,
          longTerm: longTermDebt,
          total: creditCardDebt + longTermDebt
      };
  }, [data]);

  // 3. Net Worth
  const netWorth = assets.total - liabilities.total;

  // 4. DRE (Result of Period)
  const dre = useMemo(() => {
      const now = new Date();
      const filterDate = (dString: string) => {
          const d = new Date(dString + 'T00:00:00');
          if (period === 'MONTHLY') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          if (period === 'SEMIANNUAL') {
               const sixMonthsAgo = new Date();
               sixMonthsAgo.setMonth(now.getMonth() - 6);
               return d >= sixMonthsAgo && d <= now;
          }
          if (period === 'ANNUAL') return d.getFullYear() === now.getFullYear();
          return false;
      };

      const filtered = data.transactions.filter(t => filterDate(t.date));
      
      const income = filtered.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
      const expenses = filtered.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
      const loans = filtered.filter(t => t.type === TransactionType.LOAN).reduce((acc, t) => acc + t.amount, 0); // Loan payments usually go here as expense flow
      const investments = filtered.filter(t => t.type === TransactionType.INVESTMENT).reduce((acc, t) => acc + t.amount, 0);

      return {
          income,
          expenses: expenses + loans, // Treating loan payments as cash outflow
          investments,
          result: income - (expenses + loans)
      };
  }, [data.transactions, period]);

  // --- CHART DATA ---
  const assetChartData = [
      { name: 'Caixa', value: assets.cash },
      { name: 'Investimentos', value: assets.investments },
      { name: 'Bens', value: assets.properties },
  ].filter(d => d.value > 0);

  // --- HANDLERS ---
  const handleAddProp = (e: React.FormEvent) => {
      e.preventDefault();
      onAddProperty({ name: propName, value: parseFloat(propValue), type: propType });
      setIsPropModalOpen(false);
      setPropName(''); setPropValue('');
  };

  const handleAddDebt = (e: React.FormEvent) => {
      e.preventDefault();
      onAddDebt({ name: debtName, totalAmount: parseFloat(debtTotal), remainingAmount: parseFloat(debtRemaining) });
      setIsDebtModalOpen(false);
      setDebtName(''); setDebtTotal(''); setDebtRemaining('');
  };

  const handleExport = () => {
      window.print();
  };

  return (
    <div className="pb-20 space-y-8 print:p-0">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div>
             <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                 <Scale className="mr-2 text-brand-600" />
                 Balanço Patrimonial
             </h2>
             <p className="text-slate-500 text-sm">Consolidado da sua saúde financeira.</p>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-lg border border-slate-200 flex">
                {(['MONTHLY', 'SEMIANNUAL', 'ANNUAL'] as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            period === p ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {p === 'MONTHLY' ? 'Mensal' : p === 'SEMIANNUAL' ? 'Semestral' : 'Anual'}
                    </button>
                ))}
            </div>
            <button onClick={handleExport} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50" title="Imprimir / PDF">
                <FileDown size={20} />
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-green-500">
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Total Ativos</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">R$ {assets.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-red-500">
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Total Passivos</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">R$ {liabilities.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-blue-600">
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Patrimônio Líquido</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">R$ {netWorth.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-purple-500">
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Resultado ({period === 'MONTHLY' ? 'Mês' : period === 'SEMIANNUAL' ? 'Semestre' : 'Ano'})</p>
              <p className={`text-2xl font-bold mt-1 ${dre.result >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dre.result >= 0 ? '+' : ''}R$ {dre.result.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </p>
          </div>
      </div>

      {/* Main Balance Sheet Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ASSETS COLUMN */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
                  <h3 className="font-bold text-green-800 flex items-center"><TrendingUp size={20} className="mr-2"/> ATIVOS</h3>
                  <p className="font-bold text-green-800">R$ {assets.total.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</p>
              </div>
              <div className="p-6 space-y-6">
                  {/* Cash */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center text-slate-700 font-medium"><Wallet size={16} className="mr-2 text-slate-400"/> Caixa e Equivalentes</div>
                          <span className="text-slate-800">R$ {assets.cash.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="pl-6 text-xs text-slate-500 space-y-1">
                          {data.accounts.map(acc => (
                              <div key={acc.id} className="flex justify-between">
                                  <span>{acc.name}</span>
                                  {/* Note: Ideally show calculated balance here, but for brevity just listing */}
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  {/* Investments */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center text-slate-700 font-medium"><TrendingUp size={16} className="mr-2 text-slate-400"/> Investimentos</div>
                          <span className="text-slate-800">R$ {assets.investments.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                  </div>

                  {/* Properties / Bens */}
                  <div>
                      <div className="flex justify-between items-center mb-2 border-t border-slate-50 pt-2">
                          <div className="flex items-center text-slate-700 font-medium"><Building2 size={16} className="mr-2 text-slate-400"/> Bens e Direitos</div>
                          <span className="text-slate-800">R$ {assets.properties.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="pl-6 space-y-2">
                          {data.properties.map(p => (
                              <div key={p.id} className="flex justify-between items-center text-sm group">
                                  <span className="flex items-center text-slate-600">
                                      {p.type === 'VEHICLE' ? <Car size={14} className="mr-2"/> : <Building2 size={14} className="mr-2"/>}
                                      {p.name}
                                  </span>
                                  <div className="flex items-center">
                                      <span className="mr-2">R$ {p.value.toLocaleString('pt-BR')}</span>
                                      <button onClick={() => onDeleteProperty(p.id)} className="text-red-300 hover:text-red-500 print:hidden"><Trash2 size={14}/></button>
                                  </div>
                              </div>
                          ))}
                          <button 
                            onClick={() => setIsPropModalOpen(true)} 
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center mt-2 print:hidden"
                          >
                              <Plus size={14} className="mr-1"/> Adicionar Bem
                          </button>
                      </div>
                  </div>
              </div>
              {/* Chart */}
              <div className="h-48 bg-slate-50 border-t border-slate-100 p-4">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie data={assetChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                               {assetChartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS_ASSETS[index % COLORS_ASSETS.length]} />
                               ))}
                           </Pie>
                           <Tooltip />
                       </PieChart>
                   </ResponsiveContainer>
              </div>
          </div>

          {/* LIABILITIES COLUMN */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                  <h3 className="font-bold text-red-800 flex items-center"><TrendingDown size={20} className="mr-2"/> PASSIVOS</h3>
                  <p className="font-bold text-red-800">R$ {liabilities.total.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</p>
              </div>
              <div className="p-6 space-y-6">
                  {/* Short Term */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center text-slate-700 font-medium"><CreditCard size={16} className="mr-2 text-slate-400"/> Circulante (Curto Prazo)</div>
                          <span className="text-slate-800">R$ {liabilities.shortTerm.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="pl-6 text-xs text-slate-500">
                          Faturas de Cartão em Aberto
                      </div>
                  </div>

                  {/* Long Term */}
                  <div>
                      <div className="flex justify-between items-center mb-2 border-t border-slate-50 pt-2">
                          <div className="flex items-center text-slate-700 font-medium"><Landmark size={16} className="mr-2 text-slate-400"/> Não Circulante (Longo Prazo)</div>
                          <span className="text-slate-800">R$ {liabilities.longTerm.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                       <div className="pl-6 space-y-2">
                          {data.debts.map(d => (
                              <div key={d.id} className="flex justify-between items-center text-sm group">
                                  <span className="text-slate-600">{d.name}</span>
                                  <div className="flex items-center">
                                      <span className="mr-2">R$ {d.remainingAmount.toLocaleString('pt-BR')}</span>
                                      <button onClick={() => onDeleteDebt(d.id)} className="text-red-300 hover:text-red-500 print:hidden"><Trash2 size={14}/></button>
                                  </div>
                              </div>
                          ))}
                          <button 
                            onClick={() => setIsDebtModalOpen(true)} 
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center mt-2 print:hidden"
                          >
                              <Plus size={14} className="mr-1"/> Adicionar Dívida Longa
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* DRE Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Demonstrativo de Resultados (DRE)</h3>
          
          <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded bg-green-50">
                  <span className="text-green-800 font-medium">(=) Receita Operacional</span>
                  <span className="text-green-800 font-bold">R$ {dre.income.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center px-2 text-slate-600">
                  <span>(-) Despesas e Custos</span>
                  <span className="text-red-500">- R$ {dre.expenses.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center px-2 text-slate-600 text-sm">
                  <span>(-) Investimentos Realizados (Saída de Caixa)</span>
                  <span className="text-purple-500">R$ {dre.investments.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </div>
              
              <div className="border-t-2 border-slate-200 my-2"></div>

              <div className={`flex justify-between items-center p-3 rounded-lg ${dre.result >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                  <div className="flex items-center">
                      <BadgeDollarSign className={`mr-2 ${dre.result >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                      <span className={`font-bold ${dre.result >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                          {dre.result >= 0 ? 'SUPERÁVIT' : 'DÉFICIT'} DO PERÍODO
                      </span>
                  </div>
                  <span className={`text-xl font-bold ${dre.result >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                      R$ {dre.result.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </span>
              </div>
          </div>
      </div>

      {/* Modal: Add Property */}
      {isPropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Adicionar Bem (Ativo)</h3>
              <button onClick={() => setIsPropModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddProp} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Bem</label>
                <input required className="w-full px-3 py-2 border rounded-lg" value={propName} onChange={e => setPropName(e.target.value)} placeholder="Ex: Carro, Apartamento" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor de Mercado Estimado</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-lg" value={propValue} onChange={e => setPropValue(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-white" value={propType} onChange={e => setPropType(e.target.value as any)}>
                    <option value="OTHER">Outros Bens</option>
                    <option value="REAL_ESTATE">Imóvel</option>
                    <option value="VEHICLE">Veículo</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700">Adicionar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Debt */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Adicionar Dívida Longo Prazo</h3>
              <button onClick={() => setIsDebtModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddDebt} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição da Dívida</label>
                <input required className="w-full px-3 py-2 border rounded-lg" value={debtName} onChange={e => setDebtName(e.target.value)} placeholder="Ex: Financiamento Casa" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total Original</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-lg" value={debtTotal} onChange={e => setDebtTotal(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Devedor Atual</label>
                <input required type="number" className="w-full px-3 py-2 border rounded-lg" value={debtRemaining} onChange={e => setDebtRemaining(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700">Adicionar Passivo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
