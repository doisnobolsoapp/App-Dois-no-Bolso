import React, { useMemo } from 'react';
import { AppData, TransactionType, ViewState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardProps {
  data: AppData;
  onViewChange: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onViewChange }) => {
  const summary = useMemo(() => {
    const income = data.transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = data.transactions
      .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN)
      .reduce((acc, t) => acc + t.amount, 0);
      
    const investments = data.transactions
      .filter(t => t.type === TransactionType.INVESTMENT)
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense - investments;

    return { income, expense, investments, balance };
  }, [data.transactions]);

  const cashFlowData = useMemo(() => {
    const last6Months: { month: string; income: number; expense: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      const monthIncome = data.transactions
        .filter(t => t.type === TransactionType.INCOME && 
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear())
        .reduce((acc, t) => acc + t.amount, 0);
        
      const monthExpense = data.transactions
        .filter(t => (t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN) && 
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear())
        .reduce((acc, t) => acc + t.amount, 0);

      last6Months.push({
        month: monthKey,
        income: monthIncome,
        expense: monthExpense
      });
    }
    
    return last6Months;
  }, [data.transactions]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    data.transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
      });
    
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data.transactions]);

  const quickStats = [
    {
      label: 'Saldo Atual',
      value: summary.balance,
      trend: summary.balance >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: summary.balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summary.balance >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      label: 'Receitas',
      value: summary.income,
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Despesas',
      value: summary.expense,
      trend: 'down',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Metas Ativas',
      value: data.goals.length,
      trend: 'neutral',
      icon: Target,
      color: 'text-brand-600',
      bgColor: 'bg-brand-100'
    }
  ];

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Financeiro</h2>
          <p className="text-slate-500 text-sm">Visão geral da sua situação financeira</p>
        </div>
        <div className="text-sm text-slate-500">
          Atualizado em {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' 
                    ? `R$ ${Math.abs(stat.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : stat.value
                  }
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
            {stat.trend !== 'neutral' && (
              <div className={`flex items-center mt-2 text-xs ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span className="ml-1">
                  {stat.trend === 'up' ? 'Positivo' : 'Negativo'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800">Fluxo de Caixa (Últimos 6 meses)</h3>
            <Calendar className="text-slate-400" size={20} />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar dataKey="income" fill="#10b981" name="Receitas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800">Top Categorias de Despesas</h3>
            <PieChart className="text-slate-400" size={20} />
          </div>
          <div className="h-80">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Sem dados de despesas para exibir
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onViewChange('TRANSACTIONS')}
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors"
          >
            <div className="bg-brand-100 p-2 rounded-lg inline-block mb-2">
              <TrendingUp className="text-brand-600" size={20} />
            </div>
            <p className="font-medium text-slate-800">Nova Transação</p>
          </button>
          
          <button 
            onClick={() => onViewChange('GOALS')}
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors"
          >
            <div className="bg-green-100 p-2 rounded-lg inline-block mb-2">
              <Target className="text-green-600" size={20} />
            </div>
            <p className="font-medium text-slate-800">Ver Metas</p>
          </button>
          
          <button 
            onClick={() => onViewChange('REPORTS')}
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-lg inline-block mb-2">
              <PieChart className="text-blue-600" size={20} />
            </div>
            <p className="font-medium text-slate-800">Relatórios</p>
          </button>
          
          <button 
            onClick={() => onViewChange('CALENDAR')}
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors"
          >
            <div className="bg-purple-100 p-2 rounded-lg inline-block mb-2">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <p className="font-medium text-slate-800">Calendário</p>
          </button>
        </div>
      </div>
    </div>
  );
};
