export interface Client {
  id: string;
  name: string;
  contact: string;
  notes: string;
  // totalRevenue is calculated dynamically from events now
}

export enum EventType {
  WORK = 'Trabalho',
  PERSONAL = 'Pessoal',
  ORDER = 'Encomenda', // New type for commissions/orders
  EVENT = 'Evento',    // New type for specific events/occasions
}

export interface Pack {
  id: string;
  name: string;
  price: number;
  conditions: string; // e.g., "50% entry, digital delivery"
  isActive: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO Date String
  end: string;   // ISO Date String
  bookingDate: string; // ISO Date String - When the reservation was made (for 50% revenue calc)
  type: EventType;
  description?: string;
  location?: string; // "Local"
  
  // Relations
  clientId?: string; 
  
  // Financial & Pack History (Snapshot strategy)
  packName?: string; 
  agreedPrice?: number; // Stores the price at the moment of booking (preserves history)
  
  // Order specific
  isDone?: boolean;
  shippingAddress?: string;
  referenceImages?: string[]; // Base64 strings for inspiration images
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