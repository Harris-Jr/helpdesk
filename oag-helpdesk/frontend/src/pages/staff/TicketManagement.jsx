import React, { useEffect, useState } from 'react';
import { Ticket, Staff, Notification } from '@/api/entities';
import useRealtimeTickets from '@/hooks/useRealtimeTickets';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, UserPlus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';

const STATUS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY = ['All', 'Low', 'Medium', 'High'];

export default function TicketManagement() {
  const { tickets, loading, refetch } = useRealtimeTickets({ notify: true });
  const [staffList, setStaffList] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [assignDialog, setAssignDialog] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Staff.filter({ is_active: true }).then(setStaffList).catch(() => setStaffList([]));
  }, []);

  const updateStatus = async (id, newStatus) => {
    await Ticket.update(id, { status: newStatus, last_activity: new Date().toISOString() });
    refetch();
  };

  const assignTicket = async () => {
    if (!assignDialog || !selectedStaff) return;
    setAssigning(true);
    try {
      const staff = staffList.find((s) => s.email === selectedStaff);
      await Ticket.update(assignDialog.id, {
        assigned_to: selectedStaff,
        last_activity: new Date().toISOString(),
      });
      // Notify the ticket creator
      try {
        await Notification.create({
          title: 'Your ticket has been assigned',
          message: `${staff?.full_name || selectedStaff} is now working on your ticket: "${assignDialog.title}"`,
          type: 'info',
          category: 'ticket',
          sent_to: assignDialog.created_by,
          related_entity_id: assignDialog.id,
          related_entity_type: 'ticket',
          auto_generated: true,
        });
      } catch {}
      setAssignDialog(null);
      setSelectedStaff('');
      refetch();
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <MagnifyingLoader fullScreen message="Loading tickets..." />;

  const filtered = tickets.filter((t) => {
    const mq = !q || t.title?.toLowerCase().includes(q.toLowerCase()) || t.ticket_number?.toLowerCase().includes(q.toLowerCase());
    const ms = status === 'All' || t.status === status;
    const mp = priority === 'All' || t.priority === priority;
    return mq && ms && mp;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ticket Management</h1>
        <p className="text-gray-600 mt-1">Assign, respond, and track all tickets</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search tickets..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{PRIORITY.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No tickets match your filters.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-gray-500">{t.ticket_number || `#${t.id.slice(-6)}`}</span>
                      <Badge>{t.status}</Badge>
                      <Badge variant="outline">{t.priority || 'Medium'}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{t.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      <span>By: {t.created_by}</span>
                      <span>{formatDistanceToNow(new Date(t.created_date), { addSuffix: true })}</span>
                      {t.assigned_to && <span>Assigned: <strong>{t.assigned_to}</strong></span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v)}>
                      <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Dialog open={assignDialog?.id === t.id} onOpenChange={(o) => !o && setAssignDialog(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => { setAssignDialog(t); setSelectedStaff(t.assigned_to || ''); }}>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Assign Ticket</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">{t.title}</p>
                          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                            <SelectTrigger><SelectValue placeholder="Select a staff member..." /></SelectTrigger>
                            <SelectContent>
                              {staffList.map((s) => (
                                <SelectItem key={s.email} value={s.email}>
                                  {s.full_name} — {s.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
                            <Button onClick={assignTicket} disabled={!selectedStaff || assigning} className="bg-green-700 hover:bg-green-800 text-white">
                              {assigning ? 'Assigning...' : 'Assign & Notify'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Link to={`/staff/ticket?id=${t.id}`}>
                      <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white">
                        <Eye className="w-4 h-4 mr-1" /> Open
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
