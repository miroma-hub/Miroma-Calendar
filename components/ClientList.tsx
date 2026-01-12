
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MoreVertical, Phone, FileText, Plus, Euro, X, History, Calendar as CalendarIcon } from 'lucide-react';
import { Client, CalendarEvent } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ClientList: React.FC = () => {
  const { clients, getClientRevenue, updateClient, addClient, events } = useApp();
  const [filter, setFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.contact.toLowerCase().includes(filter.toLowerCase())
  );

  const handleNewClient = () => {
    setSelectedClient({ id: 'new', name: '', contact: '', notes: '' } as Client);
  };

  const handleSaveClient = (id: string, data: Partial<Client>) => {
      if (id === 'new') {
          addClient({ name: data.name || 'Novo Cliente', contact: data.contact || '', notes: data.notes || '' });
      } else {
          updateClient(id, data);
      }
      setSelectedClient(null);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold gemini-gradient-text">Clientes</h2>
        <button 
            onClick={handleNewClient}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-900/20 font-bold"
        >
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" size={22} />
        <input 
          type="text" 
          placeholder="Buscar clientes por nome ou contato..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-blue-500 transition-colors text-lg"
        />
      </div>

      {/* GRELHA COM ESPAÇAMENTO VERTICAL AMPLIADO (gap-y-14) */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-y-14 gap-x-8 overflow-y-auto pb-16 custom-scrollbar">
        {filteredClients.map(client => {
          const revenue = getClientRevenue(client.id);
          const colors = ['from-blue-500 to-purple-600', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500', 'from-indigo-500 to-blue-500'];
          const colorClass = colors[client.name.length % colors.length];

          return (
          <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-slate-800/10 backdrop-blur-md border border-slate-700/30 rounded-3xl p-6 hover:border-blue-500/50 hover:bg-slate-800/30 transition-all cursor-pointer group relative overflow-hidden shadow-xl h-fit min-h-[260px] flex flex-col">
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${colorClass}`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className={`h-16 w-16 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                {client.name.charAt(0)}
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Investimento Total</p>
                 <span className="text-2xl font-mono font-bold text-green-400">€ {revenue.toLocaleString('pt-PT')}</span>
              </div>
            </div>

            <h3 className={`text-2xl font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors`}>{client.name}</h3>
            <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px] leading-relaxed">{client.notes || 'Sem observações adicionais.'}</p>
            
            <div className="mt-auto pt-4 border-t border-slate-700/30 space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-1.5 bg-slate-800 rounded-lg"><Phone size={16} className="text-blue-400" /></div>
                <span className="text-sm font-medium truncate">{client.contact || 'Nenhum contato'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-1.5 bg-slate-800 rounded-lg"><FileText size={16} className="text-purple-400" /></div>
                <span className="text-sm font-medium">Ficha Completa</span>
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
    const isNew = client.id === 'new';
    const colors = ['from-blue-500 to-purple-600', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500'];
    const colorClass = isNew ? colors[0] : colors[client.name.length % colors.length];

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className={`h-40 bg-gradient-to-r ${colorClass} p-10 flex items-end relative`}>
                    <button onClick={onClose} className="absolute top-8 right-8 text-white/70 hover:text-white bg-black/20 p-2.5 rounded-full backdrop-blur-sm transition-colors"><X size={24}/></button>
                    <div className="flex items-center gap-8 translate-y-12">
                        <div className="h-32 w-32 bg-slate-900 rounded-3xl p-1.5 shadow-2xl">
                            <div className={`w-full h-full rounded-[1.2rem] bg-gradient-to-br ${colorClass} flex items-center justify-center text-5xl font-bold text-white`}>
                                {formData.name ? formData.name.charAt(0) : <Plus size={40} />}
                            </div>
                        </div>
                        <div className="mb-4 w-full max-w-lg">
                             <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome do Cliente" className="w-full text-5xl font-bold text-white bg-transparent outline-none drop-shadow-lg placeholder-white/40 border-b-2 border-transparent focus:border-white/30 transition-colors" autoFocus={isNew} />
                        </div>
                    </div>
                </div>
                <div className="p-10 pt-20 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1 space-y-8">
                             <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30">
                                <label className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-3"><Phone size={16}/> Contato Direto</label>
                                <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="Email ou Telefone" className="w-full bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none pb-2 text-lg text-white placeholder-slate-600" />
                             </div>
                             {!isNew && (
                                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30">
                                    <label className="flex items-center gap-2 text-xs font-black text-green-400 uppercase tracking-[0.2em] mb-3"><Euro size={16}/> Valor em Carteira</label>
                                    <p className="text-3xl font-mono font-bold text-white">€ {revenue.toLocaleString('pt-PT')}</p>
                                </div>
                             )}
                             <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30">
                                <label className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-3"><FileText size={16}/> Notas Internas</label>
                                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Preferências, anotações importantes, histórico..." className="w-full h-48 bg-transparent outline-none text-slate-300 resize-none text-base leading-relaxed placeholder-slate-600 custom-scrollbar" />
                             </div>
                        </div>
                        <div className="lg:col-span-2">
                             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><History size={24} className="text-blue-400"/> Histórico de Projetos</h3>
                             <div className="space-y-4">
                                {events.sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime()).map(event => (
                                    <div key={event.id} className="bg-slate-800/20 border border-slate-700/30 rounded-[1.5rem] p-6 flex justify-between items-center hover:bg-slate-800/40 transition-all group">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold text-white text-lg">{event.title}</span>
                                                {event.packName && <span className="text-[10px] bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full border border-blue-500/20 font-black uppercase tracking-widest">{event.packName}</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <CalendarIcon size={14} />
                                                {format(parseISO(event.start), "dd 'de' MMMM, yyyy", {locale: ptBR})}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                             <span className="block font-bold text-xl text-green-400 mb-1">€ {event.agreedPrice?.toLocaleString('pt-PT')}</span>
                                             <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${event.isDone || new Date(event.end) < new Date() ? 'bg-green-900/30 text-green-400' : 'bg-orange-900/30 text-orange-400'}`}>
                                                 {event.isDone || new Date(event.end) < new Date() ? 'Concluído' : 'Pendente'}
                                             </span>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && <div className="text-center py-16 bg-slate-800/10 rounded-3xl border border-dashed border-slate-700/50 text-slate-500 italic text-lg">{isNew ? 'Salve o cliente primeiro para registrar serviços.' : 'Nenhum projeto registrado para este cliente.'}</div>}
                             </div>
                        </div>
                    </div>
                </div>
                <div className="p-8 border-t border-slate-700/30 flex justify-end items-center bg-slate-900/50 backdrop-blur-xl">
                    <button onClick={(e) => { e.stopPropagation(); onSave(client.id, formData); }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-blue-900/40 active:scale-95">
                        {isNew ? 'Criar Nova Ficha' : 'Atualizar Cliente'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ClientList;
