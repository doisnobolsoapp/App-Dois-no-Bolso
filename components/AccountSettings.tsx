// src/components/AccountSettings.tsx
import { useState } from 'react';
import { Plus, Edit2, Trash2, Minus } from 'lucide-react';

interface AccountSettingsProps {
  accounts: any[];
  onAddAccount: (accountData: any) => void;
  onDeleteAccount: (id: string) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ 
  accounts, 
  onAddAccount, 
  onDeleteAccount 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'asset' as 'asset' | 'liability',
    category: '',
    balance: 0,
    currency: 'BRL',
    balanceType: 'positive' as 'positive' | 'negative'
  });

  const categories = {
    asset: ['Banco', 'Dinheiro', 'Investimentos', 'Outros'],
    liability: ['Cartão de Crédito', 'Financiamentos', 'Empréstimos', 'Outros']
  };

  // Normalizar as contas para a estrutura esperada
  const normalizedAccounts = accounts.map(account => ({
    id: account.id,
    name: account.name,
    type: account.type || (account.balance >= 0 ? 'asset' : 'liability'),
    category: account.category || 'Outros',
    balance: account.balance,
    currency: account.currency || 'BRL'
  }));

  // Calcular totais por categoria
  const categoryTotals = normalizedAccounts.reduce((acc, account) => {
    if (!acc[account.category]) {
      acc[account.category] = 0;
    }
    acc[account.category] += account.balance;
    return acc;
  }, {} as Record<string, number>);

  // Separar contas por tipo
  const assets = normalizedAccounts.filter(account => account.type === 'asset' || account.balance >= 0);
  const liabilities = normalizedAccounts.filter(account => account.type === 'liability' || account.balance < 0);

  // Agrupar por categoria
  const groupedAssets = assets.reduce((acc, account) => {
    const category = account.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(account);
    return acc;
  }, {} as Record<string, typeof normalizedAccounts>);

  const groupedLiabilities = liabilities.reduce((acc, account) => {
    const category = account.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(account);
    return acc;
  }, {} as Record<string, typeof normalizedAccounts>);

  // Calcular balanço patrimonial
  const totalAtivos = assets.reduce((sum, account) => sum + Math.abs(account.balance), 0);
  const totalPassivos = liabilities.reduce((sum, account) => sum + Math.abs(account.balance), 0);
  const balancoPatrimonial = totalAtivos - totalPassivos;

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      // Adiciona a nova categoria à lista apropriada
      if (newAccount.type === 'asset') {
        categories.asset.push(newCategory.trim());
      } else {
        categories.liability.push(newCategory.trim());
      }
      setNewAccount({ ...newAccount, category: newCategory.trim() });
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.category) return;

    // Calcular saldo baseado no tipo e no balanceType
    const absoluteBalance = Math.abs(newAccount.balance);
    const finalBalance = newAccount.balanceType === 'positive' ? absoluteBalance : -absoluteBalance;

    const accountData = {
      name: newAccount.name,
      type: newAccount.type,
      category: newAccount.category,
      balance: finalBalance,
      currency: newAccount.currency
    };

    onAddAccount(accountData);
    setNewAccount({
      name: '',
      type: 'asset',
      category: '',
      balance: 0,
      currency: 'BRL',
      balanceType: 'positive'
    });
    setShowAddModal(false);
    setShowNewCategoryInput(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderAccountGroup = (title: string, groups: Record<string, any[]>, isAsset: boolean) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
      
      {Object.entries(groups).map(([category, categoryAccounts]) => (
        <div key={category} className="mb-6">
          <div className="flex justify-between items-center mb-3 p-3 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-slate-700">{category}</h3>
            <span className={`font-bold ${isAsset ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(categoryTotals[category] || 0)}
            </span>
          </div>
          
          <div className="space-y-2">
            {categoryAccounts.map(account => (
              <div key={account.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg">
                <div>
                  <span className="font-medium text-slate-800">{account.name}</span>
                  <span className="text-sm text-slate-500 ml-2">{account.currency || 'BRL'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(account.balance)}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-1 text-slate-400 hover:text-blue-600">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="p-1 text-slate-400 hover:text-red-600"
                      onClick={() => onDeleteAccount(account.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Configuração de Contas</h1>
        <p className="text-slate-600">Configuração do Fluxo de Caixa Grupo de Contas</p>
        <p className="text-sm text-slate-500">
          Saldo a partir de hoje: {new Date().toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>

      {/* ATIVOS */}
      {Object.keys(groupedAssets).length > 0 ? (
        renderAccountGroup('ATIVOS', groupedAssets, true)
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">ATIVOS</h2>
          <div className="text-center py-8 text-slate-500">
            Nenhuma conta ativa cadastrada
          </div>
        </div>
      )}

      {/* PASSIVOS */}
      {Object.keys(groupedLiabilities).length > 0 ? (
        renderAccountGroup('PASSIVOS', groupedLiabilities, false)
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">PASSIVOS</h2>
          <div className="text-center py-8 text-slate-500">
            Nenhuma conta passiva cadastrada
          </div>
        </div>
      )}

      {/* Balanço Patrimonial */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">Balanço Patrimonial</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Total de Ativos</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAtivos)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Total de Passivos</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPassivos)}</p>
          </div>
          <div className={`p-4 rounded-lg shadow-sm ${
            balancoPatrimonial >= 0 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Patrimônio Líquido</h3>
            <p className={`text-2xl font-bold ${
              balancoPatrimonial >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(balancoPatrimonial)}
            </p>
            <p className={`text-sm font-medium mt-1 ${
              balancoPatrimonial >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {balancoPatrimonial >= 0 ? '✅ Positivo' : '❌ Negativo'}
            </p>
          </div>
        </div>
      </div>

      {/* Botão Flutuante */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 z-40"
      >
        <Plus size={24} />
        <span className="font-semibold">Nova Conta</span>
      </button>

      {/* Modal Adicionar Conta */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Adicionar Nova Conta</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Bradesco, Cartão Nubank..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo
                </label>
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({
                    ...newAccount, 
                    type: e.target.value as 'asset' | 'liability',
                    category: '', // Reset category when type changes
                    balanceType: e.target.value === 'asset' ? 'positive' : 'negative' // Auto-set balance type
                  })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="asset">Ativo</option>
                  <option value="liability">Passivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Categoria
                </label>
                <div className="space-y-2">
                  <select
                    value={newAccount.category}
                    onChange={(e) => {
                      if (e.target.value === 'new-category') {
                        setShowNewCategoryInput(true);
                      } else {
                        setNewAccount({...newAccount, category: e.target.value});
                        setShowNewCategoryInput(false);
                      }
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories[newAccount.type].map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="new-category">+ Criar nova categoria</option>
                  </select>

                  {showNewCategoryInput && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nome da nova categoria"
                      />
                      <button
                        onClick={handleAddCategory}
                        className="px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Saldo Inicial
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setNewAccount({...newAccount, balanceType: 'positive'})}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        newAccount.balanceType === 'positive'
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-green-50'
                      }`}
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAccount({...newAccount, balanceType: 'negative'})}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        newAccount.balanceType === 'negative'
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-red-50'
                      }`}
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {newAccount.balanceType === 'positive' ? 
                    'Valor positivo' : 'Valor negativo (débito)'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowNewCategoryInput(false);
                }}
                className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAccount}
                disabled={!newAccount.name || !newAccount.category}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
