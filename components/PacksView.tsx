
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
    <div className="p-6 h-full flex flex-col animate-fade-in overflow-hidden">
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
      
      {/* Grid consistente com a aba Clientes: Auto-fill, Min-width 340px, Gap largo */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-10 overflow-y-auto pb-40 custom-scrollbar pr-2 items-stretch px-2">
        {packs.map(pack => {
          const colors = ['from-blue-600 to-indigo-600', 'from-purple-600 to-pink-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600'];
          const colorClass = colors[pack.name.length % colors.length];

          return (
          <div 
            key={pack.id} 
            onClick={() => startEdit(pack)} 
            className={`bg-slate-800/10 backdrop-blur-xl border ${pack.isActive ? 'border-slate-700/40' : 'border-red-900/40 opacity-50'} rounded-[2.5rem] p-8 transition-all group hover:bg-slate-800/20 cursor-pointer hover:border-indigo-500/50 shadow-2xl flex flex-col min-h-[380px] relative overflow-hidden`}
          >
            {/* Barra de gradiente no topo para consistência estética */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${colorClass}`}></div>
            
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 bg-gradient-to-br ${colorClass} rounded-2xl text-white shadow-lg ring-2 ring-white/10 group-hover:scale-110 transition-transform`}>
                <Euro size={28} />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] mb-2 ${pack.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {pack.isActive ? 'Em Linha' : 'Arquivado'}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); startEdit(pack); }} 
                  className="text-slate-500 hover:text-white p-2 hover:bg-slate-700/50 rounded-xl transition-all"
                >
                  <Edit2 size={20} />
                </button>
              </div>
            </div>
            
            {/* Nome do Pack com visibilidade máxima */}
            <div className="mb-4">
              <h3 className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors leading-tight mb-2">
                {pack.name || "Sem Nome"}
              </h3>
              <div className="flex items-center gap-2 text-indigo-400/80">
                <Zap size={14} />
                <span className="text-xs font-black uppercase tracking-widest">Serviço Premium</span>
              </div>
            </div>
            
            <p className="text-4xl font-mono font-black text-white mb-8">
              € {pack.price.toLocaleString('pt-PT')}
            </p>
            
            {/* Bloco de Condições */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/30 mb-8 flex-1 flex flex-col shadow-inner">
               <div className="flex items-center gap-2 mb-3 text-slate-500">
                  <Info size={14} className="text-indigo-400" />
                  <p className="text-[10px] uppercase font-black tracking-widest">Escopo do Serviço</p>
               </div>
               <p className="text-sm text-slate-300 leading-relaxed line-clamp-4 flex-1">
                 {pack.conditions || 'Este pack não possui condições especiais detalhadas.'}
               </p>
            </div>
            
            <div className="mt-auto pt-6 border-t border-slate-700/20 flex justify-between items-center">
               <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  Valores Atuais
               </div>
               <span className="text-xs text-indigo-400 font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Configurar →</span>
            </div>
          </div>
        )})}
      </div>

      {/* Modal de Edição Refinado */}
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
            
            <div className="space-y-8">
              <div>
                <label className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.2em] mb-3 block">Nome Comercial</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 text-white focus:border-indigo-500 focus:outline-none text-xl font-bold transition-all placeholder:text-slate-700 shadow-inner" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Casamento Diamante 2024" 
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.2em] mb-3 block">Valor Base (€)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 text-white focus:border-emerald-500 focus:outline-none text-2xl font-mono font-bold shadow-inner" 
                    value={formData.price || 0} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-3 block">Status</label>
                  <div className="flex items-center flex-1 gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                    <input 
                      type="checkbox" 
                      id="pack-active-check"
                      className="w-6 h-6 rounded-lg border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" 
                      checked={formData.isActive ?? true} 
                      onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                    />
                    <label htmlFor="pack-active-check" className="text-white text-sm font-bold cursor-pointer select-none">Ativar Pack</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-3 block">Condições e O que Inclui</label>
                <textarea 
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-white focus:border-indigo-500 focus:outline-none h-40 resize-none text-base leading-relaxed custom-scrollbar shadow-inner" 
                  value={formData.conditions || ''} 
                  onChange={e => setFormData({...formData, conditions: e.target.value})} 
                  placeholder="Liste os itens inclusos, tempo de entrega, número de fotos, etc..." 
                />
              </div>
            </div>
            
            <div className="mt-12 flex gap-4">
              <button onClick={() => setIsEditing(null)} className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-lg transition-all active:scale-95">
                Cancelar
              </button>
              <button 
                onClick={handleSave} 
                className="flex-[2] py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white rounded-2xl font-bold text-xl transition-all shadow-2xl active:scale-95 shadow-indigo-900/40"
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
