
export interface Client {
  id: string;
  name: string;
  contact: string;
  notes: string;
}

export enum EventType {
  WORK = 'Trabalho',
  PERSONAL = 'Pessoal',
  ORDER = 'Encomenda', 
  EVENT = 'Evento',    
}

// Added ExpenseCategory for financial tracking
export enum ExpenseCategory {
  MATERIAL = 'Material',
  TRAVEL = 'Deslocação',
  EMPLOYEE = 'Funcionário',
  SALARY = 'Salário',
  ACCOUNTANT = 'Contabilista',
  TAX = 'Impostos',
  SERVICE = 'Serviços',
  OTHER = 'Outros'
}

// Added Expense interface for financial tracking
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  isRecurring: boolean;
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
  isFullPayment?: boolean; 
  
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
