
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, MapPin, Euro, Car, Camera, Image as ImageIcon, Briefcase, X, MessageSquareQuote, FileText, ChevronRight, User, Sparkles, Trash2, Palette, Aperture } from 'lucide-react';
import { Employee, EmployeeRole } from '../types';

const TeamView: React.FC = () => {
  const { employees, addEmployee, updateEmployee } = useApp();
  const [filter, setFilter] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(filter.toLowerCase()) || 
    e.skills.toLowerCase().includes(filter.toLowerCase()) ||
    e.role.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSave = (id: string, data: Partial<Employee>) => {
    if (id === 'new') {
        addEmployee(data as Omit<Employee, 'id'>);
    } else {
        updateEmployee(id, data);
    }
    setSelectedEmp(null);
  };

  const getRoleBadge = (role: EmployeeRole) => {
    switch(role) {
      case 'illustrator': 
        return { 
          label: 'Ilustrador', 
          icon: Palette, 
          color: 'text-purple-400', 
          bg: 'bg-purple-500/10', 
          border: 'border-purple-500/30',
          glow: 'shadow-purple-900/20'
        };
      case 'photographer': 
        return { 
          label: 'Fotógrafo', 
          icon: Aperture, 
          color: 'text-cyan-400', 
          bg: 'bg-cyan-500/10', 
          border: 'border-cyan-500/30',
          glow: 'shadow-cyan-900/20'
        };
      default: 
        return { 
          label: 'Geral', 
          icon: User, 
          color: 'text-slate-400', 
          bg: 'bg-slate-500/10', 
          border: 'border-slate-500/30',
          glow: ''
        };
    }
  };

  return (
    <div className="p-4 md:p-6 flex flex-col md:h-full md:overflow-hidden">
      <div className="flex justify-between items-center mb-10 flex-shrink-0 px-2">
        <div>
          <h2 className="text-4xl font-black gemini-gradient-text tracking-tight">Equipe</h2>
          <p className="text-slate-400 text-sm mt-1">Gestão de talentos categorizada por especialidade.</p>
        </div>
        <button 
            onClick={() => setSelectedEmp({ id: 'new', name: '', role: 'illustrator', address: '', rateType: 'event', rateValue: 0, hasCar: false, skills: '', availabilityNotes: '', internalNotes: '' } as Employee)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl transition-all shadow-2xl font-bold active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Funcionário</span>
        </button>
      </div>

      <div className="mb-10 px-2 flex-shrink-0">
        <div className="gemini-border p-[1px] rounded-2xl max-w-2xl">
          <div className="relative bg-[#0f172a] rounded-2xl overflow-hidden">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-500" size={22} />
            <input 
              type="text" 
              placeholder="Buscar por nome, habilidade ou cargo..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-transparent py-5 pl-16 pr-6 text-white focus:outline-none transition-colors text-lg placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 md:gap-8 md:overflow-y-auto pb-32 custom-scrollbar pr-2 items-stretch px-2">
        {filteredEmployees.map(emp => {
          const badge = getRoleBadge(emp.role);
          return (
            <div key={emp.id} onClick={() => setSelectedEmp(emp)} className={`bg-slate-800/10 backdrop-blur-md border ${badge.border} rounded-[2rem] p-8 hover:bg-slate-800/30 transition-all cursor-pointer group relative overflow-hidden shadow-xl flex flex-col min-h-[350px] animate-fade-in ${badge.glow}`}>
              
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  {emp.photo ? (
                    <img src={emp.photo} alt={emp.name} className={`h-20 w-20 rounded-2xl object-cover shadow-lg border-2 ${badge.border} group-hover:border-blue-500 transition-colors`} />
                  ) : (
                    <div className={`h-20 w-20 ${badge.bg} rounded-2xl flex items-center justify-center text-3xl font-bold ${badge.color} group-hover:bg-blue-600 transition-colors`}>
                      {emp.name.charAt(0)}
                    </div>
                  )}
                  {emp.hasCar && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-lg shadow-lg">
                      <Car size={12} />
                    </div>
                  )}
                </div>
                <div className="text-right pr-4">
                  <span className={`text-[9px] px-2 py-1 rounded-lg border ${badge.border} ${badge.bg} ${badge.color} font-black uppercase tracking-widest flex items-center gap-1 mb-2`}>
                    <badge.icon size={10} />
                    {badge.label}
                  </span>
                  <span className="text-xl font-mono font-bold text-blue-400 block">€{emp.rateValue}<span className="text-[10px] text-slate-500 ml-1">/{emp.rateType === 'hour' ? 'hr' : 'ev'}</span></span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{emp.name}</h3>
              
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-6">
                  <MapPin size={12} className="text-blue-500/50" />
                  <span className="truncate">{emp.address || 'Morada não definida'}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {emp.skills.split(',').map((skill, idx) => (
                  <span key={idx} className="text-[9px] bg-slate-900/50 text-slate-400 px-2 py-1 rounded-lg border border-slate-700/50 font-black uppercase tracking-widest">{skill.trim()}</span>
                ))}
              </div>
              
              <div className="mt-auto pt-6 border-t border-slate-700/20 flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                 <div className="flex items-center gap-2"><Sparkles size={12} className="text-purple-400" /> Memória IA</div>
                 <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {selectedEmp && (
        <EmployeeModal 
          employee={selectedEmp} 
          onClose={() => setSelectedEmp(null)} 
          onSave={handleSave}
        />
      )}
    </div>
  );
};

const EmployeeModal = ({ employee, onClose, onSave }: { employee: Employee, onClose: () => void, onSave: (id: string, data: Partial<Employee>) => void }) => {
    const [formData, setFormData] = useState<Employee>(employee);
    const [activeTab, setActiveTab] = useState<'info' | 'ai' | 'portfolio'>('info');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setFormData({...formData, photo: reader.result as string});
        reader.readAsDataURL(file);
      }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-[3rem] w-full max-w-4xl max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
                
                <div className={`h-40 bg-gradient-to-r ${formData.role === 'illustrator' ? 'from-purple-700 to-indigo-800' : formData.role === 'photographer' ? 'from-cyan-700 to-blue-800' : 'from-slate-700 to-slate-800'} p-10 flex items-end relative flex-shrink-0 transition-colors`}>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-8 right-8 text-white/70 hover:text-white bg-black/20 p-2.5 rounded-full backdrop-blur-sm transition-all hover:scale-110 z-10"><X size={24}/></button>
                    <div className="flex items-center gap-8 translate-y-12 w-full">
                        <div className="relative group flex-shrink-0">
                          <div className="h-32 w-32 bg-slate-900 rounded-3xl p-1 shadow-2xl overflow-hidden">
                             {formData.photo ? (
                               <img src={formData.photo} className="w-full h-full object-cover rounded-[1.2rem]" />
                             ) : (
                               <div className="w-full h-full rounded-[1.2rem] bg-slate-800 flex items-center justify-center text-5xl font-bold text-white">
                                  {formData.name?.charAt(0) || <User size={40}/>}
                               </div>
                             )}
                             <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                             </button>
                             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                          </div>
                        </div>
                        <div className="mb-4 flex-1">
                             <div className="flex gap-4 items-center mb-1">
                                <select 
                                  value={formData.role} 
                                  onChange={e => setFormData({...formData, role: e.target.value as EmployeeRole})}
                                  className="bg-black/20 text-white/80 text-[10px] uppercase font-black tracking-widest rounded-lg px-3 py-1 border border-white/10 outline-none"
                                >
                                  <option value="illustrator" className="bg-slate-900">Ilustrador</option>
                                  <option value="photographer" className="bg-slate-900">Fotógrafo</option>
                                  <option value="other" className="bg-slate-900">Outro</option>
                                </select>
                             </div>
                             <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder="Nome Completo" 
                                className="text-4xl font-black text-white bg-transparent outline-none drop-shadow-lg placeholder-white/30 border-b border-transparent focus:border-white/20 transition-all w-full" 
                             />
                        </div>
                    </div>
                </div>

                <div className="px-10 pt-20 flex-shrink-0">
                    <div className="flex gap-8 border-b border-slate-800">
                        {['info', 'ai', 'portfolio'].map(tab => (
                          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 px-1 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                            {tab === 'info' ? 'Cadastro' : tab === 'ai' ? 'Memória AI' : 'Portfólio'}
                          </button>
                        ))}
                    </div>
                </div>

                <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                            <div className="space-y-6">
                                <div><label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 block">Morada (GPS AI)</label>
                                <div className="flex items-center gap-2 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30">
                                  <MapPin size={18} className="text-slate-500" />
                                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rua, Cidade, Portugal" className="bg-transparent text-white outline-none w-full" />
                                </div></div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Valor</label>
                                  <input type="number" value={formData.rateValue} onChange={e => setFormData({...formData, rateValue: Number(e.target.value)})} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30 text-white w-full font-mono" /></div>
                                  <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tipo</label>
                                  <select value={formData.rateType} onChange={e => setFormData({...formData, rateType: e.target.value as any})} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30 text-white w-full outline-none">
                                    <option value="event">Por Evento</option>
                                    <option value="hour">Por Hora</option>
                                  </select></div>
                                </div>

                                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30">
                                  <input type="checkbox" id="hasCar" checked={formData.hasCar} onChange={e => setFormData({...formData, hasCar: e.target.checked})} className="w-6 h-6 rounded-lg bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500" />
                                  <label htmlFor="hasCar" className="text-white font-bold flex items-center gap-2 cursor-pointer"><Car size={18} /> Possui Carro Próprio</label>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Habilidades (Tags)</label>
                                <textarea value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="Pintura, Desenho, Balões..." className="w-full h-24 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30 text-white outline-none resize-none" /></div>
                                
                                <div><label className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 block">Notas Internas (Prós/Contras)</label>
                                <textarea value={formData.internalNotes} onChange={e => setFormData({...formData, internalNotes: e.target.value})} className="w-full h-32 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30 text-white outline-none resize-none" /></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="bg-purple-900/5 border border-purple-500/20 p-8 rounded-[2rem]">
                                <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Sparkles size={20} className="text-purple-400"/> Memória Compartilhada MIROMA</h4>
                                <p className="text-slate-500 text-sm mb-6">Acordos específicos, restrições e feedbacks para a AI considerar em sugestões.</p>
                                <textarea value={formData.aiMemory} onChange={e => setFormData({...formData, aiMemory: e.target.value})} className="w-full min-h-[300px] bg-slate-950/40 border border-slate-700/50 rounded-2xl p-6 text-slate-300 outline-none font-mono text-sm leading-relaxed" placeholder="A AI recordará estas notas..." />
                            </div>
                        </div>
                    )}

                    {activeTab === 'portfolio' && (
                        <div className="animate-fade-in flex flex-col items-center justify-center h-64 text-slate-500 italic">
                            <ImageIcon size={48} className="mb-4 opacity-10" />
                            <p>Galeria em desenvolvimento.</p>
                        </div>
                    )}
                </div>

                <div className="p-10 border-t border-slate-800/50 flex justify-end items-center bg-slate-900/50 flex-shrink-0">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSave(employee.id, formData); }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl active:scale-95"
                    >
                        Confirmar Ficha
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TeamView;
