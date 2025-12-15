import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Bell, Send, Trash2, AlertTriangle, Download, Upload, Database } from 'lucide-react';

const SettingsView: React.FC = () => {
  const { telegramConfig, updateTelegramConfig, sendTelegramMessage, resetData, events, clients, packs, importBackup } = useApp();
  const [token, setToken] = useState(telegramConfig.botToken);
  const [chatId, setChatId] = useState(telegramConfig.chatId);
  const [enabled, setEnabled] = useState(telegramConfig.enabled);
  const [isTesting, setIsTesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateTelegramConfig({ botToken: token, chatId, enabled });
    alert('Configurações salvas!');
  };

  const handleTest = async () => {
      // Temporarily update config to test current inputs even if not saved
      updateTelegramConfig({ botToken: token, chatId, enabled: true });
      
      setIsTesting(true);
      await sendTelegramMessage("🤖 <b>MIROMA:</b> Teste de notificação realizado com sucesso!");
      setIsTesting(false);
      alert('Mensagem de teste enviada. Verifique seu Telegram.');
  };

  const handleReset = () => {
      if (window.confirm("ATENÇÃO: Isso apagará TODOS os eventos e clientes criados e restaurará os dados de fábrica. Tem certeza?")) {
          resetData();
          alert("Aplicativo restaurado com sucesso.");
      }
  };

  const handleExport = () => {
      const data = {
          version: 1,
          date: new Date().toISOString(),
          events,
          clients,
          packs,
          telegramConfig
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `miroma_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
              if (event.target?.result) {
                  try {
                      const data = JSON.parse(event.target.result as string);
                      if (importBackup(data)) {
                          alert('Backup restaurado com sucesso!');
                          // Update local UI for config if it changed
                          if (data.telegramConfig) {
                              setToken(data.telegramConfig.botToken);
                              setChatId(data.telegramConfig.chatId);
                              setEnabled(data.telegramConfig.enabled);
                          }
                      } else {
                          alert('Erro ao processar arquivo de backup.');
                      }
                  } catch (err) {
                      alert('Arquivo inválido.');
                  }
              }
          };
          reader.readAsText(file);
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in pb-20">
      <h2 className="text-3xl font-bold gemini-gradient-text mb-8">Configurações</h2>

      {/* Backup Section */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                <Database size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">Dados & Backup</h3>
                <p className="text-slate-400 text-sm">Salve seus dados manualmente no PC para segurança.</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl transition-all font-semibold border border-slate-600"
             >
                 <Download size={18} />
                 Baixar Backup (Exportar)
             </button>

             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl transition-all font-semibold border border-slate-600"
             >
                 <Upload size={18} />
                 Restaurar Backup (Importar)
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center">
            * O app também salva automaticamente no seu navegador, mas recomendamos backups regulares.
        </p>
      </div>

      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <Bell size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Notificações Telegram</h3>
            <p className="text-slate-400 text-sm">Receba avisos de tarefas e sugestões no seu Telegram.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Bot Token</label>
            <input 
              type="text" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
            />
             <p className="text-xs text-slate-500 mt-1">Crie um bot com @BotFather para obter o token.</p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Chat ID</label>
            <input 
              type="text" 
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-100123456789 ou ID de usuário"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Envie uma mensagem para o bot e verifique seu ID (use @userinfobot se precisar).</p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="enableTg"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="enableTg" className="text-white cursor-pointer select-none">Ativar notificações</label>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg"
        >
            <Save size={20} />
            Salvar
        </button>

        <button 
            onClick={handleTest}
            disabled={!token || !chatId || isTesting}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Send size={20} />
            {isTesting ? 'Enviando...' : 'Testar Conexão'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/10 border border-red-900/50 rounded-2xl p-6 mt-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-200">Zona de Perigo</h3>
            <p className="text-red-400/60 text-sm">Ações irreversíveis.</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm max-w-xs">Restaurar o aplicativo para o estado original (apaga todos os dados salvos).</p>
            <button 
                onClick={handleReset}
                className="flex items-center gap-2 bg-red-900/30 hover:bg-red-600 text-red-300 hover:text-white px-4 py-2 rounded-lg transition-all border border-red-800/50 hover:border-red-500"
            >
                <Trash2 size={18} />
                Resetar Dados
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;