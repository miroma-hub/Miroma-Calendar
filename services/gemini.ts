
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const tools = [
  getAppDataTool,
  addEmployeeTool,
  updateEmployeeTool,
  deleteEmployeeTool,
  assignStaffToEventTool,
  addEventTool
];

export const MODEL_NAME_PRO = 'gemini-3-pro-preview';
export const MODEL_NAME_FLASH = 'gemini-3-flash-preview';

export const SYSTEM_INSTRUCTION = `
Você é MIROMA, assistente de gestão inteligente.

GESTÃO DE EQUIPE:
- Você gerencia Ilustradores e Fotógrafos.
- DISTINÇÃO: Ilustradores são focados em arte/desenho. Fotógrafos em registro visual.
- MULTI-ATRIBUIÇÃO: Você pode e deve sugerir mais de um funcionário para o mesmo evento se a escala for grande.
- REMOÇÃO: Use 'deleteEmployee' se o usuário pedir para demitir ou remover alguém da equipe.
- Ao sugerir, considere a proximidade da morada do funcionário com o local do evento.

Seja analítico e proativo na organização da equipe. Data atual: ${new Date().toISOString()}.
`;
