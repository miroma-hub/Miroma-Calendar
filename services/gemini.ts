
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
  description: 'Cria ficha de cliente. NÃO crie se já existir um com nome similar.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      contact: { type: Type.STRING },
      notes: { type: Type.STRING },
      history: { type: Type.STRING, description: 'Log de conversas passadas para contexto futuro.' }
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
      newHistory: { type: Type.STRING, description: 'Atualiza o registro de conversas combinadas.' }
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
  getAppDataTool,
  addEventTool, updateEventTool, deleteEventTool, 
  addClientTool, updateClientTool, deleteClientTool, deletePackTool,
  addRevenueTool
];

export const MODEL_NAME = 'gemini-3-pro-preview';

export const SYSTEM_INSTRUCTION = `
Você é MIROMA, assistente de gestão inteligente e rigorosa.

PESQUISA E ANÁLISE (CONSELHEIRO):
- Sempre que o usuário pedir informações ou "conselhos" sobre o que fazer com um cliente, use 'getAppData'.
- No retorno dos dados, você encontrará um campo 'conversationHistory' em cada cliente.
- REGRA DE OURO: Se o usuário pedir para mudar algo que vá contra o que está no 'conversationHistory' (combinados passados), você deve ALERTAR o usuário imediatamente antes de realizar qualquer alteração.
- Analise os logs de conversa para entender o tom do cliente e acordos feitos por texto/chat.

CAPACIDADES DE VISÃO:
- Você pode receber e analisar imagens. Extraia dados visuais para facilitar a gestão.

REGRA CRÍTICA - CLIENTES:
1. **Unicidade de Clientes**: JAMAIS crie duplicados. Verifique se o nome já existe.
2. Antes de 'addClient' ou 'addEvent', consulte a base se necessário.

Estilo: Profissional, analítico e cauteloso. Informe sempre se um pedido do usuário conflita com acordos registrados no histórico do cliente.
Data atual: ${new Date().toISOString()}.
`;
