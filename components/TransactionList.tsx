import React, { useState, useMemo } from 'react';
import { AppData, Transaction, TransactionType, Category, PaymentMethod } from '../types';
import { TRANSACTION_TYPES_LABELS, CATEGORY_OPTIONS, PAYMENT_METHOD_LABELS } from '../constants';
import { Trash2, Plus, CreditCard, Landmark, Tag, X } from 'lucide-react';

interface TransactionListProps {
  data: AppData;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onAddMultipleTransactions: (ts: Omit<Transaction, 'id'>[]) => void;
  onDeleteTransaction: (id: string) => void;
  onAddCategory: (category: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ data, onAddTransaction, onAddMultipleTransactions, onDeleteTransaction, onAddCategory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  
  // Form State
  const [formType, setFormType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<string>(Category.FOOD);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPaid, setFormPaid] = useState(true);
  
  // Custom Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // New Form Fields
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [formAccountId, setFormAccountId] = useState<string>('');
  const [formCardId, setFormCardId] = useState<string>('');
  const [formInstallments, setFormInstallments] = useState<string>('1');

  const allCategories = useMemo(() => {
      return [...CATEGORY_OPTIONS, ...(data.customCategories || [])];
  }, [data.customCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logic to save new category if in creation mode
    let finalCategory = formCategory;
    if (isCreatingCategory) {
        if (!newCategoryName.trim()) return;
        onAddCategory(newCategoryName);
        finalCategory = newCategoryName;
        setIsCreatingCategory(false);
        setNewCategoryName('');
    }

    const amount = parseFloat(formAmount);
    const installments = parseInt(formInstallments);

    if (formPaymentMethod === PaymentMethod.CREDIT_CARD && installments > 1) {
        // Generate multiple transactions
        const newTransactions: Omit<Transaction, 'id'>[] = [];
        const baseDate = new Date(formDate);
        const installmentValue = amount / installments;

        for (let i = 0; i < installments; i++) {
            const date = new Date(baseDate);
            date.setMonth(date.getMonth() + i);
            
            newTransactions.push({
                type: formType,
                description: `${formDesc} (${i + 1}/${installments})`,
                amount: parseFloat(installmentValue.toFixed(2)),
                category: finalCategory,
                date: date.toISOString().split('T')[0],
                paid: false, // Future installments usually starts as unpaid
                paymentMethod: formPaymentMethod,
                cardId: formCardId || undefined,
                installments: { current: i + 1, total: installments }
            });
        }
        onAddMultipleTransactions(newTransactions);
    } else {
        // Single transaction
        onAddTransaction({
            type: formType,
            description: formDesc,
            amount: amount,
            category: finalCategory,
            date: formDate,
            paid: formPaid,
            dueDate: !formPaid ? formDate : undefined,
            paymentMethod: formPaymentMethod,
            accountId: (formPaymentMethod === PaymentMethod.BANK_TRANSFER || formPaymentMethod === PaymentMethod.DEBIT_CARD) ? formAccountId : undefined,
            cardId: formPaymentMethod === PaymentMethod.CREDIT_CARD ? formCardId : undefined
        });
    }

    setIsModalOpen(false);
    // Reset
    setFormDesc('');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod(PaymentMethod.CASH);
    setFormInstallments('1');
    setFormCategory(Category.FOOD);
    setIsCreatingCategory(false);
  };

  const filteredTransactions = data.transactions
    .filter(t => filterType === 'ALL' ? true : t.type === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="h-full flex flex-col pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Transações</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Nova Transação
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filterType === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Todas
        </button>
        {Object.entries(TRANSACTION_TYPES_LABELS).map(([key, label]) => (
          <button 
            key={key}
            onClick={() => setFilterType(key)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filterType === key ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-100 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Data</th>
              <th className="px-6 py-4 font-medium">Descrição</th>
              <th className="px-6 py-4 font-medium">Categoria/Método</th>
              <th className="px-6 py-4 font-medium text-right">Valor</th>
              <th className="px-6 py-4 font-medium text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTransactions.length === 0 && (
               <tr>
                 <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Nenhuma transação encontrada.</td>
               </tr>
            )}
            {filteredTransactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                  {new Date(t.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{t.description}</div>
                  <div className="text-xs text-slate-400">{TRANSACTION_TYPES_LABELS[t.type]}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 w-fit">
                        {t.category}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center">
                        {t.paymentMethod === PaymentMethod.CREDIT_CARD && <CreditCard size={10} className="mr-1"/>}
                        {t.paymentMethod === PaymentMethod.BANK_TRANSFER && <Landmark size={10} className="mr-1"/>}
                        {PAYMENT_METHOD_LABELS[t.paymentMethod]}
                        {t.installments && ` (${t.installments.current}/${t.installments.total})`}
                      </span>
                  </div>
                </td>
                <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-slate-800'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onDeleteTransaction(t.id)} className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-800">Nova Transação</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                   {(Object.keys(TRANSACTION_TYPES_LABELS) as TransactionType[]).map((type) => (
                     <button
                       key={type}
                       type="button"
                       onClick={() => setFormType(type)}
                       className={`px-3 py-2 text-xs rounded-lg border ${formType === type ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                     >
                       {TRANSACTION_TYPES_LABELS[type]}
                     </button>
                   ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Ex: Supermercado Semanal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                   <input 
                    required
                    type="date"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                {!isCreatingCategory ? (
                    <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    value={formCategory}
                    onChange={e => {
                        if (e.target.value === '__NEW__') {
                            setIsCreatingCategory(true);
                        } else {
                            setFormCategory(e.target.value);
                        }
                    }}
                    >
                    {allCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__NEW__" className="font-bold text-brand-600">+ Criar nova categoria...</option>
                    </select>
                ) : (
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            autoFocus
                            className="flex-1 px-3 py-2 border border-brand-500 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="Nome da nova categoria"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={() => setIsCreatingCategory(false)}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            title="Cancelar"
                        >
                            <X size={20}/>
                        </button>
                        <div className="flex items-center px-2 text-xs text-brand-600">
                            <Tag size={14} className="mr-1"/> Nova
                        </div>
                    </div>
                )}
              </div>

              {/* Payment Method Section */}
              <div className="pt-2 border-t border-slate-100">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                 <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    value={formPaymentMethod}
                    onChange={e => setFormPaymentMethod(e.target.value as PaymentMethod)}
                 >
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                 </select>
              </div>

              {(formPaymentMethod === PaymentMethod.BANK_TRANSFER || formPaymentMethod === PaymentMethod.DEBIT_CARD) && (
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Conta Bancária</label>
                      <select
                        required 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        value={formAccountId}
                        onChange={e => setFormAccountId(e.target.value)}
                      >
                        <option value="">Selecione a conta...</option>
                        {data.accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name} (Saldo: R$ {acc.initialBalance})</option>
                        ))}
                      </select>
                      {data.accounts.length === 0 && <p className="text-xs text-red-500 mt-1">Cadastre uma conta no menu "Minhas Contas" primeiro.</p>}
                  </div>
              )}

               {formPaymentMethod === PaymentMethod.CREDIT_CARD && (
                  <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cartão de Crédito</label>
                        <select 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                            value={formCardId}
                            onChange={e => setFormCardId(e.target.value)}
                        >
                            <option value="">Selecione o cartão...</option>
                            {data.creditCards.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {data.creditCards.length === 0 && <p className="text-xs text-red-500 mt-1">Cadastre um cartão no menu "Cartões" primeiro.</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Parcelas</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                            value={formInstallments}
                            onChange={e => setFormInstallments(e.target.value)}
                        >
                            <option value="1">À vista (1x)</option>
                            <option value="2">2x</option>
                            <option value="3">3x</option>
                            <option value="4">4x</option>
                            <option value="5">5x</option>
                            <option value="6">6x</option>
                            <option value="10">10x</option>
                            <option value="12">12x</option>
                        </select>
                      </div>
                  </div>
              )}
              
              {/* Status Checkbox - Hidden for Credit Card (defaults to unpaid until bill payment) */}
              {formPaymentMethod !== PaymentMethod.CREDIT_CARD && (
                <div className="flex items-center">
                    <input 
                    id="paid"
                    type="checkbox"
                    checked={formPaid}
                    onChange={e => setFormPaid(e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="paid" className="ml-2 text-sm text-slate-700">Já realizado/Pago?</label>
                </div>
              )}

              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-colors mt-4">
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
