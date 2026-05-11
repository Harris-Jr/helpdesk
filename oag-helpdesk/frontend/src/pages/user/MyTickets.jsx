import React, { useEffect, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Radio } from 'lucide-react';
import TicketCard from '@/components/tickets/TicketCard';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import useRealtimeTickets from '@/hooks/useRealtimeTickets';
import PullToRefresh from '@/components/shared/PullToRefresh';

export default function MyTickets() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const agoUser = localStorage.getItem('ago_user');
    const u = agoUser ? JSON.parse(agoUser) : null;
    setUserEmail(u?.email || null);
  }, []);

  const filter = useMemo(
    () => (userEmail ? { created_by: userEmail } : null),
    [userEmail]
  );

  const { tickets, loading, refetch } = useRealtimeTickets({ filter, notify: !!userEmail });

  if (loading || !userEmail) return <MagnifyingLoader fullScreen message="Loading tickets..." />;

  const filtered = tickets.filter((t) => {
    const matchQ = !q || t.title?.toLowerCase().includes(q.toLowerCase()) || t.ticket_number?.toLowerCase().includes(q.toLowerCase());
    const matchS = status === 'All' || t.status === status;
    return matchQ && matchS;
  });

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tickets</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm">
              <Radio className="w-3.5 h-3.5 text-green-600 animate-pulse" />
              Live — updates automatically
            </p>
          </div>
          <Link to="/user/submit-ticket">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />New Ticket
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9" placeholder="Search tickets..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No tickets match your filters.</div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((t) => <TicketCard key={t.id} ticket={t} detailsPath="/user/ticket" />)}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}