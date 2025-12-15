import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2, Mic, Image as ImageIcon, Paperclip, Trash2 } from 'lucide-react';
import { GoogleGenAI, Content, Part } from '@google/genai';
import { ChatMessage, EventType } from '../types';
import { ai, MODEL_NAME, SYSTEM_INSTRUCTION, tools } from '../services/gemini';
import { useApp } from '../context/AppContext';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  onClose: () => void;
  isOpen: boolean;
}

// Add SpeechRecognition type definition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, isOpen }) => {
  const { addEvent, updateEvent, deleteEvent, addClient, updateClient, clients, events } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'model',
      text: 'Olá. Sou MIROMA. Como posso ajudar a organizar sua agenda, editar eventos ou gerir clientes hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Image Upload State
  const [attachment, setAttachment] = useState<{ data: string; mimeType: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // --- SPEECH RECOGNITION SETUP ---
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // --- IMAGE HANDLING ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract base64 data and mime type
        const matches = base64String.match(/^data:(.*);base64,(.*)$/);
        if (matches && matches.length === 3) {
            setAttachment({
                mimeType: matches[1],
                data: matches[2]
            });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // TOOL EXECUTION LOGIC
  const executeTool = async (functionCall: any) => {
    const { name, args } = functionCall;
    console.log(`Executing tool: ${name}`, args);

    let result = '';

    try {
      switch (name) {
        case 'addEvent': {
          // Correctly map string type from AI to Enum
          let typeEnum = EventType.PERSONAL;
          if (args.type === 'Trabalho') typeEnum = EventType.WORK;
          else if (args.type === 'Encomenda') typeEnum = EventType.ORDER;
          else if (args.type === 'Evento') typeEnum = EventType.EVENT;
          
          // Client Logic: Find or Create
          let targetClientId: string | undefined = undefined;
          let newClientCreated = false;

          if (args.clientName) {
            const existingClient = clients.find(c => c.name.toLowerCase().includes(args.clientName.toLowerCase()));
            
            if (existingClient) {
                targetClientId = existingClient.id;
            } else {
                // Auto-create client
                const createdClient = addClient({
                    name: args.clientName,
                    contact: args.clientContact || '',
                    notes: args.clientNotes || 'Criado automaticamente via agendamento'
                });
                targetClientId = createdClient.id;
                newClientCreated = true;
            }
          }

          // eslint-disable-next-line no-case-declarations
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
            bookingDate: new Date().toISOString()
          });
          
          result = `Evento criado com sucesso: ${newEvent.title} em ${newEvent.start}. Local: ${newEvent.location || 'Não definido'}. Valor: €${newEvent.agreedPrice || 0}.`;
          if (newClientCreated) {
              result += ` (Novo cliente "${args.clientName}" foi cadastrado automaticamente).`;
          }
          break;
        }

        case 'updateEvent': {
            const search = args.searchTitle.toLowerCase();
            // Fuzzy search for event
            const eventToUpdate = events.find(e => e.title.toLowerCase().includes(search));
            
            if (!eventToUpdate) {
                result = `Não encontrei nenhum evento ou faturamento com o título similar a "${args.searchTitle}".`;
            } else {
                updateEvent(eventToUpdate.id, {
                    title: args.newTitle || eventToUpdate.title,
                    start: args.newStart || eventToUpdate.start,
                    end: args.newEnd || eventToUpdate.end,
                    location: args.newLocation !== undefined ? args.newLocation : eventToUpdate.location,
                    agreedPrice: args.newPrice !== undefined ? args.newPrice : eventToUpdate.agreedPrice,
                    description: args.newDescription || eventToUpdate.description,
                    isDone: args.isDone !== undefined ? args.isDone : eventToUpdate.isDone
                });
                result = `Item "${eventToUpdate.title}" atualizado com sucesso.`;
                if (args.newPrice !== undefined) {
                    result += ` Novo valor: €${args.newPrice}.`;
                }
            }
            break;
        }

        case 'deleteEvent': {
            const search = args.searchTitle.toLowerCase();
            const eventToDelete = events.find(e => e.title.toLowerCase().includes(search));
            
            if (!eventToDelete) {
                result = `Não encontrei nenhum item com o título similar a "${args.searchTitle}" para remover.`;
            } else {
                deleteEvent(eventToDelete.id);
                result = `Item "${eventToDelete.title}" removido com sucesso da agenda e do faturamento.`;
            }
            break;
        }
        
        case 'addClient': {
          // eslint-disable-next-line no-case-declarations
          const newClient = addClient({
            name: args.name,
            contact: args.contact || '',
            notes: args.notes || ''
          });
          result = `Cliente cadastrado: ${newClient.name}.`;
          break;
        }

        case 'updateClient': {
            const search = args.searchName.toLowerCase();
            const clientToUpdate = clients.find(c => c.name.toLowerCase().includes(search));

            if (!clientToUpdate) {
                result = `Não encontrei nenhum cliente com nome similar a "${args.searchName}".`;
            } else {
                updateClient(clientToUpdate.id, {
                    name: args.newName || clientToUpdate.name,
                    contact: args.newContact || clientToUpdate.contact,
                    notes: args.newNotes || clientToUpdate.notes
                });
                result = `Ficha do cliente "${clientToUpdate.name}" atualizada.`;
            }
            break;
        }

        case 'addRevenue': {
            const date = args.date || new Date().toISOString();
            addEvent({
                title: args.description || 'Receita Avulsa',
                start: date,
                end: date,
                type: EventType.WORK,
                packName: 'Ajuste Financeiro', // Special flag for billing
                agreedPrice: args.amount,
                description: 'Faturamento adicionado manualmente via AI.',
                bookingDate: date,
                isDone: true
            });
            result = `Adicionado faturamento de €${args.amount} com sucesso.`;
            break;
        }

        case 'getPacks':
            result = "Consulte a aba Packs para ver detalhes.";
            break;

        case 'getSchedule':
          result = `Agenda atual tem ${events.length} eventos. Próximos eventos: ${events.slice(0, 3).map(e => `${e.title} (${e.start})`).join(', ')}`;
          break;

        default:
          result = 'Ferramenta não implementada ou desconhecida.';
      }
    } catch (error) {
      result = `Erro ao executar ação: ${error}`;
    }

    return result;
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isProcessing) return;

    // Create User Message Display
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input + (attachment ? ' [Imagem Enviada]' : ''),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentAttachment = attachment; // Capture current ref
    setAttachment(null); // Clear UI
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsProcessing(true);
    
    // Keep focus on input for power users
    setTimeout(() => {
        inputRef.current?.focus();
    }, 10);

    try {
      // Build history for context
      const history: Content[] = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text || ' ' }] 
      }));

      const chat = ai.chats.create({
        model: MODEL_NAME,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: tools }]
        },
        history: history
      });

      // Construct message Payload (Text + Image if exists)
      let messagePayload: string | Part[] = input;
      
      if (currentAttachment) {
          messagePayload = [
              { text: input || "Analise esta imagem." },
              {
                  inlineData: {
                      mimeType: currentAttachment.mimeType,
                      data: currentAttachment.data
                  }
              }
          ];
      }

      let response = await chat.sendMessage({ message: messagePayload as any });
      
      const toolCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);

      if (toolCalls && toolCalls.length > 0) {
        const functionResponses = [];
        
        for (const call of toolCalls) {
            if(call){
                const result = await executeTool(call);
                functionResponses.push({
                    id: call.id,
                    name: call.name,
                    response: { result: result }
                });
            }
        }

        // Send tool results back to model using the correct object structure
        response = await chat.sendMessage({
            message: functionResponses.map(fr => ({
                functionResponse: fr
            }))
        });
      }

      const modelText = response.text || "Ação realizada.";

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: modelText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Desculpe, encontrei um erro ao processar seu pedido. " + error,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      // Ensure focus returns to input after processing as well
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-400" size={20} />
          <h2 className="text-lg font-bold gemini-gradient-text">MIROMA AI</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-slate-700 text-white rounded-br-none' 
                  : 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-slate-700 text-slate-100 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                  <Sparkles size={10} /> MIROMA
                </div>
              )}
              <div className="prose prose-invert prose-sm leading-relaxed">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-2 text-slate-400">
               <Loader2 className="animate-spin" size={16} />
               <span className="text-xs">Processando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview Area for Image */}
      {attachment && (
          <div className="px-4 pb-2">
              <div className="relative inline-block">
                  <img src={`data:${attachment.mimeType};base64,${attachment.data}`} alt="Upload preview" className="h-20 w-auto rounded-lg border border-slate-600 shadow-md" />
                  <button onClick={removeAttachment} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-500">
                      <X size={12} />
                  </button>
              </div>
          </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className={`gemini-border p-[2px] rounded-3xl bg-slate-800 ${isListening ? 'ring-2 ring-red-500/50' : ''}`}>
          <div className="bg-slate-900 rounded-3xl flex items-center px-2 py-1">
            
            {/* Attachment Button */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect} 
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
                title="Adicionar imagem"
            >
                <ImageIcon size={20} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Ouvindo..." : "Digite ou fale..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white px-2 py-3 placeholder-slate-500 focus:outline-none"
            />
            
            {/* Mic Button */}
            <button 
              onClick={toggleListening}
              className={`p-2 rounded-full transition-all mx-1 ${
                isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic size={20} />
            </button>

            {/* Send Button */}
            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !attachment) || isProcessing}
              className={`p-2 rounded-full transition-colors ${
                (input.trim() || attachment) && !isProcessing ? 'bg-blue-600 text-white hover:bg-blue-500' : 'text-slate-600 bg-slate-800'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          MIROMA pode cometer erros. Verifique as informações importantes.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;