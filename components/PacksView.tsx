
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Euro, X, Info } from 'lucide-react';
import { Pack } from '../types';

const PacksView: React.FC = () => {
  const { packs, addPack, updatePack } = useApp();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Pack>>({});

  const startEdit = (pack?: Pack) => {
    if (pack) {
      setIsEditing(pack.id);
      setFormData(pack);
    } else {
      setIsEditing('new');
      setFormData({ name: '', price: 0, conditions: '', isActive: true });
    }
  };

  const handleSave = () => {
    if (isEditing === 'new') {
      if (formData.name && formData.price) addPack(formData as Omit<Pack, 'id'>);
    } else if (isEditing) {
      updatePack(isEditing, formData);
    }
    setIsEditing(null);
    setFormData({});
  };

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div><h2 className="text-3xl font-bold gemini-gradient-text">Packs e Serviços</h2><p className="text-slate-400 mt-1">Configure seus produtos e valores padrão.</p></div>
        <button onClick={() => startEdit()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-all shadow-lg font-bold"><Plus size={20} /><span>Novo Pack</span></button>
      </div>
      
      {/* GRELHA COM ESPAÇAMENTO VERTICAL AMPLIADO (gap-y-14) */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-y-14 gap-x-8 overflow-y-auto pb-16 custom-scrollbar">
        {packs.map(pack => (
          <div key={pack.id} onClick={() => startEdit(pack)} className={`bg-slate-800/10 backdrop-blur-md border ${pack.isActive ? 'border-slate-700/30' : 'border-red-900/30 opacity-60'} rounded-3xl p-8 transition-all group hover:bg-slate-800/20 cursor-pointer hover:border-blue-500/40 shadow-xl h-fit flex flex-col min-h-[300px]`}>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:bg-blue-500/20 transition-colors"><Euro size={24} /></div>
              <button onClick={(e) => { e.stopPropagation(); startEdit(pack); }} className="text-slate-500 hover:text-white p-2 hover:bg-slate-700/50 rounded-xl transition-all"><Edit2 size={20} /></button>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3 truncate group-hover:text-blue-400 transition-colors">{pack.name}</h3>
            <p className="text-3xl font-mono font-bold text-blue-400 mb-6">€ {pack.price.toLocaleString('pt-PT')}</p>
            
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/30 mb-6 flex-1">
               <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Info size={14} />
                  <p className="text-[10px] uppercase font-black tracking-widest">Condições & Detalhes</p>
               </div>
               <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">{pack.conditions || 'Nenhuma condição especial definida para este serviço.'}</p>
            </div>
            
            <div className="mt-auto flex justify-between items-center">
               <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${pack.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {pack.isActive ? 'Em Linha' : 'Arquivado'}
               </span>
               <span className="text-xs text-slate-500 group-hover:text-blue-400 transition-colors font-bold">Ver detalhes →</span>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setIsEditing(null)}>
          <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-bold text-white">{isEditing === 'new' ? 'Novo Pack de Serviço' : 'Gerenciar Pack'}</h3>
               <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="space-y-6">
              <div><label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Nome Comercial</label><input type="text" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none text-lg" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Pack Diamante 2024" /></div>
              <div><label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Valor Base (€)</label><input type="number" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none text-lg font-mono" value={formData.price || 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
              <div><label className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2 block">Condições de Venda</label><textarea className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none h-32 resize-none text-sm leading-relaxed" value={formData.conditions || ''} onChange={e => setFormData({...formData, conditions: e.target.value})} placeholder="Liste o que está incluído, prazos de entrega, etc." /></div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30"><input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500" checked={formData.isActive ?? true} onChange={e => setFormData({...formData, isActive: e.target.checked})} /><label className="text-white text-sm font-bold">Pack disponível para novos agendamentos</label></div>
            </div>
            <div className="mt-10">
              <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-95">Salvar Configurações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacksView;
