// src/components/AIChat.tsx
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { AppData } from '../types';

interface AIChatProps {
  data: AppData;
  onAddTransaction: (t: any) => void;
  onAddGoal?: (g: any) => void;
  onAddInvestment?: (i: any) => void;
}

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

// Interface para a resposta da OpenAI
interface OpenAIResponse {
  choices: Array<{
    message: {
      content?: string;
      function_call?: {
        name: string;
        arguments: string;
      };
    };
  }>;
}

export const AIChat: React.FC<AIChatProps> = ({ data, onAddTransaction, onAddGoal, onAddInvestment }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      content: 'Olá! Sou seu assistente financeiro inteligente. Como posso ajudar você hoje?', 
      role: 'assistant', 
      timestamp: new Date() 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Implementação temporária da função callOpenAIWithTools
  const callOpenAIWithTools = async (userMessage: string, systemPrompt: string, context: string): Promise<OpenAIResponse> => {
    // TODO: Substituir por chamada real à API da OpenAI
    console.log('Chamando OpenAI com:', { userMessage, systemPrompt, context });
    
    // Simulação de resposta - REMOVER quando implementar a API real
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simula uma resposta de função para adicionar transação
        if (userMessage.toLowerCase().includes('adicionar') || userMessage.toLowerCase().includes('gasto')) {
          resolve({
            choices: [{
              message: {
                function_call: {
                  name: 'addTransaction',
                  arguments: JSON.stringify({
                    type: 'expense',
                    description: 'Transação via assistente',
                    amount: 100,
                    category: 'Outros',
                    date: new Date().toISOString().split('T')[0],
                    paid: true,
                    paymentMethod: 'cash'
                  })
                }
              }
            }]
          });
        } else {
          // Resposta textual normal
          resolve({
            choices: [{
              message: {
                content: `Entendi sua solicitação: "${userMessage}". Como posso ajudar com suas finanças?`
              }
            }]
          });
        }
      }, 1000);
    });
  };

  const handleToolCall = (toolName: string, toolArgs: any) => {
    try {
      console.log('Executando tool:', toolName, toolArgs);
      
      if (toolName === 'addTransaction') {
        const tx = {
          type: toolArgs.type || 'expense',
          description: toolArgs.description || 'Transação via assistente',
          amount: Number(toolArgs.amount) || 0,
          category: toolArgs.category || 'Outros',
          date: toolArgs.date || new Date().toISOString().split('T')[0],
          paid: toolArgs.paid === undefined ? true : Boolean(toolArgs.paid),
          paymentMethod: toolArgs.paymentMethod || 'cash',
          accountId: toolArgs.accountId,
          cardId: toolArgs.cardId
        };
        onAddTransaction(tx);
        return `✅ Transação adicionada: ${tx.description} — R$ ${tx.amount.toFixed(2)}`;
      }
      
      if (toolName === 'addGoal' && onAddGoal) {
        const goal = {
          name: toolArgs.name || 'Meta financeira',
          targetAmount: Number(toolArgs.targetAmount) || 0,
          deadline: toolArgs.deadline || ''
        };
        onAddGoal(goal);
        return `🎯 Meta criada: ${goal.name} — alvo R$ ${goal.targetAmount.toFixed(2)}`;
      }
      
      if (toolName === 'addInvestment' && onAddInvestment) {
        const inv = {
          name: toolArgs.name || 'Investimento',
          type: toolArgs.type || 'stocks',
          broker: toolArgs.broker || '',
          strategy: toolArgs.strategy || 'LONG_TERM'
        };
        onAddInvestment(inv);
        return `📈 Investimento cadastrado: ${inv.name}`;
      }
      
      return `⚠️ Função ${toolName} não reconhecida ou não suportada.`;
    } catch (err) {
      console.error('Erro ao executar tool:', err);
      return `❌ Erro ao executar ${toolName}: ${String(err)}`;
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      content: inputMessage, 
      role: 'user', 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const userContext = `
        Transações: ${data.transactions.length}
        Metas: ${data.goals.length}
        Contas: ${data.accounts.length}
        Investimentos: ${data.investments.length}
      `;

      const result = await callOpenAIWithTools(inputMessage, 'Você é um assistente financeiro útil e objetivo.', userContext);
      
      console.log('Resposta da OpenAI:', result); // Debug

      if (!result.choices || result.choices.length === 0) {
        throw new Error('Resposta vazia da OpenAI');
      }

      const message = result.choices[0].message;
      
      if (message?.function_call) {
        // Caso 1: Chamada de função
        const fc = message.function_call;
        let args = {};
        
        try {
          args = typeof fc.arguments === 'string' ? JSON.parse(fc.arguments) : fc.arguments;
        } catch (err) {
          console.warn('Não foi possível parsear arguments:', err);
          args = {};
        }

        const toolResultText = handleToolCall(fc.name, args);
        
        const assistantMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          content: toolResultText, 
          role: 'assistant', 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, assistantMsg]);
        
      } else if (message?.content) {
        // Caso 2: Resposta textual
        const assistantMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          content: message.content, 
          role: 'assistant', 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Formato de resposta não reconhecido');
      }
      
    } catch (err) {
      console.error('Erro no handleSend:', err);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        content: '❌ Erro ao contatar a IA. Verifique a conexão e tente novamente.', 
        role: 'assistant', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Assistente Financeiro IA</h2>
        <div className="flex items-center bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm">
          <Bot size={16} className="mr-2" />
          Assistente (tools)
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-brand-600 text-white rounded-br-none' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className="text-xs opacity-50 mt-2 text-right">
                  {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 rounded-2xl px-4 py-3 max-w-[80%]">
                <Loader2 size={16} className="animate-spin inline-block mr-2" /> 
                Pensando...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          type="text" 
          value={inputMessage} 
          onChange={e => setInputMessage(e.target.value)} 
          placeholder="Digite sua mensagem..." 
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent" 
          disabled={isLoading} 
        />
        <button 
          type="submit" 
          disabled={isLoading || !inputMessage.trim()} 
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};
