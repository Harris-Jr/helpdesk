import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import AnnouncementBanner from '@/components/announcements/AnnouncementBanner';
import { Ticket as TicketIcon, Clock, CheckCircle, AlertCircle, Radio } from 'lucide-react';
import { format, subDays } from 'date-fns';
import useRealtimeTickets from '@/hooks/useRealtimeTickets';

export default function StaffDashboard() {
  const [user, setUser] = useState(null);
  const { tickets, loading, newCount, clearNewCount } = useRealtimeTickets({ notify: true });

  useEffect(() => {
    const agoUser = localStorage.getItem('ago_user');
    setUser(agoUser ? JSON.parse(agoUser) : null);
  }, []);

  if (loading) return <MagnifyingLoader fullScreen message="Loading dashboard..." />;

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
    closed: tickets.filter((t) => t.status === 'Closed').length,
    assignedToMe: tickets.filter((t) => t.assigned_to === user?.email).length,
  };

  const statusData = [
    { name: 'Open', value: stats.open, color: '#3b82f6' },
    { name: 'In Progress', value: stats.inProgress, color: '#eab308' },
    { name: 'Resolved', value: stats.resolved, color: '#06402b' },
    { name: 'Closed', value: stats.closed, color: '#6b7280' },
  ].filter((d) => d.value > 0);

  // Build 7-day chart
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const count = tickets.filter((t) => format(new Date(t.created_date), 'yyyy-MM-dd') === key).length;
    return { day: format(d, 'EEE'), submitted: count };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
            Live ticket overview
          </p>
        </div>
        {newCount > 0 && (
          <button
            onClick={clearNewCount}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-medium hover:bg-primary/25 transition"
          >
            <Badge className="bg-primary hover:bg-primary">{newCount}</Badge>
            New ticket{newCount > 1 ? 's' : ''} — tap to dismiss
          </button>
        )}
      </div>

      <AnnouncementBanner />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Total" value={stats.total} icon={TicketIcon} color="text-gray-700" />
        <Stat label="Open" value={stats.open} icon={AlertCircle} color="text-blue-600" />
        <Stat label="In Progress" value={stats.inProgress} icon={Clock} color="text-yellow-600" />
        <Stat label="Resolved" value={stats.resolved} icon={CheckCircle} color="text-primary" />
        <Stat label="Assigned to me" value={stats.assignedToMe} icon={TicketIcon} color="text-primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tickets Submitted (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <BarChart data={days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                    formatter={(value) => [`${value} ticket${value === 1 ? '' : 's'}`, 'Submitted']}
                  />
                  <Bar dataKey="submitted" fill="#06402b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              {statusData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No tickets yet.
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      label={({ value }) => value}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      formatter={(value, name) => [`${value} ticket${value === 1 ? '' : 's'}`, name]}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}