// src/services/openaiService.ts
export type ToolCall =
  | { name: 'addTransaction'; arguments: any }
  | { name: 'addGoal'; arguments: any }
  | { name: 'addInvestment'; arguments: any };

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export const TOOLS_SCHEMA = {
  addTransaction: {
    name: 'addTransaction',
    description: 'Adicionar uma nova transação financeira (receita, despesa, investimento, empréstimo).',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['INCOME', 'EXPENSE', 'INVESTMENT', 'LOAN'] },
        category: { type: 'string' },
        amount: { type: 'number' },
        description: { type: 'string' },
        date: { type: 'string' },
        paid: { type: 'boolean' },
        paymentMethod: { type: 'string' },
        accountId: { type: 'string' },
        cardId: { type: 'string' }
      },
      required: ['type', 'amount', 'description']
    }
  },
  addGoal: {
    name: 'addGoal',
    description: 'Criar uma nova meta financeira.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        targetAmount: { type: 'number' },
        deadline: { type: 'string' }
      },
      required: ['name', 'targetAmount']
    }
  },
  addInvestment: {
    name: 'addInvestment',
    description: 'Cadastrar um novo investimento (apenas cadastro).',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        broker: { type: 'string' },
        strategy: { type: 'string' }
      },
      required: ['name', 'type']
    }
  }
};

/**
 * Chama a API do OpenAI (model: o1-mini) com function calling habilitado.
 * Retorna o JSON da resposta (raw) para ser processado pelo caller.
 */
export async function callOpenAIWithTools(prompt: string, systemPrompt = '', userContext = '') {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY não configurada');

  const body = {
    model: 'o1-mini', // leve/gratuito (mais barato). Substitua se preferir outro.
    messages: [
      { role: 'system', content: systemPrompt || 'Você é um assistente financeiro que pode retornar chamadas de função quando apropriado.' },
      { role: 'user', content: `${userContext}\n\n${prompt}` }
    ],
    temperature: 0.2,
    max_tokens: 800,
    // function calling similar: pass tools schema so model can choose to call them
    functions: [
      TOOLS_SCHEMA.addTransaction,
      TOOLS_SCHEMA.addGoal,
      TOOLS_SCHEMA.addInvestment
    ],
    function_call: 'auto'
  };

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${txt}`);
  }

  const data = await res.json();
  return data;
}
