
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedEventId) {
        const event = events.find(e => e.id === selectedEventId);
        if (event) setDetailEvent(event);
    }
  }, [selectedEventId, events]);

  // Lógica de Grid Estável (Segunda-feira)
  const monthStart = startOfMonth(calendarDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const daysInGrid = Array.from({ length: 42 }).map((_, i) => addDays(gridStart, i));

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

  // Implementação de Scroll-Zoom (Wheel Support) Contextual
  const handleWheel = useCallback((e: React.WheelEvent) => {
      if (Math.abs(e.deltaY) < 50) return;

      if (e.deltaY < 0) { // Scroll Up = Zoom In (Aprofundar)
          if (viewMode === 'YEAR') {
              if (hoveredDate) setCalendarDate(hoveredDate);
              setViewMode('MONTH');
          } else if (viewMode === 'MONTH') {
              if (hoveredDate) setCalendarDate(hoveredDate);
              setViewMode('DAY');
          }
      } else { // Scroll Down = Zoom Out (Afastar)
          if (viewMode === 'DAY') setViewMode('MONTH');
          else if (viewMode === 'MONTH') setViewMode('YEAR');
      }
  }, [viewMode, hoveredDate, setCalendarDate]);

  const getEventsForDay = (day: Date) => events.filter(event => isSameDay(parseISO(event.start), day));

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailEvent(event);
    setSelectedEventId(event.id);
  };

  const handleDelete = (id: string) => {
      if (window.confirm("Deseja realmente excluir este evento?")) {
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
    <div 
      ref={containerRef} 
      onWheel={handleWheel}
      onMouseLeave={() => setHoveredDate(null)}
      className={`h-full flex flex-col ${isEmbedded ? 'p-4' : 'p-6'} overflow-hidden relative select-none`} 
      onClick={() => { setDetailEvent(null); setSelectedEventId(null); }}
    >
      <div className="flex justify-between items-center mb-6 z-10">
        <h2 className={`font-black text-white capitalize ${isEmbedded ? 'text-xl' : 'text-3xl'} gemini-gradient-text tracking-tighter`}>
          {viewMode === 'MONTH' ? format(calendarDate, 'MMMM yyyy', { locale: ptBR }) : viewMode === 'YEAR' ? format(calendarDate, 'yyyy', { locale: ptBR }) : format(calendarDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-slate-800/40 rounded-xl p-1 border border-slate-700/30 backdrop-blur-md">
                <button onClick={() => setViewMode('DAY')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'DAY' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`} title="Vista Dia"><Clock size={isEmbedded ? 14 : 18}/></button>
                <button onClick={() => setViewMode('MONTH')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'MONTH' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`} title="Vista Mês"><ZoomIn size={isEmbedded ? 14 : 18}/></button>
                <button onClick={() => setViewMode('YEAR')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'YEAR' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`} title="Vista Ano"><ZoomOut size={isEmbedded ? 14 : 18}/></button>
            </div>
            <div className="flex gap-2">
                <button onClick={prev} className="p-2 hover:bg-slate-700/50 rounded-full text-slate-300 transition-colors"><ChevronLeft size={isEmbedded ? 20 : 24} /></button>
                <button onClick={next} className="p-2 hover:bg-slate-700/50 rounded-full text-slate-300 transition-colors"><ChevronRight size={isEmbedded ? 20 : 24} /></button>
            </div>
        </div>
      </div>

      <div key={viewMode} className={`flex-1 overflow-hidden ${viewMode === 'YEAR' ? 'animate-zoom-out' : 'animate-zoom-in'}`}>
      {viewMode === 'MONTH' ? (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 gap-1 mb-4 text-slate-500 font-black text-center text-[9px] uppercase tracking-[0.2em] border-b border-slate-800/30 pb-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {daysInGrid.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);
                const isThisMonth = isSameMonth(day, calendarDate);
                const hasEvents = dayEvents.length > 0;
                
                return (
                    <div key={day.toISOString()} 
                    onMouseEnter={() => setHoveredDate(day)}
                    onClick={(e) => { e.stopPropagation(); setCalendarDate(day); setViewMode('DAY'); }}
                    className={`min-h-[85px] border rounded-xl p-1.5 flex flex-col transition-all cursor-zoom-in group relative
                      ${isThisMonth ? 'bg-slate-800/10 border-slate-700/30' : 'bg-transparent border-transparent opacity-10 pointer-events-none'} 
                      ${isCurrentDay ? 'ring-2 ring-blue-500/50 bg-slate-800/40 shadow-blue-500/20 shadow-xl' : hoveredDate && isSameDay(day, hoveredDate) ? 'border-blue-500/50 bg-slate-800/20' : ''}
                      ${hasEvents && isThisMonth ? 'hover:border-blue-500/60 hover:bg-slate-800/30 shadow-blue-500/5 shadow-inner' : 'hover:bg-slate-800/20'}
                    `}>
                    
                    {hasEvents && isThisMonth && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl pointer-events-none"></div>
                    )}

                    <div className="flex justify-between items-center mb-1 relative z-10">
                        <span className={`text-[10px] font-black ${isCurrentDay ? 'text-blue-400' : 'text-slate-500'}`}>{format(day, 'd')}</span>
                        {hasEvents && isThisMonth && (
                            <div className="flex gap-0.5">
                                {dayEvents.slice(0, 2).map(ev => <div key={ev.id} className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>)}
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-0.5 overflow-hidden flex-1 relative z-10">
                        {dayEvents.slice(0, 3).map(event => {
                            const styles = getCategoryStyles(event);
                            return (
                                <div key={event.id} onClick={(e) => handleEventClick(event, e)} 
                                  className={`text-[8px] p-1 rounded-md border-l-[2px] truncate font-bold shadow-sm transition-all hover:translate-x-1 hover:brightness-125 ${styles.bg} ${styles.border.replace('border-', 'border-l-')} text-white flex items-center gap-1`}>
                                    <styles.icon size={7} />
                                    {event.title}
                                </div>
                            )
                        })}
                        {dayEvents.length > 3 && (
                            <div className="text-[7px] text-center font-black text-slate-500 uppercase tracking-tighter mt-0.5 bg-slate-800/50 py-0.5 rounded-full border border-slate-700/20">
                                + {dayEvents.length - 3} itens
                            </div>
                        )}
                    </div>
                    </div>
                );
                })}
            </div>
        </div>
      ) : viewMode === 'YEAR' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
              {monthsInYear.map(month => {
                  const monthEvents = events.filter(e => isSameMonth(parseISO(e.start), month));
                  const isCurrentMonth = isSameMonth(month, new Date());
                  const intensity = Math.min(monthEvents.length * 12, 100);
                  
                  return (
                    <div key={month.toISOString()} 
                      onMouseEnter={() => setHoveredDate(month)}
                      onClick={(e) => { e.stopPropagation(); setCalendarDate(month); setViewMode('MONTH'); }} 
                      className={`border rounded-3xl p-6 flex flex-col justify-between transition-all hover:scale-[1.03] cursor-zoom-in relative overflow-hidden group
                        ${isCurrentMonth ? 'bg-blue-600/10 border-blue-500/40 ring-1 ring-blue-500/20 shadow-2xl' : 'bg-slate-800/20 border-slate-700/30 hover:border-blue-500/50 hover:bg-slate-800/30'}
                        ${hoveredDate && isSameMonth(month, hoveredDate) ? 'border-blue-500/60 ring-1 ring-blue-500/20' : ''}
                      `}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125 group-hover:bg-blue-500/10"></div>
                        
                        <div>
                            <h3 className="text-xl font-black text-white mb-2 capitalize tracking-tight group-hover:text-blue-400 transition-colors">{format(month, 'MMMM', {locale: ptBR})}</h3>
                            <div className="flex items-center gap-2 mt-4">
                                <div className="flex-1 h-2 bg-slate-900/60 rounded-full overflow-hidden shadow-inner border border-slate-800/50">
                                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out" style={{ width: `${intensity}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{monthEvents.length}</span>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex flex-wrap gap-2">
                            {monthEvents.slice(0, 15).map((e, idx) => {
                                const styles = getCategoryStyles(e);
                                return <div key={idx} className={`w-3 h-3 rounded-full shadow-lg ${styles.bg.replace('/10', '')} border border-white/5 transition-transform hover:scale-125`} title={e.title}></div>
                            })}
                            {monthEvents.length > 15 && <span className="text-[8px] font-black text-slate-500 flex items-center bg-slate-800 px-1.5 py-0.5 rounded-full">+ {monthEvents.length - 15}</span>}
                        </div>
                    </div>
                  );
              })}
          </div>
      ) : (
          <div className="h-full overflow-y-auto relative custom-scrollbar pr-2">
              <div className="absolute top-0 left-0 w-full min-h-full">
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <div key={hour} className="flex border-b border-slate-800/20 min-h-[90px]">
                          <div className="w-24 text-right pr-6 text-[10px] text-slate-500 font-black py-7 border-r border-slate-800/30 bg-slate-900/10 uppercase tracking-[0.2em]">{hour.toString().padStart(2, '0')}:00</div>
                          <div className="flex-1 relative bg-slate-900/5 hover:bg-slate-800/10 transition-colors">
                              {getEventsForDay(calendarDate).filter(event => new Date(event.start).getHours() === hour).map(event => {
                                  const styles = getCategoryStyles(event);
                                  return (
                                      <div key={event.id} onClick={(e) => handleEventClick(event, e)} 
                                        className={`absolute left-4 right-4 top-2 bottom-2 p-6 rounded-3xl border-l-[6px] cursor-pointer hover:scale-[1.01] hover:brightness-110 shadow-2xl backdrop-blur-2xl transition-all flex flex-col justify-center ${styles.bg} ${styles.border.replace('border-', 'border-l-')}`}>
                                          <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-5">
                                                  <div className={`p-3.5 rounded-2xl bg-white/10 text-white shadow-xl ring-1 ring-white/10`}><styles.icon size={24} /></div>
                                                  <div>
                                                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] block mb-1">{styles.label}</span>
                                                      <span className="font-bold text-white text-xl leading-tight tracking-tight">{event.title}</span>
                                                  </div>
                                              </div>
                                              <span className="text-sm text-slate-100 font-mono font-black bg-black/40 px-5 py-2 rounded-2xl border border-white/5 shadow-inner">{format(parseISO(event.start), 'HH:mm')}</span>
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
      </div>

      {detailEvent && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => {setDetailEvent(null); setSelectedEventId(null);}}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
                {(() => {
                    const styles = getCategoryStyles(detailEvent);
                    const client = clients.find(c => c.id === detailEvent.clientId);
                    return (
                        <>
                        <div className={`h-36 bg-gradient-to-r ${styles.gradient} p-8 flex items-end relative`}>
                            <button onClick={() => {setDetailEvent(null); setSelectedEventId(null);}} className="absolute top-8 right-8 text-white/70 hover:text-white bg-black/30 p-2.5 rounded-full backdrop-blur-md transition-all hover:scale-110"><X size={22}/></button>
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-2xl ring-1 ring-white/20"><styles.icon size={32} /></div>
                                <div>
                                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/60 mb-1 block">{styles.label}</span>
                                    <h3 className="text-3xl font-black text-white leading-tight tracking-tight">{detailEvent.title}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar max-h-[60vh]">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-5">
                                    <div><label className="text-[10px] uppercase font-black text-slate-500 mb-2 block tracking-widest">Data do Evento</label><div className="flex items-center gap-3 text-white font-bold text-lg"><CalendarIcon size={18} className="text-blue-400" />{format(parseISO(detailEvent.start), "dd 'de' MMMM, yyyy", {locale: ptBR})}</div></div>
                                    <div><label className="text-[10px] uppercase font-black text-slate-500 mb-2 block tracking-widest">Horário Previsto</label><div className="flex items-center gap-3 text-white font-bold text-lg"><Clock size={18} className="text-purple-400" />{format(parseISO(detailEvent.start), "HH:mm")} - {format(parseISO(detailEvent.end), "HH:mm")}</div></div>
                                </div>
                                <div className="space-y-5">
                                    <div><label className="text-[10px] uppercase font-black text-slate-500 mb-2 block tracking-widest">Cliente Responsável</label><div className="flex items-center gap-3 text-white font-bold text-lg truncate"><User size={18} className="text-pink-400" />{client ? client.name : 'Individual'}</div></div>
                                    <div><label className="text-[10px] uppercase font-black text-slate-500 mb-2 block tracking-widest">Investimento Total</label><div className="flex items-center gap-3 text-green-400 font-black text-3xl">€ {detailEvent.agreedPrice?.toLocaleString('pt-PT')}</div></div>
                                </div>
                            </div>
                            <div className="bg-slate-800/30 border border-slate-700/30 rounded-[2rem] p-7 space-y-6 shadow-inner ring-1 ring-white/5">
                                <div className="flex items-start gap-5"><MapPin size={22} className="text-red-400 mt-1" /><div><label className="text-[10px] uppercase font-black text-slate-500 block mb-1 tracking-widest">Localização / Quinta</label><span className="text-slate-100 text-lg font-bold">{detailEvent.location || 'Local a definir'}</span></div></div>
                                <div className="flex items-start gap-5"><Tag size={22} className="text-yellow-400 mt-1" /><div><label className="text-[10px] uppercase font-black text-slate-500 block mb-1 tracking-widest">Serviço Contratado</label><span className="text-slate-100 text-lg font-bold">{detailEvent.packName || 'Geral'}</span></div></div>
                                {client?.notes && (
                                  <div className="flex items-start gap-5 pt-4 border-t border-slate-700/30">
                                      <div className="p-1 rounded-md bg-blue-500/10"><Info size={22} className="text-blue-400" /></div>
                                      <div>
                                          <label className="text-[10px] uppercase font-black text-slate-500 block mb-1 tracking-widest">Notas do Cliente</label>
                                          <span className="text-slate-300 text-sm leading-relaxed">{client.notes}</span>
                                      </div>
                                  </div>
                                )}
                            </div>
                        </div>
                        <div className="p-10 border-t border-slate-800/50 bg-slate-900/50 flex gap-5">
                            {!isEmbedded && (
                                <button onClick={() => handleDelete(detailEvent.id)} className="flex-1 flex items-center justify-center gap-3 bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 py-5 rounded-[1.5rem] transition-all border border-slate-700 hover:border-red-500/30 font-black text-xs uppercase tracking-widest"><Trash2 size={20} /> Excluir</button>
                            )}
                            <button onClick={() => {setDetailEvent(null); setSelectedEventId(null);}} className={`${isEmbedded ? 'flex-1' : 'flex-[2]'} bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-95 hover:brightness-110 text-white py-5 rounded-[1.5rem] transition-all font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-900/40`}>Confirmar</button>
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
