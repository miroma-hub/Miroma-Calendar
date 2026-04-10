
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Euro, X, Info, ShieldCheck, Zap } from 'lucide-react';
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
    <div className="p-4 md:p-6 flex flex-col md:h-full md:overflow-hidden animate-fade-in">
      <div className="flex justify-between items-center mb-10 flex-shrink-0 px-2">
        <div>
            <h2 className="text-4xl font-black gemini-gradient-text tracking-tight">Packs e Serviços</h2>
            <p className="text-slate-400 mt-1">Sua vitrine de serviços e precificação estratégica.</p>
        </div>
        <button 
            onClick={() => startEdit()} 
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-900/30 font-bold active:scale-95"
        >
            <Plus size={22} />
            <span>Novo Pack</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:gap-8 md:overflow-y-auto pb-40 custom-scrollbar pr-2 items-stretch px-2">
        {packs.map(pack => {
          const colors = ['from-blue-600 to-indigo-600', 'from-purple-600 to-pink-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600'];
          const colorClass = colors[pack.name.length % colors.length];

          return (
          <div 
            key={pack.id} 
            onClick={() => startEdit(pack)} 
            className={`bg-slate-800/10 backdrop-blur-xl border ${pack.isActive ? 'border-slate-700/40' : 'border-red-900/40 opacity-50'} rounded-[2.5rem] p-8 transition-all group hover:bg-slate-800/20 cursor-pointer hover:border-indigo-500/50 shadow-2xl flex flex-col min-h-[360px] relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${colorClass}`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 bg-gradient-to-br ${colorClass} rounded-2xl text-white shadow-lg ring-2 ring-white/10 group-hover:scale-110 transition-transform`}>
                <Euro size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest mb-2 ${pack.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {pack.isActive ? 'Ativo' : 'Arquivado'}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); startEdit(pack); }} 
                  className="text-slate-500 hover:text-white p-2 hover:bg-slate-700/50 rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors leading-tight mb-1 break-words">
                {pack.name || "Pack Sem Nome"}
              </h3>
              <div className="flex items-center gap-1.5 text-indigo-400/80">
                <Zap size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Catálogo</span>
              </div>
            </div>
            
            <p className="text-3xl font-mono font-black text-white mb-6">
              € {pack.price.toLocaleString('pt-PT')}
            </p>
            
            <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-700/30 mb-6 flex-1 flex flex-col shadow-inner">
               <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Info size={12} className="text-indigo-400" />
                  <p className="text-[9px] uppercase font-black tracking-widest">Condições</p>
               </div>
               <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 flex-1 overflow-hidden">
                 {pack.conditions || 'Sem detalhes específicos.'}
               </p>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-700/20 flex justify-between items-center">
               <div className="flex items-center gap-2 text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Tabela Oficial
               </div>
               <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Ver Mais →</span>
            </div>
          </div>
        )})}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsEditing(null)}>
          <div className="bg-slate-900 border border-slate-700/50 rounded-[3rem] w-full max-w-xl p-10 shadow-2xl animate-scale-in relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10">
               <div>
                 <h3 className="text-3xl font-black text-white">{isEditing === 'new' ? 'Novo Serviço' : 'Editar Pack'}</h3>
                 <p className="text-slate-500 text-sm mt-1">Personalize as condições deste item.</p>
               </div>
               <button onClick={() => setIsEditing(null)} className="text-slate-500 hover:text-white p-3 hover:bg-slate-800 rounded-full transition-all"><X size={28}/></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.2em] mb-2 block">Nome Comercial</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:border-indigo-500 focus:outline-none text-xl font-bold transition-all shadow-inner" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Casamento Diamante 2024" 
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.2em] mb-2 block">Valor Base (€)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:border-emerald-500 focus:outline-none text-2xl font-mono font-bold shadow-inner" 
                    value={formData.price || 0} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 block">Status</label>
                  <div className="flex items-center flex-1 gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                    <input 
                      type="checkbox" 
                      id="pack-active-check"
                      className="w-6 h-6 rounded-lg border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500" 
                      checked={formData.isActive ?? true} 
                      onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                    />
                    <label htmlFor="pack-active-check" className="text-white text-sm font-bold cursor-pointer select-none">Ativar Pack</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 block">Condições e Itens</label>
                <textarea 
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:border-indigo-500 focus:outline-none h-32 resize-none text-base leading-relaxed custom-scrollbar shadow-inner" 
                  value={formData.conditions || ''} 
                  onChange={e => setFormData({...formData, conditions: e.target.value})} 
                  placeholder="O que está incluso?" 
                />
              </div>
            </div>
            
            <div className="mt-10 flex gap-4">
              <button onClick={() => setIsEditing(null)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-lg transition-all active:scale-95">
                Cancelar
              </button>
              <button 
                onClick={handleSave} 
                className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white rounded-2xl font-bold text-xl transition-all shadow-2xl active:scale-95"
              >
                Salvar Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacksView;
