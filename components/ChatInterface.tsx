
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2, Mic, Image as ImageIcon, FileText, Paperclip, Zap } from 'lucide-react';
import { Content, Part } from '@google/genai';
import { ChatMessage, EventType, CalendarEvent, Client, Pack, Employee } from '../types';
import { ai, MODEL_NAME_PRO, MODEL_NAME_FLASH, SYSTEM_INSTRUCTION, tools } from '../services/gemini';
import { useApp } from '../context/AppContext';
import ReactMarkdown from 'react-markdown';
import { isSameDay, parseISO } from 'date-fns';

interface ChatInterfaceProps {
  onClose: () => void;
  isOpen: boolean;
}

declare global {
  interface window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, isOpen }) => {
  const { addEvent, updateEvent, deleteEvent, addClient, updateClient, deleteClient, deletePack, addEmployee, updateEmployee, deleteEmployee, clients, events, packs, employees } = useApp();
  
  const currentClientsRef = useRef<Client[]>([]);
  const currentEventsRef = useRef<CalendarEvent[]>([]);
  const currentPacksRef = useRef<Pack[]>([]);
  const currentEmployeesRef = useRef<Employee[]>([]);

  useEffect(() => {
    currentClientsRef.current = clients;
    currentEventsRef.current = events;
    currentPacksRef.current = packs;
    currentEmployeesRef.current = employees;
  }, [clients, events, packs, employees]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'model',
      text: 'Olá. Sou MIROMA. Como posso ajudar a gerir sua equipe e agenda hoje? Posso sugerir funcionários ideais para seus eventos baseando-me na localização deles.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFlashFallback, setIsFlashFallback] = useState(false);
  const [useProModel, setUseProModel] = useState(false);
  const [attachment, setAttachment] = useState<{ data: string; mimeType: string; name: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }
    startRecognitionLoop();
  };

  const startRecognitionLoop = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (recognitionRef.current) recognitionRef.current.abort();
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false; 
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        if (transcript) setInput(prev => (prev ? prev + ' ' + transcript.trim() : transcript.trim()));
      };
      recognition.onerror = () => {};
      recognition.onend = () => {
        if (isListening) restartTimerRef.current = setTimeout(() => startRecognitionLoop(), 300);
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) { setIsListening(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setAttachment({ 
          data: base64Data, 
          mimeType: file.type || 'application/octet-stream', 
          name: file.name 
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeTool = async (functionCall: any) => {
    const { name, args } = functionCall;
    let result = '';

    try {
      switch (name) {
        case 'getAppData': {
          const q = args.searchQuery?.toLowerCase();
          if (q) {
            result = JSON.stringify({
              clients: currentClientsRef.current.filter(c => c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q)),
              events: currentEventsRef.current.filter(e => e.title.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q) || e.start.includes(q)),
              packs: currentPacksRef.current.filter(p => p.name.toLowerCase().includes(q)),
              employees: currentEmployeesRef.current.filter(e => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
            });
          } else {
            result = JSON.stringify({
              clients: currentClientsRef.current,
              events: currentEventsRef.current,
              packs: currentPacksRef.current,
              employees: currentEmployeesRef.current
            });
          }
          break;
        }

        case 'addEmployee': {
          const newEmp = addEmployee({
            name: args.name,
            role: args.role,
            address: args.address,
            rateType: args.rateType,
            rateValue: args.rateValue,
            hasCar: args.hasCar || false,
            skills: args.skills || '',
            availabilityNotes: '',
            internalNotes: args.internalNotes || '',
            aiMemory: args.aiMemory || ''
          });
          currentEmployeesRef.current = [...currentEmployeesRef.current, newEmp];
          result = `Sucesso: Funcionário ${newEmp.name} cadastrado como ${newEmp.role}.`;
          break;
        }

        case 'deleteEmployee': {
          const search = args.name.toLowerCase();
          const target = currentEmployeesRef.current.find(e => e.name.toLowerCase().includes(search));
          if (!target) return "Funcionário não encontrado.";
          deleteEmployee(target.id);
          currentEmployeesRef.current = currentEmployeesRef.current.filter(e => e.id !== target.id);
          result = `Funcionário ${target.name} removido com sucesso da equipe.`;
          break;
        }

        case 'updateEmployee': {
          const search = args.searchName.toLowerCase();
          const target = currentEmployeesRef.current.find(e => e.name.toLowerCase().includes(search));
          if (!target) return "Funcionário não encontrado.";
          updateEmployee(target.id, {
            role: args.newRole || target.role,
            rateValue: args.newRateValue || target.rateValue,
            aiMemory: args.newAiMemory || target.aiMemory,
            skills: args.newSkills || target.skills
          });
          result = `Funcionário ${target.name} atualizado.`;
          break;
        }

        case 'assignStaffToEvent': {
          const eventSearch = args.eventTitle.toLowerCase();
          const targetEvent = currentEventsRef.current.find(e => e.title.toLowerCase().includes(eventSearch));
          if (!targetEvent) return "Evento ou Encomenda não encontrada.";

          const idsToAssign: string[] = [];
          args.employeeNames.forEach((name: string) => {
            const emp = currentEmployeesRef.current.find(e => e.name.toLowerCase().includes(name.toLowerCase()));
            if (emp) idsToAssign.push(emp.id);
          });

          if (idsToAssign.length === 0) return "Nenhum funcionário encontrado com os nomes fornecidos.";
          
          updateEvent(targetEvent.id, { assignedEmployeeIds: idsToAssign });
          result = `Sucesso: Atribuídos ${idsToAssign.length} funcionários ao evento "${targetEvent.title}".`;
          break;
        }

        case 'addEvent': {
          const searchTitle = args.title.trim().toLowerCase();
          const isDuplicate = currentEventsRef.current.some(e => 
            e.title.toLowerCase().trim().includes(searchTitle) && 
            isSameDay(parseISO(e.start), parseISO(args.start))
          );

          if (isDuplicate) return "Aviso: Já existe um evento similar nesta data.";

          let typeEnum = EventType.EVENT;
          if (args.type === 'Trabalho') typeEnum = EventType.WORK;
          else if (args.type === 'Encomenda') typeEnum = EventType.ORDER;
          else if (args.type === 'Pessoal') typeEnum = EventType.PERSONAL;
          
          let targetClientId: string | undefined = undefined;
          if (args.clientName) {
            const normalizedName = args.clientName.trim().toLowerCase();
            const existingClient = currentClientsRef.current.find(c => c.name.toLowerCase().trim() === normalizedName);
            
            if (existingClient) {
                targetClientId = existingClient.id;
            } else {
                const createdClient = addClient({
                    name: args.clientName.trim(),
                    contact: args.clientContact || '',
                    notes: 'Criado via AI',
                    conversationHistory: ''
                });
                targetClientId = createdClient.id;
                currentClientsRef.current = [...currentClientsRef.current, createdClient];
            }
          }

          const newEvent = addEvent({
            title: args.title.trim(),
            start: args.start,
            end: args.end,
            type: typeEnum,
            description: args.description,
            location: args.location,
            clientId: targetClientId,
            packName: args.packName,
            agreedPrice: args.price,
            isFullPayment: args.isFullPayment || false,
            bookingDate: args.bookingDate || new Date().toISOString(),
            assignedEmployeeIds: args.assignedEmployeeIds || []
          });
          
          currentEventsRef.current = [...currentEventsRef.current, newEvent];
          result = `Sucesso: Item "${newEvent.title}" agendado.`;
          break;
        }

        case 'updateClient': {
            const search = args.searchName.trim().toLowerCase();
            const clientToUpdate = currentClientsRef.current.find(c => c.name.toLowerCase().trim().includes(search));
            if (!clientToUpdate) return "Cliente não encontrado.";
            updateClient(clientToUpdate.id, {
                name: args.newName || clientToUpdate.name,
                contact: args.newContact || clientToUpdate.contact,
                conversationHistory: args.newHistory || clientToUpdate.conversationHistory
            });
            result = `Ficha de "${clientToUpdate.name}" atualizada.`;
            break;
        }

        case 'addClient': {
            const normalized = args.name.trim().toLowerCase();
            const existing = currentClientsRef.current.find(c => c.name.toLowerCase().trim() === normalized);
            if (existing) return `Aviso: O cliente "${existing.name}" já existe na base.`;
            const newClient = addClient({ name: args.name.trim(), contact: args.contact || '', notes: args.notes || '', conversationHistory: args.history || '' });
            currentClientsRef.current = [...currentClientsRef.current, newClient];
            result = `Cliente "${newClient.name}" cadastrado com histórico de contexto.`;
            break;
        }

        case 'updateEvent': {
            const search = args.searchTitle.trim().toLowerCase();
            const eventToUpdate = currentEventsRef.current.find(e => e.title.toLowerCase().trim().includes(search));
            if (!eventToUpdate) return "Item não encontrado.";
            updateEvent(eventToUpdate.id, {
                title: args.newTitle || eventToUpdate.title,
                agreedPrice: args.newPrice || eventToUpdate.agreedPrice,
                bookingDate: args.newBookingDate || eventToUpdate.bookingDate,
                isFullPayment: args.isFullPayment !== undefined ? args.isFullPayment : eventToUpdate.isFullPayment,
                isDone: args.isDone !== undefined ? args.isDone : eventToUpdate.isDone
            });
            result = `Item "${eventToUpdate.title}" atualizado.`;
            break;
        }

        case 'deleteEvent': {
            const search = args.searchTitle.trim().toLowerCase();
            const eventToDelete = currentEventsRef.current.find(e => e.title.toLowerCase().trim().includes(search));
            if (!eventToDelete) return "Não encontrei o item para deletar.";
            deleteEvent(eventToDelete.id);
            currentEventsRef.current = currentEventsRef.current.filter(e => e.id !== eventToDelete.id);
            result = `Sucesso: "${eventToDelete.title}" removido.`;
            break;
        }

        case 'deleteClient': {
            const search = args.searchName.trim().toLowerCase();
            const clientToDelete = currentClientsRef.current.find(c => c.name.toLowerCase().trim().includes(search));
            if (!clientToDelete) return "Cliente não encontrado.";
            deleteClient(clientToDelete.id);
            currentClientsRef.current = currentClientsRef.current.filter(c => c.id !== clientToDelete.id);
            result = `Cliente "${clientToDelete.name}" removido.`;
            break;
        }

        case 'deletePack': {
            const search = args.searchName.trim().toLowerCase();
            const packToDelete = currentPacksRef.current.find(p => p.name.toLowerCase().trim().includes(search));
            if (!packToDelete) return "Pack não encontrado.";
            deletePack(packToDelete.id);
            currentPacksRef.current = currentPacksRef.current.filter(p => p.id !== packToDelete.id);
            result = `Pack "${packToDelete.name}" removido.`;
            break;
        }

        case 'addRevenue': {
            const revenueDate = args.date || new Date().toISOString();
            const newRev = addEvent({
                title: args.description || 'Receita Avulsa',
                start: revenueDate, 
                end: revenueDate, 
                type: EventType.WORK,
                packName: 'Ajuste Financeiro', 
                agreedPrice: args.amount, 
                isFullPayment: true,
                bookingDate: revenueDate
            });
            currentEventsRef.current = [...currentEventsRef.current, newRev];
            result = `€${args.amount} adicionados ao faturamento.`;
            break;
        }

        default: result = "Ação não mapeada.";
      }
    } catch (error) { result = `Erro: ${error}`; }
    return result;
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isProcessing) return;
    if (isListening) { setIsListening(false); if (recognitionRef.current) recognitionRef.current.stop(); }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input || (attachment ? `Enviou um arquivo: ${attachment.name}` : ''), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = input;
    const currentAttachment = attachment;
    
    setInput('');
    setAttachment(null);
    setIsProcessing(true);
    setIsFlashFallback(false);

    const history: Content[] = messages.slice(-10).map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text || ' ' }]
    }));

    const messageParts: (string | Part)[] = [currentInput || (currentAttachment ? "Analise este arquivo e considere os históricos dos clientes na base de dados." : "Olá")];
    if (currentAttachment) {
      messageParts.push({ inlineData: { data: currentAttachment.data, mimeType: currentAttachment.mimeType } });
    }

    const processWithModel = async (modelName: string) => {
      const chat = ai.chats.create({
        model: modelName,
        config: { systemInstruction: SYSTEM_INSTRUCTION, tools: [{ functionDeclarations: tools }] },
        history: history
      });

      let response = await chat.sendMessage({ message: messageParts as any });
      let toolCalls = response.functionCalls;

      while (toolCalls && toolCalls.length > 0) {
        const functionResponses = [];
        for (const call of toolCalls) {
            const res = await executeTool(call);
            functionResponses.push({ id: call.id, name: call.name, response: { result: res } });
        }
        const nextStep = await chat.sendMessage({ message: functionResponses.map(fr => ({ functionResponse: fr })) });
        response = nextStep;
        toolCalls = response.functionCalls;
      }
      return response;
    };

    try {
      const modelToUse = useProModel ? MODEL_NAME_PRO : MODEL_NAME_FLASH;
      const response = await processWithModel(modelToUse);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text || "Pronto.", timestamp: new Date() }]);
    } catch (proError: any) {
      console.warn("Modelo principal falhou. Failover para Flash...", proError);
      setIsFlashFallback(true);
      try {
        const response = await processWithModel(MODEL_NAME_FLASH);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text || "Pronto.", timestamp: new Date() }]);
      } catch (flashError: any) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Erro: ${flashError.message}`, timestamp: new Date() }]);
      }
    } finally { 
      setIsProcessing(false); 
      setIsFlashFallback(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col animate-slide-in-right">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
            <Sparkles className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold gemini-gradient-text">MIROMA AI</h2>
            <button 
              onClick={() => setUseProModel(!useProModel)} 
              title={useProModel ? "Modelo PRO Ativo (Mais custo, precisão máxima)" : "Modelo FLASH Ativo (Mais rápido e barato)"}
              className={`ml-2 p-1.5 rounded-full transition-colors ${useProModel ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500 hover:text-slate-400'}`}
            >
              <Zap size={14} />
            </button>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-slate-700 text-white' : 'bg-slate-800 border border-slate-700 text-slate-100'}`}>
              <div className="prose prose-invert prose-sm break-words"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
            </div>
          </div>
        ))}
        {isProcessing && (
            <div className="text-xs text-slate-500 flex items-center gap-2 px-2 animate-pulse">
                <Loader2 className="animate-spin" size={14}/> 
                {isFlashFallback ? <span className="text-orange-400">Failover: Gemini Flash em uso...</span> : "Consultando memória e registros..."}
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-700 flex-shrink-0">
        {attachment && (
          <div className="mb-3 relative inline-flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-blue-500/30 shadow-lg animate-fade-in">
             <div className="h-10 w-10 bg-slate-700 rounded-lg flex items-center justify-center text-blue-400"><FileText size={20} /></div>
             <div className="flex flex-col max-w-[200px]"><span className="text-xs font-bold text-white truncate">{attachment.name}</span></div>
             <button onClick={() => setAttachment(null)} className="ml-2 bg-slate-700 hover:bg-red-600 text-white rounded-full p-1 transition-colors"><X size={12}/></button>
          </div>
        )}
        <div className="gemini-border p-[1px] rounded-3xl">
          <div className="bg-slate-900 rounded-3xl flex items-center px-2 py-1">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder={isListening ? "Pode falar..." : "Escreva ou anexe histórico..."} 
              className="flex-1 bg-transparent border-none focus:ring-0 text-white px-3 py-3 text-sm" 
            />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-blue-400"><Paperclip size={20} /></button>
            <button onClick={toggleListening} className={`p-2 rounded-full transition-all ${isListening ? 'bg-blue-600 animate-pulse text-white' : 'text-slate-400'}`}><Mic size={20} /></button>
            <button onClick={handleSend} disabled={!input.trim() && !attachment} className="p-2 text-blue-400 disabled:text-slate-600"><Send size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
