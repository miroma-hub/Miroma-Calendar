
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths, startOfYear, eachMonthOfInterval, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, X, Calendar as CalendarIcon, Clock, ZoomIn, ZoomOut, User, Euro, Trash2, Tag, Info, PartyPopper, Briefcase, Heart, Cake, Users } from 'lucide-react';
import { EventType, CalendarEvent } from '../types';

interface CalendarViewProps {
  isEmbedded?: boolean;
}

type ViewMode = 'MONTH' | 'YEAR' | 'DAY';

const CalendarView: React.FC<CalendarViewProps> = ({ isEmbedded = false }) => {
  const { events, clients, calendarDate, setCalendarDate, selectedEventId, setSelectedEventId, deleteEvent } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('MONTH');
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedEventId) {
        const event = events.find(e => e.id === selectedEventId);
        if (event) setDetailEvent(event);
    }
  }, [selectedEventId, events]);

  // CORREÇÃO: Gerar dias começando no início da semana (Segunda-feira = 1) do 1º dia do mês
  const monthStart = startOfMonth(calendarDate);
  const monthEnd = endOfMonth(calendarDate);
  const daysInMonth = eachDayOfInterval({ 
    start: startOfWeek(monthStart, { weekStartsOn: 1 }), 
    end: endOfWeek(monthEnd, { weekStartsOn: 1 }) 
  });

  const monthsInYear = eachMonthOfInterval({ 
    start: startOfYear(calendarDate), 
    end: new Date(calendarDate.getFullYear(), 11, 31) 
  });

  const prev = () => {
      if (viewMode === 'MONTH') setCalendarDate(subMonths(calendarDate, 1));
      else if (viewMode === 'YEAR') setCalendarDate(new Date(calendarDate.getFullYear() - 1, 0, 1));
      else if (viewMode === 'DAY') setCalendarDate(subDays(calendarDate, 1));
  };

  const next = () => {
      if (viewMode === 'MONTH') setCalendarDate(addMonths(calendarDate, 1));
      else if (viewMode === 'YEAR') setCalendarDate(new Date(calendarDate.getFullYear() + 1, 0, 1));
      else if (viewMode === 'DAY') setCalendarDate(addDays(calendarDate, 1));
  };

  const getEventsForDay = (day: Date) => events.filter(event => isSameDay(parseISO(event.start), day));

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailEvent(event);
    setSelectedEventId(event.id);
  };

  const handleDelete = (id: string) => {
      if (window.confirm("Tem certeza que deseja excluir este evento permanentemente?")) {
          deleteEvent(id);
          setDetailEvent(null);
          setSelectedEventId(null);
      }
  };

  const getCategoryStyles = (event: CalendarEvent) => {
      const t = event.title.toLowerCase();
      const p = (event.packName || '').toLowerCase();
      if (event.type === EventType.WORK || t.includes('reunião')) return { icon: Briefcase, gradient: 'from-blue-600 to-indigo-700', label: 'Reunião', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
      if (event.type === EventType.PERSONAL) return { icon: Heart, gradient: 'from-red-600 to-pink-700', label: 'Pessoal', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      if (t.includes('batizado') || p.includes('batizado')) return { icon: Users, gradient: 'from-purple-600 to-fuchsia-700', label: 'Batizado', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
      if (t.includes('aniv') || p.includes('aniv')) return { icon: Cake, gradient: 'from-orange-600 to-amber-700', label: 'Aniversário', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      return { icon: PartyPopper, gradient: 'from-pink-600 to-rose-700', label: 'Casamento', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' };
  };

  return (
    <div ref={containerRef} className={`h-full flex flex-col ${isEmbedded ? 'p-4' : 'p-6'} overflow-hidden relative`} onClick={() => { setDetailEvent(null); setSelectedEventId(null); }}>
      <div className="flex justify-between items-center mb-4 z-10">
        <h2 className={`font-bold text-white capitalize ${isEmbedded ? 'text-2xl' : 'text-3xl'} gemini-gradient-text`}>
          {viewMode === 'MONTH' ? format(calendarDate, 'MMMM yyyy', { locale: ptBR }) : viewMode === 'YEAR' ? format(calendarDate, 'yyyy', { locale: ptBR }) : format(calendarDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-slate-800/30 rounded-lg p-1 border border-slate-700/30">
                <button onClick={() => setViewMode('DAY')} className={`p-1 rounded ${viewMode === 'DAY' ? 'bg-blue-600/80 text-white' : 'text-slate-400'}`}><Clock size={16}/></button>
                <button onClick={() => setViewMode('MONTH')} className={`p-1 rounded ${viewMode === 'MONTH' ? 'bg-blue-600/80 text-white' : 'text-slate-400'}`}><ZoomIn size={16}/></button>
                <button onClick={() => setViewMode('YEAR')} className={`p-1 rounded ${viewMode === 'YEAR' ? 'bg-blue-600/80 text-white' : 'text-slate-400'}`}><ZoomOut size={16}/></button>
            </div>
            <div className="flex gap-2">
                <button onClick={prev} className="p-2 hover:bg-slate-700/50 rounded-full text-slate-300"><ChevronLeft size={24} /></button>
                <button onClick={next} className="p-2 hover:bg-slate-700/50 rounded-full text-slate-300"><ChevronRight size={24} /></button>
            </div>
        </div>
      </div>

      {viewMode === 'MONTH' ? (
        <>
            <div className="grid grid-cols-7 gap-2 mb-2 text-slate-400 font-medium text-center text-sm uppercase tracking-wide">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto animate-zoom-in custom-scrollbar">
                {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);
                const isThisMonth = isSameMonth(day, calendarDate);
                return (
                    <div key={day.toISOString()} onClick={(e) => { e.stopPropagation(); setCalendarDate(day); setViewMode('DAY'); }}
                    className={`min-h-[80px] border rounded-xl p-2 flex flex-col transition-all cursor-zoom-in ${isThisMonth ? 'bg-slate-800/20 border-slate-700/30' : 'bg-slate-900/10 border-slate-800/10 opacity-30'} ${isCurrentDay ? 'ring-1 ring-blue-500 bg-slate-800/40' : ''}`}>
                    <div className="mb-1"><span className={`text-sm font-bold ${isCurrentDay ? 'text-blue-400' : 'text-slate-500'}`}>{format(day, 'd')}</span></div>
                    <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                        {dayEvents.map(event => {
                            const styles = getCategoryStyles(event);
                            return (
                                <div key={event.id} onClick={(e) => handleEventClick(event, e)} className={`text-[10px] p-1.5 rounded-lg border-l-2 truncate ${styles.bg} ${styles.border.replace('border-', 'border-l-')}`}>
                                    {event.title}
                                </div>
                            )
                        })}
                    </div>
                    </div>
                );
                })}
            </div>
        </>
      ) : viewMode === 'YEAR' ? (
          <div className="grid grid-cols-4 gap-4 flex-1 animate-zoom-out overflow-y-auto">
              {monthsInYear.map(month => (
                  <div key={month.toISOString()} onClick={(e) => { e.stopPropagation(); setCalendarDate(month); setViewMode('MONTH'); }} className="border border-slate-700/30 bg-slate-800/20 rounded-xl p-4 hover:border-blue-500/50 cursor-zoom-in flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-2 capitalize">{format(month, 'MMMM', {locale: ptBR})}</h3>
                      <div className="mt-auto text-xs text-slate-400">{events.filter(e => isSameMonth(parseISO(e.start), month)).length} eventos</div>
                  </div>
              ))}
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto animate-zoom-in relative custom-scrollbar">
              <div className="absolute top-0 left-0 w-full min-h-full">
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <div key={hour} className="flex border-b border-slate-800/30 min-h-[60px]">
                          <div className="w-16 text-right pr-4 text-xs text-slate-500 py-2 border-r border-slate-800/30">{hour.toString().padStart(2, '0')}:00</div>
                          <div className="flex-1 relative bg-slate-900/5">
                              {getEventsForDay(calendarDate).filter(event => new Date(event.start).getHours() === hour).map(event => {
                                  const styles = getCategoryStyles(event);
                                  return (
                                      <div key={event.id} onClick={(e) => handleEventClick(event, e)} className={`absolute left-2 right-2 top-1 bottom-1 p-2 rounded-lg border-l-4 cursor-pointer hover:brightness-110 shadow-lg backdrop-blur-md transition-all ${styles.bg} ${styles.border.replace('border-', 'border-l-')}`}>
                                          <div className="flex justify-between items-start">
                                              <span className="font-bold text-white text-sm block truncate">{event.title}</span>
                                              <span className="text-[10px] text-slate-400 font-mono">{format(parseISO(event.start), 'HH:mm')}</span>
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {detailEvent && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => {setDetailEvent(null); setSelectedEventId(null);}}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
                {(() => {
                    const styles = getCategoryStyles(detailEvent);
                    const client = clients.find(c => c.id === detailEvent.clientId);
                    return (
                        <>
                        <div className={`h-32 bg-gradient-to-r ${styles.gradient} p-8 flex items-end relative`}>
                            <button onClick={() => {setDetailEvent(null); setSelectedEventId(null);}} className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-sm"><X size={20}/></button>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white"><styles.icon size={24} /></div>
                                <div>
                                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/60">{styles.label}</span>
                                    <h3 className="text-2xl font-bold text-white leading-tight">{detailEvent.title}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div><label className="text-[10px] uppercase font-black text-slate-500 mb-1 block">Data</label><div className="flex items-center gap-2 text-white font-semibold"><CalendarIcon size={16} className="text-blue-400" />{format(parseISO(detailEvent.start), "dd 'de' MMMM, yyyy", {locale: ptBR})}</div></div>
                                    <div><label className="text-[10px] uppercase font-black text-slate-500 mb-1 block">Horário</label><div className="flex items-center gap-2 text-white font-semibold"><Clock size={16} className="text-purple-400" />{format(parseISO(detailEvent.start), "HH:mm")} - {format(parseISO(detailEvent.end), "HH:mm")}</div></div>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="text-[10px] uppercase font-black text-slate-500 mb-1 block">Cliente</label><div className="flex items-center gap-2 text-white font-semibold truncate"><User size={16} className="text-pink-400" />{client ? client.name : 'Nenhum cliente'}</div></div>
                                    <div><label className="text-[10px] uppercase font-black text-slate-500 mb-1 block">Valor</label><div className="flex items-center gap-2 text-green-400 font-bold text-xl"><Euro size={18} />€ {detailEvent.agreedPrice?.toLocaleString('pt-PT')}</div></div>
                                </div>
                            </div>
                            <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 space-y-4">
                                <div className="flex items-start gap-3"><MapPin size={18} className="text-red-400 mt-0.5" /><div><label className="text-[10px] uppercase font-black text-slate-500 block mb-0.5">Localização</label><span className="text-slate-200 text-sm font-medium">{detailEvent.location || 'Local a definir'}</span></div></div>
                                <div className="flex items-start gap-3"><Tag size={18} className="text-yellow-400 mt-0.5" /><div><label className="text-[10px] uppercase font-black text-slate-500 block mb-0.5">Serviço</label><span className="text-slate-200 text-sm font-medium">{detailEvent.packName || 'Geral'}</span></div></div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-800/50 bg-slate-900/50 flex gap-3">
                            <button onClick={() => handleDelete(detailEvent.id)} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 py-3 rounded-xl transition-all border border-slate-700 hover:border-red-500/30 font-bold text-sm"><Trash2 size={18} /> Excluir</button>
                            <button onClick={() => {setDetailEvent(null); setSelectedEventId(null);}} className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl transition-all font-bold text-sm shadow-lg">Fechar</button>
                        </div>
                        </>
                    )
                })()}
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
