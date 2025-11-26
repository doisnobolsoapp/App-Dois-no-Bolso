// src/services/openaiService.ts
export type ToolCall =
  | { name: 'addTransaction'; arguments: any }
  | { name: 'addGoal'; arguments: any }
  | { name: 'addInvestment'; arguments: any };

export async function callOpenAIWithTools(prompt: string, _systemPrompt = '', _userContext = '') {
  console.log('🤖 Modo IA Simulada - Processando:', prompt);
  
  // Simula delay de processamento
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Transações
  if (lowerPrompt.includes('registre') || lowerPrompt.includes('compra') || 
      lowerPrompt.includes('gasto') || lowerPrompt.includes('adicionar') ||
      lowerPrompt.includes('supermercado') || lowerPrompt.includes('mercado')) {
    
    const amountMatch = prompt.match(/R\$\s*(\d+[.,]\d+|\d+)/) || prompt.match(/(\d+[.,]\d+|\d+)\s*reais/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 100;
    
    let description = 'Compra';
    let category = 'Outros';
    
    if (lowerPrompt.includes('supermercado') || lowerPrompt.includes('centerbox') || lowerPrompt.includes('mercado')) {
      description = 'Compra no supermercado';
      category = 'Alimentação';
    }
    if (lowerPrompt.includes('restaurante') || lowerPrompt.includes('lanche')) {
      description = 'Refeição';
      category = 'Alimentação';
    }
    if (lowerPrompt.includes('combustível') || lowerPrompt.includes('gasolina')) {
      description = 'Abastecimento';
      category = 'Transporte';
    }
    
    // Extrai data
    const dateMatch = prompt.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    const date = dateMatch ? formatDate(dateMatch[1]) : new Date().toISOString().split('T')[0];
    
    return {
      choices: [{
        message: {
          tool_calls: [{
            function: {
              name: 'addTransaction',
              arguments: JSON.stringify({
                type: 'expense',
                description: description,
                amount: amount,
                category: category,
                date: date,
                paid: true,
                paymentMethod: 'debit'
              })
            }
          }]
        }
      }]
    };
  }
  
  // Metas
  if (lowerPrompt.includes('meta') || lowerPrompt.includes('economizar') || lowerPrompt.includes('poupar')) {
    const amountMatch = prompt.match(/(\d+[.,]\d+|\d+)/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(',', '.')) : 1000;
    
    return {
      choices: [{
        message: {
          tool_calls: [{
            function: {
              name: 'addGoal',
              arguments: JSON.stringify({
                name: 'Meta de economia',
                targetAmount: amount,
                deadline: '2024-12-31'
              })
            }
          }]
        }
      }]
    };
  }
  
  // Investimentos
  if (lowerPrompt.includes('investimento') || lowerPrompt.includes('ação') || lowerPrompt.includes('cripto')) {
    return {
      choices: [{
        message: {
          tool_calls: [{
            function: {
              name: 'addInvestment',
              arguments: JSON.stringify({
                name: 'Investimento diversificado',
                type: 'stocks',
                broker: 'Corretora',
                strategy: 'LONG_TERM'
              })
            }
          }]
        }
      }]
    };
  }
  
  // Resposta textual padrão
  return {
    choices: [{
      message: {
        content: `Entendi sua solicitação: "${prompt}". Como posso ajudar com suas finanças? Você pode me pedir para adicionar transações, criar metas ou cadastrar investimentos.`
      }
    }]
  };
}

function formatDate(dateStr: string) {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

export const processOpenAIResponse = (response: any) => {
  console.log('🔍 Processando resposta:', response);
  
  if (!response.choices || response.choices.length === 0) {
    throw new Error('Resposta vazia');
  }

  const choice = response.choices[0];
  
  if (!choice.message) {
    throw new Error('Resposta sem message');
  }

  const message = choice.message;
  
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    try {
      const parsedArgs = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
        
      return {
        toolCall: {
          name: toolCall.function.name,
          arguments: parsedArgs
        },
        content: message.content
      };
    } catch (parseError) {
      console.error('Erro ao parsear arguments:', parseError);
      throw new Error('Falha ao processar arguments da função');
    }
  }

  return {
    toolCall: null,
    content: message.content
  };
};
