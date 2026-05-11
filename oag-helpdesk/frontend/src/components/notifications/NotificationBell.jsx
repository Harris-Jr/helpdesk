import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Notification, Announcement } from '@/api/entities';
import { formatDistanceToNow } from 'date-fns';

const TYPE_COLORS = {
  info: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  error: 'bg-red-50 border-red-200',
  system: 'bg-gray-50 border-gray-200',
};

export default function NotificationBell({ userEmail, portalBase = '/user' }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const mountedRef = useRef(true);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchBothItems = useCallback(async () => {
    if (!userEmail) return;
    try {
      const [notifs, announces] = await Promise.all([
        Notification.filter({ sent_to: userEmail, dismissed: false }, '-created_date', 20).catch(() => []),
        Announcement.filter({}, '-created_date', 10).catch(() => [])
      ]);

      if (mountedRef.current) {
        // Combine and merge by created_date (most recent first)
        const combined = [
          ...notifs.map(n => ({ ...n, _type: 'notification' })),
          ...announces.map(a => ({ ...a, _type: 'announcement' }))
        ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        
        setItems(combined);
      }
    } catch {
      if (mountedRef.current) setItems([]);
    }
  }, [userEmail]);

  useEffect(() => {
    mountedRef.current = true;
    fetchBothItems();

    let unsub = null;
    let pollId = null;
    try {
      if (typeof Notification.subscribe === 'function') {
        unsub = Notification.subscribe(() => { if (mountedRef.current) fetchBothItems(); });
      } else {
        pollId = setInterval(fetchBothItems, 10000);
      }
    } catch {
      pollId = setInterval(fetchBothItems, 10000);
    }

    return () => {
      mountedRef.current = false;
      if (unsub) { try { unsub(); } catch {} }
      if (pollId) clearInterval(pollId);
    };
  }, [fetchBothItems]);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  const handleItemClick = async (item) => {
    if (item._type === 'notification') {
      if (!item.read) {
        try { await Notification.update(item.id, { read: true }); } catch {}
        setItems((prev) => prev.map((x) => x.id === item.id ? { ...x, read: true } : x));
      }
      setOpen(false);
      // Navigate to the right place
      if (item.related_entity_type === 'ticket' && item.related_entity_id) {
        navigate(`${portalBase}/ticket?id=${item.related_entity_id}`);
      }
    } else if (item._type === 'announcement') {
      // Mark announcement as dismissed
      try { await Announcement.update(item.id, { dismissed: true }); } catch {}
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    }
  };

  const markAllRead = async () => {
    const unreadItems = items.filter((n) => !n.read && n._type === 'notification');
    await Promise.all(unreadItems.map((n) => Notification.update(n.id, { read: true }).catch(() => {})));
    setItems((prev) => prev.map((n) => n._type === 'notification' ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Notifications & Announcements</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-green-700 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No notifications or announcements</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-l-2 ${
                    item.read ? 'border-transparent opacity-70' : 'border-green-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!item.read && item._type === 'notification' && <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium text-gray-900 ${item.read ? '' : 'font-semibold'}`}>{item.title}</p>
                        {item._type === 'announcement' && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded">Announcement</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
