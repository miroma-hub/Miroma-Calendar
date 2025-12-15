import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MoreVertical, Phone, FileText, Plus, Euro, X, History } from 'lucide-react';
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
    // Placeholder for new client
    setSelectedClient({
        id: 'new',
        name: '',
        contact: '',
        notes: ''
    } as Client);
  };

  const handleSaveClient = (id: string, data: Partial<Client>) => {
      if (id === 'new') {
          addClient({
              name: data.name || 'Novo Cliente',
              contact: data.contact || '',
              notes: data.notes || ''
          });
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar clientes..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
        {filteredClients.map(client => {
          const revenue = getClientRevenue(client.id);
          // Deterministic color generation based on name
          const colors = ['from-blue-500 to-purple-600', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500', 'from-indigo-500 to-blue-500'];
          const colorClass = colors[client.name.length % colors.length];

          return (
          <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-slate-800/20 backdrop-blur-md border border-slate-700/30 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-slate-800/40 transition-all cursor-pointer group relative overflow-hidden shadow-lg">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClass}`}></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className={`h-12 w-12 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg`}>
                {client.name.charAt(0)}
              </div>
              <button className="text-slate-500 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <h3 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${colorClass} mb-1`}>{client.name}</h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2 min-h-[40px]">{client.notes}</p>
            
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-500" />
                <span>{client.contact}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Euro size={14} className="text-green-500" />
                 <span className="font-semibold text-green-400">€ {revenue.toLocaleString('pt-PT')}</span>
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
    
    // Default gradient for new clients
    const colors = ['from-blue-500 to-purple-600', 'from-pink-500 to-orange-500', 'from-green-500 to-teal-500'];
    const colorClass = isNew ? colors[0] : colors[client.name.length % colors.length];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900/90 border border-slate-700/50 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col backdrop-blur-xl">
                
                {/* Header with Gradient */}
                <div className={`h-32 bg-gradient-to-r ${colorClass} p-8 flex items-end relative opacity-90`}>
                    <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-sm"><X /></button>
                    <div className="flex items-center gap-6 translate-y-8">
                        <div className="h-24 w-24 bg-slate-900 rounded-full p-1 shadow-2xl">
                            <div className={`w-full h-full rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-4xl font-bold text-white`}>
                                {formData.name ? formData.name.charAt(0) : <Plus />}
                            </div>
                        </div>
                        <div className="mb-2 w-full max-w-md">
                             <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Nome do Cliente"
                                className="w-full text-4xl font-bold text-white bg-transparent outline-none drop-shadow-md placeholder-white/50 border-b border-transparent focus:border-white/50 transition-colors"
                                autoFocus={isNew}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-12 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Info */}
                        <div className="lg:col-span-1 space-y-6">
                             <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
                                <label className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2"><Phone size={14}/> Contato</label>
                                <input 
                                    type="text" 
                                    value={formData.contact} 
                                    onChange={e => setFormData({...formData, contact: e.target.value})}
                                    placeholder="Email ou Telefone"
                                    className="w-full bg-transparent border-b border-slate-700 focus:border-blue-500 outline-none pb-1 text-white placeholder-slate-600"
                                />
                             </div>

                             {!isNew && (
                                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
                                    <label className="flex items-center gap-2 text-xs font-bold text-green-400 uppercase tracking-wider mb-2"><Euro size={14}/> Total Investido</label>
                                    <p className="text-2xl font-mono text-white">€ {revenue.toLocaleString('pt-PT')}</p>
                                </div>
                             )}

                             <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 h-full">
                                <label className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2"><FileText size={14}/> Notas</label>
                                <textarea 
                                    value={formData.notes} 
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Preferências, anotações..."
                                    className="w-full h-32 bg-transparent outline-none text-slate-300 resize-none text-sm leading-relaxed placeholder-slate-600"
                                />
                             </div>
                        </div>

                        {/* Right Column: Service History */}
                        <div className="lg:col-span-2">
                             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><History size={20} className="text-slate-400"/> Histórico de Serviços</h3>
                             
                             <div className="space-y-3">
                                {events.sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime()).map(event => (
                                    <div key={event.id} className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4 flex justify-between items-center hover:bg-slate-800/40 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-white">{event.title}</span>
                                                {event.packName && <span className="text-[10px] bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">{event.packName}</span>}
                                            </div>
                                            <p className="text-xs text-slate-500">{format(parseISO(event.start), "dd 'de' MMMM, yyyy", {locale: ptBR})}</p>
                                        </div>
                                        <div className="text-right">
                                             <span className="block font-medium text-green-400">€ {event.agreedPrice?.toLocaleString('pt-PT')}</span>
                                             <span className={`text-[10px] px-2 py-0.5 rounded-full ${event.isDone || new Date(event.end) < new Date() ? 'bg-green-900/20 text-green-500' : 'bg-orange-900/20 text-orange-400'}`}>
                                                 {event.isDone || new Date(event.end) < new Date() ? 'Concluído' : 'Pendente'}
                                             </span>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && <div className="text-center py-10 text-slate-500 italic">
                                    {isNew ? 'Salve o cliente para adicionar serviços.' : 'Nenhum serviço contratado ainda.'}
                                </div>}
                             </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-700/30 flex justify-end bg-slate-900/30">
                    <button 
                        onClick={() => onSave(client.id, formData)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
                    >
                        {isNew ? 'Criar Cliente' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ClientList;