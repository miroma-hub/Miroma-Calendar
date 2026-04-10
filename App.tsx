
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClientList from './components/ClientList';
import PacksView from './components/PacksView';
import OrdersView from './components/OrdersView';
import EventsListView from './components/EventsListView';
import TeamView from './components/TeamView';
import SettingsView from './components/SettingsView';
import ChatInterface from './components/ChatInterface';
import BillingView from './components/BillingView';
import BackgroundCanvas from './components/BackgroundCanvas';
import SplashScreen from './components/SplashScreen';
import { AppProvider, useApp } from './context/AppContext';
import { ViewState } from './types';
import { Menu } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'clients': return <ClientList />;
      case 'team': return <TeamView />;
      case 'packs': return <PacksView />;
      case 'orders': return <OrdersView />;
      case 'events_view': return <EventsListView />;
      case 'billing': return <BillingView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 relative">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <BackgroundCanvas />
      <div className={`relative z-10 flex h-full w-full transition-opacity duration-1000 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
          <Sidebar 
            currentView={currentView} 
            onChangeView={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }} 
            onOpenAI={() => { setIsChatOpen(true); setIsMobileMenuOpen(false); }}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
          <main className="flex-1 overflow-hidden relative flex flex-col backdrop-blur-sm bg-slate-900/10">
          <header className="h-16 border-b border-slate-800/30 flex items-center px-4 justify-between md:hidden bg-slate-900/20 flex-shrink-0">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-400 hover:text-white p-2 -ml-2 transition-colors">
                <Menu size={26} />
              </button>
              <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">MIROMA</span>
              <button onClick={() => setIsChatOpen(true)} className="text-blue-400 text-sm font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">Chat AI</button>
          </header>
          <div className="flex-1 overflow-y-auto md:overflow-hidden custom-scrollbar relative">
              {renderView()}
          </div>
          <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
