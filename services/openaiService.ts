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
 * Chama a API do OpenAI com function calling habilitado.
 */
export async function callOpenAIWithTools(prompt: string, systemPrompt = '', userContext = '') {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // DEBUG: Verificar se a chave está carregando
  console.log('🔑 API Key carregada?', !!apiKey);
  console.log('📝 Prompt recebido:', prompt);
  
  if (!apiKey) {
    console.error('❌ ERRO: VITE_OPENAI_API_KEY não configurada');
    throw new Error('VITE_OPENAI_API_KEY não configurada. Verifique seu arquivo .env');
  }

  const body = {
    model: 'gpt-3.5-turbo',
    messages: [
      { 
        role: 'system', 
        content: systemPrompt || 'Você é um assistente financeiro útil que pode chamar funções quando necessário para adicionar transações, metas ou investimentos.' 
      },
      { 
        role: 'user', 
        content: `${userContext}\n\nUsuário: ${prompt}` 
      }
    ],
    temperature: 0.2,
    max_tokens: 800,
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

  console.log('📤 Enviando requisição para OpenAI...', { 
    model: body.model,
    messageLength: body.messages[1].content.length,
    hasTools: body.tools.length > 0
  });

  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    console.log('📥 Status da resposta:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Erro da API OpenAI:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText
      });
      
      let errorMessage = `Erro ${res.status}: `;
      if (res.status === 401) {
        errorMessage += 'Chave API inválida ou expirada';
      } else if (res.status === 429) {
        errorMessage += 'Limite de requisições excedido';
      } else if (res.status === 404) {
        errorMessage += 'Modelo não encontrado';
      } else {
        errorMessage += errorText || 'Erro desconhecido';
      }
      
      throw new Error(errorMessage);
    }

    const data = await res.json();
    console.log('✅ Resposta da OpenAI recebida:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      message: data.choices?.[0]?.message
    });
    
    return data;
    
  } catch (error) {
    console.error('💥 Erro na requisição para OpenAI:', error);
    if (error instanceof Error) {
      throw new Error(`Falha na comunicação com OpenAI: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao contactar OpenAI');
  }
}

// Função auxiliar para processar a resposta da OpenAI
export const processOpenAIResponse = (response: any) => {
  console.log('🔍 Processando resposta da OpenAI:', response);
  
  if (!response.choices || response.choices.length === 0) {
    throw new Error('Resposta vazia da OpenAI - nenhuma choice encontrada');
  }

  const choice = response.choices[0];
  
  if (!choice.message) {
    throw new Error('Resposta da OpenAI sem message');
  }

  const message = choice.message;
  
  // Verificar se há tool calls (novo formato)
  if (message.tool_calls && message.tool_calls.length > 0) {
    console.log('🛠️ Tool calls encontrados:', message.tool_calls);
    
    const toolCall = message.tool_calls[0];
    try {
      const parsedArgs = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
        
      console.log('📋 Tool call processado:', {
        name: toolCall.function.name,
        arguments: parsedArgs
      });
      
      return {
        toolCall: {
          name: toolCall.function.name,
          arguments: parsedArgs
        },
        content: message.content
      };
    } catch (parseError) {
      console.error('❌ Erro ao parsear arguments do tool call:', parseError);
      throw new Error('Falha ao processar arguments da função');
    }
  }

  // Caso de resposta textual normal
  console.log('💬 Resposta textual:', message.content);
  return {
    toolCall: null,
    content: message.content
  };
};
