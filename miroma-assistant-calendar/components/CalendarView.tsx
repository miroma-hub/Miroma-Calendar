import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths, getYear, startOfYear, eachMonthOfInterval, addDays, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, X, Edit3, Trash2, Calendar as CalendarIcon, Clock, ZoomIn, ZoomOut } from 'lucide-react';
import { EventType, CalendarEvent } from '../types';

interface CalendarViewProps {
  isEmbedded?: boolean;
}

type ViewMode = 'MONTH' | 'YEAR' | 'DAY';

const CalendarView: React.FC<CalendarViewProps> = ({ isEmbedded = false }) => {
  const { events, clients, updateEvent, deleteEvent } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('MONTH');
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  // Popover State
  const [popoverEvent, setPopoverEvent] = useState<{event: CalendarEvent, x: number, y: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month View Calculation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Year View Calculation
  const yearStart = startOfYear(currentDate);
  const monthsInYear = eachMonthOfInterval({ start: yearStart, end: new Date(currentDate.getFullYear(), 11, 31) });

  const prev = () => {
      if (viewMode === 'MONTH') setCurrentDate(subMonths(currentDate, 1));
      else if (viewMode === 'YEAR') setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
      else if (viewMode === 'DAY') setCurrentDate(subDays(currentDate, 1));
  };

  const next = () => {
      if (viewMode === 'MONTH') setCurrentDate(addMonths(currentDate, 1));
      else if (viewMode === 'YEAR') setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
      else if (viewMode === 'DAY') setCurrentDate(addDays(currentDate, 1));
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(parseISO(event.start), day));
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    // Calculate position for popover relative to container
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
        let x = rect.left - containerRect.left + 20;
        let y = rect.top - containerRect.top;
        
        // Prevent overflow right
        if (x + 250 > containerRect.width) x = x - 270;
        
        setPopoverEvent({ event, x, y });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
      // Very simple debounce via timeout could be added, but manual logic works well for "intent"
      // Scroll Up (Zoom In): DeltaY < 0
      // Scroll Down (Zoom Out): DeltaY > 0
      
      const threshold = 30;

      if (Math.abs(e.deltaY) > threshold) {
          if (e.deltaY < 0) {
              // Zoom IN
              if (viewMode === 'YEAR') setViewMode('MONTH');
              else if (viewMode === 'MONTH') {
                  if (hoveredDate) {
                      setCurrentDate(hoveredDate);
                      setViewMode('DAY');
                  }
              }
          } else {
              // Zoom OUT
              if (viewMode === 'DAY') setViewMode('MONTH');
              else if (viewMode === 'MONTH') setViewMode('YEAR');
          }
      }
  };

  const renderDayView = () => {
      const dayEvents = getEventsForDay(currentDate);
      const hours = Array.from({ length: 24 }, (_, i) => i);

      return (
          <div className="flex-1 overflow-y-auto animate-zoom-in relative custom-scrollbar">
              <div className="absolute top-0 left-0 w-full min-h-full">
                  {hours.map(hour => (
                      <div key={hour} className="flex border-b border-slate-800/30 min-h-[60px] relative group">
                          <div className="w-16 text-right pr-4 text-xs text-slate-500 py-2 border-r border-slate-800/30">
                              {hour.toString().padStart(2, '0')}:00
                          </div>
                          <div className="flex-1 relative bg-slate-900/5 hover:bg-slate-800/10 transition-colors">
                              {/* Render events that start in this hour */}
                              {dayEvents.filter(event => new Date(event.start).getHours() === hour).map(event => {
                                  const clientName = event.clientId ? clients.find(c => c.id === event.clientId)?.name : null;
                                  return (
                                      <div 
                                          key={event.id}
                                          onClick={(e) => handleEventClick(event, e)}
                                          className={`absolute left-2 right-2 top-1 bottom-1 p-2 rounded-lg border-l-4 cursor-pointer hover:brightness-110 shadow-lg backdrop-blur-md
                                            ${event.type === EventType.WORK ? 'bg-blue-900/30 border-blue-500' : 
                                              event.type === EventType.ORDER ? 'bg-orange-900/30 border-orange-500' : 
                                              event.type === EventType.EVENT ? 'bg-pink-900/30 border-pink-500' :
                                              'bg-purple-900/30 border-purple-500'}
                                          `}
                                      >
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <span className="font-bold text-white text-sm block">{event.title}</span>
                                                  {clientName && <span className="text-xs text-slate-300 block">{clientName}</span>}
                                              </div>
                                              <span className="text-xs text-slate-400 font-mono">
                                                  {format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}
                                              </span>
                                          </div>
                                          {event.description && <p className="text-xs text-slate-400 mt-1 truncate">{event.description}</p>}
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
    <div 
        ref={containerRef}
        className={`h-full flex flex-col ${isEmbedded ? 'p-4' : 'p-6'} overflow-hidden relative`}
        onWheel={handleWheel}
        onClick={() => setPopoverEvent(null)}
    >
      <div className="flex justify-between items-center mb-4 z-10">
        <h2 className={`font-bold text-white capitalize ${isEmbedded ? 'text-2xl' : 'text-3xl'} transition-all gemini-gradient-text`}>
          {viewMode === 'MONTH' 
            ? format(currentDate, 'MMMM yyyy', { locale: ptBR }) 
            : viewMode === 'YEAR' 
                ? format(currentDate, 'yyyy', { locale: ptBR })
                : format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
          }
        </h2>
        <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-slate-800/30 rounded-lg p-1 border border-slate-700/30">
                <button onClick={() => setViewMode('DAY')} className={`p-1 rounded ${viewMode === 'DAY' ? 'bg-blue-600/80 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Clock size={16}/></button>
                <button onClick={() => setViewMode('MONTH')} className={`p-1 rounded ${viewMode === 'MONTH' ? 'bg-blue-600/80 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><ZoomIn size={16}/></button>
                <button onClick={() => setViewMode('YEAR')} className={`p-1 rounded ${viewMode === 'YEAR' ? 'bg-blue-600/80 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><ZoomOut size={16}/></button>
            </div>
            <div className="flex gap-2">
            <button onClick={prev} className="p-2 hover:bg-slate-700/50 rounded-full text-slate-300">
                <ChevronLeft size={24} />
            </button>
            <button onClick={next} className="p-2 hover:bg-slate-700/50 rounded-full text-slate-300">
                <ChevronRight size={24} />
            </button>
            </div>
        </div>
      </div>

      {viewMode === 'DAY' && renderDayView()}

      {viewMode === 'MONTH' && (
        <>
            <div className="grid grid-cols-7 gap-2 mb-2 text-slate-400 font-medium text-center text-sm uppercase tracking-wide animate-fade-in">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto animate-zoom-in">
                {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);
                const isThisMonth = isSameMonth(day, currentDate);
                const isHovered = hoveredDate && isSameDay(day, hoveredDate);
                
                return (
                    <div 
                    key={day.toISOString()} 
                    onMouseEnter={() => setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => { setCurrentDate(day); setViewMode('DAY'); }}
                    className={`min-h-[80px] md:min-h-[100px] border rounded-xl p-2 flex flex-col transition-all duration-300 group relative cursor-zoom-in
                        ${isThisMonth ? 'bg-slate-800/20 border-slate-700/30' : 'bg-slate-900/20 border-slate-800/10 opacity-30'}
                        ${isCurrentDay ? 'ring-1 ring-blue-500 bg-slate-800/40' : ''}
                        ${isHovered ? 'scale-105 z-10 bg-slate-800/50 shadow-xl border-blue-500/50' : ''}
                    `}
                    >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold ${isCurrentDay ? 'text-blue-400' : 'text-slate-500'} ${isHovered ? 'text-white' : ''}`}>
                        {format(day, 'd')}
                        </span>
                    </div>
                    
                    <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                        {dayEvents.map(event => {
                            const clientName = event.clientId ? clients.find(c => c.id === event.clientId)?.name.split(' ')[0] : null;
                        
                        return (
                            <div 
                                key={event.id} 
                                onClick={(e) => handleEventClick(event, e)}
                                className={`text-[10px] md:text-xs p-1.5 rounded-lg border-l-2 truncate cursor-pointer hover:brightness-125 transition-all shadow-sm
                                ${event.type === EventType.WORK ? 'bg-blue-900/30 border-blue-500 text-blue-100' : 
                                event.type === EventType.ORDER ? 'bg-orange-900/30 border-orange-500 text-orange-100' :
                                event.type === EventType.EVENT ? 'bg-pink-900/30 border-pink-500 text-pink-100' :
                                'bg-purple-900/30 border-purple-500 text-purple-100'}
                                `}
                            >
                                {clientName ? <span className="font-bold mr-1">{clientName}:</span> : null}
                                {event.title}
                            </div>
                        );
                        })}
                    </div>
                    </div>
                );
                })}
            </div>
        </>
      )} 
      
      {viewMode === 'YEAR' && (
          <div className="grid grid-cols-4 gap-4 flex-1 animate-zoom-out overflow-y-auto">
              {monthsInYear.map(month => (
                  <div 
                    key={month.toISOString()} 
                    onClick={() => { setCurrentDate(month); setViewMode('MONTH'); }}
                    className="border border-slate-700/30 bg-slate-800/20 rounded-xl p-4 hover:border-blue-500/50 hover:bg-slate-800/40 cursor-zoom-in transition-all flex flex-col"
                  >
                      <h3 className="text-lg font-bold text-white mb-2 capitalize">{format(month, 'MMMM', {locale: ptBR})}</h3>
                      <div className="flex-1 grid grid-cols-7 gap-1 opacity-50 pointer-events-none">
                          {/* Mini Grid Representation */}
                           {eachDayOfInterval({start: startOfMonth(month), end: endOfMonth(month)}).map(d => (
                               <div key={d.toISOString()} className={`h-1 w-1 rounded-full ${isToday(d) ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
                           ))}
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                          {events.filter(e => isSameMonth(parseISO(e.start), month)).length} eventos
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Mini Popover Card */}
      {popoverEvent && (
        <div 
            className="absolute z-50 w-64 bg-slate-900/80 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl p-4 animate-scale-in origin-top-left"
            style={{ top: popoverEvent.y, left: popoverEvent.x }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-start mb-2">
                 <h4 className="font-bold text-white text-lg leading-tight">{popoverEvent.event.title}</h4>
                 <button onClick={() => setPopoverEvent(null)} className="text-slate-400 hover:text-white"><X size={16}/></button>
            </div>
            
            <div className="space-y-2 text-sm text-slate-300 mb-3">
                 <div className="flex items-center gap-2">
                     <Clock size={14} className="text-blue-400" />
                     <span>{format(parseISO(popoverEvent.event.start), 'dd/MM HH:mm')}</span>
                 </div>
                 {popoverEvent.event.location && (
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-purple-400" />
                        <span>{popoverEvent.event.location}</span>
                    </div>
                 )}
                 <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold
                         ${popoverEvent.event.type === EventType.WORK ? 'bg-blue-900/50 text-blue-300' : 
                           popoverEvent.event.type === EventType.ORDER ? 'bg-orange-900/50 text-orange-300' : 
                           popoverEvent.event.type === EventType.EVENT ? 'bg-pink-900/50 text-pink-300' :
                           'bg-purple-900/50 text-purple-300'}
                    `}>
                        {popoverEvent.event.type}
                    </span>
                 </div>
            </div>
            
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/50">
                 <button className="flex-1 bg-slate-800/50 hover:bg-slate-700 py-1.5 rounded-lg text-xs font-medium text-white transition-colors">Editar</button>
                 <button onClick={() => { deleteEvent(popoverEvent.event.id); setPopoverEvent(null); }} className="p-1.5 hover:bg-red-900/30 text-red-400 rounded-lg"><Trash2 size={16} /></button>
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
