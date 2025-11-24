import React from 'react';
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
  
  const categoryData = React.useMemo(() => {
    const map = new Map<string, number>();

    data.transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [data.transactions]);

  return (
    <div className="pb-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Relatórios Detalhados</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gráfico de Pizza */}
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
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Sem dados de despesas para exibir.
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
                    ? `${[...categoryData].sort((a, b) => b.value - a.value)[0].name} é sua categoria com maior gasto.`
                    : 'Registre despesas para ver insights.'}
                </p>
              </div>
            </li>

            {/* Dica Investimentos */}
            <li className="flex items-start">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">📈</div>
              <div>
                <p className="font-medium text-slate-800">Investimentos</p>
                <p className="text-sm text-slate-500">
                  Faça aportes regulares para aumentar seu patrimônio a longo prazo.
                </p>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
