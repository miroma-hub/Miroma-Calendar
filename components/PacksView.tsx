
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
    <div className="p-6 h-full flex flex-col animate-fade-in overflow-hidden">
      <div className="flex justify-between items-center mb-10 flex-shrink-0 px-2">
        <div>
            <h2 className="text-4xl font-black gemini-gradient-text tracking-tight">Packs e Serviços</h2>
            <p className="text-slate-400 mt-1">Configure seus produtos e tabelas de valores padrão.</p>
        </div>
        <button onClick={() => startEdit()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all shadow-2xl font-bold active:scale-95 shadow-blue-900/20">
            <Plus size={20} />
            <span>Novo Pack</span>
        </button>
      </div>
      
      {/* Grid consistente com a aba Clientes */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8 overflow-y-auto pb-32 custom-scrollbar pr-2 items-stretch px-2">
        {packs.map(pack => (
          <div key={pack.id} onClick={() => startEdit(pack)} className={`bg-slate-800/10 backdrop-blur-md border ${pack.isActive ? 'border-slate-700/30' : 'border-red-900/30 opacity-60'} rounded-[2rem] p-8 transition-all group hover:bg-slate-800/20 cursor-pointer hover:border-blue-500/40 shadow-xl flex flex-col min-h-[320px] relative`}>
            
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:bg-blue-500/20 transition-colors shadow-lg ring-1 ring-blue-500/20"><Euro size={28} /></div>
              <button onClick={(e) => { e.stopPropagation(); startEdit(pack); }} className="text-slate-600 hover:text-white p-2.5 hover:bg-slate-700/50 rounded-xl transition-all"><Edit2 size={22} /></button>
            </div>
            
            {/* Nome do Pack - Garantindo visibilidade total sem truncate agressivo */}
            <h3 className="text-2xl font-bold text-white mb-2 break-words group-hover:text-blue-400 transition-colors leading-tight">
              {pack.name || "Pack Sem Nome"}
            </h3>
            
            <p className="text-3xl font-mono font-bold text-blue-400 mb-8">€ {pack.price.toLocaleString('pt-PT')}</p>
            
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-700/30 mb-8 flex-1 flex flex-col">
               <div className="flex items-center gap-2 mb-3 text-slate-600">
                  <Info size={14} />
                  <p className="text-[10px] uppercase font-black tracking-widest">Incluso & Condições</p>
               </div>
               <p className="text-sm text-slate-400 leading-relaxed line-clamp-4 flex-1">{pack.conditions || 'Sem condições especiais cadastradas.'}</p>
            </div>
            
            <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-700/20">
               <span className={`text-[10px] px-4 py-1.5 rounded-xl font-black uppercase tracking-widest ${pack.isActive ? 'bg-green-900/20 text-green-400 border border-green-500/20' : 'bg-red-900/20 text-red-400 border border-red-500/20'}`}>
                  {pack.isActive ? 'Ativo' : 'Pausado'}
               </span>
               <span className="text-xs text-slate-600 group-hover:text-blue-400 transition-colors font-black uppercase tracking-widest">Detalhes →</span>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsEditing(null)}>
          <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-3xl font-black text-white">{isEditing === 'new' ? 'Novo Pack' : 'Configuração'}</h3>
               <button onClick={() => setIsEditing(null)} className="text-slate-500 hover:text-white p-2.5 hover:bg-slate-800 rounded-full transition-all"><X size={28}/></button>
            </div>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3 block">Nome do Serviço</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:border-blue-500 focus:outline-none text-xl font-bold" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Casamento Diamante" 
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3 block">Valor Base (€)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:border-blue-500 focus:outline-none text-xl font-mono font-bold" 
                  value={formData.price || 0} 
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3 block">Condições e Itens</label>
                <textarea 
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:border-blue-500 focus:outline-none h-32 resize-none text-base leading-relaxed" 
                  value={formData.conditions || ''} 
                  onChange={e => setFormData({...formData, conditions: e.target.value})} 
                  placeholder="O que está incluso neste pack?" 
                />
              </div>
              <div className="flex items-center gap-4 p-5 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-lg border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500" 
                  checked={formData.isActive ?? true} 
                  onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                />
                <label className="text-white font-bold">Pack disponível para novos contratos</label>
              </div>
            </div>
            <div className="mt-12">
              <button onClick={handleSave} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white rounded-2xl font-bold text-xl transition-all shadow-2xl active:scale-95 shadow-blue-900/40">Salvar Pack</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacksView;
