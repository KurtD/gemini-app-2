export type Role = 'user' | 'agent';

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export interface ChatSession {
  id: number;
  title: string;
}