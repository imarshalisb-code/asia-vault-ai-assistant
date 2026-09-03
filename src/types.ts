export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: string;
  error?: boolean;
}

export type GeminiModelId = 
  | 'gemini-3.5-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.8-flash'
  | 'gemini-3.1-pro-preview';

export interface ModelOption {
  id: GeminiModelId;
  name: string;
  badge: string;
  description: string;
  speed: string;
}

export interface PersonaRole {
  id: string;
  title: string;
  description: string;
  systemInstruction: string;
  iconName: string;
}
