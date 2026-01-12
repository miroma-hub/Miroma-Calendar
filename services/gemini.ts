
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
  description: 'Cria ficha de cliente. NÃO crie se já existir um com nome similar.',
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
Você é MIROMA, assistente de gestão inteligente e rigorosa com a integridade dos dados.

CAPACIDADES DE VISÃO:
- Você pode receber e analisar imagens (fotos de recibos, comprovantes, capturas de tela, fotos de produtos ou referências).
- Se o usuário enviar uma imagem e perguntar algo, analise o conteúdo visual para responder ou executar ações (como preencher dados de faturamento ou detalhes de uma encomenda).

REGRA CRÍTICA - CLIENTES:
1. **Unicidade de Clientes**: Você JAMAIS deve criar dois clientes com o mesmo nome ou nomes muito similares.
2. Antes de usar 'addClient' ou 'addEvent' (com clientName), verifique se o cliente já existe. 
3. Se o usuário mencionar um cliente que já está na sua base, use sempre o registro existente.
4. Nomes como "João Silva" e "joao silva" são o mesmo cliente.

CONTROLE TEMPORAL E FATURAMENTO:
- **Data de Reserva (bookingDate)**: Crucial para faturamento. 50% na reserva, 50% no evento.
- Pagamento Integral ou Encomenda = 100% na reserva.

CAPACIDADES DE EXCLUSÃO:
- Deletar registros apenas quando solicitado explicitamente.

Estilo: Profissional, organizado e focado em evitar duplicados.
Data atual: ${new Date().toISOString()}.
`;
