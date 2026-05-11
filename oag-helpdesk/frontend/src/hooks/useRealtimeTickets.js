import { useEffect, useRef, useState, useCallback } from 'react';
import { Ticket } from '@/api/entities';
import { toast } from '@/components/ui/use-toast';

/**
 * Real-time tickets hook.
 *
 * Subscribes to Ticket entity events and keeps the local list in sync.
 * Falls back to polling every 8s if subscriptions aren't supported.
 *
 * @param {Object} opts
 * @param {Object} [opts.filter] - optional filter for initial fetch (e.g. { created_by: email })
 * @param {boolean} [opts.notify=true] - show toast notifications on live changes
 * @param {string} [opts.notifyScope='all'] - 'all' | 'mine' (filter toasts to tickets matching filter)
 */
export default function useRealtimeTickets({ filter, notify = true, notifyScope = 'all' } = {}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const mountedRef = useRef(true);
  const debounceRef = useRef(null);

  const matchesFilter = useCallback(
    (t) => {
      if (!filter) return true;
      return Object.entries(filter).every(([k, v]) => t?.[k] === v);
    },
    [filter]
  );

  const fetchList = useCallback(async () => {
    try {
      const list = filter
        ? await Ticket.filter(filter, '-created_date', 500)
        : await Ticket.list('-created_date', 500);
      if (mountedRef.current) setTickets(list);
    } catch {
      if (mountedRef.current) setTickets([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [filter]);

  // Debounced refetch (batch rapid events)
  const scheduleRefetch = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchList, 400);
  }, [fetchList]);

  useEffect(() => {
    mountedRef.current = true;
    fetchList();

    let unsub = null;
    let pollId = null;

    try {
      if (typeof Ticket.subscribe === 'function') {
        unsub = Ticket.subscribe((event) => {
          if (!mountedRef.current) return;

          const data = event.data;
          const relevant = data ? matchesFilter(data) : true;

          if (notify && relevant) {
            if (event.type === 'create' && (notifyScope === 'all' || matchesFilter(data))) {
              setNewCount((c) => c + 1);
              toast({
                title: '🎫 New ticket',
                description: data?.title ? `"${data.title}"` : 'A new ticket was submitted',
              });
            } else if (event.type === 'update' && data) {
              toast({
                title: 'Ticket updated',
                description: `${data.ticket_number || 'Ticket'} → ${data.status || 'changed'}`,
              });
            }
          }

          scheduleRefetch();
        });
      } else {
        pollId = setInterval(fetchList, 8000);
      }
    } catch {
      pollId = setInterval(fetchList, 8000);
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(debounceRef.current);
      if (unsub) { try { unsub(); } catch {} }
      if (pollId) clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)]);

  const clearNewCount = useCallback(() => setNewCount(0), []);

  return { tickets, loading, newCount, clearNewCount, refetch: fetchList };
}
