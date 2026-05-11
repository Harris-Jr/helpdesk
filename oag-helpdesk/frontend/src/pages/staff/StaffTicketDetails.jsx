import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TicketThread from '@/components/tickets/TicketThread';
import { Button } from '@/components/ui/button';

export default function StaffTicketDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const ticketId = params.get('id');

  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('ago_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { email: 'staff@ago.gov.zm', full_name: 'Staff', role: 'staff' };
  });

  if (!ticketId) return (
    <div className="p-8 text-center">
      <p className="text-gray-500 mb-4">No ticket ID specified.</p>
      <Button onClick={() => navigate('/staff/tickets')} variant="outline">Back to Tickets</Button>
    </div>
  );

  return <TicketThread ticketId={ticketId} user={user} backTo="/staff/tickets" canRespond />;
}