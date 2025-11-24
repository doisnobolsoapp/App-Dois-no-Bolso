// services/storageService.ts
import {
  AppData,
  Transaction,
  Goal,
  Account,
  CreditCard,
  Investment,
  Property,
  Debt
} from '../types';

const STORAGE_KEY = 'dois-no-bolso-data';

const nowIso = () => new Date().toISOString();

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substring(2, 9);

// -------------------------
// LOAD & SAVE
// -------------------------
export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppData;
      // Optional: ensure arrays exist to avoid runtime undefined
      return {
        transactions: parsed.transactions || [],
        goals: parsed.goals || [],
        accounts: parsed.accounts || [],
        creditCards: parsed.creditCards || [],
        investments: parsed.investments || [],
        properties: parsed.properties || [],
        debts: parsed.debts || [],
        customCategories: parsed.customCategories || []
      };
    }
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }

  return {
    transactions: [],
    goals: [],
    accounts: [],
    creditCards: [],
    investments: [],
    properties: [],
    debts: [],
    customCategories: []
  };
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar dados:', e);
  }
};

// -------------------------
// TRANSACTIONS
// -------------------------
export const addTransaction = (trans: Omit<Transaction, 'id'>): Transaction => {
  return { ...trans, id: generateId() };
};

export const addMultipleTransactions = (
  transactions: Omit<Transaction, 'id'>[]
): Transaction[] => {
  return transactions.map((t) => addTransaction(t));
};

export const deleteTransaction = (id: string) => {
  const data = loadData();
  data.transactions = data.transactions.filter((t) => t.id !== id);
  saveData(data);
};

// -------------------------
// GOALS
// -------------------------
export const addGoal = (goal: Omit<Goal, 'id'>): Goal => {
  return { ...goal, id: generateId() };
};

export const updateGoal = (goal: Goal) => {
  const data = loadData();
  data.goals = data.goals.map((g) => (g.id === goal.id ? goal : g));
  saveData(data);
};

// -------------------------
// ACCOUNTS
// -------------------------
export const addAccount = (acc: Omit<Account, 'id'>): Account => {
  return { ...acc, id: generateId() };
};

export const deleteAccount = (id: string) => {
  const data = loadData();
  data.accounts = data.accounts.filter((a) => a.id !== id);
  saveData(data);
};

// -------------------------
// CREDIT CARDS
// -------------------------
export const addCreditCard = (card: Omit<CreditCard, 'id'>): CreditCard => {
  return { ...card, id: generateId() };
};

export const deleteCreditCard = (id: string) => {
  const data = loadData();
  data.creditCards = data.creditCards.filter((c) => c.id !== id);
  saveData(data);
};

// -------------------------
// INVESTMENTS (com movimentos)
// -------------------------
export const addInvestment = (investment: Omit<Investment, 'id'>): Investment => {
  // garante campos opcionais default
  const inv: Investment = {
    ...investment,
    id: generateId(),
    quantity: investment.quantity ?? 0,
    averagePrice: investment.averagePrice ?? 0,
    currentPrice: investment.currentPrice ?? investment.averagePrice ?? 0,
    history: investment.history ?? []
  };
  return inv;
};

/**
 * addInvestmentMovement
 * - invId: id do investimento
 * - type: 'BUY' | 'SELL' | 'UPDATE'
 * - qty: quantidade (aplicável para BUY/SELL)
 * - price: preço por unidade (aplicável para BUY/SELL/UPDATE)
 * - date: ISO date string
 * - notes: observações
 *
 * Retorna o investimento atualizado ou null se não encontrado.
 */
export const addInvestmentMovement = (
  invId: string,
  type: 'BUY' | 'SELL' | 'UPDATE',
  qty: number,
  price: number,
  date: string,
  notes?: string
): Investment | null => {
  const data = loadData();
  const invIndex = data.investments.findIndex((i) => i.id === invId);
  if (invIndex === -1) return null;

  const inv = { ...data.investments[invIndex] };

  // Normaliza campos opcionais
  inv.quantity = inv.quantity ?? 0;
  inv.averagePrice = inv.averagePrice ?? 0;
  inv.currentPrice = inv.currentPrice ?? inv.averagePrice ?? 0;
  inv.history = inv.history ?? [];

  const entryBase = {
    id: generateId(),
    date: date || nowIso(),
    price,
    qty,
    notes: notes || ''
  };

  if (type === 'BUY') {
    // recalcula preço médio
    const totalExistingCost = (inv.averagePrice || 0) * (inv.quantity || 0);
    const totalBuyCost = price * qty;
    const newQuantity = (inv.quantity || 0) + qty;
    const newAvg = newQuantity > 0 ? (totalExistingCost + totalBuyCost) / newQuantity : 0;

    inv.quantity = newQuantity;
    inv.averagePrice = Number(newAvg.toFixed(6)); // manter precisão
    inv.currentPrice = price;

    inv.history.push({ ...entryBase, type: 'BUY', total: totalBuyCost });
  } else if (type === 'SELL') {
    const sellQty = qty;
    const available = inv.quantity || 0;
    const actualSell = Math.min(sellQty, available);

    // atualiza quantidade (não permitimos negativa)
    inv.quantity = Math.max(0, available - actualSell);
    inv.currentPrice = price;

    // Opcional: registrar efeito (não calculamos lucro realizado detalhado aqui,
    // porque Investment não tem campo para realizedProfit; pode ser estendido)
    inv.history.push({ ...entryBase, type: 'SELL', total: price * actualSell, soldQuantity: actualSell });
  } else if (type === 'UPDATE') {
    // Atualiza somente o preço atual (mark-to-market)
    inv.currentPrice = price;
    inv.history.push({ ...entryBase, type: 'UPDATE' });
  } else {
    // tipo desconhecido: não altera
    return null;
  }

  // grava no array e salva
  data.investments[invIndex] = inv;
  saveData(data);
  return inv;
};

export const deleteInvestment = (id: string) => {
  const data = loadData();
  data.investments = data.investments.filter((i) => i.id !== id);
  saveData(data);
};

// -------------------------
// PROPERTIES
// -------------------------
export const addProperty = (property: Omit<Property, 'id'>): Property => {
  return { ...property, id: generateId() };
};

export const deleteProperty = (id: string) => {
  const data = loadData();
  data.properties = data.properties.filter((p) => p.id !== id);
  saveData(data);
};

// -------------------------
// DEBTS
// -------------------------
export const addDebt = (debt: Omit<Debt, 'id'>): Debt => {
  return { ...debt, id: generateId() };
};

export const deleteDebt = (id: string) => {
  const data = loadData();
  data.debts = data.debts.filter((d) => d.id !== id);
  saveData(data);
};

// -------------------------
// CUSTOM CATEGORIES
// -------------------------
export const addCustomCategory = (category: string) => {
  try {
    const list = JSON.parse(localStorage.getItem('customCategories') || '[]') as string[];
    list.push(category);
    localStorage.setItem('customCategories', JSON.stringify(list));
  } catch (e) {
    console.error('Erro ao salvar categoria:', e);
  }
};

// -------------------------
// GETTERS
// -------------------------
export const getTransactions = () => loadData().transactions;
export const getGoals = () => loadData().goals;
export const getAccounts = () => loadData().accounts;
export const getCreditCards = () => loadData().creditCards;
export const getInvestments = () => loadData().investments;
export const getProperties = () => loadData().properties;
export const getDebts = () => loadData().debts;
export const getCustomCategories = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('customCategories') || '[]');
  } catch {
    return [];
  }
};
