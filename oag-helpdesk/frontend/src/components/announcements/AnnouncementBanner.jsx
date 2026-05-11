import React, { useEffect, useState } from 'react';
import { Announcement } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

// Unified green theme across all announcement categories
const GREEN_CARD = 'bg-green-50 border-l-4 border-green-600 text-green-900';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const items = await Announcement.filter({ published: true }, '-created_date', 10);
        if (mounted) setAnnouncements(items);
      } catch {
        if (mounted) setAnnouncements([]);
      }
    };
    load();

    // Real-time subscription (falls back to polling if unsupported)
    let unsub = null;
    let pollId = null;
    try {
      if (typeof Announcement.subscribe === 'function') {
        unsub = Announcement.subscribe(() => { if (mounted) load(); });
      } else {
        pollId = setInterval(load, 15000);
      }
    } catch {
      pollId = setInterval(load, 15000);
    }

    return () => {
      mounted = false;
      if (unsub) { try { unsub(); } catch {} }
      if (pollId) clearInterval(pollId);
    };
  }, []);

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('dismissed_announcements', JSON.stringify(next));
  };

  const visible = announcements.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {visible.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className={GREEN_CARD}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Megaphone className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-700" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{a.title}</h3>
                        <Badge className="text-xs bg-green-600 hover:bg-green-600 text-white border-transparent">{a.category}</Badge>
                        <span className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(a.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{a.message}</p>
                      {a.author_name && (
                        <p className="text-xs opacity-60 mt-2">— {a.author_name}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => dismiss(a.id)}
                    className="p-1 rounded hover:bg-green-100 flex-shrink-0"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
