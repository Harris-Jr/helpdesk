import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TicketThread from '@/components/tickets/TicketThread';
import { Button } from '@/components/ui/button';

export default function AdminTicketDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const ticketId = params.get('id');

  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('ago_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    // Fallback: construct a minimal user so the thread still loads
    return { email: 'admin@ago.gov.zm', full_name: 'Admin', role: 'admin' };
  });

  if (!ticketId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">No ticket ID specified.</p>
        <Button onClick={() => navigate('/admin/tickets')} variant="outline">Back to Tickets</Button>
      </div>
    );
  }

  return <TicketThread ticketId={ticketId} user={user} backTo="/admin/tickets" canRespond />;
}