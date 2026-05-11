import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Ticket, TicketResponse } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Send, ArrowLeft, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import AttachmentGallery from '@/components/shared/AttachmentGallery';

/**
 * Unified ticket thread view — used by User, Staff, and Admin portals.
 * Props:
 *  - ticketId
 *  - user (current user)
 *  - backTo (URL for back button)
 *  - canRespond (boolean)
 */
export default function TicketThread({ ticketId, user, backTo, canRespond = true }) {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const mountedRef = useRef(true);

  // Stable load function using useCallback so subscriptions always call the latest version
  const load = useCallback(async () => {
    if (!ticketId) return;
    try {
      const [t, r] = await Promise.all([
        Ticket.get(ticketId),
        TicketResponse.filter({ ticket_id: ticketId }, 'created_date'),
      ]);
      if (!mountedRef.current) return;
      setTicket(t);
      setResponses(r || []);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Failed to load ticket.');
      setTicket(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      setError('No ticket ID provided.');
      return;
    }

    mountedRef.current = true;
    setLoading(true);
    setError(null);
    load();

    const unsubs = [];
    let pollId = null;

    const safeLoad = () => { if (mountedRef.current) load(); };

    try {
      if (typeof Ticket.subscribe === 'function') {
        unsubs.push(
          Ticket.subscribe((evt) => {
            if (evt?.id === ticketId || evt?.data?.id === ticketId) safeLoad();
          })
        );
      }
      if (typeof TicketResponse.subscribe === 'function') {
        unsubs.push(
          TicketResponse.subscribe((evt) => {
            if (evt?.data?.ticket_id === ticketId) safeLoad();
          })
        );
      }
      // Fallback polling if subscriptions unavailable
      if (unsubs.length === 0) pollId = setInterval(safeLoad, 5000);
    } catch {
      pollId = setInterval(safeLoad, 5000);
    }

    return () => {
      mountedRef.current = false;
      unsubs.forEach((u) => { try { u(); } catch {} });
      if (pollId) clearInterval(pollId);
    };
  }, [ticketId, load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  const send = async () => {
    if (!reply.trim() || sending) return;
    const isStaff = user?.role === 'admin' || user?.role === 'staff';
    const content = reply.trim();
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      ticket_id: ticketId,
      content,
      responder_email: user.email,
      responder_name: user.full_name || user.email,
      response_type: isStaff ? 'admin_response' : 'user_message',
      read_by_user: false,
      created_date: new Date().toISOString(),
      _optimistic: true,
    };

    // Show the message immediately
    setResponses((prev) => [...prev, optimistic]);
    setReply('');
    setSending(true);

    // Fire & forget — server update happens in the background
    (async () => {
      try {
        await TicketResponse.create({
          ticket_id: ticketId,
          content,
          responder_email: user.email,
          responder_name: user.full_name || user.email,
          response_type: isStaff ? 'admin_response' : 'user_message',
          read_by_user: false,
        });
        Ticket.update(ticketId, {
          last_activity: new Date().toISOString(),
        }).catch(() => {});
        // Real-time subscription / polling will reconcile and replace the temp item
        load();
      } catch {
        // Roll back the optimistic message on failure
        if (mountedRef.current) {
          setResponses((prev) => prev.filter((r) => r.id !== tempId));
          setReply(content);
          alert('Failed to send message.');
        }
      } finally {
        if (mountedRef.current) setSending(false);
      }
    })();
  };

  if (loading) return <MagnifyingLoader fullScreen message="Loading ticket..." />;

  if (error || !ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-2">{error || 'Ticket not found or you don\'t have access.'}</p>
        <Button onClick={() => navigate(backTo)} variant="outline">Back</Button>
      </div>
    );
  }

  const safeDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <Link to={backTo} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-gray-500">
                  {ticket.ticket_number || `#${ticket.id.slice(-6)}`}
                </span>
                <Badge>{ticket.status}</Badge>
                <Badge variant="outline">{ticket.priority || 'Medium'}</Badge>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
            </div>
            {safeDate(ticket.created_date) && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(safeDate(ticket.created_date), 'MMM d, yyyy HH:mm')}
              </span>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          {ticket.attachments?.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <AttachmentGallery urls={ticket.attachments} />
            </div>
          )}
          {ticket.assigned_to && (
            <p className="text-xs text-gray-500 mt-3">Assigned to: <span className="font-medium">{ticket.assigned_to}</span></p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3 mb-4">
        {responses.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">No replies yet.</p>
        )}
        {responses.map((r) => {
          const fromStaff = r.response_type === 'admin_response' || r.response_type === 'it_solution';
          const mine = r.responder_email === user?.email;
          const ts = safeDate(r.created_date);
          return (
            <div key={r.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${
                mine ? 'bg-green-700 text-white' :
                fromStaff ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
                  <span className="font-semibold">{r.responder_name || r.responder_email}</span>
                  {fromStaff && !mine && <Badge variant="outline" className="text-xs bg-white">IT Support</Badge>}
                </div>
                <p className="whitespace-pre-wrap text-sm">{r.content}</p>
                {ts && (
                  <p className="text-xs opacity-70 mt-1" title={format(ts, 'MMM d, yyyy HH:mm:ss')}>
                    {formatDistanceToNow(ts, { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {canRespond && (
        <Card>
          <CardContent className="p-3 flex gap-2">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send();
              }}
            />
            <Button
              onClick={send}
              disabled={!reply.trim() || sending}
              className="bg-green-700 hover:bg-green-800 text-white self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
