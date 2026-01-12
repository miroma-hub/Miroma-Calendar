
export interface Client {
  id: string;
  name: string;
  contact: string;
  notes: string;
  conversationHistory?: string; // Novo campo para contexto da AI
}

export enum EventType {
  WORK = 'Trabalho',
  PERSONAL = 'Pessoal',
  ORDER = 'Encomenda', 
  EVENT = 'Evento',    
}

export interface Pack {
  id: string;
  name: string;
  price: number;
  conditions: string; 
  isActive: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; 
  end: string;   
  bookingDate: string; 
  type: EventType;
  description?: string;
  location?: string; 
  
  // Relations
  clientId?: string; 
  
  // Financial
  packName?: string; 
  agreedPrice?: number; 
  isFullPayment?: boolean; // Nova flag para pagamento 100%
  
  // Order specific
  isDone?: boolean;
  shippingAddress?: string;
  referenceImages?: string[]; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export type ViewState = 'dashboard' | 'calendar' | 'clients' | 'packs' | 'orders' | 'settings' | 'billing' | 'events_view';
