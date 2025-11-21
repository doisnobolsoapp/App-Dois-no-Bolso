// Mantenha apenas UMA definição da interface Account
export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  institution?: string;
  type?: string; // Apenas esta linha para 'type'
  color?: string;
}

// O resto do arquivo permanece igual...
export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string;
  paid: boolean;
  dueDate?: string;
  notificationSent?: boolean;
  paymentMethod: PaymentMethod;
  accountId?: string;
  cardId?: string;
  installments?: { current: number; total: number };
  investmentId?: string;
  createdBy?: string;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE', 
  INVESTMENT = 'INVESTMENT',
  LOAN = 'LOAN'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PIX = 'PIX'
}

export enum Category {
  FOOD = 'Alimentação',
  TRANSPORT = 'Transporte',
  HOUSING = 'Moradia',
  HEALTH = 'Saúde',
  EDUCATION = 'Educação',
  ENTERTAINMENT = 'Lazer',
  SHOPPING = 'Compras',
  SERVICES = 'Serviços',
  TRAVEL = 'Viagens',
  INVESTMENTS = 'Investimentos',
  SALARY = 'Salário',
  FREELANCE = 'Freelance',
  OTHER = 'Outros'
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  currentBalance?: number;
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  broker: string;
  strategy: InvestmentStrategy;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  notes: string;
  history: InvestmentHistory[];
}

export interface InvestmentHistory {
  id: string;
  date: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'UPDATE';
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  notes?: string;
}

export enum InvestmentType {
  FIXED_INCOME = 'FIXED_INCOME',
  STOCK = 'STOCK', 
  FII = 'FII',
  CRYPTO = 'CRYPTO',
  FUND = 'FUND',
  PENSION = 'PENSION',
  SAVINGS = 'SAVINGS',
  INTERNATIONAL = 'INTERNATIONAL',
  OTHER = 'OTHER'
}

export enum InvestmentStrategy {
  RESERVE = 'RESERVE',
  LONG_TERM = 'LONG_TERM',
  SHORT_TERM = 'SHORT_TERM', 
  SWING_TRADE = 'SWING_TRADE',
  HOLD = 'HOLD'
}

export interface Property {
  id: string;
  name: string;
  value: number;
  currentValue?: number;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  dueDate: string;
  institution: string;
}

export interface AppData {
  transactions: Transaction[];
  goals: Goal[];
  accounts: Account[];
  creditCards: CreditCard[];
  investments: Investment[];
  properties: Property[];
  debts: Debt[];
  customCategories: string[];
  userMode: 'INDIVIDUAL' | 'COUPLE';
  language: 'PT' | 'EN';
}

export type ViewState = 
  | 'DASHBOARD' 
  | 'TRANSACTIONS' 
  | 'GOALS' 
  | 'REPORTS' 
  | 'CALENDAR'
  | 'BANKS'
  | 'CARDS'
  | 'INVESTMENTS'
  | 'BALANCE'
  | 'CHAT'
  | 'SETTINGS';
