
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const addEventTool: FunctionDeclaration = {
  name: 'addEvent',
  description: 'Adiciona um novo evento ou encomenda. Verifica duplicados automaticamente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Título do evento' },
      start: { type: Type.STRING, description: 'Data/Hora início ISO 8601' },
      end: { type: Type.STRING, description: 'Data/Hora fim ISO 8601' },
      bookingDate: { type: Type.STRING, description: 'Data em que a reserva foi feita ou paga (importante para faturamento). Use ISO 8601.' },
      type: { type: Type.STRING, description: 'Tipo: "Trabalho", "Pessoal", "Encomenda" ou "Evento"' },
      description: { type: Type.STRING, description: 'Descrição detalhada' },
      location: { type: Type.STRING, description: 'Local' },
      clientName: { type: Type.STRING, description: 'Nome do cliente para vínculo/criação.' },
      clientContact: { type: Type.STRING, description: 'Contato do cliente' },
      isFullPayment: { type: Type.BOOLEAN, description: 'Defina como TRUE se o usuário indicar pagamento integral (100%, totalidade, tudo pago).' },
      packName: { type: Type.STRING, description: 'Nome do serviço/pack.' },
      price: { type: Type.NUMBER, description: 'Valor total em Euros.' }
    },
    required: ['title', 'start', 'end', 'type']
  }
};

const updateEventTool: FunctionDeclaration = {
  name: 'updateEvent',
  description: 'Edita um evento ou encomenda existente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchTitle: { type: Type.STRING, description: 'Título do item original' },
      newTitle: { type: Type.STRING, description: 'Novo título' },
      newPrice: { type: Type.NUMBER, description: 'Novo valor' },
      newBookingDate: { type: Type.STRING, description: 'Atualizar data de reserva/pagamento inicial ISO 8601' },
      isFullPayment: { type: Type.BOOLEAN, description: 'Alterar status de pagamento integral' },
      isDone: { type: Type.BOOLEAN, description: 'Concluído' }
    },
    required: ['searchTitle']
  }
};

const deleteEventTool: FunctionDeclaration = {
  name: 'deleteEvent',
  description: 'Remove permanentemente um item (evento ou encomenda) da agenda através do título.',
  parameters: {
    type: Type.OBJECT,
    properties: { 
      searchTitle: { type: Type.STRING, description: 'Título aproximado do evento ou encomenda a remover.' } 
    },
    required: ['searchTitle']
  }
};

const addClientTool: FunctionDeclaration = {
  name: 'addClient',
  description: 'Cria ficha de cliente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      contact: { type: Type.STRING },
      notes: { type: Type.STRING }
    },
    required: ['name']
  }
};

const updateClientTool: FunctionDeclaration = {
  name: 'updateClient',
  description: 'Edita cliente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchName: { type: Type.STRING },
      newName: { type: Type.STRING },
      newContact: { type: Type.STRING }
    },
    required: ['searchName']
  }
};

const deleteClientTool: FunctionDeclaration = {
  name: 'deleteClient',
  description: 'Remove permanentemente um cliente através do nome.',
  parameters: {
    type: Type.OBJECT,
    properties: { 
      searchName: { type: Type.STRING, description: 'Nome aproximado do cliente a remover.' } 
    },
    required: ['searchName']
  }
};

const deletePackTool: FunctionDeclaration = {
  name: 'deletePack',
  description: 'Remove um pack de serviços cadastrado.',
  parameters: {
    type: Type.OBJECT,
    properties: { 
      searchName: { type: Type.STRING, description: 'Nome do pack a remover.' } 
    },
    required: ['searchName']
  }
};

const addRevenueTool: FunctionDeclaration = {
  name: 'addRevenue',
  description: 'Adiciona receita manual.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER },
      description: { type: Type.STRING },
      date: { type: Type.STRING, description: 'Data da receita (ISO 8601). O padrão é hoje.' }
    },
    required: ['amount']
  }
};

export const tools = [
  addEventTool, updateEventTool, deleteEventTool, 
  addClientTool, updateClientTool, deleteClientTool, deletePackTool,
  addRevenueTool
];

export const MODEL_NAME = 'gemini-3-pro-preview';

export const SYSTEM_INSTRUCTION = `
Você é MIROMA, assistente de gestão inteligente altamente precisa.

CONTROLE TEMPORAL E FATURAMENTO:
- **Data de Reserva (bookingDate)**: É CRUCIAL para o faturamento. Se o usuário disser "agendei isso em Janeiro para acontecer em Dezembro", o bookingDate deve ser em Janeiro e a data do evento (start) em Dezembro.
- Se o usuário não especificar a data de reserva, use a data atual (${new Date().toISOString()}).
- O faturamento é impactado por estas datas: 50% na data da reserva e 50% na data do evento (start). Exceto se for Pagamento Integral ou Encomenda (100% na reserva).

CAPACIDADES DE EXCLUSÃO:
- Você PODE e DEVE deletar registros se solicitado.
- Tente encontrar o item pelo título ou nome aproximado.

DIRETRIZES DE INTELIGÊNCIA:
1. **Pagamento Integral**: Detecte "pago por inteiro", "100%", "total" para marcar 'isFullPayment'.
2. **Prevenção de Duplicados**: Antes de criar, verifique se o item já existe na conversa ou no contexto.
3. **Moeda**: Euro (€).

Estilo: Profissional, conciso e focado em organização financeira.
Data atual: ${new Date().toISOString()}.
`;
