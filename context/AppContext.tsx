
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent, Client, EventType, Pack, TelegramConfig, ViewState, Expense } from '../types';
import { isSameMonth, parseISO } from 'date-fns';

interface AppContextType {
  events: CalendarEvent[];
  clients: Client[];
  packs: Pack[];
  expenses: Expense[]; // Added expenses state
  telegramConfig: TelegramConfig;
  currentView: ViewState;
  calendarDate: Date;
  selectedEventId: string | null;
  setCurrentView: (view: ViewState) => void;
  setCalendarDate: (date: Date) => void;
  setSelectedEventId: (id: string | null) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addPack: (pack: Omit<Pack, 'id'>) => Pack;
  updatePack: (id: string, updates: Partial<Pack>) => void;
  deletePack: (id: string) => void;
  // Expense management methods
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;
  updateTelegramConfig: (config: TelegramConfig) => void;
  calculateMonthlyRevenue: (date: Date) => number;
  calculateMonthlyExpenses: (date: Date) => number; // Added monthly expense calculation
  getMonthlyIVA: (date: Date) => number; // Added IVA calculation
  getClientRevenue: (clientId: string) => number;
  sendTelegramMessage: (text: string) => Promise<void>;
  resetData: () => void;
  importBackup: (data: any) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('miroma_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('miroma_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [packs, setPacks] = useState<Pack[]>(() => {
    const saved = localStorage.getItem('miroma_packs');
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize expenses from localStorage
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('miroma_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem('miroma_telegram');
    return saved ? JSON.parse(saved) : { botToken: '', chatId: '', enabled: false };
  });

  useEffect(() => { localStorage.setItem('miroma_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('miroma_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('miroma_packs', JSON.stringify(packs)); }, [packs]);
  useEffect(() => { localStorage.setItem('miroma_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('miroma_telegram', JSON.stringify(telegramConfig)); }, [telegramConfig]);

  const sendTelegramMessage = async (text: string) => {
    if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) return;
    try {
        const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: telegramConfig.chatId, text, parse_mode: 'HTML' }),
        });
    } catch (error) { console.error('Telegram error:', error); }
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      bookingDate: eventData.bookingDate || new Date().toISOString(),
      referenceImages: eventData.referenceImages || []
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, ...updates } : evt));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = { ...clientData, id: Math.random().toString(36).substr(2, 9) };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addPack = (packData: Omit<Pack, 'id'>) => {
    const newPack = { ...packData, id: Math.random().toString(36).substr(2, 9) };
    setPacks(prev => [...prev, newPack]);
    return newPack;
  };

  const updatePack = (id: string, updates: Partial<Pack>) => {
    setPacks(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePack = (id: string) => {
    setPacks(prev => prev.filter(p => p.id !== id));
  };

  // Add a new expense record
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  };

  // Delete an expense record
  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateTelegramConfig = (config: TelegramConfig) => {
    setTelegramConfig(config);
  };

  const resetData = () => {
      setEvents([]); setClients([]); setPacks([]); setExpenses([]); localStorage.clear();
  };

  const importBackup = (data: any): boolean => {
      try {
          if (data.events) setEvents(data.events);
          if (data.clients) setClients(data.clients);
          if (data.packs) setPacks(data.packs);
          if (data.expenses) setExpenses(data.expenses);
          if (data.telegramConfig) setTelegramConfig(data.telegramConfig);
          return true;
      } catch (e) { return false; }
  };

  const calculateMonthlyRevenue = (date: Date) => {
    let total = 0;
    events.forEach(event => {
        if (!event.agreedPrice) return;
        if (event.packName === 'Ajuste Financeiro') {
             if (isSameMonth(parseISO(event.start), date)) total += event.agreedPrice;
             return; 
        }
        if (event.isFullPayment || event.type === EventType.ORDER) {
            if (isSameMonth(parseISO(event.bookingDate), date)) total += event.agreedPrice;
        } else {
            if (isSameMonth(parseISO(event.bookingDate), date)) total += (event.agreedPrice * 0.5);
            if (isSameMonth(parseISO(event.start), date)) total += (event.agreedPrice * 0.5);
        }
    });
    return total;
  };

  // Calculate monthly IVA (tax) based on revenue
  const getMonthlyIVA = (date: Date) => {
    return calculateMonthlyRevenue(date) * 0.06;
  };

  // Calculate total monthly expenses including fixed and manual costs
  const calculateMonthlyExpenses = (date: Date) => {
    const iva = getMonthlyIVA(date);
    // Base fixed costs defined by operational model from ExpensesView.tsx
    const fixedSum = 3000 + 307.5 + 1042.5 + 345 + 133.86 + 18.7 + iva;
    
    const manual = expenses
      .filter(e => isSameMonth(parseISO(e.date), date))
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    return fixedSum + manual;
  };

  const getClientRevenue = (clientId: string) => {
    return events
      .filter(e => e.clientId === clientId && e.agreedPrice)
      .reduce((acc, curr) => acc + (curr.agreedPrice || 0), 0);
  };

  return (
    <AppContext.Provider value={{ 
      events, clients, packs, expenses, telegramConfig, currentView, calendarDate, selectedEventId,
      setCurrentView, setCalendarDate, setSelectedEventId,
      addEvent, updateEvent, deleteEvent, 
      addClient, updateClient, deleteClient,
      addPack, updatePack, deletePack,
      addExpense, deleteExpense,
      updateTelegramConfig, calculateMonthlyRevenue, calculateMonthlyExpenses, getMonthlyIVA,
      getClientRevenue, sendTelegramMessage, resetData, importBackup
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
