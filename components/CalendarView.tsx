
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths, getYear, startOfYear, eachMonthOfInterval, addDays, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, X, Edit3, Calendar as CalendarIcon, Clock, ZoomIn, ZoomOut } from 'lucide-react';
import { EventType, CalendarEvent } from '../types';

interface CalendarViewProps {
  isEmbedded?: boolean;
}

type ViewMode = 'MONTH' | 'YEAR' | 'DAY';

const CalendarView: React.FC<CalendarViewProps> = ({ isEmbedded = false }) => {
  const { events, clients, calendarDate, setCalendarDate, selectedEventId, setSelectedEventId } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('MONTH');
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [popoverEvent, setPopoverEvent] = useState<{event: CalendarEvent, x: number, y: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronizar popover se um evento for selecionado externamente
  useEffect(() => {
    if (selectedEventId) {
        const event = events.find(e => e.id === selectedEventId);
        if (event) {
            setViewMode('DAY');
            // Pequeno delay para garantir que o container renderizou a visão do dia
            setTimeout(() => {
                const eventElement = document.getElementById(`calendar-event-${event.id}`);
                if (eventElement && containerRef.current) {
                    const rect = eventElement.getBoundingClientRect();
                    const containerRect = containerRef.current.getBoundingClientRect();
                    setPopoverEvent({
                        event,
                        x: rect.left - containerRect.left + 20,
                        y: rect.top - containerRect.top
                    });
                    eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }
  }, [selectedEventId, events]);

  const daysInMonth = eachDayOfInterval({ 
    start: startOfMonth(calendarDate), 
    end: endOfMonth(calendarDate) 
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
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
        let x = rect.left - containerRect.left + 20;
        let y = rect.top - containerRect.top;
        if (x + 250 > containerRect.width) x = x - 270;
        setPopoverEvent({ event, x, y });
        setSelectedEventId(event.id);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
      if (Math.abs(e.deltaY) > 30) {
          if (e.deltaY < 0) {
              if (viewMode === 'YEAR') setViewMode('MONTH');
              else if (viewMode === 'MONTH' && hoveredDate) { setCalendarDate(hoveredDate); setViewMode('DAY'); }
          } else {
              if (viewMode === 'DAY') setViewMode('MONTH');
              else if (viewMode === 'MONTH') setViewMode('YEAR');
          }
      }
  };

  const renderDayView = () => {
      const dayEvents = getEventsForDay(calendarDate);
      const hours = Array.from({ length: 24 }, (_, i) => i);
      return (
          <div className="flex-1 overflow-y-auto animate-zoom-in relative custom-scrollbar">
              <div className="absolute top-0 left-0 w-full min-h-full">
                  {hours.map(hour => (
                      <div key={hour} className="flex border-b border-slate-800/30 min-h-[60px] relative group">
                          <div className="w-16 text-right pr-4 text-xs text-slate-500 py-2 border-r border-slate-800/30">{hour.toString().padStart(2, '0')}:00</div>
                          <div className="flex-1 relative bg-slate-900/5 hover:bg-slate-800/10 transition-colors">
                              {dayEvents.filter(event => new Date(event.start).getHours() === hour).map(event => {
                                  const client = clients.find(c => c.id === event.clientId);
                                  const isSelected = selectedEventId === event.id;
                                  return (
                                      <div 
                                          key={event.id}
                                          id={`calendar-event-${event.id}`}
                                          onClick={(e) => handleEventClick(event, e)}
                                          className={`absolute left-2 right-2 top-1 bottom-1 p-2 rounded-lg border-l-4 cursor-pointer hover:brightness-110 shadow-lg backdrop-blur-md transition-all
                                            ${isSelected ? 'ring-2 ring-white scale-[1.02] z-20' : ''}
                                            ${event.type === EventType.WORK ? 'bg-blue-900/30 border-blue-500' : 
                                              event.type === EventType.ORDER ? 'bg-orange-900/30 border-orange-500' : 
                                              event.type === EventType.EVENT ? 'bg-pink-900/30 border-pink-500' :
                                              'bg-purple-900/30 border-purple-500'}
                                          `}
                                      >
                                          <div className="flex justify-between items-start overflow-hidden">
                                              <div><span className="font-bold text-white text-sm block truncate">{event.title}</span>{client && <span className="text-xs text-slate-300 block">{client.name}</span>}</div>
                                              <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{format(parseISO(event.start), 'HH:mm')}</span>
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  };

  return (
    <div ref={containerRef} className={`h-full flex flex-col ${isEmbedded ? 'p-4' : 'p-6'} overflow-hidden relative`} onWheel={handleWheel} onClick={() => { setPopoverEvent(null); setSelectedEventId(null); }}>
      <div className="flex justify-between items-center mb-4 z-10">
        <h2 className={`font-bold text-white capitalize ${isEmbedded ? 'text-2xl' : 'text-3xl'} gemini-gradient-text`}>
          {viewMode === 'MONTH' ? format(calendarDate, 'MMMM yyyy', { locale: ptBR }) : viewMode === 'YEAR' ? format(calendarDate, 'yyyy', { locale: ptBR }) : format(calendarDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-slate-800/30 rounded-lg p-1 border border-slate-700/30">
                <button onClick={() => setViewMode('DAY')} className={`p-1 rounded ${viewMode === 'DAY' ? 'bg-blue-600/80 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Clock size={16}/></button>
                <button onClick={() => setViewMode('MONTH')} className={`p-1 rounded ${viewMode === 'MONTH' ? 'bg-blue-600/80 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><ZoomIn size={16}/></button>
                <button onClick={() => setViewMode('YEAR')} className={`p-1 rounded ${viewMode === 'YEAR' ? 'bg-blue-600/80 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><ZoomOut size={16}/></button>
            </div>
            <div className="flex gap-2">
                <button onClick={prev} className="p-2 hover:bg-slate-700/50 rounded-full text-slate-300"><ChevronLeft size={24} /></button>
                <button onClick={next} className="p-2 hover:bg-slate-700/50 rounded-full text-slate-300"><ChevronRight size={24} /></button>
            </div>
        </div>
      </div>

      {viewMode === 'DAY' ? renderDayView() : viewMode === 'MONTH' ? (
        <>
            <div className="grid grid-cols-7 gap-2 mb-2 text-slate-400 font-medium text-center text-sm uppercase tracking-wide">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto animate-zoom-in">
                {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);
                const isThisMonth = isSameMonth(day, calendarDate);
                return (
                    <div key={day.toISOString()} onMouseEnter={() => setHoveredDate(day)} onMouseLeave={() => setHoveredDate(null)} onClick={(e) => { e.stopPropagation(); setCalendarDate(day); setViewMode('DAY'); }}
                    className={`min-h-[80px] md:min-h-[100px] border rounded-xl p-2 flex flex-col transition-all duration-300 relative cursor-zoom-in ${isThisMonth ? 'bg-slate-800/20 border-slate-700/30' : 'bg-slate-900/20 border-slate-800/10 opacity-30'} ${isCurrentDay ? 'ring-1 ring-blue-500 bg-slate-800/40' : ''} ${hoveredDate && isSameDay(day, hoveredDate) ? 'scale-105 z-10 bg-slate-800/50 shadow-xl border-blue-500/50' : ''}`}>
                    <div className="flex justify-between items-start mb-1"><span className={`text-sm font-bold ${isCurrentDay ? 'text-blue-400' : 'text-slate-500'}`}>{format(day, 'd')}</span></div>
                    <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                        {dayEvents.map(event => (
                            <div key={event.id} onClick={(e) => handleEventClick(event, e)} className={`text-[10px] p-1.5 rounded-lg border-l-2 truncate cursor-pointer hover:brightness-125 transition-all ${event.type === EventType.WORK ? 'bg-blue-900/30 border-blue-500' : event.type === EventType.ORDER ? 'bg-orange-900/30 border-orange-500' : 'bg-pink-900/30 border-pink-500'}`}>
                                {event.title}
                            </div>
                        ))}
                    </div>
                    </div>
                );
                })}
            </div>
        </>
      ) : (
          <div className="grid grid-cols-4 gap-4 flex-1 animate-zoom-out overflow-y-auto">
              {monthsInYear.map(month => (
                  <div key={month.toISOString()} onClick={(e) => { e.stopPropagation(); setCalendarDate(month); setViewMode('MONTH'); }} className="border border-slate-700/30 bg-slate-800/20 rounded-xl p-4 hover:border-blue-500/50 hover:bg-slate-800/40 cursor-zoom-in transition-all flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-2 capitalize">{format(month, 'MMMM', {locale: ptBR})}</h3>
                      <div className="mt-auto text-xs text-slate-400">{events.filter(e => isSameMonth(parseISO(e.start), month)).length} eventos</div>
                  </div>
              ))}
          </div>
      )}

      {popoverEvent && (
        <div className="absolute z-[60] w-64 bg-slate-900 border border-slate-600/50 rounded-xl shadow-2xl p-4 animate-scale-in" style={{ top: popoverEvent.y, left: popoverEvent.x }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-white text-lg leading-tight">{popoverEvent.event.title}</h4><button onClick={() => { setPopoverEvent(null); setSelectedEventId(null); }} className="text-slate-400 hover:text-white"><X size={16}/></button></div>
            <div className="space-y-2 text-sm text-slate-300">
                 <div className="flex items-center gap-2"><Clock size={14} className="text-blue-400" /><span>{format(parseISO(popoverEvent.event.start), 'dd/MM HH:mm')}</span></div>
                 {popoverEvent.event.location && <div className="flex items-center gap-2"><MapPin size={14} className="text-purple-400" /><span>{popoverEvent.event.location}</span></div>}
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
