
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { DEFAULT_SYSTEM_INSTRUCTION } from "../constants";

// Define tool for adding transactions
const addTransactionTool: FunctionDeclaration = {
  name: "addTransaction",
  description: "Adicionar uma nova transação financeira (receita, despesa, investimento, etc).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ["INCOME", "EXPENSE", "INVESTMENT", "LOAN"],
        description: "O tipo da transação."
      },
      category: {
        type: Type.STRING,
        description: "A categoria da transação (ex: Alimentação, Salário, Lazer)."
      },
      amount: {
        type: Type.NUMBER,
        description: "O valor numérico da transação."
      },
      description: {
        type: Type.STRING,
        description: "Uma breve descrição ou nome da transação."
      },
      date: {
        type: Type.STRING,
        description: "Data no formato YYYY-MM-DD. Se não especificado, use a data de hoje."
      },
      paid: {
        type: Type.BOOLEAN,
        description: "Se a conta já foi paga ou recebida. True por padrão para despesas imediatas."
      }
    },
    required: ["type", "amount", "description"]
  }
};

const addGoalTool: FunctionDeclaration = {
  name: "addGoal",
  description: "Criar uma nova meta financeira.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nome da meta (ex: Viagem para Paris)." },
      targetAmount: { type: Type.NUMBER, description: "Valor alvo a ser atingido." },
      deadline: { type: Type.STRING, description: "Data limite para a meta (YYYY-MM-DD)." }
    },
    required: ["name", "targetAmount"]
  }
};

const addInvestmentTool: FunctionDeclaration = {
    name: "addInvestment",
    description: "Cadastrar um novo ativo de investimento na carteira (Apenas cadastro, não aporte).",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Nome ou Ticker do ativo (ex: PETR4, CDB Inter)." },
            type: { 
                type: Type.STRING, 
                enum: ["FIXED_INCOME", "STOCK", "FII", "CRYPTO", "FUND", "PENSION", "SAVINGS", "INTERNATIONAL", "OTHER"],
                description: "Tipo do investimento." 
            },
            broker: { type: Type.STRING, description: "Corretora ou banco." },
            strategy: {
                type: Type.STRING,
                enum: ["RESERVE", "LONG_TERM", "SHORT_TERM", "SWING_TRADE", "HOLD"],
                description: "Estratégia do investimento."
            }
        },
        required: ["name", "type"]
    }
};

export const createGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in process.env");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const getGeminiModel = (client: GoogleGenAI) => {
  return client.models; // Access to generateContent
};

export const TOOLS_CONFIG = [
  { functionDeclarations: [addTransactionTool, addGoalTool, addInvestmentTool] }
];

export const SYSTEM_INSTRUCTION = DEFAULT_SYSTEM_INSTRUCTION;
