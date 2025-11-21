import React, { useState } from 'react';
import { Goal } from '../types';
import { Target, Plus, Trophy } from 'lucide-react';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (g: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (g: Goal) => void;
}

export const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onUpdateGoal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({
      name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      deadline
    });
    setIsModalOpen(false);
    setName(''); setTarget(''); setDeadline('');
  };

  const handleContribution = (goal: Goal, amount: number) => {
    onUpdateGoal({
        ...goal,
        currentAmount: goal.currentAmount + amount
    });
  };

  return (
    <div className="pb-20">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Metas Financeiras</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
                <div key={goal.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-brand-50 p-3 rounded-lg text-brand-600">
                            <Trophy size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Alvo</p>
                            <p className="font-bold text-slate-800">R$ {goal.targetAmount.toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-800 mb-1">{goal.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>

                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-brand-700">{progress.toFixed(0)}%</span>
                            <span className="text-slate-500">R$ {goal.currentAmount.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                            <div className="bg-brand-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                           onClick={() => handleContribution(goal, 100)}
                           className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            + R$ 100
                        </button>
                        <button 
                           onClick={() => handleContribution(goal, 500)}
                           className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            + R$ 500
                        </button>
                    </div>
                </div>
            );
        })}
        
        {goals.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Target size={48} className="mb-4 opacity-50" />
                <p>Você ainda não definiu nenhuma meta. Que tal começar agora?</p>
            </div>
        )}
      </div>

      {/* Add Goal Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Nova Meta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Meta</label>
                <input required type="text" className="w-full input-std px-3 py-2 border rounded-lg" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Viagem Fim de Ano" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Alvo (R$)</label>
                <input required type="number" className="w-full input-std px-3 py-2 border rounded-lg" value={target} onChange={e => setTarget(e.target.value)} placeholder="5000" />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Limite</label>
                <input required type="date" className="w-full input-std px-3 py-2 border rounded-lg" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors">Criar Meta</button>
            </form>
          </div>
        </div>
       )}
    </div>
  );
};
