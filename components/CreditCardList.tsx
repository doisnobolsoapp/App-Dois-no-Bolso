
import React, { useState } from 'react';
import { AppData, CreditCard, TransactionType, PaymentMethod } from '../types';
import { CreditCard as CreditCardIcon, Plus, Trash2, Calendar } from 'lucide-react';

interface CreditCardListProps {
  data: AppData;
  onAddCard: (c: Omit<CreditCard, 'id'>) => void;
  onDeleteCard: (id: string) => void;
}

export const CreditCardList: React.FC<CreditCardListProps> = ({ data, onAddCard, onDeleteCard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('1');
  const [dueDay, setDueDay] = useState('10');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCard({
      name,
      limit: parseFloat(limit),
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
      color: 'black'
    });
    setIsModalOpen(false);
    setName(''); setLimit(''); setClosingDay('1'); setDueDay('10');
  };

  const getCardUsage = (card: CreditCard) => {
    // Calculate total unpaid expenses on this card
    // A more complex logic would consider billing cycles. For simplicity: sum of all unpaid expenses.
    return data.transactions
      .filter(t => t.cardId === card.id && t.type === TransactionType.EXPENSE && t.paymentMethod === PaymentMethod.CREDIT_CARD && !t.paid)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Meus Cartões de Crédito</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.creditCards.map(card => {
            const used = getCardUsage(card);
            const available = card.limit - used;
            const usagePercent = Math.min((used / card.limit) * 100, 100);
            
            return (
                <div key={card.id} className="bg-slate-900 text-white rounded-xl p-6 shadow-lg relative group overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                         <button 
                            onClick={() => { if(confirm('Tem certeza? O histórico de transações deste cartão será afetado.')) onDeleteCard(card.id) }}
                            className="text-slate-400 hover:text-red-500 p-1"
                         >
                             <Trash2 size={16} />
                         </button>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <CreditCardIcon className="text-brand-400 mr-3" size={24} />
                            <h3 className="font-bold text-lg tracking-wide">{card.name}</h3>
                        </div>
                        <div className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            Vence dia {card.dueDay}
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-slate-400 text-xs mb-1">Fatura Atual (Estimada)</p>
                        <p className="text-2xl font-bold">R$ {used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Limite Usado {usagePercent.toFixed(0)}%</span>
                            <span>Disponível: R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-brand-500'}`} 
                                style={{ width: `${usagePercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center text-xs text-slate-500">
                        <Calendar size={12} className="mr-1" />
                        <span>Fecha dia {card.closingDay}</span>
                    </div>
                </div>
            );
        })}

        {data.creditCards.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center p-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <CreditCardIcon size={48} className="mb-4 opacity-50" />
                <p>Nenhum cartão de crédito cadastrado.</p>
                <p className="text-sm mt-2">Controle faturas e limites cadastrando seus cartões.</p>
            </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Novo Cartão</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apelido do Cartão</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Nubank Gold, XP Visa" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Limite Total (R$)</label>
                <input required type="number" step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" value={limit} onChange={e => setLimit(e.target.value)} placeholder="5000.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dia Fechamento</label>
                    <input required type="number" min="1" max="31" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" value={closingDay} onChange={e => setClosingDay(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dia Vencimento</label>
                    <input required type="number" min="1" max="31" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" value={dueDay} onChange={e => setDueDay(e.target.value)} />
                  </div>
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors">Salvar Cartão</button>
            </form>
          </div>
        </div>
       )}
    </div>
  );
};
