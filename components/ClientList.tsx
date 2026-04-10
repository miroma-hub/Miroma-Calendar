
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Phone, FileText, Plus, Euro, X, MessageSquareQuote, Calendar as CalendarIcon, ClipboardCopy, ArrowUpDown, ArrowUpAZ, ArrowDownZA, TrendingUp, TrendingDown, CalendarClock } from 'lucide-react';
import { Client, CalendarEvent } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SortOption = 'name_asc' | 'name_desc' | 'revenue_asc' | 'revenue_desc' | 'date_asc' | 'date_desc';

const ClientList: React.FC = () => {
  const { clients, getClientRevenue, updateClient, addClient, events } = useApp();
  const [filter, setFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sortType, setSortType] = useState<SortOption>('name_asc');

  // Lógica de ordenação e filtro combinada
  const sortedAndFilteredClients = useMemo(() => {
    let result = [...clients].filter(c => 
      c.name.toLowerCase().includes(filter.toLowerCase()) || 
      c.contact.toLowerCase().includes(filter.toLowerCase())
    );

    const now = Date.now();

    result.sort((a, b) => {
      switch (sortType) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'revenue_asc':
          return getClientRevenue(a.id) - getClientRevenue(b.id);
        case 'revenue_desc':
          return getClientRevenue(b.id) - getClientRevenue(a.id);
        case 'date_asc':
        case 'date_desc': {
          const getClientTimeMeta = (clientId: string) => {
            const clientEvents = events.filter(e => e.clientId === clientId);
            if (clientEvents.length === 0) return { category: 3, time: 0 }; // Sem eventos

            const futureEvents = clientEvents
              .map(e => new Date(e.start).getTime())
              .filter(t => t >= now)
              .sort((x, y) => x - y); // Ordena para pegar o mais próximo do futuro

            if (futureEvents.length > 0) {
              return { category: 1, time: futureEvents[0] }; // Tem evento futuro
            }

            const pastEvents = clientEvents
              .map(e => new Date(e.start).getTime())
              .filter(t => t < now)
              .sort((x, y) => y - x); // Ordena para pegar o mais recente do passado

            return { category: 2, time: pastEvents[0] }; // Apenas eventos passados
          };

          const metaA = getClientTimeMeta(a.id);
          const metaB = getClientTimeMeta(b.id);

          // REGRA SOLICITADA: Eventos futuros sempre primeiro (Categoria 1), 
          // seguidos de passados (Categoria 2) e sem eventos (Categoria 3).
          // Independente de ser ASC ou DESC, a prioridade de categoria é fixa.
          if (metaA.category !== metaB.category) {
            return metaA.category - metaB.category;
          }

          // Se ambos estão na mesma categoria, aí sim aplicamos a direção do tempo
          if (sortType === 'date_asc') {
            return metaA.time - metaB.time;
          } else {
            return metaB.time - metaA.time;
          }
        }
        default:
          return 0;
      }
    });

    return result;
  }, [clients, filter, sortType, getClientRevenue, events]);

  const handleNewClient = () => {
    setSelectedClient({ id: 'new', name: '', contact: '', notes: '', conversationHistory: '' } as Client);
  };

  const handleSaveClient = (id: string, data: Partial<Client>) => {
      if (id === 'new') {
          addClient({ 
            name: data.name || 'Novo Cliente', 
            contact: data.contact || '', 
            notes: data.notes || '',
            conversationHistory: data.conversationHistory || ''
          });
      } else {
          updateClient(id, data);
      }
      setSelectedClient(null);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col md:h-full md:overflow-hidden">
      <div className="flex justify-between items-center mb-10 flex-shrink-0 px-2">
        <div>
          <h2 className="text-4xl font-black gemini-gradient-text tracking-tight">Clientes</h2>
          <p className="text-slate-400 text-sm mt-1">Sua base de contatos e inteligência de negócios.</p>
        </div>
        <button 
            onClick={handleNewClient}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-blue-900/30 font-bold active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 flex-shrink-0 px-2">
        {/* Busca */}
        <div className="flex-1 relative">
          <div className="gemini-border p-[1px] rounded-2xl">
            <div className="relative bg-[#0f172a] rounded-2xl overflow-hidden">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-500" size={22} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou contato..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-transparent py-5 pl-16 pr-6 text-white focus:outline-none transition-colors text-lg placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Ordenação */}
        <div className="relative md:w-64">
          <div className="gemini-border p-[1px] rounded-2xl h-full">
            <div className="relative bg-[#0f172a] rounded-2xl overflow-hidden h-full flex items-center px-4">
              <ArrowUpDown className="text-slate-500 mr-3" size={20} />
              <select 
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortOption)}
                className="bg-transparent text-white w-full outline-none text-sm font-bold cursor-pointer appearance-none"
              >
                <optgroup label="Ordem Alfabética" className="bg-slate-900">
                  <option value="name_asc">Nome (A → Z)</option>
                  <option value="name_desc">Nome (Z → A)</option>
                </optgroup>
                <optgroup label="Financeiro" className="bg-slate-900">
                  <option value="revenue_desc">Faturamento (Maior)</option>
                  <option value="revenue_asc">Faturamento (Menor)</option>
                </optgroup>
                <optgroup label="Cronologia Inteligente" className="bg-slate-900">
                  <option value="date_asc">Próximos Eventos</option>
                  <option value="date_desc">Mais Longe / Antigos</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:gap-8 md:overflow-y-auto pb-32 custom-scrollbar pr-2 items-stretch px-2">
        {sortedAndFilteredClients.map(client => {
          const revenue = getClientRevenue(client.id);
          const colors = ['from-blue-500 to-purple-600', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500', 'from-indigo-500 to-blue-500'];
          const colorClass = colors[client.name.length % colors.length];

          // Verifica se o cliente tem um evento futuro para feedback visual
          const hasFutureEvent = events.some(e => e.clientId === client.id && new Date(e.start).getTime() >= Date.now());

          return (
          <div key={client.id} onClick={() => setSelectedClient(client)} className={`bg-slate-800/10 backdrop-blur-md border ${hasFutureEvent ? 'border-slate-700/60 shadow-blue-900/10' : 'border-slate-700/20 opacity-70'} rounded-[2rem] p-8 hover:border-blue-500/50 hover:bg-slate-800/30 transition-all cursor-pointer group relative overflow-hidden shadow-xl flex flex-col min-h-[300px] animate-fade-in`}>
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${colorClass} ${hasFutureEvent ? 'opacity-100' : 'opacity-30'}`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className={`h-16 w-16 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg transform group-hover:scale-110 transition-transform flex-shrink-0 ${!hasFutureEvent && 'grayscale-[0.5] opacity-80'}`}>
                {client.name.charAt(0)}
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Faturamento</p>
                 <span className="text-xl font-mono font-bold text-green-400">€ {revenue.toLocaleString('pt-PT')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-2xl font-bold text-white break-words group-hover:text-blue-400 transition-colors leading-tight`}>
                {client.name}
              </h3>
              {hasFutureEvent && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" title="Evento Ativo"></div>}
            </div>
            
            <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed min-h-[40px]">
              {client.notes || 'Sem observações detalhadas.'}
            </p>
            
            <div className="mt-auto pt-6 border-t border-slate-700/20 space-y-4">
              <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                <div className="p-2 bg-slate-900/50 rounded-lg text-blue-500/70"><Phone size={16} /></div>
                <span className="text-sm font-medium truncate">{client.contact || 'Nenhum contato'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200 transition-colors">
                <div className="p-2 bg-slate-900/50 rounded-lg text-purple-500/70"><MessageSquareQuote size={16} /></div>
                <span className="text-sm font-medium">Memória IA: {client.conversationHistory ? 'Preenchida' : 'Vazia'}</span>
              </div>
            </div>
          </div>
        )})}
      </div>

      {selectedClient && (
        <ClientModal 
            client={selectedClient} 
            revenue={selectedClient.id === 'new' ? 0 : getClientRevenue(selectedClient.id)}
            events={selectedClient.id === 'new' ? [] : events.filter(e => e.clientId === selectedClient.id)}
            onClose={() => setSelectedClient(null)} 
            onSave={handleSaveClient}
        />
      )}
    </div>
  );
};

const ClientModal = ({ client, revenue, events, onClose, onSave }: { client: Client, revenue: number, events: CalendarEvent[], onClose: any, onSave: any }) => {
    const [formData, setFormData] = useState(client);
    const [activeTab, setActiveTab] = useState<'info' | 'history' | 'projects'>('info');
    const isNew = client.id === 'new';
    const colors = ['from-blue-600 to-indigo-600', 'from-pink-600 to-rose-600', 'from-emerald-600 to-teal-600'];
    const colorClass = isNew ? colors[0] : colors[client.name.length % colors.length];

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
                
                <div className={`h-40 bg-gradient-to-r ${colorClass} p-10 flex items-end relative flex-shrink-0`}>
                    <button onClick={onClose} className="absolute top-8 right-8 text-white/70 hover:text-white bg-black/20 p-2.5 rounded-full backdrop-blur-sm transition-all hover:scale-110"><X size={24}/></button>
                    <div className="flex items-center gap-8 translate-y-12">
                        <div className="h-32 w-32 bg-slate-900 rounded-3xl p-1.5 shadow-2xl">
                            <div className={`w-full h-full rounded-[1.2rem] bg-gradient-to-br ${colorClass} flex items-center justify-center text-5xl font-bold text-white shadow-inner`}>
                                {formData.name ? formData.name.charAt(0) : <Plus size={40} />}
                            </div>
                        </div>
                        <div className="mb-4 w-full">
                             <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder="Nome do Cliente" 
                                className="text-5xl font-black text-white bg-transparent outline-none drop-shadow-lg placeholder-white/30 border-b border-transparent focus:border-white/20 transition-all w-full" 
                                autoFocus={isNew} 
                             />
                        </div>
                    </div>
                </div>

                <div className="px-10 pt-20 flex-shrink-0">
                    <div className="flex gap-8 border-b border-slate-800">
                        <button onClick={() => setActiveTab('info')} className={`pb-4 px-1 font-bold text-sm uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'info' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                            <FileText size={16}/> Informações
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`pb-4 px-1 font-bold text-sm uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'history' ? 'text-purple-400 border-purple-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                            <MessageSquareQuote size={16}/> Memória da IA
                        </button>
                        <button onClick={() => setActiveTab('projects')} className={`pb-4 px-1 font-bold text-sm uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'projects' ? 'text-emerald-400 border-emerald-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                            <CalendarIcon size={16}/> Projetos
                        </button>
                    </div>
                </div>

                <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
                            <div className="space-y-8">
                                <div className="bg-slate-800/20 p-8 rounded-3xl border border-slate-700/30">
                                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 block">Contato Principal</label>
                                    <input 
                                        type="text" 
                                        value={formData.contact} 
                                        onChange={e => setFormData({...formData, contact: e.target.value})} 
                                        placeholder="Email, WhatsApp ou Instagram" 
                                        className="w-full bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none pb-3 text-xl text-white placeholder-slate-700 transition-colors" 
                                    />
                                </div>
                                {!isNew && (
                                    <div className="bg-slate-800/20 p-8 rounded-3xl border border-slate-700/30">
                                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 block">Investimento Total</label>
                                        <p className="text-4xl font-mono font-bold text-white">€ {revenue.toLocaleString('pt-PT')}</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-slate-800/20 p-8 rounded-3xl border border-slate-700/30 flex flex-col">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Notas Internas</label>
                                <textarea 
                                    value={formData.notes} 
                                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                                    placeholder="Preferências, estilo, prazos e lembretes rápidos..." 
                                    className="w-full flex-1 min-h-[150px] bg-transparent outline-none text-slate-300 resize-none text-lg leading-relaxed placeholder-slate-800 custom-scrollbar" 
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="animate-fade-in space-y-6 h-full flex flex-col">
                            <div className="bg-purple-900/5 border border-purple-500/20 p-8 rounded-[2.5rem] flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-purple-500/20 rounded-2xl text-purple-400 shadow-xl shadow-purple-950/30">
                                            <ClipboardCopy size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-white">Log de Conversas & Acordos</h4>
                                            <p className="text-slate-500 text-sm">A MIROMA consultará este texto para te aconselhar sobre pedidos que fujam do combinado.</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-slate-900/50 rounded-2xl border border-purple-500/30 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                        Alimentação de Contexto IA
                                    </div>
                                </div>
                                <textarea 
                                    value={formData.conversationHistory} 
                                    onChange={e => setFormData({...formData, conversationHistory: e.target.value})} 
                                    placeholder="Cole aqui o texto da conversa..." 
                                    className="w-full flex-1 min-h-[400px] bg-slate-950/40 border border-slate-700/50 rounded-3xl p-8 text-slate-300 outline-none focus:border-purple-500 transition-all font-mono text-sm leading-relaxed custom-scrollbar shadow-inner"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="animate-fade-in space-y-4">
                            {events.sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime()).map(event => (
                                <div key={event.id} className="bg-slate-800/10 border border-slate-700/30 rounded-[1.5rem] p-8 flex justify-between items-center hover:bg-slate-800/20 transition-all group">
                                    <div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="font-bold text-white text-xl group-hover:text-emerald-400 transition-colors">{event.title}</span>
                                            {event.packName && <span className="text-[10px] bg-blue-900/40 text-blue-300 px-3 py-1 rounded-lg border border-blue-500/20 font-black uppercase tracking-widest">{event.packName}</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                            <CalendarIcon size={16} />
                                            {format(parseISO(event.start), "dd 'de' MMMM, yyyy", {locale: ptBR})}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                         <span className="block font-mono font-bold text-2xl text-emerald-400 mb-2">€ {event.agreedPrice?.toLocaleString('pt-PT')}</span>
                                         <span className={`text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-widest ${event.isDone || new Date(event.end) < new Date() ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 'bg-orange-900/30 text-orange-400 border border-orange-500/20'}`}>
                                             {event.isDone || new Date(event.end) < new Date() ? 'Finalizado' : 'Pendente'}
                                         </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-10 border-t border-slate-800/50 flex justify-end items-center bg-slate-900/50 backdrop-blur-md flex-shrink-0">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSave(client.id, formData); }} 
                        className={`bg-gradient-to-r ${colorClass} hover:brightness-110 text-white px-16 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl active:scale-95`}
                    >
                        {isNew ? 'Cadastrar Cliente' : 'Salvar Ficha'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ClientList;
