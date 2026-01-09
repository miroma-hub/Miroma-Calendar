
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventType } from '../types';
import { format, eachMonthOfInterval, startOfYear, endOfYear, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, X, CheckCircle } from 'lucide-react';

const BillingView: React.FC = () => {
  const { calculateMonthlyRevenue, events, clients } = useApp();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonthDetails, setSelectedMonthDetails] = useState<{date: Date, items: any[]} | null>(null);

  const months = eachMonthOfInterval({
    start: startOfYear(new Date(currentYear, 0, 1)),
    end: endOfYear(new Date(currentYear, 0, 1))
  });

  const data = months.map(month => ({
    dateObj: month,
    name: format(month, 'MMM', { locale: ptBR }),
    fullName: format(month, 'MMMM', { locale: ptBR }),
    revenue: calculateMonthlyRevenue(month),
  }));

  const totalYearRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);

  const handleShowDetails = (monthDate: Date) => {
    const items: any[] = [];
    events.forEach(event => {
        if (!event.agreedPrice) return;
        const price = event.agreedPrice;

        if (event.packName === 'Ajuste Financeiro') {
             if (isSameMonth(parseISO(event.start), monthDate)) {
                 items.push({ event, type: 'manual', label: 'Ajuste Manual / Extra', amount: price, date: event.start });
             }
             return;
        }

        if (event.isFullPayment || event.type === EventType.ORDER) {
             if (isSameMonth(parseISO(event.bookingDate), monthDate)) {
                items.push({ event, type: 'full', label: 'Pagamento 100% (Integral)', amount: price, date: event.bookingDate });
             }
        } else {
            if (isSameMonth(parseISO(event.bookingDate), monthDate)) {
                items.push({ event, type: 'booking', label: 'Sinal / Reserva (50%)', amount: price * 0.5, date: event.bookingDate });
            }
            if (isSameMonth(parseISO(event.start), monthDate)) {
                items.push({ event, type: 'realization', label: 'Evento/Finalização (50%)', amount: price * 0.5, date: event.start });
            }
        }
    });
    setSelectedMonthDetails({ date: monthDate, items });
  };

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <div><h2 className="text-3xl font-bold gemini-gradient-text">Faturamento</h2></div>
        <div className="flex items-center gap-4 bg-slate-800/40 rounded-full px-4 py-2 border border-slate-700/50 backdrop-blur-sm">
           <button onClick={() => setCurrentYear(currentYear - 1)} className="hover:text-blue-400"><ChevronLeft /></button>
           <span className="font-bold text-xl text-white">{currentYear}</span>
           <button onClick={() => setCurrentYear(currentYear + 1)} className="hover:text-blue-400"><ChevronRight /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="lg:col-span-2 bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-6">Visão Anual</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                     <XAxis dataKey="name" stroke="#94a3b8" />
                     <YAxis stroke="#94a3b8" tickFormatter={(value) => `€${value}`} />
                     <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: '#334155', borderRadius: '8px', color: '#fff', backdropFilter: 'blur(4px)' }} />
                     <Bar dataKey="revenue" fill="#4285F4" radius={[4, 4, 0, 0]} opacity={0.8} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-slate-700/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center backdrop-blur-sm"><TrendingUp size={32} className="text-green-400 mb-4" /><p className="text-slate-400 uppercase text-xs font-bold">Total Acumulado</p><p className="text-4xl font-bold text-white mt-2">€ {totalYearRevenue.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</p></div>
      </div>
      <div className="flex-1 overflow-y-auto">
         <h3 className="text-xl font-bold text-white mb-4">Detalhamento Mensal</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map((month) => (
               <div key={month.name} className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-800/30 transition-colors backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2"><span className="text-slate-300 font-medium capitalize">{month.fullName}</span>{month.revenue > 0 && (<button onClick={() => handleShowDetails(month.dateObj)} className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded-full border border-green-500/20 hover:bg-green-500 hover:text-white transition-all">+ Info</button>)}</div>
                  <p className="text-2xl font-bold text-white">€ {month.revenue.toLocaleString('pt-PT')}</p>
               </div>
            ))}
         </div>
      </div>
      {selectedMonthDetails && (
          <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedMonthDetails(null)}>
              <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                      <div><h3 className="text-2xl font-bold text-white capitalize">{format(selectedMonthDetails.date, 'MMMM yyyy', {locale: ptBR})}</h3><p className="text-slate-400 text-sm">Origem das receitas</p></div>
                      <button onClick={() => setSelectedMonthDetails(null)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {selectedMonthDetails.items.map((item, idx) => {
                          const client = clients.find(c => c.id === item.event.clientId);
                          return (
                            <div key={idx} className="bg-slate-800/30 border border-slate-700/30 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-white text-sm">{item.event.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                        <span className={`px-1.5 py-0.5 rounded ${item.type === 'full' ? 'bg-green-900/30 text-green-300' : 'bg-slate-900/50 text-slate-300'}`}>{item.label}</span>
                                        {client && <span>• {client.name}</span>}
                                        {item.event.isFullPayment && <CheckCircle size={12} className="text-green-400" />}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono font-bold text-white">€ {item.amount.toLocaleString('pt-PT')}</span>
                                </div>
                            </div>
                          )
                      })}
                  </div>
                  <div className="p-4 bg-slate-800/50 border-t border-slate-700/50 flex justify-between items-center"><span className="text-slate-400 font-medium">Total do Mês</span><span className="text-xl font-bold text-green-400">€ {selectedMonthDetails.items.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-PT')}</span></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BillingView;
