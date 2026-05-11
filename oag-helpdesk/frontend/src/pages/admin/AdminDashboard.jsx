import React, { useEffect, useState } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';
import { Radio } from 'lucide-react';
import { format, subDays } from 'date-fns';
import useRealtimeTickets from '@/hooks/useRealtimeTickets';


export default function AdminDashboard() {
  const { tickets, loading, newCount, clearNewCount } = useRealtimeTickets({ notify: true });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    User.list().then(setUsers).catch(() => setUsers([]));
  }, []);

  if (loading) return <MagnifyingLoader fullScreen message="Loading dashboard..." />;

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
    closed: tickets.filter((t) => t.status === 'Closed').length,
    users: users.length
  };

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const count = tickets.filter((t) => format(new Date(t.created_date), 'yyyy-MM-dd') === key).length;
    return { day: format(d, 'EEE'), submitted: count };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          


          
        </div>
        {newCount > 0 &&
        <button
          onClick={clearNewCount}
          className="inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-medium hover:bg-green-200 transition">
          
            <Badge className="bg-green-600 hover:bg-green-600">{newCount}</Badge>
            New ticket{newCount > 1 ? 's' : ''} — tap to dismiss
          </button>
        }
      </div>

      <AnnouncementBanner />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Total Tickets" value={stats.total} />
        <Stat label="Open" value={stats.open} />
        <Stat label="In Progress" value={stats.inProgress} />
        <Stat label="Resolved" value={stats.resolved} />
        <Stat label="Users" value={stats.users} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Tickets (Last 7 Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v} ticket${v === 1 ? '' : 's'}`, 'Submitted']} />
                <Bar dataKey="submitted" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>);

}

function Stat({ label, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-gray-500 uppercase">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>);

}
