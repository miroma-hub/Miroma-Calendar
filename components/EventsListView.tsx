
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EventType, CalendarEvent } from '../types';
import { MapPin, Calendar as CalendarIcon, Clock, User, PartyPopper, Plus, X, Search, Briefcase, Heart, Edit3, Tag, Euro, Cake, Users } from 'lucide-react';
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
      if (lowerTitle.includes('reunião') || lowerPack.includes('reunião')) return 'Reunião';
      return 'Casamento';
  };

  const getSubtag = (event: CalendarEvent, category: string): string | null => {
      if (!event.packName) return null;
      if (event.packName.toLowerCase() === category.toLowerCase()) return null;
      return event.packName;
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
            <h2 className="text-3xl font-bold gemini-gradient-text">Eventos & Compromissos</h2>
            <p className="text-slate-400 mt-1">Gestão centralizada de datas, locais e orçamentos.</p>
        </div>
        <button type="button" onClick={() => setSelectedEvent('new')} className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-6 py-3 rounded-full transition-all shadow-xl font-bold">
             <Plus size={20} />
             <span>Agendar Novo</span>
          </button>
      </div>

      <div className="relative mb-10">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" size={22} />
        <input type="text" placeholder="Pesquisar por título, cliente ou pack..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/10 backdrop-blur-sm border border-slate-700/30 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-pink-500 transition-colors text-lg" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
        <div className="mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <CalendarIcon className="text-pink-400" size={24} /> 
            Próximas Datas
          </h3>
          
          <div className="grid grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-y-14 gap-x-8">
            {upcomingEvents.map(event => {
               const client = clients.find(c => c.id === event.clientId);
               const category = getEventCategory(event);
               const subtag = getSubtag(event, category);
               return (
                 <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-slate-800/10 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/20 hover:border-pink-500/40 transition-all shadow-xl group relative overflow-hidden cursor-pointer h-fit flex flex-col min-h-[340px]">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110 opacity-20 bg-gradient-to-br ${getHeaderBg(category)}`}></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex flex-wrap gap-3 mb-6 items-start">
                            <span className={`border text-[10px] px-3 py-1.5 rounded-xl uppercase font-black tracking-widest flex items-center gap-2 ${getColorByCategory(category)}`}>
                                {getIconByCategory(category)}
                                {category}
                            </span>
                            {subtag && <span className="border border-slate-600 bg-slate-900/50 text-slate-300 text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 truncate max-w-[180px]"><Tag size={12} />{subtag}</span>}
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center gap-2 text-slate-500 font-mono text-xs mb-2">
                               <CalendarIcon size={12} />
                               <span>{format(parseISO(event.start), 'dd/MM/yyyy')}</span>
                            </div>
                            <h4 className="text-2xl font-bold text-white leading-tight group-hover:text-pink-400 transition-colors truncate pr-10">{event.title}</h4>
                        </div>

                        {event.description && <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed h-[40px]">{event.description}</p>}

                        <div className="mt-auto pt-6 border-t border-slate-700/30 grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                                    <Clock size={16} className="text-slate-500" />
                                    <span>{format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300 font-medium truncate">
                                    <MapPin size={16} className="text-slate-500" />
                                    <span>{event.location || 'Local a definir'}</span>
                                </div>
                            </div>
                            <div className="space-y-3 text-right">
                                <div className="flex items-center justify-end gap-2 text-sm text-slate-300 font-medium truncate">
                                    <User size={16} className="text-slate-500" />
                                    <span>{client ? client.name : 'Sem cliente'}</span>
                                </div>
                                <div className="flex items-center justify-end gap-2 text-lg font-bold text-green-400">
                                    <Euro size={16} />
                                    <span>€ {event.agreedPrice?.toLocaleString('pt-PT') || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
        
        {pastEvents.length > 0 && (
            <div className="opacity-50 hover:opacity-100 transition-opacity duration-500 pt-8 border-t border-slate-800">
                <h3 className="text-lg font-bold text-slate-400 mb-6 flex items-center gap-3"><Clock size={20} /> Histórico de Realizados</h3>
                <div className="space-y-4">
                    {pastEvents.map(event => (
                        <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 hover:border-slate-700 transition-all group">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-slate-300 transition-colors">
                                  <CalendarIcon size={24} />
                               </div>
                               <div>
                                  <h5 className="font-bold text-slate-300 text-lg group-hover:text-white transition-colors">{event.title}</h5>
                                  <p className="text-sm text-slate-500">{format(parseISO(event.start), "dd 'de' MMMM, yyyy", {locale: ptBR})}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className="text-[10px] bg-slate-800 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">Arquivo</span>
                               <p className="text-slate-400 font-mono mt-1">€ {event.agreedPrice?.toLocaleString('pt-PT')}</p>
                            </div>
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
    
    // Novo estado para categoria visual
    const [category, setCategory] = useState<string>('Casamento');

    useEffect(() => {
        if (initialData) {
            // Tenta detectar a categoria a partir dos dados existentes
            const t = initialData.title.toLowerCase();
            const p = (initialData.packName || '').toLowerCase();
            if (initialData.type === EventType.WORK) setCategory('Reunião');
            else if (initialData.type === EventType.PERSONAL) setCategory('Pessoal');
            else if (t.includes('batizado') || p.includes('batizado')) setCategory('Batizado');
            else if (t.includes('aniv') || p.includes('aniv')) setCategory('Aniversário');
            else setCategory('Casamento');
        }
    }, [initialData]);

    const categories = [
        { name: 'Casamento', icon: PartyPopper, color: 'text-pink-400', type: EventType.EVENT },
        { name: 'Batizado', icon: Users, color: 'text-purple-400', type: EventType.EVENT },
        { name: 'Aniversário', icon: Cake, color: 'text-orange-400', type: EventType.EVENT },
        { name: 'Reunião', icon: Briefcase, color: 'text-blue-400', type: EventType.WORK },
        { name: 'Pessoal', icon: Heart, color: 'text-red-400', type: EventType.PERSONAL }
    ];

    const handleCategorySelect = (cat: any) => {
        setCategory(cat.name);
        setType(cat.type);
        if (!packName || categories.some(c => c.name === packName)) {
            setPackName(cat.name);
        }
    };

    const handleSubmit = () => {
        if(!title || !date) return;
        const start = `${date}T${startTime}:00`;
        const end = `${date}T${endTime}:00`;
        onSave({ 
            title, 
            clientId, 
            start, 
            end, 
            agreedPrice: price, 
            description, 
            location, 
            type, 
            packName: packName || category 
        });
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-scale-in" onClick={onClose}>
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl w-full max-w-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                    <div><h3 className="text-xl font-bold text-white">{initialData ? 'Editar Evento' : 'Novo Evento'}</h3></div>
                    <button type="button" onClick={onClose}><X className="text-slate-400 hover:text-white"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    {/* Seletor de Categorias/Tags */}
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-black tracking-widest mb-3 block">Tipo de Serviço / Tag</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${category === cat.name ? 'bg-slate-800 border-white/20 ring-1 ring-white/10' : 'bg-slate-900/50 border-slate-700/50 text-slate-500'}`}
                                >
                                    <cat.icon size={16} className={category === cat.name ? cat.color : 'text-slate-600'} />
                                    <span className={`text-sm font-bold ${category === cat.name ? 'text-white' : ''}`}>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-400 uppercase font-bold">Título do Evento</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Casamento Joana & Pedro" className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none" /></div>
                        <div><label className="text-xs text-slate-400 uppercase font-bold">Cliente Responsável</label><select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none"><option value="">Selecione um cliente...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="text-xs text-slate-400 uppercase font-bold">Data</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none" /></div>
                        <div><label className="text-xs text-slate-400 uppercase font-bold">Início</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none" /></div>
                        <div><label className="text-xs text-slate-400 uppercase font-bold">Fim</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none" /></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-xs text-slate-400 uppercase font-bold">Local / Quinta</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Nome do local" className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none" /></div>
                        <div><label className="text-xs text-slate-400 uppercase font-bold">Valor do Contrato (€)</label><input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none font-mono" /></div>
                    </div>
                    
                    <div><label className="text-xs text-slate-400 uppercase font-bold">Nome do Pack / Sub-Tag (Opcional)</label><input type="text" value={packName} onChange={e => setPackName(e.target.value)} placeholder="Ex: Pack Diamante, Mini-Sessão..." className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none" /></div>
                    
                    <div><label className="text-xs text-slate-400 uppercase font-bold">Observações e Detalhes</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 h-24 resize-none custom-scrollbar outline-none focus:border-pink-500"></textarea></div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                     <button type="button" onClick={handleSubmit} className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-4 rounded-xl transition-all shadow-xl active:scale-[0.98]">
                        {initialData ? 'Salvar Alterações' : 'Agendar Novo Evento'}
                     </button>
                </div>
            </div>
        </div>
    )
}

export default EventsListView;
