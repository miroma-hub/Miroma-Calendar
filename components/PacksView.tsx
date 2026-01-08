import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Archive, Euro } from 'lucide-react';
import { Pack } from '../types';

const PacksView: React.FC = () => {
  const { packs, addPack, updatePack } = useApp();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  // Local state for form
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
      if (formData.name && formData.price) {
        addPack(formData as Omit<Pack, 'id'>);
      }
    } else if (isEditing) {
      updatePack(isEditing, formData);
    }
    setIsEditing(null);
    setFormData({});
  };

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold gemini-gradient-text">Packs e Serviços</h2>
          <p className="text-slate-400 mt-1">Gerencie preços atuais. Alterações aqui não afetam contratos passados.</p>
        </div>
        <button 
          onClick={() => startEdit()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-all shadow-lg"
        >
          <Plus size={18} />
          <span>Novo Pack</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map(pack => (
          <div 
            key={pack.id} 
            onClick={() => startEdit(pack)}
            className={`bg-slate-800/20 backdrop-blur-sm border ${pack.isActive ? 'border-slate-700/30' : 'border-red-900/30 opacity-60'} rounded-2xl p-6 transition-all group hover:bg-slate-800/30 cursor-pointer hover:scale-[1.01] hover:border-blue-500/30 shadow-lg`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Euro size={20} />
              </div>
              <button onClick={(e) => { e.stopPropagation(); startEdit(pack); }} className="text-slate-500 hover:text-white transition-colors">
                <Edit2 size={18} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{pack.name}</h3>
            <p className="text-2xl font-bold text-blue-400 mb-4">€ {pack.price.toLocaleString('pt-PT')}</p>
            
            <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/30 mb-4">
               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Condições</p>
               <p className="text-sm text-slate-300">{pack.conditions}</p>
            </div>

            <div className="flex justify-between items-center text-sm">
                <span className={pack.isActive ? 'text-green-400' : 'text-red-400'}>
                    {pack.isActive ? 'Ativo' : 'Arquivado'}
                </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Edit/Create */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl backdrop-blur-xl animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-4">
              {isEditing === 'new' ? 'Criar Novo Pack' : 'Detalhes do Pack'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Nome do Pack</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Preço (€)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1"
                  value={formData.price || 0}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Condições / Descrição</label>
                <textarea 
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 text-white mt-1 h-24"
                  value={formData.conditions || ''}
                  onChange={e => setFormData({...formData, conditions: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2">
                 <input 
                    type="checkbox" 
                    checked={formData.isActive ?? true} 
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                 />
                 <label className="text-white text-sm">Pack Ativo para novos contratos</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsEditing(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacksView;