import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TicketThread from '@/components/tickets/TicketThread';
import { Button } from '@/components/ui/button';

export default function UserTicketDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const ticketId = params.get('id');

  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('ago_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { email: '', full_name: 'User', role: 'user' };
  });

  if (!ticketId) return (
    <div className="p-8 text-center">
      <p className="text-gray-500 mb-4">No ticket ID specified.</p>
      <Button onClick={() => navigate('/user/my-tickets')} variant="outline">Back to My Tickets</Button>
    </div>
  );

  return <TicketThread ticketId={ticketId} user={user} backTo="/user/my-tickets" canRespond />;
}