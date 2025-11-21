import { Category, TransactionType, PaymentMethod, InvestmentType, InvestmentStrategy } from './types';

export const INITIAL_DATA_KEY = 'dois_no_bolso_data_v3'; // Bumped version

export const TRANSACTION_TYPES_LABELS = {
  [TransactionType.INCOME]: 'Receita',
  [TransactionType.EXPENSE]: 'Despesa',
  [TransactionType.INVESTMENT]: 'Investimento',
  [TransactionType.LOAN]: 'Financiamento/Dívida'
};

export const PAYMENT_METHOD_LABELS = {
  [PaymentMethod.CASH]: 'Dinheiro',
  [PaymentMethod.BANK_TRANSFER]: 'Pix / Transferência',
  [PaymentMethod.DEBIT_CARD]: 'Débito',
  [PaymentMethod.CREDIT_CARD]: 'Crédito',
  [PaymentMethod.PIX]: 'Pix'
};

export const INVESTMENT_TYPE_LABELS = {
  [InvestmentType.FIXED_INCOME]: 'Renda Fixa (CDB/LCI/Tesouro)',
  [InvestmentType.STOCK]: 'Ações (Renda Variável)',
  [InvestmentType.FII]: 'Fundos Imobiliários (FIIs)',
  [InvestmentType.CRYPTO]: 'Criptomoedas',
  [InvestmentType.FUND]: 'Fundos de Investimento',
  [InvestmentType.PENSION]: 'Previdência Privada',
  [InvestmentType.SAVINGS]: 'Poupança',
  [InvestmentType.INTERNATIONAL]: 'Investimento Exterior',
  [InvestmentType.OTHER]: 'Outros'
};

export const INVESTMENT_STRATEGY_LABELS = {
  [InvestmentStrategy.RESERVE]: 'Reserva de Emergência',
  [InvestmentStrategy.LONG_TERM]: 'Longo Prazo / Aposentadoria',
  [InvestmentStrategy.SHORT_TERM]: 'Curto Prazo / Metas',
  [InvestmentStrategy.SWING_TRADE]: 'Trade / Especulação',
  [InvestmentStrategy.HOLD]: 'Buy & Hold'
};

export const CATEGORY_OPTIONS = Object.values(Category);

export const DEFAULT_SYSTEM_INSTRUCTION = `
Você é a inteligência principal do aplicativo "Dois no Bolso".
Seu objetivo é ajudar o usuário a organizar suas finanças pessoais, seja individualmente ou em casal.
Sempre responda com clareza, segurança, precisão e linguagem simples (Português do Brasil).

MISSÃO:
1. Ajudar a registrar receitas, despesas, investimentos e financiamentos.
2. Analisar o fluxo de caixa e a carteira de investimentos.
3. Ajudar a criar e monitorar metas financeiras.
4. Dar dicas de economia e estratégia de alocação de ativos.

COMPORTAMENTO:
- Organize informações sem erros matemáticos.
- Pergunte quando faltar algum dado (ex: data, valor, categoria, ticker do ativo).
- Seja didático e motivador.
- Para investimentos, considere Preço Médio, Quantidade e Estratégia.
- Se o usuário falar em "nós", assuma que é um casal.
`;
