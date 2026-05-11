export const entityRegistry = {
  Announcement: { table: 'announcements' },
  AppUser: { table: 'app_users' },
  AuditLog: { table: 'audit_logs' },
  ChatbotConfig: { table: 'chatbot_configs' },
  ChatbotFAQ: { table: 'chatbot_faqs' },
  ChatLog: { table: 'chat_logs' },
  ChatSession: { table: 'chat_sessions' },
  Comment: { table: 'comments' },
  EmailForwardingLog: { table: 'email_forwarding_logs' },
  EmailNotification: { table: 'email_notifications' },
  EmailServerConfig: { table: 'email_server_configs' },
  EmailTicket: { table: 'email_tickets' },
  Feedback: { table: 'feedback' },
  InternalEmail: { table: 'internal_emails' },
  ITExtension: { table: 'it_extensions' },
  KnowledgeBaseArticle: { table: 'knowledge_base_articles' },
  NewUsers: { table: 'new_users' },
  Notification: { table: 'notifications' },
  QRAccess: { table: 'qr_access' },
  Staff: { table: 'staff' },
  Ticket: { table: 'tickets' },
  TicketCategory: { table: 'ticket_categories' },
  TicketNote: { table: 'ticket_notes' },
  TicketResponse: { table: 'ticket_responses' },
  TicketRoute: { table: 'ticket_routes' },
  User: { table: 'users' },
  ValidationRequest: { table: 'validation_requests' }
};

export const entityNames = Object.keys(entityRegistry);

export function getEntityConfig(entityName) {
  const config = entityRegistry[entityName];
  if (!config) {
    const error = new Error(`Unknown entity: ${entityName}`);
    error.status = 404;
    throw error;
  }
  return config;
}
