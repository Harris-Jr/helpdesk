import React, { useEffect, useState } from 'react';
import { KnowledgeBaseArticle } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';

const CATEGORIES = ['Getting Started', 'Common Issues', 'Advanced Topics', 'FAQ'];

const empty = { title: '', content: '', category: 'Common Issues', status: 'Published' };

export default function AdminKnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setArticles(await KnowledgeBaseArticle.list('-created_date', 500));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing({ ...empty }); setOpen(true); };
  const startEdit = (a) => { setEditing({ ...a }); setOpen(true); };

  const save = async () => {
    if (!editing.title?.trim() || !editing.content?.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        await KnowledgeBaseArticle.update(editing.id, {
          title: editing.title, content: editing.content,
          category: editing.category, status: editing.status,
        });
      } else {
        await KnowledgeBaseArticle.create({
          title: editing.title, content: editing.content,
          category: editing.category, status: editing.status,
        });
      }
      setOpen(false);
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this article?')) return;
    await KnowledgeBaseArticle.delete(id);
    load();
  };

  if (loading) return <MagnifyingLoader fullScreen message="Loading articles..." />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-1">Create and manage articles visible to users</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew} className="bg-green-700 hover:bg-green-800 text-white">
              <Plus className="w-4 h-4 mr-2" />New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing?.id ? 'Edit Article' : 'New Article'}</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea rows={10} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={save} disabled={saving} className="bg-green-700 hover:bg-green-800 text-white">
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {articles.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">No articles yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {articles.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-500">{a.category || 'Uncategorized'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${a.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {a.status || 'Draft'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{a.content}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={() => startEdit(a)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => remove(a.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
