import React, { useMemo } from 'react';
import { AppData, ViewState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardProps {
  data: AppData;
  onViewChange: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onViewChange }) => {
  // CÁLCULOS CORRIGIDOS PARA PERÍODOS ESPECÍFICOS
  const periodSummary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Mês atual
    const currentMonthTransactions = data.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    // Semestre atual (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    
    const semesterTransactions = data.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= sixMonthsAgo && transactionDate <= now;
    });

    // Ano atual
    const yearTransactions = data.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === currentYear;
    });

    // Cálculos para cada período
    const calculateSummary = (transactions: typeof data.transactions) => {
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
      
      const expense = transactions
        .filter(t => t.type === 'expense' || t.type === 'loan')
        .reduce((acc, t) => acc + t.amount, 0);
        
      const investments = transactions
        .filter(t => t.type === 'investment')
        .reduce((acc, t) => acc + t.amount, 0);

      const balance = income - expense - investments;

      return { income, expense, investments, balance };
    };

    return {
      currentMonth: calculateSummary(currentMonthTransactions),
      semester: calculateSummary(semesterTransactions),
      currentYear: calculateSummary(yearTransactions),
      overall: calculateSummary(data.transactions)
    };
  }, [data.transactions]);

  // FLUXO DE CAIXA CORRIGIDO
  const cashFlowData = useMemo(() => {
    const last6Months: { month: string; income: number; expense: number; net: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthTransactions = data.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
        
      const monthExpense = monthTransactions
        .filter(t => t.type === 'expense' || t.type === 'loan')
        .reduce((acc, t) => acc + t.amount, 0);

      last6Months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expense: monthExpense,
        net: monthIncome - monthExpense
      });
    }
    
    return last6Months;
  }, [data.transactions]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    data.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
      });
    
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data.transactions]);

  // STATS ATUALIZADOS COM OS NOVOS PERÍODOS
  const quickStats = [
    {
      label: 'Saldo Mês Atual',
      value: periodSummary.currentMonth.balance,
      trend: periodSummary.currentMonth.balance >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: periodSummary.currentMonth.balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: periodSummary.currentMonth.balance >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      label: 'Receitas Mês',
      value: periodSummary.currentMonth.income,
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Despesas Mês',
      value: periodSummary.currentMonth.expense,
      trend: 'down',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Fluxo Semestre',
      value: periodSummary.semester.balance,
      trend: periodSummary.semester.balance >= 0 ? 'up' : 'down',
      icon: Target,
      color: periodSummary.semester.balance >= 0 ? 'text-brand-600' : 'text-red-600',
      bgColor: periodSummary.semester.balance >= 0 ? 'bg-brand-100' : 'bg-red-100'
    }
  ];

  // NOVA SEÇÃO: RESUMO POR PERÍODO
  const periodStats = [
    {
      label: 'Mês Atual',
      income: periodSummary.currentMonth.income,
      expense: periodSummary.currentMonth.expense,
      balance: periodSummary.currentMonth.balance
    },
    {
      label: 'Últimos 6 Meses',
      income: periodSummary.semester.income,
      expense: periodSummary.semester.expense,
      balance: periodSummary.semester.balance
    },
    {
      label: 'Ano Atual',
      income: periodSummary.currentYear.income,
      expense: periodSummary.currentYear.expense,
      balance: periodSummary.currentYear.balance
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

      {/* NOVA SEÇÃO: FLUXO POR PERÍODO */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-6">Resumo do Fluxo de Caixa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {periodStats.map((period, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 mb-3">{period.label}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Receitas:</span>
                  <span className="text-green-600 font-medium">
                    R$ {period.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Despesas:</span>
                  <span className="text-red-600 font-medium">
                    R$ {period.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-100 pt-2">
                  <span className="text-slate-800 font-medium">Saldo:</span>
                  <span className={`font-bold ${
                    period.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    R$ {period.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts - Mantido igual mas agora funcionando */}
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

      {/* Quick Actions - CORRIGIDO */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onViewChange('transactions')}
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors"
          >
            <div className="bg-brand-100 p-2 rounded-lg inline-block mb-2">
              <TrendingUp className="text-brand-600" size={20} />
            </div>
            <p className="font-medium text-slate-800">Nova Transação</p>
          </button>
          
          <button 
            onClick={() => onViewChange('goals')}
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors"
          >
            <div className="bg-green-100 p-2 rounded-lg inline-block mb-2">
              <Target className="text-green-600" size={20} />
            </div>
            <p className="font-medium text-slate-800">Ver Metas</p>
          </button>
          
          <button 
            onClick={() => onViewChange('reports')}
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-lg inline-block mb-2">
              <PieChart className="text-blue-600" size={20} />
            </div>
            <p className="font-medium text-slate-800">Relatórios</p>
          </button>
          
          <button 
            onClick={() => onViewChange('calendar')}
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
