import React, { useEffect, useState } from 'react';
import { KnowledgeBaseArticle } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';

export default function UserKnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await KnowledgeBaseArticle.filter({ status: 'Published' }, '-views', 100);
        if (!mounted) return;
        setArticles(list.length ? list : await KnowledgeBaseArticle.list('-views', 100));
      } catch {
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    // Real-time subscription (fallback to polling)
    let unsub = null;
    let pollId = null;
    try {
      if (typeof KnowledgeBaseArticle.subscribe === 'function') {
        unsub = KnowledgeBaseArticle.subscribe(() => { if (mounted) load(); });
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

  if (loading) return <MagnifyingLoader fullScreen message="Loading articles..." />;

  const filtered = articles.filter((a) =>
    !q || a.title.toLowerCase().includes(q.toLowerCase()) || a.content?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-600 mt-1">Self-service guides and solutions.</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input className="pl-9" placeholder="Search articles..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No articles available.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((a) => (
            <Card key={a.id} className="cursor-pointer hover:shadow-md transition" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  {a.category && <Badge variant="outline">{a.category}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-sm text-gray-600 whitespace-pre-wrap ${expanded === a.id ? '' : 'line-clamp-2'}`}>
                  {a.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
