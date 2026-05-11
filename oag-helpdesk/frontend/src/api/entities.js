import apiClient from './apiClient';

const entityNames = [
  'Announcement',
  'AppUser',
  'AuditLog',
  'ChatbotConfig',
  'ChatbotFAQ',
  'ChatLog',
  'ChatSession',
  'Comment',
  'EmailForwardingLog',
  'EmailNotification',
  'EmailServerConfig',
  'EmailTicket',
  'Feedback',
  'InternalEmail',
  'ITExtension',
  'KnowledgeBaseArticle',
  'NewUsers',
  'Notification',
  'QRAccess',
  'Staff',
  'Ticket',
  'TicketCategory',
  'TicketNote',
  'TicketResponse',
  'TicketRoute',
  'User',
  'ValidationRequest'
];

const sortParams = (sort, limit) => {
  const params = {};
  if (sort) params.sort = sort;
  if (limit) params.limit = limit;
  return params;
};

const createEntityClient = (name) => ({
  async list(sort, limit) {
    return apiClient.get(`/entities/${name}`, { params: sortParams(sort, limit) });
  },

  async filter(filters = {}, sort, limit) {
    return apiClient.get(`/entities/${name}`, {
      params: { ...sortParams(sort, limit), filter: JSON.stringify(filters || {}) }
    });
  },

  async get(id) {
    return apiClient.get(`/entities/${name}/${id}`);
  },

  async create(data) {
    return apiClient.post(`/entities/${name}`, data);
  },

  async update(id, data) {
    return apiClient.put(`/entities/${name}/${id}`, data);
  },

  async delete(id) {
    return apiClient.delete(`/entities/${name}/${id}`);
  },

  subscribe(callback) {
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/$/, '');
    const source = new EventSource(`${base}/realtime/${name}`);
    source.onmessage = (event) => {
      try {
        callback(JSON.parse(event.data));
      } catch {
        callback({ type: 'message', data: event.data });
      }
    };
    return () => source.close();
  }
});

export const entities = Object.fromEntries(entityNames.map((name) => [name, createEntityClient(name)]));
export const Entity = createEntityClient;

entities.User.me = async () => {
  const { default: auth } = await import('./auth');
  return auth.me();
};

export const Announcement = entities.Announcement;
export const AppUser = entities.AppUser;
export const AuditLog = entities.AuditLog;
export const ChatbotConfig = entities.ChatbotConfig;
export const ChatbotFAQ = entities.ChatbotFAQ;
export const ChatLog = entities.ChatLog;
export const ChatSession = entities.ChatSession;
export const Comment = entities.Comment;
export const EmailForwardingLog = entities.EmailForwardingLog;
export const EmailNotification = entities.EmailNotification;
export const EmailServerConfig = entities.EmailServerConfig;
export const EmailTicket = entities.EmailTicket;
export const Feedback = entities.Feedback;
export const InternalEmail = entities.InternalEmail;
export const ITExtension = entities.ITExtension;
export const KnowledgeBaseArticle = entities.KnowledgeBaseArticle;
export const NewUsers = entities.NewUsers;
export const Notification = entities.Notification;
export const QRAccess = entities.QRAccess;
export const Staff = entities.Staff;
export const Ticket = entities.Ticket;
export const TicketCategory = entities.TicketCategory;
export const TicketNote = entities.TicketNote;
export const TicketResponse = entities.TicketResponse;
export const TicketRoute = entities.TicketRoute;
export const User = entities.User;
export const ValidationRequest = entities.ValidationRequest;

export default entities;
