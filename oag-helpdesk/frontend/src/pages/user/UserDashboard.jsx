import React, { useEffect, useState } from 'react';
import { Ticket } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, Ticket as TicketIcon } from 'lucide-react';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';
import TicketCard from '@/components/tickets/TicketCard';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import FeedbackForm from '@/components/shared/FeedbackForm';

export default function UserDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const agoUser = localStorage.getItem('ago_user');
      const u = agoUser ? JSON.parse(agoUser) : null;
      setUser(u);
      if (u?.email) {
        try {
          const list = await Ticket.filter({ created_by: u.email }, '-created_date', 50);
          setTickets(list);
        } catch {
          setTickets([]);
        }
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <MagnifyingLoader fullScreen message="Loading dashboard..." />;

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  };

  const recent = tickets.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-gray-600 mt-1">Your support tickets and announcements</p>
        </div>
        <Link to="/user/submit-ticket">
          <Button className="bg-green-700 hover:bg-green-800 text-white">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      <AnnouncementBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Open" value={stats.open} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Resolved" value={stats.resolved} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
          <Link to="/user/my-tickets" className="text-sm text-green-700 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <TicketIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No tickets yet. Submit your first support request.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {recent.map((t) => (
              <TicketCard key={t.id} ticket={t} detailsPath="/user/ticket" />
            ))}
          </div>
        )}
      </div>

      {/* Feedback at the bottom */}
      <div className="pt-4">
        <FeedbackForm user={user} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
