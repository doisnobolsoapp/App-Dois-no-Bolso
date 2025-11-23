// constants.ts

export const INITIAL_DATA_KEY = 'dois_no_bolso_data_v3'; // Bumped version

// Usar strings literais em vez de enums
export const TRANSACTION_TYPES_LABELS = {
  'income': 'Receita',
  'expense': 'Despesa',
  'investment': 'Investimento',
  'loan': 'Financiamento/Dívida'
};

export const PAYMENT_METHOD_LABELS = {
  'cash': 'Dinheiro',
  'credit': 'Crédito',
  'debit': 'Débito',
  'transfer': 'Transferência',
  'pix': 'Pix'
};

export const INVESTMENT_TYPE_LABELS = {
  'FIXED_INCOME': 'Renda Fixa (CDB/LCI/Tesouro)',
  'STOCK': 'Ações (Renda Variável)',
  'FII': 'Fundos Imobiliários (FIIs)',
  'CRYPTO': 'Criptomoedas',
  'FUND': 'Fundos de Investimento',
  'PENSION': 'Previdência Privada',
  'SAVINGS': 'Poupança',
  'INTERNATIONAL': 'Investimento Exterior',
  'OTHER': 'Outros'
};

export const INVESTMENT_STRATEGY_LABELS = {
  'RESERVE': 'Reserva de Emergência',
  'LONG_TERM': 'Longo Prazo / Aposentadoria',
  'SHORT_TERM': 'Curto Prazo / Metas',
  'SWING_TRADE': 'Trade / Especulação',
  'HOLD': 'Buy & Hold'
};

// Categorias padrão
export const CATEGORY_OPTIONS = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Serviços',
  'Impostos',
  'Outros',
  'Salário',
  'Freelance',
  'Investimentos',
  'Presentes',
  'Reembolsos'
];

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
