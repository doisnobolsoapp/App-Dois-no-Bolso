import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { AppData, TransactionType, PaymentMethod } from '../types';

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

export const AIChat: React.FC<AIChatProps> = ({ data, onAddTransaction }) => {
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

  // ==========================
  //   OPENAI REQUEST
  // ==========================
  const callOpenAI = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      console.error('VITE_OPENAI_API_KEY não foi definida.');
      return 'Erro: API KEY não configurada.';
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente financeiro experiente. Analise dados do usuário e responda de forma simples, direta e útil."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Não consegui gerar uma resposta.";
  };

  // ==========================
  //  HANDLE SEND MESSAGE
  // ==========================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Contexto financeiro para a IA
      const context = `
        Dados do usuário:
        - Total de transações: ${data.transactions.length}
        - Metas ativas: ${data.goals.length}
        - Contas bancárias: ${data.accounts.length}
        - Investimentos: ${data.investments.length}
      `;

      const prompt = `${context}\n\nUsuário: ${userMessage.content}`;

      const reply = await callOpenAI(prompt);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: reply,
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Detectar criação de despesa automática
      if (userMessage.content.toLowerCase().includes("nova despesa")) {
        const sample = {
          type: TransactionType.EXPENSE,
          description: "Despesa via IA",
          amount: 50,
          category: "Outros",
          date: new Date().toISOString().split("T")[0],
          paid: true,
          paymentMethod: PaymentMethod.CASH
        };
        onAddTransaction(sample);
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: "Erro ao se comunicar com a IA. Tente novamente.",
          role: "assistant",
          timestamp: new Date()
        }
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="pb-20 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Assistente Financeiro IA</h2>
        <div className="flex items-center bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm">
          <Bot size={16} className="mr-2" />
          GPT-4o mini
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-800 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className="text-xs opacity-50 mt-2 text-right">
                  {msg.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 rounded-2xl px-4 py-3 max-w-[80%]">
                <Loader2 size={16} className="animate-spin inline-block mr-2" />
                Digitando...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg flex items-center"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};
