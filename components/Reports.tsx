import React, { useMemo, useState } from 'react';
import { AppData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ReportsProps {
  data: AppData;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28',
  '#FF8042', '#8884d8', '#82ca9d', '#ffc658'
];

export const Reports: React.FC<ReportsProps> = ({ data }) => {

  // -------------------------------------------
  // Estados dos filtros
  // -------------------------------------------
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'income' | 'expense' | 'investment' | 'loan'>('expense');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Lista dinâmica de anos
  const yearsList = useMemo(() => {
    const years = new Set<string>();
    data.transactions.forEach(t => {
      const y = t.date.split('-')[0];
      years.add(y);
    });
    return Array.from(years);
  }, [data.transactions]);

  // Lista dinâmica de categorias
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    data.transactions.forEach(t => {
      if (t.type === "expense") cats.add(t.category);
    });
    return Array.from(cats);
  }, [data.transactions]);

  // -------------------------------------------
  // Filtragem de dados
  // -------------------------------------------
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(t => {

      // filtrar tipo de transação
      if (filterType !== "ALL" && t.type !== filterType) return false;

      // filtrar ano
      const [year, month] = t.date.split('-');
      if (filterYear !== 'ALL' && filterYear !== year) return false;

      // filtrar mês
      if (filterMonth !== 'ALL' && filterMonth !== month) return false;

      // filtrar categoria (somente despesas)
      if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;

      return true;
    });
  }, [data.transactions, filterMonth, filterYear, filterType, filterCategory]);

  // -------------------------------------------
  // Dados do gráfico de categorias
  // -------------------------------------------
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();

    filteredTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  return (
    <div className="pb-20 space-y-6">
      
      <h2 className="text-2xl font-bold text-slate-800">Relatórios Detalhados</h2>
      <p className="text-slate-500 text-sm mb-4">Use os filtros abaixo para personalizar a visualização.</p>

      {/* -------------------------------------------
         FILTROS
      -------------------------------------------- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
          <select
            className="w-full px-3 py-2 border rounded-lg bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="ALL">Todos</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
            <option value="investment">Investimentos</option>
            <option value="loan">Empréstimos</option>
          </select>
        </div>

        {/* Ano */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ano</label>
          <select
            className="w-full px-3 py-2 border rounded-lg bg-white"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="ALL">Todos</option>
            {yearsList.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Mês */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mês</label>
          <select
            className="w-full px-3 py-2 border rounded-lg bg-white"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="ALL">Todos</option>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
          <select
            className="w-full px-3 py-2 border rounded-lg bg-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">Todas</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

      </div>

      {/* -------------------------------------------
         CONTEÚDO: GRÁFICO + INSIGHTS
      -------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Gráfico */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-96">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
            Despesas por Categoria
          </h3>

          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Sem dados para exibir.
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Insights Rápidos</h3>

          <ul className="space-y-4">
            
            {/* Maior gasto */}
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">💡</div>
              <div>
                <p className="font-medium text-slate-800">Maior Gasto</p>
                <p className="text-sm text-slate-500">
                  {categoryData.length > 0
                    ? `${[...categoryData].sort((a, b) => b.value - a.value)[0].name} é sua categoria mais cara.`
                    : 'Registre despesas para ver insights.'}
                </p>
              </div>
            </li>

            {/* Dica de investimento */}
            <li className="flex items-start">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">📈</div>
              <div>
                <p className="font-medium text-slate-800">Investimentos</p>
                <p className="text-sm text-slate-500">
                  Aporte regularmente para acelerar seu crescimento patrimonial.
                </p>
              </div>
            </li>

          </ul>
        </div>

      </div>

    </div>
  );
};
