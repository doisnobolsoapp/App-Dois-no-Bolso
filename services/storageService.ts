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

// -------------------------
// LOAD & SAVE
// -------------------------
export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Erro ao carregar:", e);
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
    console.error("Erro ao salvar:", e);
  }
};

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substring(2, 9);

// -------------------------
// TRANSACTIONS
// -------------------------
export const addTransaction = (trans: Omit<Transaction, "id">): Transaction => {
  return { ...trans, id: generateId() };
};

export const addMultipleTransactions = (
  transactions: Omit<Transaction, "id">[]
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
export const addGoal = (goal: Omit<Goal, "id">): Goal => {
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
export const addAccount = (acc: Omit<Account, "id">): Account => {
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
export const addCreditCard = (
  card: Omit<CreditCard, "id">
): CreditCard => {
  return { ...card, id: generateId() };
};

export const deleteCreditCard = (id: string) => {
  const data = loadData();
  data.creditCards = data.creditCards.filter((c) => c.id !== id);
  saveData(data);
};

// -------------------------
// INVESTMENTS
// -------------------------
export const addInvestment = (
  investment: Omit<Investment, "id">
): Investment => {
  return { ...investment, id: generateId() };
};

// Função simples, já que sua interface NÃO tem movimentos
export const addInvestmentMovement = (
  invId: string
) => {
  console.warn("Movimentos não implementados — interface não contém histórico.");
  return null;
};

export const deleteInvestment = (id: string) => {
  const data = loadData();
  data.investments = data.investments.filter((i) => i.id !== id);
  saveData(data);
};

// -------------------------
// PROPERTIES
// -------------------------
export const addProperty = (
  property: Omit<Property, "id">
): Property => {
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
export const addDebt = (debt: Omit<Debt, "id">): Debt => {
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
    const list = JSON.parse(localStorage.getItem("customCategories") || "[]");
    list.push(category);
    localStorage.setItem("customCategories", JSON.stringify(list));
  } catch (e) {
    console.error("Erro ao salvar categoria:", e);
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
    return JSON.parse(localStorage.getItem("customCategories") || "[]");
  } catch (e) {
    return [];
  }
};
