import { AppData, Transaction, Goal, TransactionType, Account, CreditCard, Investment, Property, Debt } from '../types';
import { INITIAL_DATA_KEY } from '../constants';

const getInitialData = (): AppData => ({
  transactions: [],
  goals: [],
  accounts: [],
  creditCards: [],
  investments: [],
  properties: [],
  debts: [],
  customCategories: [],
  userMode: 'INDIVIDUAL',
  language: 'PT'
});

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(INITIAL_DATA_KEY);
    if (!data) return getInitialData();
    
    const parsed = JSON.parse(data);
    // Ensure new fields exist if migration from old version
    if (!parsed.accounts) parsed.accounts = [];
    if (!parsed.creditCards) parsed.creditCards = [];
    if (!parsed.investments) parsed.investments = [];
    if (!parsed.properties) parsed.properties = [];
    if (!parsed.debts) parsed.debts = [];
    if (!parsed.customCategories) parsed.customCategories = [];
    if (!parsed.language) parsed.language = 'PT';
    return parsed;
  } catch (e) {
    console.error("Failed to load data", e);
    return getInitialData();
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(INITIAL_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const addCustomCategory = (category: string) => {
    const data = loadData();
    if (!data.customCategories.includes(category)) {
        data.customCategories.push(category);
        saveData(data);
    }
};

export const addTransaction = (t: Omit<Transaction, 'id'>): Transaction => {
  const data = loadData();
  const newTransaction: Transaction = { ...t, id: crypto.randomUUID(), notificationSent: false };
  data.transactions.push(newTransaction);
  saveData(data);
  return newTransaction;
};

export const addMultipleTransactions = (transactions: Omit<Transaction, 'id'>[]): Transaction[] => {
  const data = loadData();
  const newTransactions = transactions.map(t => ({ ...t, id: crypto.randomUUID(), notificationSent: false }));
  data.transactions.push(...newTransactions);
  saveData(data);
  return newTransactions;
};

export const updateTransactionNotification = (id: string, sent: boolean) => {
  const data = loadData();
  const index = data.transactions.findIndex(t => t.id === id);
  if (index !== -1) {
      data.transactions[index].notificationSent = sent;
      saveData(data);
  }
};

export const deleteTransaction = (id: string) => {
  const data = loadData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveData(data);
};

export const addGoal = (g: Omit<Goal, 'id'>): Goal => {
  const data = loadData();
  const newGoal: Goal = { ...g, id: crypto.randomUUID() };
  data.goals.push(newGoal);
  saveData(data);
  return newGoal;
};

export const updateGoal = (goal: Goal) => {
  const data = loadData();
  const index = data.goals.findIndex(g => g.id === goal.id);
  if (index !== -1) {
    data.goals[index] = goal;
    saveData(data);
  }
};

export const addAccount = (a: Omit<Account, 'id'>): Account => {
  const data = loadData();
  const newAccount: Account = { ...a, id: crypto.randomUUID() };
  data.accounts.push(newAccount);
  saveData(data);
  return newAccount;
};

export const deleteAccount = (id: string) => {
  const data = loadData();
  data.accounts = data.accounts.filter(a => a.id !== id);
  data.transactions = data.transactions.map(t => 
    t.accountId === id ? { ...t, accountId: undefined } : t
  );
  saveData(data);
};

export const addCreditCard = (c: Omit<CreditCard, 'id'>): CreditCard => {
  const data = loadData();
  const newCard: CreditCard = { ...c, id: crypto.randomUUID() };
  data.creditCards.push(newCard);
  saveData(data);
  return newCard;
};

export const deleteCreditCard = (id: string) => {
  const data = loadData();
  data.creditCards = data.creditCards.filter(c => c.id !== id);
  data.transactions = data.transactions.map(t => 
    t.cardId === id ? { ...t, cardId: undefined } : t
  );
  saveData(data);
};

// --- Investment Logic ---

export const addInvestment = (i: Omit<Investment, 'id' | 'history'>): Investment => {
    const data = loadData();
    const newInvestment: Investment = { 
        ...i, 
        id: crypto.randomUUID(), 
        history: [],
    };
    
    if (i.quantity > 0) {
        newInvestment.history.push({
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            type: 'BUY',
            quantity: i.quantity,
            pricePerUnit: i.averagePrice,
            totalAmount: i.quantity * i.averagePrice,
            notes: 'Saldo Inicial cadastrado'
        });
    }

    data.investments.push(newInvestment);
    saveData(data);
    return newInvestment;
};

export const updateInvestment = (inv: Investment) => {
    const data = loadData();
    const idx = data.investments.findIndex(i => i.id === inv.id);
    if (idx !== -1) {
        data.investments[idx] = inv;
        saveData(data);
    }
};

export const addInvestmentMovement = (
    investmentId: string, 
    type: 'BUY' | 'SELL' | 'DIVIDEND' | 'UPDATE', 
    quantity: number, 
    pricePerUnit: number, 
    date: string,
    notes?: string
) => {
    const data = loadData();
    const idx = data.investments.findIndex(i => i.id === investmentId);
    if (idx === -1) return;

    const inv = data.investments[idx];
    const totalAmount = quantity * pricePerUnit;

    if (type === 'BUY') {
        const totalOld = inv.quantity * inv.averagePrice;
        const totalNew = totalAmount;
        const newQty = inv.quantity + quantity;
        
        inv.averagePrice = (totalOld + totalNew) / newQty;
        inv.quantity = newQty;
        inv.currentPrice = pricePerUnit; 
    } else if (type === 'SELL') {
        inv.quantity = Math.max(0, inv.quantity - quantity);
        inv.currentPrice = pricePerUnit;
    } else if (type === 'UPDATE') {
        inv.currentPrice = pricePerUnit;
    }

    inv.history.push({
        id: crypto.randomUUID(),
        date,
        type,
        quantity,
        pricePerUnit,
        totalAmount,
        notes
    });

    data.investments[idx] = inv;
    saveData(data);
    return inv;
};

export const deleteInvestment = (id: string) => {
    const data = loadData();
    data.investments = data.investments.filter(i => i.id !== id);
    saveData(data);
};

// --- Property & Debt Logic ---

export const addProperty = (p: Omit<Property, 'id'>): Property => {
    const data = loadData();
    const newProp: Property = { ...p, id: crypto.randomUUID() };
    data.properties.push(newProp);
    saveData(data);
    return newProp;
};

export const deleteProperty = (id: string) => {
    const data = loadData();
    data.properties = data.properties.filter(p => p.id !== id);
    saveData(data);
};

export const addDebt = (d: Omit<Debt, 'id'>): Debt => {
    const data = loadData();
    const newDebt: Debt = { ...d, id: crypto.randomUUID() };
    data.debts.push(newDebt);
    saveData(data);
    return newDebt;
};

export const deleteDebt = (id: string) => {
    const data = loadData();
    data.debts = data.debts.filter(d => d.id !== id);
    saveData(data);
};

export const getSummary = () => {
  const data = loadData();
  const income = data.transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);
  
  const expense = data.transactions
    .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN)
    .reduce((acc, t) => acc + t.amount, 0);
    
  const investmentsFlow = data.transactions
    .filter(t => t.type === TransactionType.INVESTMENT)
    .reduce((acc, t) => acc + t.amount, 0);

  return { income, expense, investments: investmentsFlow, balance: income - expense - investmentsFlow };
};
