
import React, { useMemo, useState } from 'react';
import { AppData, TransactionType } from '../types';
import {  TrendingUp, TrendingDown, DollarSign, AlertCircle, PiggyBank, Calendar, CheckCircle2, CircleDashed } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  data: AppData;
  onViewDetails: () => void;
}

type ChartPeriod = 'MONTHLY' | 'BIMONTHLY' | 'SEMIANNUAL' | 'ANNUAL';

export const Dashboard: React.FC<DashboardProps> = ({ data, onViewDetails }) => {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('SEMIANNUAL');

  const summary = useMemo(() => {
    const income = data.transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = data.transactions
      .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN)
      .reduce((acc, t) => acc + t.amount, 0);
    const investment = data.transactions
      .filter(t => t.type === TransactionType.INVESTMENT)
      .reduce((acc, t) => acc + t.amount, 0);
    
    return { income, expense, investment, balance: income - expense - investment };
  }, [data.transactions]);

  const upcomingBills = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const next3Days = new Date(today);
    next3Days.setDate(today.getDate() + 3);
    
    return data.transactions.filter(t => {
      if (!t.dueDate || t.paid) return false;
      const due = new Date(t.dueDate + 'T00:00:00'); // Fix timezone offset
      return due >= today && due <= next3Days;
    });
  }, [data.transactions]);

  // --- Provisioning Logic ---
  const provisioning = useMemo(() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const filterExpenses = (t: any) => t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN;

      // Monthly Provision
      const monthExpenses = data.transactions.filter(t => {
          const d = new Date(t.date + 'T00:00:00');
          return filterExpenses(t) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const totalMonth = monthExpenses.reduce((acc, t) => acc + t.amount, 0);
      const paidMonth = monthExpenses.filter(t => t.paid).reduce((acc, t) => acc + t.amount, 0);

      // Annual Provision
      const yearExpenses = data.transactions.filter(t => {
          const d = new Date(t.date + 'T00:00:00');
          return filterExpenses(t) && d.getFullYear() === currentYear;
      });
      const totalYear = yearExpenses.reduce((acc, t) => acc + t.amount, 0);
      const paidYear = yearExpenses.filter(t => t.paid).reduce((acc, t) => acc + t.amount, 0);

      return {
          month: { total: totalMonth, paid: paidMonth, pending: totalMonth - paidMonth },
          year: { total: totalYear, paid: paidYear, pending: totalYear - paidYear }
      };
  }, [data.transactions]);

  // --- Chart Logic ---
  const chartData = useMemo(() => {
    const today = new Date();
    const dataPoints = [];

    if (chartPeriod === 'MONTHLY') {
        // Show days of current month
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayStr = i.toString().padStart(2, '0');
            dataPoints.push({
                name: dayStr,
                fullDate: `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${dayStr}`,
                income: 0,
                expense: 0
            });
        }

        data.transactions.forEach(t => {
            const tDate = new Date(t.date + 'T00:00:00');
            if (tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()) {
                 const dayIndex = tDate.getDate() - 1;
                 if (dataPoints[dayIndex]) {
                     if (t.type === TransactionType.INCOME) dataPoints[dayIndex].income += t.amount;
                     if (t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN) dataPoints[dayIndex].expense += t.amount;
                 }
            }
        });

    } else {
        // Monthly aggregation logic for other periods
        let monthsToLookBack = 6;
        if (chartPeriod === 'BIMONTHLY') monthsToLookBack = 2;
        if (chartPeriod === 'ANNUAL') monthsToLookBack = 12;

        for (let i = 0; i < monthsToLookBack; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - (monthsToLookBack - 1) + i, 1);
            dataPoints.push({
                name: d.toLocaleDateString('pt-BR', { month: 'short' }),
                month: d.getMonth(),
                year: d.getFullYear(),
                income: 0,
                expense: 0
            });
        }

        data.transactions.forEach(t => {
            const tDate = new Date(t.date + 'T00:00:00');
            const point = dataPoints.find(p => p.month === tDate.getMonth() && p.year === tDate.getFullYear());
            if (point) {
                if (t.type === TransactionType.INCOME) point.income += t.amount;
                if (t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN) point.expense += t.amount;
            }
        });
    }

    return dataPoints;
  }, [data.transactions, chartPeriod]);

  const renderProvisionCard = (title: string, data: { total: number, paid: number, pending: number }) => {
      const progress = data.total > 0 ? (data.paid / data.total) * 100 : 0;
      return (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mr-3">
                        <Calendar size={20} />
                    </div>
                    <h3 className="font-bold text-slate-700">{title}</h3>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                    Total Previsto: R$ {data.total.toLocaleString('pt-BR', {minimumFractionDigits: 0})}
                </span>
            </div>
            
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Pago ({progress.toFixed(0)}%)</span>
                        <span className="font-bold text-slate-700">R$ {data.paid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{width: `${progress}%`}}></div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-50">
                    <div className="flex items-center text-green-600">
                        <CheckCircle2 size={14} className="mr-1"/>
                        <span>Pago: R$ {data.paid.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</span>
                    </div>
                    <div className="flex items-center text-amber-600">
                        <CircleDashed size={14} className="mr-1"/>
                        <span>Falta: R$ {data.pending.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</span>
                    </div>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Olá, {data.userMode === 'COUPLE' ? 'Casal' : 'Viajante'}! 👋</h2>
            <p className="text-slate-500">Aqui está o resumo financeiro.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Saldo Atual</p>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Entradas</p>
            <p className="text-2xl font-bold text-green-600">
              +R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Saídas</p>
            <p className="text-2xl font-bold text-red-600">
              -R$ {summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Investido</p>
            <p className="text-2xl font-bold text-purple-600">
              R$ {summary.investment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <PiggyBank size={20} />
          </div>
        </div>
      </div>

      {/* Provisioning Section */}
      <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3">Provisionamento de Despesas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderProvisionCard('Este Mês', provisioning.month)}
              {renderProvisionCard('Este Ano', provisioning.year)}
          </div>
      </div>

      {/* Alert Banner */}
      {upcomingBills.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-amber-600 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Atenção aos vencimentos!</h4>
            <p className="text-sm text-amber-700 mt-1">
              Você tem {upcomingBills.length} conta(s) vencendo nos próximos 3 dias.
            </p>
            <ul className="mt-2 text-sm text-amber-800 list-disc list-inside">
              {upcomingBills.map(bill => (
                <li key={bill.id}>{bill.description} - R$ {bill.amount} (Vence: {new Date(bill.dueDate! + 'T00:00:00').toLocaleDateString('pt-BR')})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Charts Area */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm min-h-[400px]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-slate-800">Fluxo de Caixa</h3>
            
            {/* Period Selector */}
            <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                {[
                    { id: 'MONTHLY', label: 'Mensal' },
                    { id: 'BIMONTHLY', label: 'Bimestral' },
                    { id: 'SEMIANNUAL', label: 'Semestral' },
                    { id: 'ANNUAL', label: 'Anual' }
                ].map((period) => (
                    <button
                        key={period.id}
                        onClick={() => setChartPeriod(period.id as ChartPeriod)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                            chartPeriod === period.id 
                            ? 'bg-white text-brand-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {period.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-80">
            <div className="h-full">
                <p className="text-center text-xs text-slate-400 mb-2">Evolução {chartPeriod === 'MONTHLY' ? 'Diária' : 'Mensal'}</p>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
                    />
                    <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Receitas" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Despesas" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="h-full border-l border-slate-50 pl-0 lg:pl-6">
                <p className="text-center text-xs text-slate-400 mb-2">Comparativo Entradas x Saídas</p>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Entrada" />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Saída" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};
