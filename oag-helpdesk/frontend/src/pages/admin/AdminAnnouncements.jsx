import React, { useEffect, useState } from 'react';
import { Announcement } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Megaphone } from 'lucide-react';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import { format } from 'date-fns';

const CATEGORIES = ['General', 'System', 'Maintenance', 'Urgent'];
const empty = { title: '', message: '', category: 'General', published: true };

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const load = async () => {
    try {
      setItems(await Announcement.list('-created_date', 200));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const agoUser = localStorage.getItem('ago_user');
    setUser(agoUser ? JSON.parse(agoUser) : null);
    load();
  }, []);

  const startNew = () => { setEditing({ ...empty }); setOpen(true); };
  const startEdit = (a) => { setEditing({ ...a }); setOpen(true); };

  const save = async () => {
    if (!editing.title?.trim() || !editing.message?.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: editing.title,
        message: editing.message,
        category: editing.category,
        published: !!editing.published,
        author_name: user?.full_name,
        author_email: user?.email,
      };
      if (editing.id) await Announcement.update(editing.id, payload);
      else await Announcement.create(payload);
      setOpen(false);
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await Announcement.delete(id);
    load();
  };

  const togglePublished = async (a) => {
    await Announcement.update(a.id, { ...a, published: !a.published });
    load();
  };

  if (loading) return <MagnifyingLoader fullScreen message="Loading..." />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-green-700" />
            Announcements
          </h1>
          <p className="text-gray-600 mt-1">Published announcements appear instantly on all dashboards</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew} className="bg-green-700 hover:bg-green-800 text-white">
              <Plus className="w-4 h-4 mr-2" />New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? 'Edit Announcement' : 'New Announcement'}</DialogTitle></DialogHeader>
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
                  <Label>Message</Label>
                  <Textarea rows={5} value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                  Published (visible to all users & staff)
                </label>
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

      {items.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">No announcements yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-500">{a.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${a.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {a.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-400">{format(new Date(a.created_date), 'MMM d, yyyy')}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1 whitespace-pre-wrap">{a.message}</p>
                </div>
                <div className="flex gap-1 items-start">
                  <Button variant="outline" size="sm" onClick={() => togglePublished(a)}>
                    {a.published ? 'Unpublish' : 'Publish'}
                  </Button>
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
