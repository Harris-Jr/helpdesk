import nodemailer from 'nodemailer';

export function createTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });
}

export async function sendSystemEmail({ to, subject, html, text }) {
  const transport = createTransport();
  if (!transport) return { skipped: true, reason: 'SMTP is not configured' };
  return transport.sendMail({
    from: process.env.MAIL_FROM || 'OAG Helpdesk <no-reply@oag.local>',
    to,
    subject,
    html,
    text
  });
}

export async function notifyStaffNewTicket(ticket, staffUsers = []) {
  const recipients = staffUsers.map((user) => user.email).filter(Boolean);
  if (!recipients.length) return { notified: [] };

  const ticketNumber = ticket.ticket_number || ticket.id;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #06402b; padding: 20px 24px;">
        <h2 style="color: white; margin: 0; font-size: 20px;">New Support Ticket Submitted</h2>
        <p style="color: #a3e4d7; margin: 4px 0 0; font-size: 13px;">OAG Helpdesk System Notification</p>
      </div>
      <div style="padding: 24px;">
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Title:</strong> ${ticket.title || ''}</p>
        <p><strong>Submitted By:</strong> ${ticket.created_by || 'Unknown'}</p>
        <p><strong>Priority:</strong> ${ticket.priority || 'Medium'}</p>
        <p><strong>Location:</strong> ${ticket.location || 'Not specified'}</p>
        <p>${ticket.description || 'No description provided'}</p>
      </div>
    </div>
  `;

  await Promise.all(recipients.map((to) => sendSystemEmail({
    to,
    subject: `New Helpdesk Ticket: ${ticket.title || ticketNumber}`,
    html
  })));
  return { notified: recipients };
}
