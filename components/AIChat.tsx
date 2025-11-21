import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { AppData, TransactionType, PaymentMethod, Category } from '../types';
import { createGeminiClient, getGeminiModel, SYSTEM_INSTRUCTION } from '../services/geminiService';

interface AIChatProps {
  data: AppData;
  onAddTransaction: (t: any) => void;
  onAddGoal: (g: any) => void;
  onAddInvestment: (i: any) => void;
}

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const client = createGeminiClient();
      const model = getGeminiModel(client);
      
      const context = `
        Dados do usuário:
        - Total de transações: ${data.transactions.length}
        - Metas ativas: ${data.goals.length}
        - Contas bancárias: ${data.accounts.length}
        - Investimentos: ${data.investments.length}
        
        Instrução: ${SYSTEM_INSTRUCTION}
      `;

      const prompt = `${context}\n\nUsuário: ${inputMessage}\nAssistente:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Simple command detection for demo purposes
      if (inputMessage.toLowerCase().includes('adicionar despesa') || inputMessage.toLowerCase().includes('nova despesa')) {
        const sampleTransaction = {
          type: TransactionType.EXPENSE,
          description: 'Despesa via assistente',
          amount: 50,
          category: Category.OTHER,
          date: new Date().toISOString().split('T')[0],
          paid: true,
          paymentMethod: PaymentMethod.CASH
        };
        onAddTransaction(sampleTransaction);
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
          Gemini AI
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'assistant' && (
                    <Bot size={16} className="mr-2 text-brand-600" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.role === 'user' ? 'Você' : 'Assistente'}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs opacity-50 mt-2 text-right">
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%]">
                <div className="flex items-center">
                  <Bot size={16} className="mr-2 text-brand-600" />
                  <Loader2 size={16} className="animate-spin mr-2" />
                  <span className="text-xs opacity-70">Digitando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>

      {/* Quick Suggestions */}
      <div className="mt-4">
        <p className="text-sm text-slate-500 mb-2">Sugestões rápidas:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Como organizar minhas despesas?",
            "Me mostre um resumo financeiro",
            "Quero criar uma meta de economia",
            "Analise meus investimentos"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
