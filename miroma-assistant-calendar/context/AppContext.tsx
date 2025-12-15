import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent, Client, EventType, Pack, TelegramConfig } from '../types';
import { isSameMonth, parseISO } from 'date-fns';

interface AppContextType {
  events: CalendarEvent[];
  clients: Client[];
  packs: Pack[];
  telegramConfig: TelegramConfig;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addPack: (pack: Omit<Pack, 'id'>) => Pack;
  updatePack: (id: string, updates: Partial<Pack>) => void;
  updateTelegramConfig: (config: TelegramConfig) => void;
  calculateMonthlyRevenue: (date: Date) => number;
  getClientRevenue: (clientId: string) => number;
  sendTelegramMessage: (text: string) => Promise<void>;
  resetData: () => void;
  importBackup: (data: any) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_PACKS: Pack[] = [
  { id: 'p1', name: 'Pack Básico - Ilustração', price: 500, conditions: 'Entrega digital, 1 revisão', isActive: true },
  { id: 'p2', name: 'Pack Premium - Pintura', price: 1200, conditions: 'Entrega física + digital, 3 revisões', isActive: true },
];

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'Empresa Alpha', contact: 'contato@alpha.com', notes: 'Prefere reuniões pela manhã.' },
  { id: '2', name: 'João Silva', contact: '11 99999-9999', notes: 'Gosta de cores vibrantes.' },
];

// Helper to set booking date 15 days prior to start if not provided
const today = new Date();
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
const lastMonth = new Date(today); lastMonth.setMonth(today.getMonth() - 1);

const INITIAL_EVENTS: CalendarEvent[] = [
  { 
    id: '101', 
    title: 'Reunião Alpha', 
    start: today.toISOString(), 
    end: new Date(new Date().setHours(today.getHours() + 1)).toISOString(), 
    bookingDate: lastMonth.toISOString(), // Booked last month
    type: EventType.WORK, 
    clientId: '1', 
    description: 'Briefing inicial',
    location: 'Google Meet',
    packName: 'Consultoria Hora',
    agreedPrice: 200
  },
  { 
    id: '103',
    title: 'Entrega Ilustração João',
    start: nextWeek.toISOString(),
    end: nextWeek.toISOString(),
    bookingDate: today.toISOString(), // Booked this month
    type: EventType.ORDER,
    clientId: '2',
    description: 'Ilustração para capa de livro',
    packName: 'Pack Básico - Ilustração',
    agreedPrice: 500,
    isDone: false,
    shippingAddress: 'Rua das Flores, 123, Lisboa',
    referenceImages: []
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize State from LocalStorage if available, otherwise use Mock Data
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('miroma_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('miroma_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [packs, setPacks] = useState<Pack[]>(() => {
    const saved = localStorage.getItem('miroma_packs');
    return saved ? JSON.parse(saved) : INITIAL_PACKS;
  });

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem('miroma_telegram');
    return saved ? JSON.parse(saved) : { botToken: '', chatId: '', enabled: false };
  });

  // Persist data whenever it changes
  useEffect(() => { localStorage.setItem('miroma_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('miroma_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('miroma_packs', JSON.stringify(packs)); }, [packs]);
  useEffect(() => { localStorage.setItem('miroma_telegram', JSON.stringify(telegramConfig)); }, [telegramConfig]);

  // Real implementation of Telegram Notification
  const sendTelegramMessage = async (text: string) => {
    if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) {
        console.warn('Telegram not configured or disabled');
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramConfig.chatId,
                text: text,
                parse_mode: 'HTML'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Telegram API Error:', errorData);
        }
    } catch (error) {
        console.error('Network error sending Telegram message:', error);
    }
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      // If bookingDate not provided, assume today
      bookingDate: eventData.bookingDate || new Date().toISOString(),
      referenceImages: eventData.referenceImages || []
    };
    setEvents(prev => [...prev, newEvent]);
    
    // Send Notification
    if (telegramConfig.enabled) {
      const dateStr = new Date(newEvent.start).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' });
      const msg = `✨ <b>Novo Agendamento MIROMA</b>\n\n📌 <b>${newEvent.title}</b>\n🕒 ${dateStr}\n💶 €${newEvent.agreedPrice || 0}\n📝 ${newEvent.description || 'Sem descrição'}`;
      sendTelegramMessage(msg);
    }
    
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...updates } : evt));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addPack = (packData: Omit<Pack, 'id'>) => {
    const newPack = { ...packData, id: Math.random().toString(36).substr(2, 9) };
    setPacks(prev => [...prev, newPack]);
    return newPack;
  };

  const updatePack = (id: string, updates: Partial<Pack>) => {
    setPacks(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const updateTelegramConfig = (config: TelegramConfig) => {
    setTelegramConfig(config);
  };

  const resetData = () => {
      setEvents(INITIAL_EVENTS);
      setClients(INITIAL_CLIENTS);
      setPacks(INITIAL_PACKS);
      
      localStorage.removeItem('miroma_events');
      localStorage.removeItem('miroma_clients');
      localStorage.removeItem('miroma_packs');
  };

  const importBackup = (data: any): boolean => {
      try {
          if (data.events && Array.isArray(data.events)) setEvents(data.events);
          if (data.clients && Array.isArray(data.clients)) setClients(data.clients);
          if (data.packs && Array.isArray(data.packs)) setPacks(data.packs);
          if (data.telegramConfig) setTelegramConfig(data.telegramConfig);
          return true;
      } catch (e) {
          console.error("Backup import failed", e);
          return false;
      }
  };

  const calculateMonthlyRevenue = (date: Date) => {
    let total = 0;
    
    events.forEach(event => {
        if (!event.agreedPrice) return;
        
        // SPECIAL CASE: Manual Adjustment (AddRevenue)
        if (event.packName === 'Ajuste Financeiro') {
             if (isSameMonth(parseISO(event.start), date)) {
                 total += event.agreedPrice;
             }
             return; 
        }

        // Orders (Encomendas): 100% on booking date (Creation date)
        if (event.type === EventType.ORDER) {
            if (isSameMonth(parseISO(event.bookingDate), date)) {
                total += event.agreedPrice;
            }
        } 
        // Events, Work, Personal: 50% on Booking, 50% on Event Date
        else {
            // 50% on Booking Month
            if (isSameMonth(parseISO(event.bookingDate), date)) {
                total += (event.agreedPrice * 0.5);
            }
            
            // 50% on Event Start Month
            if (isSameMonth(parseISO(event.start), date)) {
                total += (event.agreedPrice * 0.5);
            }
        }
    });

    return total;
  };

  const getClientRevenue = (clientId: string) => {
    return events
      .filter(e => e.clientId === clientId && e.agreedPrice)
      .reduce((acc, curr) => acc + (curr.agreedPrice || 0), 0);
  };

  return (
    <AppContext.Provider value={{ 
      events, clients, packs, telegramConfig,
      addEvent, updateEvent, deleteEvent, 
      addClient, updateClient, 
      addPack, updatePack,
      updateTelegramConfig, calculateMonthlyRevenue,
      getClientRevenue, sendTelegramMessage, resetData, importBackup
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};