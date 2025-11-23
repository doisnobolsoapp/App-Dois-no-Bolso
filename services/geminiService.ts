import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEFAULT_SYSTEM_INSTRUCTION } from "../constants";

// ========== Tools (Funções da IA) ==========
const addTransactionTool = {
  name: "addTransaction",
  description: "Adicionar nova transação financeira.",
  parameters: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["income", "expense", "investment", "loan"] },
      category: { type: "string" },
      amount: { type: "number" },
      description: { type: "string" },
      date: { type: "string" },
      paid: { type: "boolean" }
    },
    required: ["type", "amount", "description"]
  }
};

const addGoalTool = {
  name: "addGoal",
  description: "Criar uma nova meta financeira.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      targetAmount: { type: "number" },
      deadline: { type: "string" }
    },
    required: ["name", "targetAmount"]
  }
};

const addInvestmentTool = {
  name: "addInvestment",
  description: "Cadastrar um novo investimento.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      type: { 
        type: "string",
        enum: ["FIXED_INCOME", "STOCK", "FII", "CRYPTO", "FUND", "PENSION", "SAVINGS", "INTERNATIONAL", "OTHER"]
      },
      broker: { type: "string" },
      strategy: { 
        type: "string",
        enum: ["RESERVE", "LONG_TERM", "SHORT_TERM", "SWING_TRADE", "HOLD"]
      }
    },
    required: ["name", "type"]
  }
};

export const TOOLS_CONFIG = [addTransactionTool, addGoalTool, addInvestmentTool];

// ========== Criar cliente ==========
export const createGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ ERRO: VITE_GEMINI_API_KEY não encontrada no .env");
    throw new Error("API key do Gemini não configurada");
  }

  return new GoogleGenerativeAI(apiKey);
};

// ========== Obter modelo ==========
export const getGeminiModel = (client: GoogleGenerativeAI) => {
  return client.getGenerativeModel({
    model: "gemini-1.5-flash",
    // Corrigido: usar a estrutura correta para functionDeclarations
    tools: TOOLS_CONFIG,
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION
  });
};

export const SYSTEM_INSTRUCTION = DEFAULT_SYSTEM_INSTRUCTION;

// ========== Função principal para chamar a IA ==========
export const callGeminiWithTools = async (userMessage: string, systemInstruction?: string, context?: string) => {
  try {
    const client = createGeminiClient();
    const model = getGeminiModel(client);
    
    const fullPrompt = context 
      ? `${systemInstruction || DEFAULT_SYSTEM_INSTRUCTION}\n\nContexto atual:\n${context}\n\nUsuário: ${userMessage}`
      : `${systemInstruction || DEFAULT_SYSTEM_INSTRUCTION}\n\nUsuário: ${userMessage}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    
    return {
      choices: [{
        message: {
          content: response.text(),
          function_call: null
        }
      }]
    };
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    throw error;
  }
};
