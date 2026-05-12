import { query } from '../config/db.js';
import { createCrudController } from './crudController.js';
import { notifyStaffNewTicket, notifyStaffAssignment } from '../utils/email.js';
import { toRecord } from '../utils/records.js';

async function nextTicketNumber() {
  const result = await query('SELECT count(*)::int AS count FROM tickets');
  const next = Number(result.rows[0]?.count || 0) + 1;
  return `OAG-${new Date().getFullYear()}-${String(next).padStart(5, '0')}`;
}

async function staffRecipients() {
  const appUsers = await query(
    `SELECT * FROM app_users
     WHERE data->>'role' IN ('admin', 'staff')
       AND COALESCE((data->>'is_active')::boolean, true) = true`
  );
  const staff = await query('SELECT * FROM staff');
  return [
    ...appUsers.rows.map(toRecord),
    ...staff.rows.map(toRecord)
  ];
}

const ticketController = createCrudController('Ticket', {
  async beforeCreate(body) {
    return {
      ...body,
      ticket_number: body.ticket_number || await nextTicketNumber(),
      status: body.status || 'Open',
      last_activity: body.last_activity || new Date().toISOString()
    };
  },

  async afterCreate(ticket) {
    try {
      await notifyStaffNewTicket(ticket, await staffRecipients());
    } catch (error) {
      console.warn('Ticket notification failed:', error.message);
    }
  },

  async beforeUpdate(body) {
    return {
      ...body,
      last_activity: body.last_activity || new Date().toISOString()
    };
  },

  async afterUpdate(newTicket, oldTicket) {
    try {
      // Check if assigned_to changed
      const oldAssigned = oldTicket?.assigned_to || oldTicket?.data?.assigned_to;
      const newAssigned = newTicket?.assigned_to || newTicket?.data?.assigned_to;

      if (newAssigned && newAssigned !== oldAssigned) {
        // Get the newly assigned staff member's email and name
        const staffResult = await query(
          `SELECT email, full_name FROM app_users 
           WHERE lower(data->>'email') = lower($1) AND data->>'role' = 'staff'`,
          [newAssigned]
        );

        if (staffResult.rows.length > 0) {
          const staff = staffResult.rows[0];
          await notifyStaffAssignment(
            newTicket,
            staff.email,
            staff.full_name
          );
        }
      }
    } catch (error) {
      console.warn('Ticket assignment notification failed:', error.message);
    }
  }
});

export default ticketController;
