
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getAppDataTool: FunctionDeclaration = {
  name: 'getAppData',
  description: 'Recupera a base de dados. Para economizar tokens (dinheiro), forneça um searchQuery para filtrar os resultados quando estiver procurando por algo específico.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchQuery: { type: Type.STRING, description: 'Termo de busca opcional (ex: nome do cliente, título do evento, data)' }
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
  description: 'Adiciona uma receita avulsa OU UM DESCONTO/ISENÇÃO (usando valor negativo) ao faturamento.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER, description: 'Valor financeiro. USE VALOR NEGATIVO para remover parcelas do faturamento (ex: -477 para remover uma cobrança de 477).' },
      description: { type: Type.STRING, description: 'Descrição da receita ou do desconto (ex: "Isenção da parcela de Finalização - Casamento X")' },
      date: { type: Type.STRING, description: 'Data da receita ou do desconto no formato ISO referente ao mês/ano que a cobrança seria feita (ex: 2026-10-15T10:00:00Z)' }
    },
    required: ['amount', 'description', 'date']
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

ECONOMIA DE TOKENS E VELOCIDADE:
- Seja conciso e direto nas respostas. Respostas longas demoram mais para gerar e gastam mais.
- NUNCA chame 'getAppData' sem passar o parâmetro 'searchQuery'. Trazer a base inteira gasta muitos tokens e deixa a resposta extremamente lenta. Filtre sempre!

PRECISÃO MATEMÁTICA E INTERPRETAÇÃO DE TEXTOS:
- Atenção REDOBRADA aos valores financeiros e contas matemáticas. Faça cálculos passo-a-passo internamente para garantir que não haja erros de soma ou subtração.
- Ao ler conversas coladas do usuário (textos longos do cliente), leia com calma para extrair os dados EXATOS (nomes, datas, preços, serviços) sem inventar nada e sem errar os números.

REGRAS CRÍTICAS CONTRA DUPLICAÇÃO:
- ANTES de criar um novo cliente, evento ou faturamento, você DEVE usar 'getAppData' com 'searchQuery' para verificar se já existe na base.
- Ao analisar uma conversa colada, cruze os dados com a base existente. Se o cliente ou evento já existir (mesmo com nome ligeiramente diferente), use 'updateClient' ou 'updateEvent' para adicionar as novas informações. NÃO crie duplicatas.
- Se você acabou de criar um cliente com 'addClient', e em seguida vai usar 'addEvent', certifique-se de usar EXATAMENTE o mesmo nome.

GESTÃO DE EQUIPE:
- Ilustradores (arte/desenho) vs Fotógrafos (registro visual). Sugira baseando-se na morada/local do evento.
- Use 'deleteEmployee' para remover.

GESTÃO DE EVENTOS E FATURAMENTO (MUITO IMPORTANTE):
- O faturamento no ecrã é calculado AUTOMATICAMENTE com base nos eventos da agenda (50% no mês da reserva, 50% no mês do evento).
- SE o usuário pedir para "remover do faturamento", "dar desconto" ou anular uma parcela de pagamento MAS quiser manter o evento intacto na agenda: NUNCA altere o evento original ('updateEvent').
- A ÚNICA forma correta de remover valores pendentes do faturamento (sem estragar o evento) é usar a ferramenta 'addRevenue' informando um VALOR NEGATIVO (ex: -477), a data exata do mês da remoção (ex: 2026-10-15) e uma descrição clara ("Desconto/Isenção - Nome do Evento"). Isso abate o valor da tela.

Data atual: ${new Date().toISOString()}.
`;
