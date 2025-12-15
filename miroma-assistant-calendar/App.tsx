import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClientList from './components/ClientList';
import PacksView from './components/PacksView';
import OrdersView from './components/OrdersView';
import EventsListView from './components/EventsListView';
import SettingsView from './components/SettingsView';
import ChatInterface from './components/ChatInterface';
import BillingView from './components/BillingView';
import BackgroundCanvas from './components/BackgroundCanvas';
import SplashScreen from './components/SplashScreen';
import { AppProvider } from './context/AppContext';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'clients': return <ClientList />;
      case 'packs': return <PacksView />;
      case 'orders': return <OrdersView />;
      case 'events_view': return <EventsListView />;
      case 'billing': return <BillingView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <AppProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 relative">
        {/* Splash Screen Overlay */}
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

        <BackgroundCanvas />
        
        <div className={`relative z-10 flex h-full w-full transition-opacity duration-1000 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
            <Sidebar 
            currentView={currentView} 
            onChangeView={setCurrentView} 
            onOpenAI={() => setIsChatOpen(true)}
            />
            
            <main className="flex-1 overflow-hidden relative flex flex-col backdrop-blur-sm bg-slate-900/10">
            <header className="h-16 border-b border-slate-800/30 flex items-center px-8 justify-between md:hidden bg-slate-900/20">
                <span className="font-bold">MIROMA</span>
                <button onClick={() => setIsChatOpen(true)} className="text-blue-400">Chat</button>
            </header>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {renderView()}
            </div>

            <ChatInterface 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
            />
            </main>
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
