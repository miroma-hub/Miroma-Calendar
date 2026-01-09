
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventType, CalendarEvent } from '../types';
import { Euro, Package, Calendar as CalendarIcon, Clock, X, CheckCircle, ChevronRight } from 'lucide-react';
import CalendarView from './CalendarView'; 
import { format, isSameMonth, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardView: React.FC = () => {
  const { events, clients, calculateMonthlyRevenue, setCurrentView, setCalendarDate, setSelectedEventId } = useApp();
  const [activeSummary, setActiveSummary] = useState<'billing' | 'orders' | null>(null);
  
  const currentMonth = new Date();
  const monthlyRevenue = calculateMonthlyRevenue(currentMonth);
  const pendingOrders = events.filter(e => e.type === EventType.ORDER && !e.isDone);
  const nextEvent = events
    .filter(e => isAfter(parseISO(e.end), new Date()) && e.type !== EventType.ORDER)
    .sort((a,b) => a.start.localeCompare(b.start))[0];

  const handleNextEventClick = () => {
      if (nextEvent) {
          setCalendarDate(parseISO(nextEvent.start));
          setSelectedEventId(nextEvent.id);
      }
  };

  const SummaryModal = ({ title, type, items, onClose }: { title: string, type: 'billing' | 'orders', items: any[], onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[70vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
                <h3 className="font-bold text-lg text-white">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {items.length === 0 ? (
                    <p className="text-center text-slate-500 py-8 italic">Nenhum registro encontrado.</p>
                ) : (
                    items.map((item, idx) => (
                        <div key={idx} className="bg-slate-800/40 border border-slate-700/30 p-3 rounded-xl flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-white">{item.title || item.event?.title}</p>
                                <p className="text-xs text-slate-400">
                                    {item.date ? format(parseISO(item.date), 'dd/MM') : format(parseISO(item.start), 'dd/MM')}
                                    {item.client && ` • ${item.client}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-blue-400 font-bold">
                                    {type === 'billing' ? `€ ${item.amount.toLocaleString('pt-PT')}` : 'Pendente'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {type === 'billing' && items.length > 0 && (
                <div className="p-4 bg-slate-800/30 border-t border-slate-700 flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total do Mês</span>
                    <span className="text-xl font-bold text-green-400">€ {items.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-PT')}</span>
                </div>
            )}
            <button onClick={() => { setCurrentView(type === 'billing' ? 'billing' : 'orders'); onClose(); }} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                Ver completo <ChevronRight size={16}/>
            </button>
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 flex-shrink-0">
        {/* Card Faturamento */}
        <button onClick={() => setActiveSummary('billing')} className="bg-slate-800/20 backdrop-blur-md border border-slate-700/30 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-800/40 hover:border-green-500/30 transition-all group text-left">
           <div className="bg-green-500/10 p-2 rounded-lg text-green-400 group-hover:bg-green-500/20 transition-colors"><Euro /></div>
           <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Faturamento (Mês)</p>
              <p className="text-xl font-bold text-white">€ {monthlyRevenue.toLocaleString('pt-PT')}</p>
           </div>
        </button>

        {/* Card Encomendas */}
        <button onClick={() => setActiveSummary('orders')} className="bg-slate-800/20 backdrop-blur-md border border-slate-700/30 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-800/40 hover:border-orange-500/30 transition-all group text-left">
           <div className="bg-orange-500/10 p-2 rounded-lg text-orange-400 group-hover:bg-orange-500/20 transition-colors"><Package /></div>
           <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Encomendas Ativas</p>
              <p className="text-xl font-bold text-white">{pendingOrders.length}</p>
           </div>
        </button>

        {/* Card Eventos Totais */}
         <button onClick={() => setCurrentView('events_view')} className="bg-slate-800/20 backdrop-blur-md border border-slate-700/30 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-800/40 hover:border-blue-500/30 transition-all group text-left">
           <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors"><CalendarIcon /></div>
           <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Eventos Totais</p>
              <p className="text-xl font-bold text-white">{events.length}</p>
           </div>
        </button>

        {/* Card Próximo Evento */}
        <button onClick={handleNextEventClick} className="bg-slate-800/20 backdrop-blur-md border border-slate-700/30 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-800/40 hover:border-purple-500/30 transition-all group text-left">
           <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400 group-hover:bg-purple-500/20 transition-colors"><Clock /></div>
           <div className="flex-1 overflow-hidden">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Próximo Evento</p>
              <p className="text-sm font-semibold text-white truncate">
                  {nextEvent?.title || 'Nenhum'}
              </p>
           </div>
        </button>
      </div>

      <div className="flex-1 bg-slate-900/10 backdrop-blur-sm border border-slate-700/30 rounded-2xl overflow-hidden relative shadow-2xl">
         <CalendarView isEmbedded={true} />
      </div>

      {activeSummary === 'billing' && (
          <SummaryModal 
            title={`Faturamento de ${format(currentMonth, 'MMMM', {locale: ptBR})}`}
            type="billing"
            items={events.reduce((acc: any[], event) => {
                if (!event.agreedPrice) return acc;
                if (event.packName === 'Ajuste Financeiro' && isSameMonth(parseISO(event.start), currentMonth)) {
                    acc.push({ title: event.title, amount: event.agreedPrice, date: event.start });
                } else if ((event.isFullPayment || event.type === EventType.ORDER) && isSameMonth(parseISO(event.bookingDate), currentMonth)) {
                    acc.push({ title: event.title, amount: event.agreedPrice, date: event.bookingDate });
                } else {
                    if (isSameMonth(parseISO(event.bookingDate), currentMonth)) acc.push({ title: `${event.title} (Sinal)`, amount: event.agreedPrice * 0.5, date: event.bookingDate });
                    if (isSameMonth(parseISO(event.start), currentMonth)) acc.push({ title: `${event.title} (Evento)`, amount: event.agreedPrice * 0.5, date: event.start });
                }
                return acc;
            }, [])}
            onClose={() => setActiveSummary(null)}
          />
      )}

      {activeSummary === 'orders' && (
          <SummaryModal 
            title="Encomendas Pendentes"
            type="orders"
            items={pendingOrders.map(o => ({
                title: o.title,
                start: o.start,
                client: o.clientId ? clients.find(c => c.id === o.clientId)?.name : null
            }))}
            onClose={() => setActiveSummary(null)}
          />
      )}
    </div>
  );
};

export default DashboardView;
