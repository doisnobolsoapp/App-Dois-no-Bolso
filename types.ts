
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  INVESTMENT = 'INVESTMENT', // Used for cash flow
  LOAN = 'LOAN'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER', // Pix, TED, DOC
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD'
}

export enum Category {
  // Income
  SALARY = 'Salário',
  FREELANCE = 'Freelance',
  DIVIDENDS = 'Dividendos',
  OTHER_INCOME = 'Outras Receitas',
  
  // Expense
  HOUSING = 'Habitação',
  TRANSPORT = 'Transporte',
  FOOD = 'Alimentação',
  HEALTH = 'Saúde',
  LEISURE = 'Lazer',
  EDUCATION = 'Educação',
  SHOPPING = 'Compras',
  BILLS = 'Contas Fixas', // Luz, agua, internet
  OTHER_EXPENSE = 'Outros Gastos',

  // Investment (Generic for transaction list)
  STOCKS = 'Ações',
  FIXED_INCOME = 'Renda Fixa',
  CRYPTO = 'Cripto',
  RESERVE = 'Reserva de Emergência',

  // Loan
  MORTGAGE = 'Financiamento Imobiliário',
  CAR_LOAN = 'Financiamento Veículo',
  PERSONAL_LOAN = 'Empréstimo Pessoal'
}

// --- Investment Specific Types ---

export enum InvestmentType {
  FIXED_INCOME = 'FIXED_INCOME', // CDB, Tesouro
  STOCK = 'STOCK', // Ações
  FII = 'FII', // Fundos Imobiliários
  CRYPTO = 'CRYPTO',
  FUND = 'FUND', // Fundos de Investimento
  PENSION = 'PENSION', // Previdência
  SAVINGS = 'SAVINGS', // Poupança
  INTERNATIONAL = 'INTERNATIONAL',
  OTHER = 'OTHER'
}

export enum InvestmentStrategy {
  RESERVE = 'RESERVE', // Reserva de Emergência
  LONG_TERM = 'LONG_TERM', // Aposentadoria/Longo Prazo
  SHORT_TERM = 'SHORT_TERM', // Curto Prazo/Viagem
  SWING_TRADE = 'SWING_TRADE',
  HOLD = 'HOLD'
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

export interface Investment {
  id: string;
  name: string; // Ticker or Name (e.g. PETR4, CDB Banco X)
  type: InvestmentType;
  broker: string; // Institution
  strategy: InvestmentStrategy;
  
  quantity: number;
  currentPrice: number; // Manually updated or last purchase
  averagePrice: number; // Calculated
  
  notes?: string;
  history: InvestmentHistory[];
}

// --- Existing Types ---

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  institution?: string;
  type?: string;
  color: string;
}

export interface CreditCard {
  id: string;
  name: string; // e.g. Nubank Gold
  limit: number;
  currentBalance?: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  paid: boolean;
  dueDate?: string; // For alerts
  
  // New fields
  paymentMethod: PaymentMethod;
  accountId?: string; // If paid via Bank/Debit
  cardId?: string; // If paid via Credit Card
  installments?: {
    current: number;
    total: number;
  };
  
  // Calendar & Notification Logic
  notificationSent?: boolean;
  createdBy?: string; // For couple filtering (User ID or Name)

  // Link to specific investment
  investmentId?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

// --- Balance Sheet Types ---

export interface Property {
  id: string;
  name: string; // e.g. Apartment, Car
  value: number;
  currentValue?: number;
  type: 'REAL_ESTATE' | 'VEHICLE' | 'OTHER';
  dateAcquired?: string;
}

export interface Debt {
  id: string;
  name: string; // e.g. Mortgage, Personal Loan
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  dueDate?: string;
}

// --- Auth Types ---

export interface User {
  id: string;
  email: string;
  name: string;
  mode: 'INDIVIDUAL' | 'COUPLE';
}

export type Language = 'PT' | 'EN' | 'ES';

export interface AppData {
  transactions: Transaction[];
  goals: Goal[];
  accounts: Account[];
  creditCards: CreditCard[];
  investments: Investment[];
  properties: Property[]; // New: Assets/Bens
  debts: Debt[]; // New: Long term liabilities
  customCategories: string[];
  userMode: 'INDIVIDUAL' | 'COUPLE';
  userName?: string;
  language: Language;
}

export type ViewState = 'DASHBOARD' | 'TRANSACTIONS' | 'GOALS' | 'REPORTS' | 'CHAT' | 'SETTINGS' | 'BANKS' | 'CARDS' | 'INVESTMENTS' | 'BALANCE' | 'CALENDAR';
