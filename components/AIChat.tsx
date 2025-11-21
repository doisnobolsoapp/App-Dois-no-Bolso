import React, { useState, useRef, useEffect } from 'react';
import { AppData, Transaction, Goal } from '../types';
import { createGeminiClient, getGeminiModel, TOOLS_CONFIG, SYSTEM_INSTRUCTION } from '../services/geminiService';
import { Send, Bot, User, Loader2, Mic, MicOff } from 'lucide-react';
import { ToolCall } from '@google/genai';

interface AIChatProps {
  data: AppData;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onAddGoal: (g: Omit<Goal, 'id'>) => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isToolUse?: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({ data, onAddTransaction, onAddGoal }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Olá! Sou o assistente do Dois no Bolso. Posso ajudar a registrar gastos, verificar seu saldo ou dar dicas. O que vamos fazer hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [geminiClient] = useState(() => createGeminiClient());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Context construction to make the AI aware of current state
      // Note: sending too much data can hit token limits. Sending a summary is safer.
      // For this demo, we send a compact summary string in the prompt.
      const financialSummary = `
        [Contexto Atual do Usuário]
        Saldo Atual: ${data.transactions.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0)}
        Metas: ${data.goals.map(g => g.name).join(', ')}
      `;

      const model = getGeminiModel(geminiClient);
      
      const response = await model.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + financialSummary,
          tools: TOOLS_CONFIG,
        },
        contents: [
            ...messages.slice(-10).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            })), // History
            { role: 'user', parts: [{ text: userMsg.text }] } // Current
        ]
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) throw new Error("No response");

      const content = candidates[0].content;
      const parts = content.parts;

      // Check for tool calls
      let toolOutput = '';
      let handledTool = false;

      for (const part of parts) {
        if (part.functionCall) {
            handledTool = true;
            const fc = part.functionCall;
            // Execute the tool locally
            if (fc.name === 'addTransaction') {
                const args = fc.args as any;
                onAddTransaction({
                    type: args.type,
                    amount: args.amount,
                    category: args.category || 'Outros',
                    description: args.description,
                    date: args.date || new Date().toISOString().split('T')[0],
                    paid: args.paid !== undefined ? args.paid : true
                });
                toolOutput = `✅ Transação "${args.description}" de R$ ${args.amount} registrada com sucesso!`;
            } else if (fc.name === 'addGoal') {
                const args = fc.args as any;
                onAddGoal({
                    name: args.name,
                    targetAmount: args.targetAmount,
                    currentAmount: 0,
                    deadline: args.deadline
                });
                 toolOutput = `✅ Meta "${args.name}" criada para atingir R$ ${args.targetAmount} até ${args.deadline}.`;
            }
        }
        
        if (part.text) {
             setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: part.text || '' }]);
        }
      }

      if (handledTool && toolOutput) {
         setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: toolOutput, isToolUse: true }]);
      }


    } catch (error) {
      console.error("Gemini Error", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Desculpe, tive um problema ao processar isso. Verifique sua conexão ou chave de API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden pb-20 md:pb-0">
      <div className="bg-brand-600 p-4 text-white flex items-center shadow-md">
        <Bot className="mr-3" />
        <div>
            <h2 className="font-bold text-lg">Assistente Inteligente</h2>
            <p className="text-brand-100 text-xs">Pergunte sobre gastos, adicione despesas ou peça dicas.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-br-none' 
                : msg.isToolUse ? 'bg-green-100 text-green-900 border border-green-200 rounded-bl-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
                {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
             <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center">
                    <Loader2 className="animate-spin text-brand-600 w-4 h-4 mr-2" />
                    <span className="text-slate-500 text-sm">Pensando...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2 relative">
          <input 
            type="text" 
            className="flex-1 border border-slate-300 rounded-full px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            placeholder="Ex: Gastei 50 reais no mercado..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-full disabled:opacity-50 transition-colors flex-shrink-0"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
            A IA pode cometer erros. Verifique os valores importantes.
        </p>
      </div>
    </div>
  );
};
