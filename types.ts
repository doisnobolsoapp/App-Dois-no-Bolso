// types.ts

// ------------------------------------
// CHAT MESSAGES
// ------------------------------------
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// ------------------------------------
// LAYOUT
// ------------------------------------
export interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onLogout: () => void;
}

// ------------------------------------
// APP DATA
// ------------------------------------
export interface AppData {
  transactions: Transaction[];
  goals: Goal[];
  accounts: Account[];
  creditCards: CreditCard[];
  investments: Investment[];
  properties: Property[];
  debts: Debt[];
  customCategories?: string[];
  userMode?: "INDIVIDUAL" | "COUPLE";
  language?: string;
  userPreferences?: {
    currency: string;
    language: string;
    notifications: boolean;
  };
}

// ------------------------------------
// TRANSACTIONS
// ------------------------------------
export type TransactionType = "income" | "expense" | "investment" | "loan";
export type PaymentMethod = "cash" | "credit" | "debit" | "transfer" | "pix";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  paid: boolean;
  paymentMethod?: PaymentMethod;
  dueDate?: string;
  accountId?: string;
  cardId?: string;
  installments?: {
    current: number;
    total: number;
  };
  createdBy?: string;
  notificationSent?: boolean;
  investmentId?: string;
}

// ------------------------------------
// GOALS
// ------------------------------------
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

// ------------------------------------
// ACCOUNTS
// ------------------------------------
export interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
  initialBalance: number;
  institution?: string;
  color?: string;
  category?: string; // ADICIONADO para AccountSettings
  currency?: string; // ADICIONADO para AccountSettings
}

// ------------------------------------
// CREDIT CARDS
// ------------------------------------
export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  currentBalance: number;
  dueDate: string;
  balance?: number; // ADICIONADO para compatibilidade
}

// ------------------------------------
// INVESTMENTS
// ------------------------------------
export type InvestmentType =
  | "FIXED_INCOME"
  | "STOCK"
  | "FII"
  | "CRYPTO"
  | "FUND"
  | "PENSION"
  | "SAVINGS"
  | "INTERNATIONAL"
  | "OTHER";

export type InvestmentStrategy =
  | "RESERVE"
  | "LONG_TERM"
  | "SHORT_TERM"
  | "SWING_TRADE"
  | "HOLD";

export interface InvestmentMovement {
  type: "BUY" | "SELL" | "UPDATE";
  quantity: number;
  price: number;
  date: string;
  notes?: string;

  before: {
    quantity: number;
    averagePrice: number;
  };

  after: {
    quantity: number;
    averagePrice: number;
  };
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  broker?: string;
  strategy?: InvestmentStrategy;

  quantity: number;
  averagePrice: number;
  currentPrice: number;

  purchaseDate: string; // <- ADICIONADO (necessário no InvestmentDashboard)

  history?: InvestmentMovement[];
}

// ------------------------------------
// PROPERTIES
// ------------------------------------
export interface Property {
  id: string;
  name: string;
  value: number;
  purchaseDate: string;
  currentValue?: number;
}

// ------------------------------------
// DEBTS
// ------------------------------------
export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string;
}

// ------------------------------------
// VIEW STATE
// ------------------------------------
export type ViewState = 
  | 'dashboard'
  | 'transactions'
  | 'goals'
  | 'reports'
  | 'calendar'
  | 'banks'
  | 'cards'
  | 'investments'
  | 'balance'
  | 'chat'
  | 'settings'
  | 'accountSettings'; // JÁ EXISTIA - CORRETO

export type Category = string;

// ------------------------------------
// ACCOUNT SETTINGS TYPES
// ------------------------------------
export interface AccountSettingsProps {
  accounts: Account[];
  onAddAccount: (accountData: any) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateAccount: (accountData: any) => void;
}

// ------------------------------------
// DASHBOARD TYPES
// ------------------------------------
export interface DashboardProps {
  data: AppData;
  onViewChange: (view: ViewState) => void;
}

// ------------------------------------
// USER TYPES
// ------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}
