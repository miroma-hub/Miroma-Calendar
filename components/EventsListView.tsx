
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EventType, CalendarEvent } from '../types';
import { MapPin, Calendar as CalendarIcon, Clock, User, PartyPopper, Plus, X, Search, Briefcase, Heart, Tag, Euro, Cake, Users } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EventsListView: React.FC = () => {
  const { events, clients, addEvent, updateEvent } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | 'new' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const eventItems = events
    .filter(e => e.type !== EventType.ORDER)
    .filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.clientId && clients.find(c => c.id === e.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const upcomingEvents = eventItems.filter(e => isAfter(parseISO(e.end), new Date()));
  const pastEvents = eventItems.filter(e => !isAfter(parseISO(e.end), new Date()));

  const handleSave = (data: Partial<CalendarEvent>) => {
      if (typeof selectedEvent === 'string' && selectedEvent === 'new') {
          addEvent({ ...data as any, bookingDate: new Date().toISOString() });
      } else if (selectedEvent && typeof selectedEvent !== 'string') {
          updateEvent(selectedEvent.id, data);
      }
      setSelectedEvent(null);
  };

  const getEventCategory = (event: CalendarEvent): string => {
      if (event.type === EventType.WORK) return 'Reunião';
      if (event.type === EventType.PERSONAL) return 'Pessoal';
      const lowerTitle = event.title.toLowerCase();
      const lowerPack = (event.packName || '').toLowerCase();
      if (lowerTitle.includes('batizado') || lowerPack.includes('batizado')) return 'Batizado';
      if (lowerTitle.includes('aniversário') || lowerPack.includes('aniversário') || lowerTitle.includes('aniv')) return 'Aniversário';
      return 'Evento';
  };

  const getIconByCategory = (category: string) => {
      if (category === 'Reunião') return <Briefcase size={18} className="text-blue-400" />;
      if (category === 'Pessoal') return <Heart size={18} className="text-red-400" />;
      if (category === 'Batizado') return <Users size={18} className="text-purple-400" />;
      if (category === 'Aniversário') return <Cake size={18} className="text-orange-400" />;
      return <PartyPopper size={18} className="text-pink-400" />;
  };

  const getColorByCategory = (category: string) => {
      if (category === 'Reunião') return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
      if (category === 'Pessoal') return 'border-red-500/30 bg-red-500/10 text-red-300';
      if (category === 'Batizado') return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
      if (category === 'Aniversário') return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
      return 'border-pink-500/30 bg-pink-500/10 text-pink-300';
  };

  const getHeaderBg = (category: string) => {
      if (category === 'Reunião') return 'from-blue-600 to-indigo-700';
      if (category === 'Pessoal') return 'from-red-600 to-pink-700';
      if (category === 'Batizado') return 'from-purple-600 to-fuchsia-700';
      if (category === 'Aniversário') return 'from-orange-600 to-amber-700';
      return 'from-pink-600 to-rose-700';
  }

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in relative">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold gemini-gradient-text">Eventos</h2>
            <p className="text-slate-400 mt-1">Sua linha do tempo de compromissos.</p>
        </div>
        <button type="button" onClick={() => setSelectedEvent('new')} className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:brightness-110 text-white px-6 py-3 rounded-full transition-all shadow-xl font-bold active:scale-95">
             <Plus size={20} />
             <span>Agendar Novo</span>
          </button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" size={22} />
        <input type="text" placeholder="Pesquisar eventos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/10 backdrop-blur-sm border border-slate-700/30 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-pink-500 transition-colors text-lg" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 pr-2">
        <div className="mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <CalendarIcon className="text-pink-400" size={20} /> 
            Futuros
          </h3>
          
          {/* Grid corrigido para evitar sobreposição */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-8 items-stretch">
            {upcomingEvents.map(event => {
               const client = clients.find(c => c.id === event.clientId);
               const category = getEventCategory(event);
               return (
                 <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-slate-800/10 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/20 hover:border-pink-500/40 transition-all shadow-xl group relative overflow-hidden cursor-pointer flex flex-col min-h-[320px]">
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-10 bg-gradient-to-br ${getHeaderBg(category)}`}></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`border text-[9px] px-2 py-1 rounded-lg uppercase font-black tracking-widest flex items-center gap-1.5 ${getColorByCategory(category)}`}>
                                {getIconByCategory(category)}
                                {category}
                            </span>
                            {event.packName && <span className="border border-slate-700 bg-slate-900/40 text-slate-400 text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest flex items-center gap-1.5 truncate max-w-[150px]"><Tag size={10} />{event.packName}</span>}
                        </div>

                        <div className="mb-4">
                            <h4 className="text-xl font-bold text-white leading-tight group-hover:text-pink-400 transition-colors truncate mb-1">{event.title}</h4>
                            <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
                               <CalendarIcon size={10} />
                               <span>{format(parseISO(event.start), 'dd/MM/yyyy')} às {format(parseISO(event.start), 'HH:mm')}</span>
                            </div>
                        </div>

                        <p className="text-slate-400 text-xs mb-6 line-clamp-2 flex-1 leading-relaxed">{event.description || 'Sem descrição.'}</p>

                        <div className="mt-auto pt-4 border-t border-slate-700/20 grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium truncate">
                                    <MapPin size={12} className="text-slate-500" />
                                    <span>{event.location || 'A definir'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium truncate">
                                    <User size={12} className="text-slate-500" />
                                    <span>{client ? client.name : 'Individual'}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1 text-lg font-mono font-bold text-green-400">
                                    <Euro size={14} />
                                    <span>{event.agreedPrice?.toLocaleString('pt-PT')}</span>
                                </div>
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Valor Total</span>
                            </div>
                        </div>
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
        
        {pastEvents.length > 0 && (
            <div className="opacity-40 hover:opacity-100 transition-opacity duration-500 pt-8 border-t border-slate-800">
                <h3 className="text-lg font-bold text-slate-500 mb-6 flex items-center gap-3"><Clock size={18} /> Histórico</h3>
                <div className="space-y-3">
                    {pastEvents.slice(0, 5).map(event => (
                        <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 hover:border-slate-700 transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-pink-500 transition-colors">
                                  <CalendarIcon size={20} />
                               </div>
                               <div>
                                  <h5 className="font-bold text-slate-400 text-sm group-hover:text-white transition-colors">{event.title}</h5>
                                  <p className="text-[10px] text-slate-600 uppercase font-black">{format(parseISO(event.start), "dd MMM yyyy", {locale: ptBR})}</p>
                               </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-600">€ {event.agreedPrice?.toLocaleString('pt-PT')}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

       {selectedEvent && (
          <EventModal 
            initialData={selectedEvent === 'new' ? undefined : selectedEvent}
            onClose={() => setSelectedEvent(null)} 
            onSave={handleSave}
            clients={clients}
          />
      )}
    </div>
  );
};

// ... Resto do componente EventModal permanece igual ...

interface EventModalProps {
    initialData?: CalendarEvent;
    onClose: () => void;
    onSave: (data: any) => void;
    clients: any[];
}

const EventModal: React.FC<EventModalProps> = ({ initialData, onClose, onSave, clients }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [clientId, setClientId] = useState(initialData?.clientId || '');
    const [date, setDate] = useState(initialData?.start ? initialData.start.slice(0, 10) : format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState(initialData?.start ? initialData.start.slice(11, 16) : '09:00');
    const [endTime, setEndTime] = useState(initialData?.end ? initialData.end.slice(11, 16) : '10:00');
    const [location, setLocation] = useState(initialData?.location || '');
    const [price, setPrice] = useState(initialData?.agreedPrice || 0);
    const [description, setDescription] = useState(initialData?.description || '');
    const [type, setType] = useState<EventType>(initialData?.type || EventType.EVENT);
    const [packName, setPackName] = useState(initialData?.packName || '');
    const [category, setCategory] = useState<string>('Evento');

    useEffect(() => {
        if (initialData) {
            const t = initialData.title.toLowerCase();
            const p = (initialData.packName || '').toLowerCase();
            if (initialData.type === EventType.WORK) setCategory('Reunião');
            else if (initialData.type === EventType.PERSONAL) setCategory('Pessoal');
            else if (t.includes('batizado') || p.includes('batizado')) setCategory('Batizado');
            else if (t.includes('aniv') || p.includes('aniv')) setCategory('Aniversário');
            else setCategory('Evento');
        }
    }, [initialData]);

    const categories = [
        { name: 'Evento', icon: PartyPopper, color: 'text-pink-400', type: EventType.EVENT },
        { name: 'Batizado', icon: Users, color: 'text-purple-400', type: EventType.EVENT },
        { name: 'Aniversário', icon: Cake, color: 'text-orange-400', type: EventType.EVENT },
        { name: 'Reunião', icon: Briefcase, color: 'text-blue-400', type: EventType.WORK },
        { name: 'Pessoal', icon: Heart, color: 'text-red-400', type: EventType.PERSONAL }
    ];

    const handleCategorySelect = (cat: any) => {
        setCategory(cat.name);
        setType(cat.type);
        if (!packName) setPackName(cat.name);
    };

    const handleSubmit = () => {
        if(!title || !date) return;
        const start = `${date}T${startTime}:00`;
        const end = `${date}T${endTime}:00`;
        onSave({ title, clientId, start, end, agreedPrice: price, description, location, type, packName });
    }

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white">{initialData ? 'Editar Compromisso' : 'Novo Agendamento'}</h3>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="text-slate-400"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3 block">Categoria Visual</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button key={cat.name} type="button" onClick={() => handleCategorySelect(cat)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${category === cat.name ? 'bg-slate-800 border-white/20 ring-1 ring-white/10 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
                                    <cat.icon size={14} className={category === cat.name ? cat.color : 'text-slate-700'} />
                                    <span className="text-xs font-bold">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block">Título</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Casamento Silva" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-pink-500 outline-none" /></div>
                        <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block">Cliente</label><select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-pink-500 outline-none"><option value="">Individual / Avulso</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block">Data</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-pink-500 outline-none" /></div>
                        <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block">Início</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-pink-500 outline-none" /></div>
                        <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block">Fim</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-pink-500 outline-none" /></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block">Local</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-pink-500 outline-none" /></div>
                        <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block">Valor (€)</label><input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-pink-500 outline-none font-mono" /></div>
                    </div>
                    
                    <div><label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 block">Pack / Observações</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white h-24 resize-none outline-none focus:border-pink-500"></textarea></div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-800">
                     <button type="button" onClick={handleSubmit} className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:brightness-110 text-white font-bold py-4 rounded-2xl transition-all shadow-xl active:scale-95">
                        {initialData ? 'Atualizar Evento' : 'Agendar Compromisso'}
                     </button>
                </div>
            </div>
        </div>
    )
}

export default EventsListView;
