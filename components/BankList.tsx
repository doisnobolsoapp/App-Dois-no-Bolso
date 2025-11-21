import React, { useState } from 'react';
import { Account } from '../types';
import { Landmark, Plus, Trash2, Edit3 } from 'lucide-react';

interface BankListProps {
  accounts: Account[];
  onAddAccount: (a: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateAccount: (a: Account) => void;
}

export const BankList: React.FC<BankListProps> = ({ accounts, onAddAccount, onDeleteAccount, onUpdateAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formName, setFormName] = useState('');
  const [formBalance, setFormBalance] = useState('');
  const [formInstitution, setFormInstitution] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(formBalance) || 0;

    if (editingAccount) {
      onUpdateAccount({
        ...editingAccount,
        name: formName,
        initialBalance: balance,
        institution: formInstitution,
        type: 'Corrente',
        color: '#3B82F6'
      });
    } else {
      onAddAccount({
        name: formName,
        initialBalance: balance,
        institution: formInstitution,
        type: 'Corrente',
        color: '#3B82F6'
      });
    }

    setIsModalOpen(false);
    setEditingAccount(null);
    setFormName('');
    setFormBalance('');
    setFormInstitution('');
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormName(account.name);
    setFormBalance(account.initialBalance.toString());
    setFormInstitution(account.institution || '');
    setIsModalOpen(true);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.initialBalance, 0);

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Minhas Contas</h2>
          <p className="text-slate-500 text-sm">Gerencie suas contas bancárias</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Nova Conta
        </button>
      </div>

      {/* Total Balance */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm">Saldo Total em Contas</p>
            <p className="text-2xl font-bold text-slate-800">
              R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Landmark className="text-brand-600" size={32} />
        </div>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <div key={account.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-brand-50 p-3 rounded-lg text-brand-600">
                <Landmark size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditModal(account)}
                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => onDeleteAccount(account.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 mb-1">{account.name}</h3>
            {account.institution && (
              <p className="text-sm text-slate-500 mb-4">{account.institution}</p>
            )}
            
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800">
                R$ {account.initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Saldo atual</p>
            </div>
          </div>
        ))}
        
        {accounts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Landmark size={48} className="mb-4 opacity-50" />
            <p className="text-center">Você ainda não cadastrou nenhuma conta bancária.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-brand-600 hover:text-brand-700 font-medium"
            >
              Cadastrar primeira conta
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
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </h3>
              <button onClick={() => {
                setIsModalOpen(false);
                setEditingAccount(null);
                setFormName('');
                setFormBalance('');
                setFormInstitution('');
              }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Conta</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Conta Corrente Nubank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instituição</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formInstitution}
                  onChange={e => setFormInstitution(e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Bradesco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Inicial (R$)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formBalance}
                  onChange={e => setFormBalance(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors">
                {editingAccount ? 'Atualizar' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
