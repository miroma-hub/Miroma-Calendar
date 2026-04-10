
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { EventType, CalendarEvent, Employee } from '../types';
import { CheckCircle, Circle, Clock, Package, AlertTriangle, Plus, X, Search, MapPin, Upload, Image as ImageIcon, Trash2, User, Users } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OrdersView: React.FC = () => {
  const { events, updateEvent, addEvent, clients, employees } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<CalendarEvent | 'new' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const orders = events
    .filter(e => e.type === EventType.ORDER)
    .filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.clientId && clients.find(c => c.id === e.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const toggleStatus = (id: string, currentStatus?: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateEvent(id, { isDone: !currentStatus });
  };

  const getPriority = (bookingDateStr: string) => {
    const elapsed = differenceInDays(new Date(), parseISO(bookingDateStr));
    if (elapsed >= 10) return { label: 'Urgente', color: 'bg-red-500/10 text-red-300 border-red-500/30', elapsed, icon: true };
    if (elapsed >= 5) return { label: 'Atenção', color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30', elapsed, icon: false };
    return { label: 'Normal', color: 'bg-green-500/10 text-green-300 border-green-500/30', elapsed, icon: false };
  };

  const handleSaveOrder = (data: Partial<CalendarEvent>) => {
      if (typeof selectedOrder === 'string' && selectedOrder === 'new') {
           addEvent({ ...data as any, type: EventType.ORDER, start: new Date().toISOString(), bookingDate: new Date().toISOString(), isDone: false });
      } else if (selectedOrder && typeof selectedOrder !== 'string') {
          updateEvent(selectedOrder.id, data);
      }
      setSelectedOrder(null);
  }

  return (
    <div className="p-4 md:p-6 flex flex-col md:h-full md:overflow-hidden animate-fade-in relative">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 flex-shrink-0">
          <div><h2 className="text-3xl font-bold gemini-gradient-text">Encomendas</h2><p className="text-slate-400">Fluxo de produção e equipe atribuída.</p></div>
          <button type="button" onClick={() => setSelectedOrder('new')} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-orange-900/20"><Plus size={18} /><span>Nova Encomenda</span></button>
      </div>
      <div className="relative mb-6 flex-shrink-0">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-14 gap-x-8 md:overflow-y-auto pb-16 custom-scrollbar">
        <div>
           <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2"><Clock size={20} className="text-orange-400" /> Em Produção</h3>
           <div className="space-y-6">
             {orders.filter(o => !o.isDone).map(order => {
               const client = clients.find(c => c.id === order.clientId);
               const priority = getPriority(order.bookingDate);
               const staffCount = order.assignedEmployeeIds?.length || 0;

               return (
                 <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-slate-800/20 backdrop-blur-sm border border-l-4 border-slate-700/50 border-l-orange-500 rounded-xl p-4 hover:bg-slate-800/30 transition-all shadow-md group cursor-pointer">
                    <div className="flex justify-between items-start">
                       <div className="flex-1">
                          <h4 className="font-bold text-white text-lg">{order.title}</h4>
                          <div className="flex items-center gap-2 mb-2">
                             <p className="text-blue-300 text-sm">{client ? client.name : 'Venda Direta'}</p>
                             {staffCount > 0 && <span className="text-[9px] bg-slate-900/50 px-2 py-0.5 rounded text-slate-500 flex items-center gap-1"><Users size={10}/> {staffCount} staff</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3"><span className={`px-2 py-1 rounded border ${priority.color} flex items-center gap-1 font-bold`}>{priority.icon && <AlertTriangle size={12} />}{priority.label}</span></div>
                          <p className="text-slate-400 text-sm bg-slate-900/20 p-2 rounded-lg border border-slate-700/30 line-clamp-2">{order.description}</p>
                       </div>
                       <div className="ml-4 flex flex-col items-center gap-2"><button type="button" onClick={(e) => toggleStatus(order.id, order.isDone, e)} className="text-slate-600 hover:text-green-400 transition-colors p-1 rounded-full hover:bg-green-500/10"><Circle size={28} strokeWidth={1.5} /></button></div>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
        <div>
           <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2"><Package size={20} className="text-green-400" /> Finalizados</h3>
           <div className="space-y-6">
             {orders.filter(o => o.isDone).map(order => (
               <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-slate-800/10 backdrop-blur-sm border border-slate-800/30 rounded-xl p-4 opacity-60 hover:opacity-100 transition-all cursor-pointer">
                    <div className="flex justify-between items-center"><div><h4 className="font-bold text-slate-300 line-through">{order.title}</h4></div><button type="button" onClick={(e) => toggleStatus(order.id, order.isDone, e)} className="text-green-500"><CheckCircle size={24} /></button></div>
                 </div>
             ))}
           </div>
        </div>
      </div>
      {selectedOrder && (
          <OrderModal 
            initialData={selectedOrder === 'new' ? undefined : selectedOrder}
            onClose={() => setSelectedOrder(null)} 
            onSave={handleSaveOrder}
            clients={clients}
            employees={employees}
          />
      )}
    </div>
  );
};

interface OrderModalProps {
    initialData?: CalendarEvent;
    onClose: () => void;
    onSave: (data: Partial<CalendarEvent>) => void;
    clients: any[];
    employees: Employee[];
}

const OrderModal: React.FC<OrderModalProps> = ({ initialData, onClose, onSave, clients, employees }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [clientId, setClientId] = useState(initialData?.clientId || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.agreedPrice || 0);
    const [shippingAddress, setShippingAddress] = useState(initialData?.shippingAddress || '');
    const [isFullPayment, setIsFullPayment] = useState(initialData?.isFullPayment || false);
    const [isDone, setIsDone] = useState(initialData?.isDone || false);
    const [assignedStaff, setAssignedStaff] = useState<string[]>(initialData?.assignedEmployeeIds || []);

    const toggleStaff = (id: string) => {
      setAssignedStaff(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSubmit = () => {
        if (!title) return;
        onSave({
            title,
            clientId,
            description,
            agreedPrice: price,
            shippingAddress,
            isFullPayment,
            isDone,
            assignedEmployeeIds: assignedStaff
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-scale-in" onClick={onClose}>
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl w-full max-w-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                    <div><h3 className="text-xl font-bold text-white">{initialData ? 'Editar Encomenda' : 'Nova Encomenda'}</h3></div>
                    <button type="button" onClick={onClose}><X className="text-slate-400 hover:text-white"/></button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1.5">Título do Projeto</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-orange-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1.5">Cliente</label>
                            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-orange-500 outline-none">
                                <option value="">Selecione...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3 block">Equipe de Produção</label>
                        <div className="flex flex-wrap gap-2">
                           <button onClick={() => setAssignedStaff([])} className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${assignedStaff.length === 0 ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Produção Própria</button>
                           {employees.map(emp => (
                             <button 
                                key={emp.id} 
                                onClick={() => toggleStaff(emp.id)} 
                                className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${assignedStaff.includes(emp.id) ? 'bg-slate-800 border-white/20 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                             >
                                {emp.photo && <img src={emp.photo} className="w-4 h-4 rounded-full" />}
                                {emp.name}
                             </button>
                           ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1.5">Endereço de Envio</label>
                        <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-slate-500" />
                            <input type="text" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-orange-500 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1.5">Valor (€)</label>
                            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-orange-500 outline-none font-mono" />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="isFullPayment" checked={isFullPayment} onChange={e => setIsFullPayment(e.target.checked)} className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-orange-600 focus:ring-orange-500" />
                            <label htmlFor="isFullPayment" className="text-white text-sm font-bold">Totalmente Pago</label>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1.5">Especificações da Encomenda</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-orange-500 outline-none h-32 resize-none custom-scrollbar"></textarea>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                     <button type="button" onClick={handleSubmit} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 text-white font-bold py-4 rounded-2xl transition-all shadow-xl active:scale-95">
                        {initialData ? 'Atualizar Encomenda' : 'Lançar Encomenda'}
                     </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersView;
