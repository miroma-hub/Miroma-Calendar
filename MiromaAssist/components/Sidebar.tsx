import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Calendar, Users, Settings, Sparkles, Package, Tag, Wallet, CalendarRange } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onOpenAI: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onOpenAI }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
    { id: 'billing', icon: Wallet, label: 'Faturamento' },
    { id: 'events_view', icon: CalendarRange, label: 'Eventos' },
    { id: 'orders', icon: Package, label: 'Encomendas' },
    { id: 'clients', icon: Users, label: 'Clientes' },
    { id: 'packs', icon: Tag, label: 'Packs' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="w-20 md:w-64 h-screen bg-slate-900/40 backdrop-blur-md border-r border-slate-700/30 flex flex-col flex-shrink-0 transition-all duration-300 z-20">
      <div className="p-6 flex items-center justify-center md:justify-start">
        <span className="font-bold text-xl md:text-3xl tracking-tight gemini-gradient-text truncate">MIROMA</span>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-3">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-100 hover:border hover:border-slate-700/50 border border-transparent'
                }`}
            >
              <item.icon size={22} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-100'} />
              <span className={`hidden md:block font-medium ${isActive ? 'text-blue-400' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/30">
        <button 
          onClick={onOpenAI}
          className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 border border-white/10 backdrop-blur-sm"
        >
          <Sparkles size={20} className="animate-pulse" />
          <span className="hidden md:block font-semibold">Assistente AI</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
