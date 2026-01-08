import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { EventType, CalendarEvent } from '../types';
import { CheckCircle, Circle, Clock, Package, AlertTriangle, Plus, X, Search, MapPin, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OrdersView: React.FC = () => {
  const { events, updateEvent, addEvent, clients } = useApp();
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
    const bookingDate = parseISO(bookingDateStr);
    const today = new Date();
    const elapsed = differenceInDays(today, bookingDate);
    
    // Logic: 15 days manufacturing time.
    if (elapsed >= 10) {
       return { label: 'Urgente', color: 'bg-red-500/10 text-red-300 border-red-500/30', elapsed, icon: true };
    }
    if (elapsed >= 5) {
       return { label: 'Atenção', color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30', elapsed, icon: false };
    }
    return { label: 'Normal', color: 'bg-green-500/10 text-green-300 border-green-500/30', elapsed, icon: false };
  };

  const handleSaveOrder = (data: Partial<CalendarEvent>) => {
      if (selectedOrder === 'new') {
           addEvent({
              ...data as any,
              type: EventType.ORDER,
              start: new Date().toISOString(), // Start production today
              bookingDate: new Date().toISOString(),
              isDone: false
          });
      } else if (selectedOrder && typeof selectedOrder !== 'string') {
          updateEvent(selectedOrder.id, data);
      }
      setSelectedOrder(null);
  }

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in relative">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold gemini-gradient-text">Encomendas</h2>
            <p className="text-slate-400">Gerencie a produção (Ciclo padrão: 15 dias).</p>
          </div>
          <button 
             onClick={() => setSelectedOrder('new')}
             className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-orange-900/20"
          >
             <Plus size={18} />
             <span>Nova Encomenda</span>
          </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar encomendas, clientes..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto">
        {/* Pending */}
        <div>
           <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
             <Clock size={20} className="text-orange-400" /> Em Produção
           </h3>
           <div className="space-y-4">
             {orders.filter(o => !o.isDone).map(order => {
               const client = clients.find(c => c.id === order.clientId);
               const priority = getPriority(order.bookingDate);

               return (
                 <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-slate-800/20 backdrop-blur-sm border border-l-4 border-slate-700/50 border-l-orange-500 rounded-xl p-4 hover:bg-slate-800/30 transition-all shadow-md group cursor-pointer"
                 >
                    <div className="flex justify-between items-start">
                       <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <h4 className="font-bold text-white text-lg">{order.title}</h4>
                          </div>
                          <p className="text-blue-300 text-sm mb-2">{client ? client.name : 'Cliente Manual'}</p>
                          
                          <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
                             {/* Priority Tag */}
                             <span className={`px-2 py-1 rounded border ${priority.color} flex items-center gap-1 font-bold uppercase tracking-wider`}>
                                {priority.icon && <AlertTriangle size={12} />}
                                {priority.label} • {priority.elapsed}d decorridos
                             </span>

                             <span className="bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50 flex items-center">{order.packName || 'Personalizado'}</span>
                             <span className="bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50 flex items-center">Prazo: {format(parseISO(order.end), 'dd/MM/yyyy')}</span>
                          </div>
                          
                          <p className="text-slate-400 text-sm bg-slate-900/20 p-2 rounded-lg border border-slate-700/30 line-clamp-2">{order.description}</p>
                          
                          {/* Indicators */}
                          <div className="flex gap-2 mt-2">
                             {order.shippingAddress && <div className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 flex items-center gap-1"><MapPin size={10}/> Endereço</div>}
                             {order.referenceImages && order.referenceImages.length > 0 && <div className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 flex items-center gap-1"><ImageIcon size={10}/> {order.referenceImages.length} fotos</div>}
                          </div>
                       </div>
                       <div className="ml-4 flex flex-col items-center gap-2">
                           <button onClick={(e) => toggleStatus(order.id, order.isDone, e)} className="text-slate-600 hover:text-green-400 transition-colors p-1 rounded-full hover:bg-green-500/10">
                              <Circle size={28} strokeWidth={1.5} />
                           </button>
                       </div>
                    </div>
                 </div>
               );
             })}
             {orders.filter(o => !o.isDone).length === 0 && <p className="text-slate-500 italic">Nenhuma encomenda pendente.</p>}
           </div>
        </div>

        {/* Done */}
        <div>
           <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
             <Package size={20} className="text-green-400" /> Entregues / Finalizados
           </h3>
           <div className="space-y-4">
             {orders.filter(o => o.isDone).map(order => (
               <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-slate-800/10 backdrop-blur-sm border border-slate-800/30 rounded-xl p-4 opacity-60 hover:opacity-100 transition-all cursor-pointer"
                >
                    <div className="flex justify-between items-center">
                       <div>
                          <h4 className="font-bold text-slate-300 line-through">{order.title}</h4>
                          <p className="text-sm text-slate-500">Entregue em: {format(parseISO(order.end), 'dd/MM/yyyy')}</p>
                       </div>
                       <button onClick={(e) => toggleStatus(order.id, order.isDone, e)} className="text-green-500">
                          <CheckCircle size={24} />
                       </button>
                    </div>
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
          />
      )}
    </div>
  );
};

interface OrderModalProps {
    initialData?: CalendarEvent;
    onClose: () => void;
    onSave: (data: any) => void;
    clients: any[];
}

const OrderModal: React.FC<OrderModalProps> = ({ initialData, onClose, onSave, clients }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [clientId, setClientId] = useState(initialData?.clientId || '');
    const [deadline, setDeadline] = useState(initialData?.end ? initialData.end.slice(0, 10) : '');
    const [price, setPrice] = useState(initialData?.agreedPrice || 0);
    const [description, setDescription] = useState(initialData?.description || '');
    const [shippingAddress, setShippingAddress] = useState(initialData?.shippingAddress || '');
    const [images, setImages] = useState<string[]>(initialData?.referenceImages || []);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if(!title || !deadline) return;
        onSave({
            title,
            clientId,
            end: new Date(deadline).toISOString(),
            agreedPrice: price,
            description,
            shippingAddress,
            referenceImages: images,
            packName: initialData?.packName || 'Personalizado'
        });
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setImages(prev => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-scale-in">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl w-full max-w-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">{initialData ? 'Editar Encomenda' : 'Nova Encomenda'}</h3>
                        <p className="text-xs text-slate-400">Gerencie detalhes, prazos e referências.</p>
                    </div>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-white"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Título da Encomenda</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1" placeholder="Ex: Retrato Digital"/>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Cliente</label>
                            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1">
                                <option value="">Selecione um cliente...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="text-xs text-slate-400 uppercase font-bold">Prazo de Entrega</label>
                             <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1" />
                        </div>
                        <div>
                             <label className="text-xs text-slate-400 uppercase font-bold">Valor Total (€)</label>
                             <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2 mb-2">
                             <MapPin size={14}/> Endereço de Envio
                        </label>
                        <input 
                            type="text" 
                            value={shippingAddress} 
                            onChange={e => setShippingAddress(e.target.value)} 
                            className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white" 
                            placeholder="Rua, Número, Código Postal, Cidade..."
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Descrição / Detalhes</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white mt-1 h-24" placeholder="Detalhes do pedido..."></textarea>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                         <div className="flex justify-between items-center mb-2">
                             <label className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2">
                                 <ImageIcon size={14}/> Fotos de Inspiração
                             </label>
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1 rounded-full border border-slate-600 flex items-center gap-1 transition-colors"
                             >
                                 <Upload size={12}/> Adicionar Foto
                             </button>
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                             />
                         </div>
                         
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                             {images.map((img, index) => (
                                 <div key={index} className="relative group aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                                     <img src={img} alt={`Ref ${index}`} className="w-full h-full object-cover" />
                                     <button 
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-600/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                         <Trash2 size={12} />
                                     </button>
                                 </div>
                             ))}
                             {images.length === 0 && (
                                 <div className="col-span-full py-6 text-center text-slate-500 border border-dashed border-slate-700 rounded-lg bg-slate-800/30">
                                     Sem fotos de referência.
                                 </div>
                             )}
                         </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
                     <button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg">
                        {initialData ? 'Salvar Alterações' : 'Criar Encomenda'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrdersView;