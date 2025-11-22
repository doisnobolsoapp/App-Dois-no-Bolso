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
    debts: [],
    customCategories: [],
    userPreferences: {
      currency: 'BRL',
      language: 'pt-BR',
      theme: 'light',
      notifications: true,
      biometricAuth: false,
      backupEnabled: false,
      backupFrequency: 'weekly'
    }
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
export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  return newTransaction;
};

export const addMultipleTransactions = (transactions: Omit<Transaction, 'id' | 'createdAt'>[]): Transaction[] => {
  return transactions.map(transaction => addTransaction(transaction));
};

export const deleteTransaction = (id: string) => {
  // Implementação seria feita no contexto do App
};

// Operações para Goals
export const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>): Goal => {
  const newGoal: Goal = {
    ...goal,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  return newGoal;
};

export const updateGoal = (goal: Goal) => {
  // Implementação seria feita no contexto do App
};

// Operações para Accounts
export const addAccount = (account: Omit<Account, 'id' | 'createdAt'>): Account => {
  const newAccount: Account = {
    ...account,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  return newAccount;
};

export const deleteAccount = (id: string) => {
  // Implementação seria feita no contexto do App
};

// Operações para Credit Cards
export const addCreditCard = (card: Omit<CreditCard, 'id' | 'createdAt'>): CreditCard => {
  const newCard: CreditCard = {
    ...card,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  return newCard;
};

export const deleteCreditCard = (id: string) => {
  // Implementação seria feita no contexto do App
};

// Operações para Investments
export const addInvestment = (investment: Omit<Investment, 'id' | 'createdAt' | 'currentValue' | 'profitLoss' | 'profitLossPercentage'>): Investment => {
  const currentValue = investment.quantity * investment.averagePrice;
  const newInvestment: Investment = {
    ...investment,
    id: generateId(),
    currentValue,
    profitLoss: 0,
    profitLossPercentage: 0,
    createdAt: new Date().toISOString()
  };
  return newInvestment;
};

export const addInvestmentMovement = (invId: string, type: 'BUY' | 'SELL' | 'UPDATE', qty: number, price: number, date: string, notes?: string) => {
  // Implementação seria feita no contexto do App
  return null;
};

export const deleteInvestment = (id: string) => {
  // Implementação seria feita no contexto do App
};

// Operações para Properties
export const addProperty = (property: Omit<Property, 'id' | 'createdAt'>): Property => {
  const newProperty: Property = {
    ...property,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  return newProperty;
};

export const deleteProperty = (id: string) => {
  // Implementação seria feita no contexto do App
};

// Operações para Debts
export const addDebt = (debt: Omit<Debt, 'id' | 'createdAt'>): Debt => {
  const newDebt: Debt = {
    ...debt,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  return newDebt;
};

export const deleteDebt = (id: string) => {
  // Implementação seria feita no contexto do App
};

// Operações para Categories
export const addCustomCategory = (category: string) => {
  // Implementação seria feita no contexto do App
};
