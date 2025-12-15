import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- TOOL DEFINITIONS ---

const addEventTool: FunctionDeclaration = {
  name: 'addEvent',
  description: 'Adiciona um novo evento, reunião ou encomenda. CRIA CLIENTE AUTOMATICAMENTE SE O NOME FOR FORNECIDO.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Título do evento' },
      start: { type: Type.STRING, description: 'Data/Hora início ISO 8601' },
      end: { type: Type.STRING, description: 'Data/Hora fim ISO 8601' },
      type: { type: Type.STRING, description: 'Tipo: "Trabalho", "Pessoal", "Encomenda" ou "Evento"' },
      description: { type: Type.STRING, description: 'Descrição detalhada' },
      location: { type: Type.STRING, description: 'Local (Endereço, Cidade, Link ou App de Reunião)' },
      clientName: { type: Type.STRING, description: 'Nome do cliente. SE FORNECIDO, O CLIENTE SERÁ CRIADO/VINCULADO AUTOMATICAMENTE.' },
      clientContact: { type: Type.STRING, description: 'Contato do cliente (se for um novo cliente)' },
      clientNotes: { type: Type.STRING, description: 'Notas sobre o cliente (se for um novo cliente)' },
      packName: { type: Type.STRING, description: 'SUBTAG / NOME DO SERVIÇO ESPECÍFICO (Ex: "Pack Gold", "Fotografia", "Vídeo").' },
      price: { type: Type.NUMBER, description: 'Valor TOTAL acordado em Euros. Use este campo se o usuário especificar um valor.' }
    },
    required: ['title', 'start', 'end', 'type']
  }
};

const updateEventTool: FunctionDeclaration = {
  name: 'updateEvent',
  description: 'Edita um evento, encomenda ou FATURAMENTO existente. Use newPrice para alterar valores.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchTitle: { type: Type.STRING, description: 'O título do evento/faturamento original para buscar' },
      newTitle: { type: Type.STRING, description: 'Novo título (opcional)' },
      newStart: { type: Type.STRING, description: 'Nova data início ISO 8601 (opcional)' },
      newEnd: { type: Type.STRING, description: 'Nova data fim ISO 8601 (opcional)' },
      newLocation: { type: Type.STRING, description: 'Novo local (opcional)' },
      newPrice: { type: Type.NUMBER, description: 'Novo valor acordado (opcional). USE ISSO PARA CORRIGIR FATURAMENTO.' },
      newDescription: { type: Type.STRING, description: 'Nova descrição (opcional)' },
      isDone: { type: Type.BOOLEAN, description: 'Marcar como concluído/entregue (true/false)' }
    },
    required: ['searchTitle']
  }
};

const deleteEventTool: FunctionDeclaration = {
  name: 'deleteEvent',
  description: 'Remove/Deleta um evento, encomenda ou entrada de faturamento da agenda.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchTitle: { type: Type.STRING, description: 'Título do item a ser removido' }
    },
    required: ['searchTitle']
  }
};

const addClientTool: FunctionDeclaration = {
  name: 'addClient',
  description: 'Adiciona um novo cliente (Ficha) explicitamente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Nome do cliente' },
      contact: { type: Type.STRING, description: 'Email/Telefone' },
      notes: { type: Type.STRING, description: 'Notas sobre o cliente' }
    },
    required: ['name']
  }
};

const updateClientTool: FunctionDeclaration = {
  name: 'updateClient',
  description: 'Edita as informações de um cliente existente. Busca pelo nome atual.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchName: { type: Type.STRING, description: 'Nome atual do cliente para buscar' },
      newName: { type: Type.STRING, description: 'Novo nome (opcional)' },
      newContact: { type: Type.STRING, description: 'Novo contato (opcional)' },
      newNotes: { type: Type.STRING, description: 'Novas notas (opcional)' }
    },
    required: ['searchName']
  }
};

const addRevenueTool: FunctionDeclaration = {
  name: 'addRevenue',
  description: 'Adiciona um faturamento/receita avulsa injustificada ou manual (Ex: "Recebi 500 euros hoje").',
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: { type: Type.NUMBER, description: 'Valor em Euros' },
      description: { type: Type.STRING, description: 'Motivo ou descrição curta (Ex: "Venda extra", "Ajuste")' },
      date: { type: Type.STRING, description: 'Data do recebimento ISO 8601 (Opcional, use hoje se não informado)' }
    },
    required: ['amount']
  }
};

const getPacksTool: FunctionDeclaration = {
  name: 'getPacks',
  description: 'Lista os packs/serviços e preços atuais.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const getScheduleTool: FunctionDeclaration = {
  name: 'getSchedule',
  description: 'Lê a agenda.',
  parameters: { type: Type.OBJECT, properties: {} }
};

export const tools = [addEventTool, updateEventTool, deleteEventTool, addClientTool, updateClientTool, addRevenueTool, getPacksTool, getScheduleTool];

export const MODEL_NAME = 'gemini-2.5-flash';

export const SYSTEM_INSTRUCTION = `
Você é MIROMA, uma assistente pessoal e comercial de IA com estética Gemini.

FUNÇÕES PRINCIPAIS:
1. **Agenda & Encomendas**: 
   - Ao criar eventos, se o 'clientName' for informado, o sistema criará a ficha do cliente automaticamente.
   - **PADRÃO CASAMENTO**: Se o usuário não especificar o tipo de evento (ex: "Batizado", "Reunião"), assuma que é um **CASAMENTO**.
   - **SUBTAGS**: Use o campo 'packName' para colocar o nome específico do serviço contratado (Ex: "Pack Gold", "Drone", "Consultoria"). Isso funcionará como uma subtag dentro da categoria principal.
   - Ao criar eventos, sempre tente preencher o campo 'location' se o usuário mencionar onde será.

2. **Financeiro Inteligente**: 
   - A moeda oficial é EURO (€).
   - REGRAS DE FATURAMENTO:
     - **Encomendas**: 100% do valor é considerado pago na data do pedido.
     - **Eventos e Trabalho**: 50% na reserva (bookingDate) e 50% no dia do evento.
     - **Faturamento Avulso**: Se o usuário disser que recebeu um valor sem contexto de evento ("Recebi 500 euros"), use a ferramenta 'addRevenue'.
   - **EDIÇÃO DE FATURAMENTO**:
     - Para alterar um valor errado, use 'updateEvent' com o parâmetro 'newPrice'.
     - Para remover um faturamento indevido, use 'deleteEvent'.

3. **Gestão de Clientes**: 
   - Você pode criar ou **editar** fichas de clientes. Mantenha as notas atualizadas.

ESTILO:
- Responda de forma polida, profissional, mas calorosa.
- Use emojis moderados ✨.
- Assuma datas atuais baseadas em ${new Date().toISOString()}.
`;