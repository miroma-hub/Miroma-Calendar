import React from 'react';
import { useApp } from '../context/AppContext';
import { EventType } from '../types';
import { Euro, Package, Calendar as CalendarIcon, Clock } from 'lucide-react';
import CalendarView from './CalendarView'; 
import { format } from 'date-fns';

const DashboardView: React.FC = () => {
  const { events, calculateMonthlyRevenue } = useApp();
  const currentMonth = new Date();

  // Financial Calc for Current Month (using new 50/50 logic)
  const monthlyRevenue = calculateMonthlyRevenue(currentMonth);
  const pendingOrders = events.filter(e => e.type === EventType.ORDER && !e.isDone).length;

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in overflow-hidden">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 flex-shrink-0">
        <div className="bg-slate-800/20 backdrop-blur-md border border-slate-700/30 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-800/40 transition-colors group">
           <div className="bg-green-500/10 p-2 rounded-lg text-green-400 group-hover:bg-green-500/20 transition-colors"><Euro /></div>
           <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Faturamento (Mês)</p>
              <p className="text-xl font-bold text-white">€ {monthlyRevenue.toLocaleString('pt-PT')}</p>
           </div>
        </div>

        <div className="bg-slate-800/20 backdrop-blur-md border border-slate-700/30 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-800/40 transition-colors group">
           <div className="bg-orange-500/10 p-2 rounded-lg text-orange-400 group-hover:bg-orange-500/20 transition-colors"><Package /></div>
           <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Encomendas Pendentes</p>
              <p className="text-xl font-bold text-white">{pendingOrders}</p>
           </div>
        </div>

         <div className="bg-slate-800/20 backdrop-blur-md border border-slate-700/30 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-800/40 transition-colors group">
           <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors"><CalendarIcon /></div>
           <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Eventos Totais</p>
              <p className="text-xl font-bold text-white">{events.length}</p>
           </div>
        </div>

        <div className="bg-slate-800/20 backdrop-blur-md border border-slate-700/30 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-800/40 transition-colors group">
           <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400 group-hover:bg-purple-500/20 transition-colors"><Clock /></div>
           <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Próximo Evento</p>
              <p className="text-sm font-semibold text-white truncate max-w-[150px]">
                  {events.filter(e => new Date(e.start) > new Date()).sort((a,b) => a.start.localeCompare(b.start))[0]?.title || 'Nenhum'}
              </p>
           </div>
        </div>
      </div>

      {/* Main Calendar Area - Large */}
      <div className="flex-1 bg-slate-900/10 backdrop-blur-sm border border-slate-700/30 rounded-2xl overflow-hidden relative shadow-2xl">
         <CalendarView isEmbedded={true} />
      </div>
    </div>
  );
};

export default DashboardView;