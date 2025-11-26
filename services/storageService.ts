import { AppData, Transaction, Goal, Account, CreditCard, Investment, Property, Debt } from '../types';

const STORAGE_KEY = 'dois-no-bolso-data';

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
  
  // Dados iniciais padrão
  return {
    transactions: [],
    goals: [],
    accounts: [],
    creditCards: [],
    investments: [],
    properties: [],
    debts: []
  };
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};

// Funções auxiliares para gerar IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Operações para Transactions
export const addTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId()
  };
  return newTransaction;
};

export const addMultipleTransactions = (transactions: Omit<Transaction, 'id'>[]): Transaction[] => {
  return transactions.map(transaction => addTransaction(transaction));
};

export const deleteTransaction = (id: string) => {
  const data = loadData();
  const updatedTransactions = data.transactions.filter(t => t.id !== id);
  const updatedData: AppData = {
    ...data,
    transactions: updatedTransactions
  };
  saveData(updatedData);
};

// Operações para Goals
export const addGoal = (goal: Omit<Goal, 'id'>): Goal => {
  const newGoal: Goal = {
    ...goal,
    id: generateId()
  };
  return newGoal;
};

export const updateGoal = (goal: Goal) => {
  const data = loadData();
  const updatedGoals = data.goals.map(g => g.id === goal.id ? goal : g);
  const updatedData: AppData = {
    ...data,
    goals: updatedGoals
  };
  saveData(updatedData);
};

// Operações para Accounts
export const addAccount = (account: Omit<Account, 'id'>): Account => {
  const newAccount: Account = {
    ...account,
    id: generateId()
  };
  return newAccount;
};

export const deleteAccount = (id: string) => {
  const data = loadData();
  const updatedAccounts = data.accounts.filter(a => a.id !== id);
  const updatedData: AppData = {
    ...data,
    accounts: updatedAccounts
  };
  saveData(updatedData);
};

// Operações para Credit Cards
export const addCreditCard = (card: Omit<CreditCard, 'id'>): CreditCard => {
  const newCard: CreditCard = {
    ...card,
    id: generateId()
  };
  return newCard;
};

export const deleteCreditCard = (id: string) => {
  const data = loadData();
  const updatedCreditCards = data.creditCards.filter(c => c.id !== id);
  const updatedData: AppData = {
    ...data,
    creditCards: updatedCreditCards
  };
  saveData(updatedData);
};

// Operações para Investments - CORRIGIDO
export const addInvestment = (investment: Omit<Investment, 'id'>): Investment => {
  const newInvestment: Investment = {
    ...investment,
    id: generateId()
  };
  return newInvestment;
};

// Operações para Investments - CORRIGIDO (função simplificada)
export const addInvestmentMovement = (invId: string) => {
  const data = loadData();
  const investment = data.investments.find(inv => inv.id === invId);
  if (!investment) return null;

  // Retorna o investimento encontrado (implementação básica)
  return investment;
};

export const deleteInvestment = (id: string) => {
  const data = loadData();
  const updatedInvestments = data.investments.filter(inv => inv.id !== id);
  const updatedData: AppData = {
    ...data,
    investments: updatedInvestments
  };
  saveData(updatedData);
};

// Operações para Properties
export const addProperty = (property: Omit<Property, 'id'>): Property => {
  const newProperty: Property = {
    ...property,
    id: generateId()
  };
  return newProperty;
};

export const deleteProperty = (id: string) => {
  const data = loadData();
  const updatedProperties = data.properties.filter(p => p.id !== id);
  const updatedData: AppData = {
    ...data,
    properties: updatedProperties
  };
  saveData(updatedData);
};

// Operações para Debts
export const addDebt = (debt: Omit<Debt, 'id'>): Debt => {
  const newDebt: Debt = {
    ...debt,
    id: generateId()
  };
  return newDebt;
};

export const deleteDebt = (id: string) => {
  const data = loadData();
  const updatedDebts = data.debts.filter(d => d.id !== id);
  const updatedData: AppData = {
    ...data,
    debts: updatedDebts
  };
  saveData(updatedData);
};

// Operações para Categories
export const addCustomCategory = (category: string) => {
  try {
    const existingCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
    const updatedCategories = [...existingCategories, category];
    localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
  } catch (error) {
    console.error('Erro ao salvar categoria personalizada:', error);
  }
};

// Funções auxiliares para buscar dados específicos
export const getTransactions = (): Transaction[] => {
  return loadData().transactions;
};

export const getGoals = (): Goal[] => {
  return loadData().goals;
};

export const getAccounts = (): Account[] => {
  return loadData().accounts;
};

export const getCreditCards = (): CreditCard[] => {
  return loadData().creditCards;
};

export const getInvestments = (): Investment[] => {
  return loadData().investments;
};

export const getProperties = (): Property[] => {
  return loadData().properties;
};

export const getDebts = (): Debt[] => {
  return loadData().debts;
};

export const getCustomCategories = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('customCategories') || '[]');
  } catch (error) {
    console.error('Erro ao carregar categorias personalizadas:', error);
    return [];
  }
};
