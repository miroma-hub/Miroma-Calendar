
import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Users, Settings, Sparkles, Package, Tag, Wallet, CalendarRange, Briefcase, X } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onOpenAI: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onOpenAI, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
    { id: 'billing', icon: Wallet, label: 'Faturamento' },
    { id: 'events_view', icon: CalendarRange, label: 'Eventos' },
    { id: 'orders', icon: Package, label: 'Encomendas' },
    { id: 'clients', icon: Users, label: 'Clientes' },
    { id: 'team', icon: Briefcase, label: 'Equipe' },
    { id: 'packs', icon: Tag, label: 'Packs' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden animate-fade-in" 
          onClick={onClose}
        />
      )}
      
      <div className={`fixed md:relative top-0 left-0 z-50 w-72 md:w-64 h-screen bg-slate-900/95 md:bg-slate-900/40 backdrop-blur-md border-r border-slate-700/30 flex flex-col flex-shrink-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between md:justify-start">
          <span className="font-bold text-2xl md:text-3xl tracking-tight gemini-gradient-text truncate">MIROMA</span>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-100 hover:border hover:border-slate-700/50 border border-transparent'
                  }`}
              >
                <item.icon size={22} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-100'} />
                <span className={`font-medium text-base ${isActive ? 'text-blue-400' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-700/30">
          <button 
            onClick={onOpenAI}
            className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl py-4 px-4 flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20 border border-white/10 backdrop-blur-sm"
          >
            <Sparkles size={20} className="animate-pulse" />
            <span className="font-semibold text-base">Assistente AI</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
