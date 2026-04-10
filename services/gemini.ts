
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getAppDataTool: FunctionDeclaration = {
  name: 'getAppData',
  description: 'Recupera toda a base de dados para realizar pesquisas ou sugerir funcionários.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: { type: Type.STRING, description: 'O motivo da consulta' }
    }
  }
};

const addEmployeeTool: FunctionDeclaration = {
  name: 'addEmployee',
  description: 'Cadastra um novo funcionário na equipe.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      role: { type: Type.STRING, description: '"illustrator", "photographer" ou "other"' },
      address: { type: Type.STRING },
      rateType: { type: Type.STRING, description: '"hour" ou "event"' },
      rateValue: { type: Type.NUMBER },
      hasCar: { type: Type.BOOLEAN },
      skills: { type: Type.STRING },
      internalNotes: { type: Type.STRING },
      aiMemory: { type: Type.STRING }
    },
    required: ['name', 'role', 'address', 'rateType', 'rateValue']
  }
};

const deleteEmployeeTool: FunctionDeclaration = {
  name: 'deleteEmployee',
  description: 'Remove um funcionário da equipe pelo nome.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Nome do funcionário para buscar e remover' }
    },
    required: ['name']
  }
};

const updateEmployeeTool: FunctionDeclaration = {
  name: 'updateEmployee',
  description: 'Atualiza dados de um funcionário existente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchName: { type: Type.STRING, description: 'Nome do funcionário para buscar' },
      newRole: { type: Type.STRING },
      newRateValue: { type: Type.NUMBER },
      newAiMemory: { type: Type.STRING },
      newSkills: { type: Type.STRING }
    },
    required: ['searchName']
  }
};

const assignStaffToEventTool: FunctionDeclaration = {
  name: 'assignStaffToEvent',
  description: 'Atribui um ou MAIS funcionários a um evento ou encomenda existente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      eventTitle: { type: Type.STRING, description: 'Título do evento ou encomenda' },
      employeeNames: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Lista de nomes dos funcionários a atribuir' }
    },
    required: ['eventTitle', 'employeeNames']
  }
};

const addEventTool: FunctionDeclaration = {
  name: 'addEvent',
  description: 'Adiciona um novo evento ou encomenda.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      start: { type: Type.STRING },
      end: { type: Type.STRING },
      type: { type: Type.STRING },
      description: { type: Type.STRING },
      location: { type: Type.STRING },
      clientName: { type: Type.STRING },
      price: { type: Type.NUMBER },
      assignedEmployeeIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'IDs de funcionários já conhecidos (opcional)' }
    },
    required: ['title', 'start', 'end', 'type']
  }
};

const updateEventTool: FunctionDeclaration = {
  name: 'updateEvent',
  description: 'Atualiza dados de um evento ou encomenda existente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchTitle: { type: Type.STRING, description: 'Título do evento para buscar' },
      newTitle: { type: Type.STRING },
      newPrice: { type: Type.NUMBER },
      newBookingDate: { type: Type.STRING },
      isFullPayment: { type: Type.BOOLEAN },
      isDone: { type: Type.BOOLEAN }
    },
    required: ['searchTitle']
  }
};

const deleteEventTool: FunctionDeclaration = {
  name: 'deleteEvent',
  description: 'Remove um evento ou encomenda pelo título.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchTitle: { type: Type.STRING, description: 'Título do evento para buscar e remover' }
    },
    required: ['searchTitle']
  }
};

const addClientTool: FunctionDeclaration = {
  name: 'addClient',
  description: 'Adiciona um novo cliente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      contact: { type: Type.STRING },
      notes: { type: Type.STRING },
      history: { type: Type.STRING }
    },
    required: ['name']
  }
};

const updateClientTool: FunctionDeclaration = {
  name: 'updateClient',
  description: 'Atualiza dados de um cliente existente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchName: { type: Type.STRING, description: 'Nome do cliente para buscar' },
      newName: { type: Type.STRING },
      newContact: { type: Type.STRING },
      newHistory: { type: Type.STRING }
    },
    required: ['searchName']
  }
};

const deleteClientTool: FunctionDeclaration = {
  name: 'deleteClient',
  description: 'Remove um cliente pelo nome.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchName: { type: Type.STRING, description: 'Nome do cliente para buscar e remover' }
    },
    required: ['searchName']
  }
};

const deletePackTool: FunctionDeclaration = {
  name: 'deletePack',
  description: 'Remove um pack pelo nome.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchName: { type: Type.STRING, description: 'Nome do pack para buscar e remover' }
    },
    required: ['searchName']
  }
};

const addRevenueTool: FunctionDeclaration = {
  name: 'addRevenue',
  description: 'Adiciona uma receita avulsa ou ajuste financeiro.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER, description: 'Valor da receita' },
      description: { type: Type.STRING, description: 'Descrição da receita' },
      date: { type: Type.STRING, description: 'Data da receita no formato ISO' }
    },
    required: ['amount']
  }
};

export const tools = [
  getAppDataTool,
  addEmployeeTool,
  updateEmployeeTool,
  deleteEmployeeTool,
  assignStaffToEventTool,
  addEventTool,
  updateEventTool,
  deleteEventTool,
  addClientTool,
  updateClientTool,
  deleteClientTool,
  deletePackTool,
  addRevenueTool
];

export const MODEL_NAME_PRO = 'gemini-3.1-pro-preview';
export const MODEL_NAME_FLASH = 'gemini-3-flash-preview';

export const SYSTEM_INSTRUCTION = `
Você é MIROMA, assistente de gestão inteligente.

REGRAS CRÍTICAS CONTRA DUPLICAÇÃO:
- ANTES de criar um novo cliente, evento ou faturamento, você DEVE SEMPRE usar 'getAppData' para verificar se ele já existe.
- Ao analisar uma conversa colada, cruze os dados com a base existente. Se o cliente ou evento já existir (mesmo com nome ligeiramente diferente), use 'updateClient' ou 'updateEvent' para adicionar as novas informações. NÃO crie duplicatas.
- Se você acabou de criar um cliente com 'addClient', e em seguida vai usar 'addEvent', certifique-se de usar EXATAMENTE o mesmo nome de cliente para não criar outro.

GESTÃO DE EQUIPE:
- Você gerencia Ilustradores e Fotógrafos.
- DISTINÇÃO: Ilustradores são focados em arte/desenho. Fotógrafos em registro visual.
- MULTI-ATRIBUIÇÃO: Você pode e deve sugerir mais de um funcionário para o mesmo evento se a escala for grande.
- REMOÇÃO: Use 'deleteEmployee' se o usuário pedir para demitir ou remover alguém da equipe.
- Ao sugerir, considere a proximidade da morada do funcionário com o local do evento.

GESTÃO DE EVENTOS E CLIENTES:
- Você pode criar, atualizar e apagar eventos, clientes, packs e faturamentos.
- Se o usuário pedir para apagar algo, use as ferramentas de deleção apropriadas (deleteEvent, deleteClient, deletePack).

Seja analítico e proativo na organização da equipe. Data atual: ${new Date().toISOString()}.
`;
