
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getAppDataTool: FunctionDeclaration = {
  name: 'getAppData',
  description: 'Recupera toda a base de dados (clientes, eventos/encomendas e packs) para realizar pesquisas, filtros, relatórios ou encontrar padrões em comum.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: { type: Type.STRING, description: 'O motivo da consulta (ex: listar clientes com algo em comum)' }
    }
  }
};

const addEventTool: FunctionDeclaration = {
  name: 'addEvent',
  description: 'Adiciona um novo evento ou encomenda. Verifica duplicados automaticamente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Título do evento' },
      start: { type: Type.STRING, description: 'Data/Hora início ISO 8601' },
      end: { type: Type.STRING, description: 'Data/Hora fim ISO 8601' },
      bookingDate: { type: Type.STRING, description: 'Data em que a reserva foi feita ou paga. Use ISO 8601.' },
      type: { type: Type.STRING, description: 'Tipo: "Trabalho", "Pessoal", "Encomenda" ou "Evento"' },
      description: { type: Type.STRING, description: 'Descrição detalhada' },
      location: { type: Type.STRING, description: 'Local (Endereço completo)' },
      lat: { type: Type.NUMBER, description: 'Latitude para o mapa' },
      lng: { type: Type.NUMBER, description: 'Longitude para o mapa' },
      clientName: { type: Type.STRING, description: 'Nome do cliente para vínculo/criação.' },
      clientContact: { type: Type.STRING, description: 'Contato do cliente' },
      isFullPayment: { type: Type.BOOLEAN, description: 'Defina como TRUE se o usuário indicar pagamento integral.' },
      packName: { type: Type.STRING, description: 'Nome do serviço/pack.' },
      price: { type: Type.NUMBER, description: 'Valor total em Euros.' }
    },
    required: ['title', 'start', 'end', 'type']
  }
};

const updateEventTool: FunctionDeclaration = {
  name: 'updateEvent',
  description: 'Edita um evento ou encomenda existente, incluindo sua localização geográfica.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchTitle: { type: Type.STRING, description: 'Título do item original' },
      newTitle: { type: Type.STRING, description: 'Novo título' },
      newPrice: { type: Type.NUMBER, description: 'Novo valor' },
      newLocation: { type: Type.STRING, description: 'Novo endereço' },
      lat: { type: Type.NUMBER, description: 'Nova latitude' },
      lng: { type: Type.NUMBER, description: 'Nova longitude' },
      newBookingDate: { type: Type.STRING, description: 'Atualizar data de reserva ISO 8601' },
      isFullPayment: { type: Type.BOOLEAN, description: 'Alterar status de pagamento integral' },
      isDone: { type: Type.BOOLEAN, description: 'Concluído' }
    },
    required: ['searchTitle']
  }
};

const deleteEventTool: FunctionDeclaration = {
  name: 'deleteEvent',
  description: 'Remove permanentemente um item da agenda através do título.',
  parameters: {
    type: Type.OBJECT,
    properties: { 
      searchTitle: { type: Type.STRING, description: 'Título aproximado do item.' } 
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
      notes: { type: Type.STRING },
      history: { type: Type.STRING, description: 'Log de conversas passadas.' }
    },
    required: ['name']
  }
};

const updateClientTool: FunctionDeclaration = {
  name: 'updateClient',
  description: 'Edita cliente e seu histórico de conversas.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchName: { type: Type.STRING },
      newName: { type: Type.STRING },
      newContact: { type: Type.STRING },
      newHistory: { type: Type.STRING, description: 'Atualiza o registro de conversas.' }
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
      searchName: { type: Type.STRING, description: 'Nome aproximado do cliente.' } 
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
      searchName: { type: Type.STRING, description: 'Nome do pack.' } 
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
      date: { type: Type.STRING, description: 'Data da receita (ISO 8601).' }
    },
    required: ['amount']
  }
};

export const tools = [
  getAppDataTool,
  addEventTool, updateEventTool, deleteEventTool, 
  addClientTool, updateClientTool, deleteClientTool, deletePackTool,
  addRevenueTool
];

export const MODEL_NAME_PRO = 'gemini-3-pro-preview';
export const MODEL_NAME_FLASH = 'gemini-3-flash-preview';

export const SYSTEM_INSTRUCTION = `
Você é MIROMA, assistente de gestão inteligente.

MAPEAMENTO E LOGÍSTICA:
- Você agora gere um MAPA LOGÍSTICO.
- Quando o usuário mencionar um local, tente obter o endereço.
- O sistema possui um módulo de geolocalização automática na aba MAPA.
- Informe ao usuário que ele pode ver os eventos geograficamente na nova aba MAPA.

Estilo: Profissional e analítico. Data atual: ${new Date().toISOString()}.
`;
