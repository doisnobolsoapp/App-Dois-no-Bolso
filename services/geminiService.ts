import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEFAULT_SYSTEM_INSTRUCTION } from "../constants";

// Define tool for adding transactions
const addTransactionTool = {
  name: "addTransaction",
  description: "Adicionar uma nova transação financeira (receita, despesa, investimento, etc).",
  parameters: {
    type: "OBJECT",
    properties: {
      type: {
        type: "STRING",
        enum: ["INCOME", "EXPENSE", "INVESTMENT", "LOAN"],
        description: "O tipo da transação."
      },
      category: {
        type: "STRING",
        description: "A categoria da transação (ex: Alimentação, Salário, Lazer)."
      },
      amount: {
        type: "NUMBER",
        description: "O valor numérico da transação."
      },
      description: {
        type: "STRING",
        description: "Uma breve descrição ou nome da transação."
      },
      date: {
        type: "STRING",
        description: "Data no formato YYYY-MM-DD. Se não especificado, use a data de hoje."
      },
      paid: {
        type: "BOOLEAN",
        description: "Se a conta já foi paga ou recebida. True por padrão para despesas imediatas."
      }
    },
    required: ["type", "amount", "description"]
  }
};

const addGoalTool = {
  name: "addGoal",
  description: "Criar uma nova meta financeira.",
  parameters: {
    type: "OBJECT",
    properties: {
      name: { type: "STRING", description: "Nome da meta (ex: Viagem para Paris)." },
      targetAmount: { type: "NUMBER", description: "Valor alvo a ser atingido." },
      deadline: { type: "STRING", description: "Data limite para a meta (YYYY-MM-DD)." }
    },
    required: ["name", "targetAmount"]
  }
};

const addInvestmentTool = {
    name: "addInvestment",
    description: "Cadastrar um novo ativo de investimento na carteira (Apenas cadastro, não aporte).",
    parameters: {
        type: "OBJECT",
        properties: {
            name: { type: "STRING", description: "Nome ou Ticker do ativo (ex: PETR4, CDB Inter)." },
            type: { 
                type: "STRING", 
                enum: ["FIXED_INCOME", "STOCK", "FII", "CRYPTO", "FUND", "PENSION", "SAVINGS", "INTERNATIONAL", "OTHER"],
                description: "Tipo do investimento." 
            },
            broker: { type: "STRING", description: "Corretora ou banco." },
            strategy: {
                type: "STRING",
                enum: ["RESERVE", "LONG_TERM", "SHORT_TERM", "SWING_TRADE", "HOLD"],
                description: "Estratégia do investimento."
            }
        },
        required: ["name", "type"]
    }
};

export const createGeminiClient = () => {
  // Corrigido: usar import.meta.env corretamente
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getGeminiModel = (client: GoogleGenerativeAI) => {
  return client.getGenerativeModel({ model: "gemini-pro" });
};

export const TOOLS_CONFIG = [
  addTransactionTool, addGoalTool, addInvestmentTool
];

export const SYSTEM_INSTRUCTION = DEFAULT_SYSTEM_INSTRUCTION;
