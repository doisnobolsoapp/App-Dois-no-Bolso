// src/components/Dashboard.tsx
import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3
} from 'lucide-react';
import { AppData, ViewState } from '../types';

interface DashboardProps {
  data: AppData;
  onViewChange: (view: ViewState) => void;
}

interface CashFlowData {
  period: string;
  income: number;
  expenses: number;
  balance: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onViewChange }) => {
  const [cashFlowRange, setCashFlowRange] = useState<'last6' | 'next3' | 'next6' | 'next12'>('last6');

  // Calcular totais
  const totals = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthTransactions = data.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    // CORREÇÃO: Usa currentBalance que existe na interface CreditCard
    const creditCardBalance = data.creditCards.reduce((sum, card) => {
      return sum + (card.currentBalance || 0);
    }, 0);

    return {
      income,
      expenses,
      balance: totalBalance,
      creditCardBalance: Math.abs(creditCardBalance),
      netWorth: totalBalance + creditCardBalance
    };
  }, [data.transactions, data.accounts, data.creditCards]);

  // Calcular fluxo de caixa baseado no período selecionado
  const cashFlowData = useMemo((): CashFlowData[] => {
    const today = new Date();
    const months: CashFlowData[] = [];

    if (cashFlowRange === 'last6') {
      // Últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthTransactions = data.transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getMonth() === date.getMonth() && 
                 transactionDate.getFullYear() === date.getFullYear();
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        months.push({
          period: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          income,
          expenses,
          balance: income - expenses
        });
      }
    } else {
      // Próximos meses (previsão)
      const monthCount = cashFlowRange === 'next3' ? 3 : cashFlowRange === 'next6' ? 6 : 12;
      
      // Calcular média de receitas e despesas dos últimos 3 meses para previsão
      const last3Months = data.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        return transactionDate >= threeMonthsAgo;
      });

      const avgIncome = last3Months
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) / 3;

      const avgExpenses = last3Months
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) / 3;

      for (let i = 1; i <= monthCount; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        
        // Aplicar uma variação aleatória de ±10% para simular previsão mais realista
        const variation = 0.9 + Math.random() * 0.2;
        
        months.push({
          period: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          income: avgIncome * variation,
          expenses: avgExpenses * variation,
          balance: (avgIncome - avgExpenses) * variation
        });
      }
    }

    return months;
  }, [data.transactions, cashFlowRange]);

  // Calcular categorias de despesas
  const expenseCategories = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = data.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'expense';
    });

    const categories: { [key: string]: number } = {};
    currentMonthExpenses.forEach(transaction => {
      const category = transaction.category || 'Outros';
      categories[category] = (categories[category] || 0) + transaction.amount;
    });

    return Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [data.transactions]);

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    onClick 
  }: { 
    title: string;
    value: string;
    subtitle?: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    onClick?: () => void;
  }) => (
    <div 
      className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer hover:border-blue-200' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${
          trend === 'up' ? 'bg-green-100 text-green-600' :
          trend === 'down' ? 'bg-red-100 text-red-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-slate-600 font-medium text-sm">{title}</p>
      {subtitle && (
        <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
          <p className="text-slate-600">Resumo financeiro do seu mês atual</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onViewChange('transactions')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Nova Transação
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(totals.income)}
          icon={TrendingUp}
          trend="up"
          onClick={() => onViewChange('transactions')}
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(totals.expenses)}
          icon={TrendingDown}
          trend="down"
          onClick={() => onViewChange('transactions')}
        />
        <StatCard
          title="Saldo Total"
          value={formatCurrency(totals.balance)}
          subtitle="Contas bancárias"
          icon={DollarSign}
          trend={totals.balance >= 0 ? 'up' : 'down'}
          onClick={() => onViewChange('accountSettings')}
        />
        <StatCard
          title="Cartões de Crédito"
          value={formatCurrency(totals.creditCardBalance)}
          subtitle="Fatura em aberto"
          icon={CreditCard}
          trend="down"
          onClick={() => onViewChange('cards')}
        />
      </div>

      {/* Cash Flow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Fluxo de Caixa
                </h2>
                <p className="text-slate-600 text-sm">
                  {cashFlowRange === 'last6' ? 'Últimos 6 meses' : 
                   cashFlowRange === 'next3' ? 'Previsão próximos 3 meses' :
                   cashFlowRange === 'next6' ? 'Previsão próximos 6 meses' : 
                   'Previsão próximos 12 meses'}
                </p>
              </div>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setCashFlowRange('last6')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    cashFlowRange === 'last6'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Últimos 6M
                </button>
                <button
                  onClick={() => setCashFlowRange('next3')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    cashFlowRange === 'next3'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Próximos 3M
                </button>
                <button
                  onClick={() => setCashFlowRange('next6')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    cashFlowRange === 'next6'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Próximos 6M
                </button>
                <button
                  onClick={() => setCashFlowRange('next12')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    cashFlowRange === 'next12'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Próximos 12M
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {cashFlowData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 text-sm font-medium text-slate-600">
                      {month.period}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <ArrowUpRight size={14} />
                          <span>{formatCurrency(month.income)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <ArrowDownRight size={14} />
                          <span>{formatCurrency(month.expenses)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    month.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(month.balance)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <PieChart size={20} />
            Top Despesas do Mês
          </h2>
          
          <div className="space-y-4">
            {expenseCategories.length > 0 ? (
              expenseCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: [
                          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'
                        ][index % 5]
                      }}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <PieChart size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma despesa este mês</p>
              </div>
            )}
          </div>

          {expenseCategories.length > 0 && (
            <button 
              onClick={() => onViewChange('reports')}
              className="w-full mt-6 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
            >
              Ver relatório completo
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onViewChange('transactions')}
            className="p-4 text-left border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <DollarSign size={20} className="text-blue-600 mb-2" />
            <div className="font-medium text-slate-800">Nova Transação</div>
            <div className="text-sm text-slate-600">Registrar entrada/saída</div>
          </button>
          
          <button 
            onClick={() => onViewChange('goals')}
            className="p-4 text-left border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <TrendingUp size={20} className="text-green-600 mb-2" />
            <div className="font-medium text-slate-800">Metas</div>
            <div className="text-sm text-slate-600">Acompanhar objetivos</div>
          </button>
          
          <button 
            onClick={() => onViewChange('calendar')}
            className="p-4 text-left border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Calendar size={20} className="text-purple-600 mb-2" />
            <div className="font-medium text-slate-800">Calendário</div>
            <div className="text-sm text-slate-600">Agendar pagamentos</div>
          </button>
          
          <button 
            onClick={() => onViewChange('accountSettings')}
            className="p-4 text-left border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <CreditCard size={20} className="text-orange-600 mb-2" />
            <div className="font-medium text-slate-800">Contas</div>
            <div className="text-sm text-slate-600">Gerenciar contas</div>
          </button>
        </div>
      </div>
    </div>
  );
};
