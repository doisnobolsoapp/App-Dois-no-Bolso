import React, { useState } from 'react';
import { CreditCard } from '../types';
import { CreditCard as CreditCardIcon, Plus, Trash2, Edit3 } from 'lucide-react';

interface CreditCardListProps {
  cards: CreditCard[];
  onAddCreditCard: (c: Omit<CreditCard, 'id'>) => void;
  onDeleteCreditCard: (id: string) => void;
  onUpdateCreditCard: (c: CreditCard) => void;
}

export const CreditCardList: React.FC<CreditCardListProps> = ({
  cards,
  onAddCreditCard,
  onDeleteCreditCard,
  onUpdateCreditCard
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [formName, setFormName] = useState('');
  const [formLimit, setFormLimit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(formLimit) || 0;

    if (editingCard) {
      onUpdateCreditCard({
        ...editingCard,
        name: formName,
        limit: limit,
        dueDate: editingCard.dueDate || "2025-01-01",
        currentBalance: editingCard.currentBalance ?? 0
      });
    } else {
      onAddCreditCard({
        name: formName,
        limit: limit,
        dueDate: "2025-01-01",
        currentBalance: 0
      });
    }

    setIsModalOpen(false);
    setEditingCard(null);
    setFormName('');
    setFormLimit('');
  };

  const openEditModal = (card: CreditCard) => {
    setEditingCard(card);
    setFormName(card.name);
    setFormLimit(card.limit.toString());
    setIsModalOpen(true);
  };

  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
  const totalUsed = cards.reduce((sum, card) => sum + (card.currentBalance || 0), 0);
  const availableLimit = totalLimit - totalUsed;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cartões de Crédito</h2>
          <p className="text-slate-500 text-sm">Gerencie seus cartões</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Novo Cartão
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Limite Total</p>
          <p className="text-2xl font-bold text-slate-800">
            R$ {totalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Limite Disponível</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">Utilizado</p>
          <p className="text-2xl font-bold text-red-600">
            R$ {totalUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => {
          const usedPercentage = card.currentBalance
            ? (card.currentBalance / card.limit) * 100
            : 0;

          return (
            <div key={card.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-red-50 p-3 rounded-lg text-red-600">
                  <CreditCardIcon size={24} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(card)}
                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteCreditCard(card.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-800 mb-1">{card.name}</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Limite</p>
                  <p className="font-bold text-slate-800">
                    R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Utilizado</p>
                  <p className="font-bold text-red-600">
                    R$ {(card.currentBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {cards.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <CreditCardIcon size={48} className="mb-4 opacity-50" />
            <p className="text-center">Você ainda não cadastrou nenhum cartão de crédito.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-brand-600 hover:text-brand-700 font-medium"
            >
              Cadastrar primeiro cartão
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCard(null);
                  setFormName('');
                  setFormLimit('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cartão</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Nubank Visa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Limite (R$)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formLimit}
                  onChange={e => setFormLimit(e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors"
              >
                {editingCard ? "Atualizar" : "Cadastrar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
