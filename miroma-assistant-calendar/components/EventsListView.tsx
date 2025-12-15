import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventType, CalendarEvent } from '../types';
import { MapPin, Calendar as CalendarIcon, Clock, User, PartyPopper, Plus, X, Search, Briefcase, Heart, Edit3, Tag } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EventsListView: React.FC = () => {
  const { events, clients, addEvent, updateEvent } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | 'new' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter types: Show Event, Work, Personal (Exclude Orders)
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
      if (selectedEvent === 'new') {
          addEvent({
              ...data as any,
              bookingDate: new Date().toISOString(),
          });
      } else if (selectedEvent && typeof selectedEvent !== 'string') {
          updateEvent(selectedEvent.id, data);
      }
      setSelectedEvent(null);
  };

  // Logic to determine Main Category (Theme) vs Subtag (Pack Name)
  const getEventCategory = (event: CalendarEvent): string => {
      // Check for explicit overrides in description or title if necessary, but default logic:
      if (event.type === EventType.WORK) return 'Reunião';
      if (event.type === EventType.PERSONAL) return 'Pessoal';
      
      // For type EVENT: Check keywords or default to Casamento
      const lowerTitle = event.title.toLowerCase();
      const lowerPack = (event.packName || '').toLowerCase();
      
      if (lowerTitle.includes('batizado') || lowerPack.includes('batizado')) return 'Batizado';
      if (lowerTitle.includes('aniversário') || lowerPack.includes('aniversário')) return 'Aniversário';
      
      // Default per user request
      return 'Casamento';
  };

  const getSubtag = (event: CalendarEvent, category: string): string | null => {
      if (!event.packName) return null;
      // If packName is exactly the category (e.g. legacy data), don't show as subtag
      if (event.packName.toLowerCase() === category.toLowerCase()) return null;
      return event.packName;
  };

  const getIconByCategory = (category: string) => {
      if (category === 'Reunião') return <Briefcase size={16} className="text-blue-400" />;
      if (category === 'Pessoal') return <Heart size={16} className="text-red-400" />;
      if (category === 'Batizado') return <PartyPopper size={16} className="text-purple-400" />;
      return <PartyPopper size={16} className="text-pink-400" />; // Casamento default
  };

  const getColorByCategory = (category: string) => {
      if (category === 'Reunião') return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
      if (category === 'Pessoal') return 'border-red-500/30 bg-red-500/10 text-red-300';
      if (category === 'Batizado') return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
      return 'border-pink-500/30 bg-pink-500/10 text-pink-300'; // Casamento default
  };

  const getHeaderBg = (category: string) => {
      if (category === 'Reunião') return 'bg-blue-500';
      if (category === 'Pessoal') return 'bg-red-500';
      if (category === 'Batizado') return 'bg-purple-500';
      return 'bg-pink-500'; // Casamento default
  }

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in relative">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold gemini-gradient-text">Eventos & Compromissos</h2>
            <p className="text-slate-400">Gerencie casamentos, batizados, reuniões e datas especiais.</p>
        </div>
        <button 
             onClick={() => setSelectedEvent('new')}
             className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-pink-900/20"
          >
             <Plus size={18} />
             <span>Novo Evento</span>
          </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar eventos, reuniões..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Upcoming Section */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="text-pink-400" /> Próximos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingEvents.map(event => {
               const client = clients.find(c => c.id === event.clientId);
               const category = getEventCategory(event);
               const subtag = getSubtag(event, category);

               return (
                 <div 
                    key={event.id} 
                    onClick={() => setSelectedEvent(event)}
                    className="bg-slate-800/20 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/40 hover:border-pink-500/30 transition-all shadow-lg group relative overflow-hidden cursor-pointer"
                 >
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-10 ${getHeaderBg(category)}`}></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-wrap gap-2 mb-4 items-start">
                            {/* Main Category Tag */}
                            <span className={`border text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide flex items-center gap-2 ${getColorByCategory(category)}`}>
                                {getIconByCategory(category)}
                                {category}
                            </span>
                            
                            {/* Subtag / Pack Name */}
                            {subtag && (
                                <span className="border border-slate-600 bg-slate-800/50 text-slate-300 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                    <Tag size={12} />
                                    {subtag}
                                </span>
                            )}
                        </div>
                        
                        <div className="mb-2">
                            <span className="text-slate-400 text-xs font-mono bg-slate-900/40 px-2 py-0.5 rounded inline-block mb-1">
                                {format(parseISO(event.start), 'dd/MM/yyyy')}
                            </span>
                            <h4 className="text-2xl font-bold text-white leading-tight flex items-center gap-2">
                                {event.title}
                                <Edit3 size={14} className="opacity-0 group-hover:opacity-50 transition-opacity text-slate-400"/>
                            </h4>
                        </div>
                        
                        {event.description && <p className="text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>}

                        <div className="space-y-2 pt-4 border-t border-slate-700/30">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Clock size={16} className="text-slate-500" />
                                <span>{format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}</span>
                            </div>
                            {event.location && (
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <MapPin size={16} className="text-slate-500" />
                                    <span>{event.location}</span>
                                </div>
                            )}
                            {client && (
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <User size={16} className="text-slate-500" />
                                    <span>{client.name}</span>
                                </div>
                            )}
                             <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="font-semibold text-green-400">€ {event.agreedPrice?.toLocaleString('pt-PT') || 0}</span>
                            </div>
                        </div>
                    </div>
                 </div>
               );
            })}
            {upcomingEvents.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-500 bg-slate-800/10 rounded-xl border border-dashed border-slate-700">
                    Nenhum evento encontrado.
                </div>
            )}
          </div>
        </div>

        {/* Past Section */}
        {pastEvents.length > 0 && (
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-lg font-bold text-slate-400 mb-4 flex items-center gap-2">
                    <Clock size={18} /> Histórico
                </h3>
                <div className="space-y-3">
                    {pastEvents.map(event => (
                        <div 
                            key={event.id} 
                            onClick={() => setSelectedEvent(event)}
                            className="bg-slate-900/20 border border-slate-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30"
                        >
                            <div>
                                <h5 className="font-bold text-slate-300">{event.title}</h5>
                                <p className="text-xs text-slate-500">{format(parseISO(event.start), "dd 'de' MMMM, yyyy", {locale: ptBR})}</p>
                            </div>
                            <span className="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded">Concluído</span>
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
    onSave: (data: Partial<CalendarEvent>) => void;
    clients: any[];
}

const EventModal: React.FC<EventModalProps> = ({ initialData, onClose, onSave, clients }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [clientId, setClientId] = useState(initialData?.clientId || '');
    const [start, setStart] = useState(initialData?.start ? initialData.start.slice(0, 16) : '');
    const [end, setEnd] = useState(initialData?.end ? initialData.end.slice(0, 16) : '');
    const [price, setPrice] = useState(initialData?.agreedPrice || 0);
    const [location, setLocation] = useState(initialData?.location || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [packName, setPackName] = useState(initialData?.packName || '');
    
    // Derived Category State (Default to Casamento if new)
    const [category, setCategory] = useState<string>(() => {
        if (!initialData) return 'Casamento';
        if (initialData.type === EventType.WORK) return 'Reunião';
        if (initialData.type === EventType.PERSONAL) return 'Pessoal';
        // Try to infer from packName or just default to Casamento if it's an Event
        if (initialData.packName && initialData.packName.toLowerCase().includes('batizado')) return 'Batizado';
        return 'Casamento'; 
    });

    const handleSubmit = () => {
        if(!title || !start || !end) return;

        let type = EventType.EVENT;
        
        // Map Category UI state to EventType
        if (category === 'Reunião') {
            type = EventType.WORK;
        } else if (category === 'Pessoal') {
            type = EventType.PERSONAL;
        } else {
            type = EventType.EVENT; // Casamento, Batizado, etc are all EVENTS
        }

        // Use the packName input as the Subtag. If empty, maybe fallback to category name for consistency?
        // But user wants explicit subtag. Let's save what is in the input.
        // If the user didn't type a pack name, we can save the Category as the packName to act as default
        const finalPackName = packName || category;

        onSave({
            title,
            clientId,
            start: new Date(start).toISOString(),
            end: new Date(end).toISOString(),
            agreedPrice: price,
            location,
            description,
            type,
            packName: finalPackName
        });
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-scale-in">
            <div className="bg-slate-900/90 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{initialData ? 'Editar Evento' : 'Novo Evento'}</h3>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-white"/></button>
                </div>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Category Selector */}
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Tema / Categoria</label>
                        <div className="flex flex-wrap gap-2">
                            {['Casamento', 'Batizado', 'Reunião', 'Pessoal'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                        category === cat 
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Título</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1" placeholder="Ex: Casamento Joana & Pedro" />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2">
                            <Tag size={12}/> Subtag / Nome do Pack
                        </label>
                        <input 
                            type="text" 
                            value={packName} 
                            onChange={e => setPackName(e.target.value)} 
                            className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1" 
                            placeholder="Ex: Pack Gold, Fotografia, Videoclipe..." 
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Este nome aparecerá como uma etiqueta secundária no card.</p>
                    </div>
                    
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Cliente (Opcional)</label>
                        <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1">
                            <option value="">Selecione um cliente...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Início</label>
                            <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Fim</label>
                            <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1 text-sm" />
                        </div>
                    </div>
                    <div>
                         <label className="text-xs text-slate-400 uppercase font-bold">Local</label>
                         <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1" />
                    </div>
                    <div>
                         <label className="text-xs text-slate-400 uppercase font-bold">Orçamento (€)</label>
                         <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Descrição</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1 h-20"></textarea>
                    </div>
                </div>
                <button onClick={handleSubmit} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
                    {initialData ? 'Salvar Alterações' : 'Criar Evento'}
                </button>
            </div>
        </div>
    )
}

export default EventsListView;