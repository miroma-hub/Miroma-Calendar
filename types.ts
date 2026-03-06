
export interface Client {
  id: string;
  name: string;
  contact: string;
  notes: string;
  conversationHistory?: string;
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

export type EmployeeRole = 'illustrator' | 'photographer' | 'other';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  photo?: string; // Base64 avatar
  portfolio?: string[]; // Base64 or links
  address: string;
  rateType: 'hour' | 'event';
  rateValue: number;
  hasCar: boolean;
  skills: string; 
  availabilityNotes: string; 
  internalNotes: string; 
  aiMemory?: string; 
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
  lat?: number;
  lng?: number;
  clientId?: string; 
  packName?: string; 
  agreedPrice?: number; 
  isFullPayment?: boolean;
  isDone?: boolean;
  shippingAddress?: string;
  referenceImages?: string[];
  assignedEmployeeIds?: string[]; 
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

export type ViewState = 'dashboard' | 'calendar' | 'clients' | 'packs' | 'orders' | 'settings' | 'billing' | 'events_view' | 'team';
