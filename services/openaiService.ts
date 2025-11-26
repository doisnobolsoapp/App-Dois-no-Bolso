// src/services/openaiService.ts - VERSÃO COM PROXY
export async function callOpenAIWithTools(prompt: string, systemPrompt = '', userContext = '') {
  console.log('🚀 Usando proxy para OpenAI...');

  const body = {
    messages: [
      { 
        role: 'system', 
        content: systemPrompt || 'Você é um assistente financeiro útil.' 
      },
      { 
        role: 'user', 
        content: `${userContext}\n\n${prompt}` 
      }
    ],
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

  // Tenta diferentes URLs de proxy
  const proxyUrls = [
    'http://localhost:3001/api/openai/chat', // Seu backend local
    'https://your-deployed-backend.vercel.app/api/openai/chat' // Quando deployar
  ];

  let lastError;

  for (const proxyUrl of proxyUrls) {
    try {
      console.log(`🔄 Tentando proxy: ${proxyUrl}`);
      
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Resposta recebida via proxy');
        return data;
      } else {
        lastError = await res.text();
        console.warn(`❌ Proxy ${proxyUrl} falhou:`, lastError);
      }
    } catch (error) {
      lastError = error;
      console.warn(`❌ Proxy ${proxyUrl} erro:`, error);
    }
  }

  // Se todos os proxies falharem, use modo simulado
  console.log('🔧 Usando modo simulado...');
  return await simulatedOpenAI(prompt);
}

// Função simulada para quando a API não está disponível
async function simulatedOpenAI(prompt: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('registre') || lowerPrompt.includes('compra') || 
      lowerPrompt.includes('supermercado') || lowerPrompt.includes('adicionar')) {
    
    const amountMatch = prompt.match(/R\$\s*(\d+[.,]\d+|\d+)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 100;
    
    let description = 'Compra no supermercado';
    if (lowerPrompt.includes('centerbox')) description = 'Compra no Centerbox';
    
    // Extrai data se existir
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
                category: 'Alimentação',
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
  
  // Resposta para outros tipos de pedidos
  return {
    choices: [{
      message: {
        content: `Entendi: "${prompt}". No momento estou processando localmente. Configure um backend para usar a API OpenAI real.`
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
