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
        type: { type: 'string', enum: ['income', 'expense', 'investment', 'loan'] },
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
  // Corrigido para usar import.meta.env
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY não configurada');

  const body = {
    model: 'gpt-3.5-turbo', // Usando modelo mais compatível com function calling
    messages: [
      { role: 'system', content: systemPrompt || 'Você é um assistente financeiro que pode retornar chamadas de função quando apropriado.' },
      { role: 'user', content: `${userContext}\n\n${prompt}` }
    ],
    temperature: 0.2,
    max_tokens: 800,
    // function calling - usando tools em vez de functions (formato mais recente)
    tools: [
      {
        type: 'function',
        function: TOOLS_SCHEMA.addTransaction
      },
      {
        type: 'function',
        function: TOOLS_SCHEMA.addGoal
      },
      {
        type: 'function',
        function: TOOLS_SCHEMA.addInvestment
      }
    ],
    tool_choice: 'auto'
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

// Função auxiliar para processar a resposta da OpenAI
export const processOpenAIResponse = (response: any) => {
  const choice = response.choices?.[0];
  if (!choice) {
    throw new Error('Resposta vazia da OpenAI');
  }

  const message = choice.message;
  
  // Verificar se há tool calls
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    return {
      toolCall: {
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments)
      },
      content: message.content
    };
  }

  return {
    toolCall: null,
    content: message.content
  };
};
