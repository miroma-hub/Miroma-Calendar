
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2, Mic, Image as ImageIcon } from 'lucide-react';
import { Content, Part } from '@google/genai';
import { ChatMessage, EventType, CalendarEvent } from '../types';
import { ai, MODEL_NAME, SYSTEM_INSTRUCTION, tools } from '../services/gemini';
import { useApp } from '../context/AppContext';
import ReactMarkdown from 'react-markdown';
import { isSameDay, parseISO } from 'date-fns';

interface ChatInterfaceProps {
  onClose: () => void;
  isOpen: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, isOpen }) => {
  const { addEvent, updateEvent, deleteEvent, addClient, updateClient, deleteClient, deletePack, clients, events, packs } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'model',
      text: 'Olá. Sou MIROMA. Como posso ajudar a gerir sua agenda e faturamento hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachment, setAttachment] = useState<{ data: string; mimeType: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }
    startRecognitionLoop();
  };

  const startRecognitionLoop = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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

  const executeTool = async (functionCall: any) => {
    const { name, args } = functionCall;
    let result = '';

    try {
      switch (name) {
        case 'addEvent': {
          const isDuplicate = events.some(e => 
            e.title.toLowerCase().includes(args.title.toLowerCase()) && 
            isSameDay(parseISO(e.start), parseISO(args.start))
          );

          if (isDuplicate) {
             return "Erro: Já existe um evento similar nesta data. Operação cancelada para evitar duplicidade.";
          }

          let typeEnum = EventType.EVENT;
          if (args.type === 'Trabalho') typeEnum = EventType.WORK;
          else if (args.type === 'Encomenda') typeEnum = EventType.ORDER;
          else if (args.type === 'Pessoal') typeEnum = EventType.PERSONAL;
          
          let targetClientId: string | undefined = undefined;
          if (args.clientName) {
            const existingClient = clients.find(c => c.name.toLowerCase() === args.clientName.toLowerCase());
            if (existingClient) {
                targetClientId = existingClient.id;
            } else {
                const createdClient = addClient({
                    name: args.clientName,
                    contact: args.clientContact || '',
                    notes: 'Criado via AI'
                });
                targetClientId = createdClient.id;
            }
          }

          const newEvent = addEvent({
            title: args.title,
            start: args.start,
            end: args.end,
            type: typeEnum,
            description: args.description,
            location: args.location,
            clientId: targetClientId,
            packName: args.packName,
            agreedPrice: args.price,
            isFullPayment: args.isFullPayment || false,
            bookingDate: args.bookingDate || new Date().toISOString()
          });
          
          result = `Sucesso: Item "${newEvent.title}" agendado. Faturamento registrado para ${parseISO(newEvent.bookingDate).toLocaleDateString('pt-PT')}.`;
          break;
        }

        case 'updateEvent': {
            const eventToUpdate = events.find(e => e.title.toLowerCase().includes(args.searchTitle.toLowerCase()));
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
            const eventToDelete = events.find(e => e.title.toLowerCase().includes(args.searchTitle.toLowerCase()));
            if (!eventToDelete) return "Não encontrei nenhum evento ou encomenda com esse título para deletar.";
            deleteEvent(eventToDelete.id);
            result = `Sucesso: O item "${eventToDelete.title}" foi removido da agenda.`;
            break;
        }

        case 'addClient': {
            if (clients.some(c => c.name.toLowerCase() === args.name.toLowerCase())) {
                return "Erro: Já existe um cliente com este nome.";
            }
            const newClient = addClient({ name: args.name, contact: args.contact || '', notes: args.notes || '' });
            result = `Cliente "${newClient.name}" cadastrado.`;
            break;
        }

        case 'updateClient': {
            const clientToUpdate = clients.find(c => c.name.toLowerCase().includes(args.searchName.toLowerCase()));
            if (!clientToUpdate) return "Cliente não encontrado.";
            updateClient(clientToUpdate.id, {
                name: args.newName || clientToUpdate.name,
                contact: args.newContact || clientToUpdate.contact
            });
            result = `Ficha de "${clientToUpdate.name}" atualizada.`;
            break;
        }

        case 'deleteClient': {
            const clientToDelete = clients.find(c => c.name.toLowerCase().includes(args.searchName.toLowerCase()));
            if (!clientToDelete) return "Não encontrei nenhum cliente com esse nome para deletar.";
            deleteClient(clientToDelete.id);
            result = `Sucesso: A ficha do cliente "${clientToDelete.name}" foi removida.`;
            break;
        }

        case 'deletePack': {
            const packToDelete = packs.find(p => p.name.toLowerCase().includes(args.searchName.toLowerCase()));
            if (!packToDelete) return "Não encontrei esse pack para deletar.";
            deletePack(packToDelete.id);
            result = `Sucesso: O pack "${packToDelete.name}" foi removido.`;
            break;
        }

        case 'addRevenue': {
            const revenueDate = args.date || new Date().toISOString();
            addEvent({
                title: args.description || 'Receita Avulsa',
                start: revenueDate, 
                end: revenueDate, 
                type: EventType.WORK,
                packName: 'Ajuste Financeiro', 
                agreedPrice: args.amount, 
                isFullPayment: true,
                bookingDate: revenueDate
            });
            result = `€${args.amount} adicionados ao faturamento de ${parseISO(revenueDate).toLocaleDateString('pt-PT')}.`;
            break;
        }

        default: result = "Ação não mapeada.";
      }
    } catch (error) { result = `Erro: ${error}`; }
    return result;
  };

  const handleSend = async () => {
    if (!input.trim() && !attachment || isProcessing) return;
    if (isListening) { setIsListening(false); if (recognitionRef.current) recognitionRef.current.stop(); }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentAttachment = attachment;
    
    setInput('');
    setAttachment(null);
    setIsProcessing(true);

    try {
      const history: Content[] = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text || ' ' }]
      }));

      const chat = ai.chats.create({
        model: MODEL_NAME,
        config: { systemInstruction: SYSTEM_INSTRUCTION, tools: [{ functionDeclarations: tools }] },
        history: history
      });

      let response = await chat.sendMessage({ message: currentInput });
      let toolCalls = response.functionCalls;

      if (toolCalls && toolCalls.length > 0) {
        const functionResponses = [];
        for (const call of toolCalls) {
            const res = await executeTool(call);
            functionResponses.push({ id: call.id, name: call.name, response: { result: res } });
        }
        response = await chat.sendMessage({ message: functionResponses.map(fr => ({ functionResponse: fr })) });
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text || "Concluído.", timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Erro na conexão.", timestamp: new Date() }]);
    } finally { setIsProcessing(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col animate-slide-in-right">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2"><Sparkles className="text-blue-400" size={20} /><h2 className="text-lg font-bold gemini-gradient-text">MIROMA AI</h2></div>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-slate-800 border border-slate-700'}`}>
              <div className="prose prose-invert prose-sm"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
            </div>
          </div>
        ))}
        {isProcessing && <div className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="animate-spin" size={14}/> Pensando...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="gemini-border p-[1px] rounded-3xl">
          <div className="bg-slate-900 rounded-3xl flex items-center px-2 py-1">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isListening ? "Ouvindo..." : "Escreva ou fale..."} className="flex-1 bg-transparent border-none focus:ring-0 text-white px-3 py-3" />
            <button onClick={toggleListening} className={`p-2 rounded-full ${isListening ? 'bg-blue-600 animate-pulse' : 'text-slate-400'}`}><Mic size={20} /></button>
            <button onClick={handleSend} className="p-2 text-blue-400"><Send size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
