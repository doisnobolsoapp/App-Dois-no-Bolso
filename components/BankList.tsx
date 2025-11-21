
import React, { useState } from 'react';
import { AppData, Account, TransactionType } from '../types';
import { Landmark, Plus, Trash2, Wallet, Search, Check } from 'lucide-react';

interface BankListProps {
  data: AppData;
  onAddAccount: (a: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
}

// Lista de bancos populares com domínios para busca de logo
const PREDEFINED_BANKS = [
  { name: 'Nubank', domain: 'nubank.com.br' },
  { name: 'Itaú', domain: 'itau.com.br' },
  { name: 'Bradesco', domain: 'bradesco.com.br' },
  { name: 'Banco do Brasil', domain: 'bb.com.br' },
  { name: 'Caixa Econômica', domain: 'caixa.gov.br' },
  { name: 'Banco Inter', domain: 'inter.co' },
  { name: 'Santander', domain: 'santander.com.br' },
  { name: 'C6 Bank', domain: 'c6bank.com.br' },
  { name: 'BTG Pactual', domain: 'btgpactual.com' },
  { name: 'XP Investimentos', domain: 'xpi.com.br' },
  { name: 'Safra', domain: 'safra.com.br' },
  { name: 'Banco Original', domain: 'original.com.br' },
  { name: 'PicPay', domain: 'picpay.com' },
  { name: 'Mercado Pago', domain: 'mercadopago.com.br' },
];

const getBankLogo = (name: string) => {
    // Normaliza para encontrar parcial
    const bank = PREDEFINED_BANKS.find(b => 
        name.toLowerCase().includes(b.name.toLowerCase()) || 
        b.name.toLowerCase().includes(name.toLowerCase())
    );
    return bank ? `https://logo.clearbit.com/${bank.domain}` : null;
};

export const BankList: React.FC<BankListProps> = ({ data, onAddAccount, onDeleteAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Conta Corrente');
  const [initialBalance, setInitialBalance] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAccount({
      name,
      type,
      initialBalance: parseFloat(initialBalance),
      color: 'blue' // default color
    });
    setIsModalOpen(false);
    setName(''); setType('Conta Corrente'); setInitialBalance('');
  };

  const getAccountBalance = (account: Account) => {
    const transactions = data.transactions.filter(t => t.accountId === account.id);
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN || t.type === TransactionType.INVESTMENT)
      .reduce((acc, t) => acc + t.amount, 0);
    
    return account.initialBalance + income - expense;
  };

  const currentLogo = getBankLogo(name);

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Minhas Contas e Bancos</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.accounts.map(account => {
            const balance = getAccountBalance(account);
            const logoUrl = getBankLogo(account.name);

            return (
                <div key={account.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => { if(confirm('Tem certeza? Transações vinculadas perderão o vínculo.')) onDeleteAccount(account.id) }}
                            className="text-slate-400 hover:text-red-500 p-1"
                         >
                             <Trash2 size={16} />
                         </button>
                    </div>

                    <div className="flex items-center mb-4">
                        <div className={`rounded-full mr-4 flex-shrink-0 overflow-hidden border border-slate-100 ${logoUrl ? 'w-12 h-12' : 'bg-blue-100 text-blue-600 p-3'}`}>
                            {logoUrl ? (
                                <img src={logoUrl} alt={account.name} className="w-full h-full object-cover" />
                            ) : (
                                <Landmark size={24} />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg truncate max-w-[150px]" title={account.name}>{account.name}</h3>
                            <p className="text-xs text-slate-500">{account.type}</p>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <p className="text-sm text-slate-500 mb-1">Saldo Atual</p>
                        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-xs text-slate-400">
                        <span>Saldo Inicial: R$ {account.initialBalance.toFixed(2)}</span>
                    </div>
                </div>
            );
        })}

        {data.accounts.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center p-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Landmark size={48} className="mb-4 opacity-50" />
                <p>Nenhuma conta bancária cadastrada.</p>
                <p className="text-sm mt-2">Cadastre suas contas para controlar o saldo por instituição.</p>
            </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-800">Nova Conta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-6">
              
              {/* Bank Selector Grid */}
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Bancos Populares</label>
                  <div className="grid grid-cols-4 gap-2">
                      {PREDEFINED_BANKS.map(bank => {
                          const isSelected = name === bank.name;
                          const logo = `https://logo.clearbit.com/${bank.domain}`;
                          return (
                            <button
                                key={bank.name}
                                type="button"
                                onClick={() => setName(bank.name)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                                    isSelected 
                                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white mb-1">
                                    <img src={logo} alt={bank.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                </div>
                                <span className="text-[10px] text-center leading-tight text-slate-600 font-medium">{bank.name}</span>
                            </button>
                          )
                      })}
                  </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Instituição</label>
                <div className="flex items-center">
                    {currentLogo && (
                         <div className="absolute left-3 top-8 w-6 h-6 rounded-full overflow-hidden border border-slate-200">
                             <img src={currentLogo} alt="Logo" className="w-full h-full object-cover"/>
                         </div>
                    )}
                    <input 
                        required 
                        type="text" 
                        className={`w-full py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 ${currentLogo ? 'pl-11 pr-3' : 'px-3'}`} 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Ou digite o nome (ex: Carteira)" 
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Conta</label>
                <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    value={type}
                    onChange={e => setType(e.target.value)}
                >
                    <option>Conta Corrente</option>
                    <option>Conta Poupança</option>
                    <option>Carteira Física</option>
                    <option>Investimento</option>
                    <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Inicial (R$)</label>
                <input required type="number" step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} placeholder="0.00" />
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors">Salvar Conta</button>
            </form>
          </div>
        </div>
       )}
    </div>
  );
};
