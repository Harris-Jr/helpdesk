import React, { useEffect, useState } from 'react';
import { ITExtension } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Phone } from 'lucide-react';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';

const AVAILABILITY = ['Available', 'Busy', 'Away', 'Offline'];

const emptyForm = {
  staff_name: '',
  extension_number: '',
  department: '',
  specialization: '',
  availability: 'Available',
  location: '',
  is_emergency: false,
  priority_level: 1,
};

export default function AdminStaffDirectory() {
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const list = await ITExtension.list('priority_level', 200);
      setExtensions(list || []);
    } catch {
      setExtensions([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ext) => {
    setEditing(ext);
    setForm({
      staff_name: ext.staff_name || '',
      extension_number: ext.extension_number || '',
      department: ext.department || '',
      specialization: ext.specialization || '',
      availability: ext.availability || 'Available',
      location: ext.location || '',
      is_emergency: !!ext.is_emergency,
      priority_level: ext.priority_level || 1,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.staff_name.trim() || !form.extension_number.trim() || !form.department.trim()) {
      alert('Please fill in name, extension number, and department.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await ITExtension.update(editing.id, form);
      } else {
        await ITExtension.create(form);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (ext) => {
    if (!confirm(`Delete ${ext.staff_name}?`)) return;
    try {
      await ITExtension.delete(ext.id);
      await load();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  if (loading) return <MagnifyingLoader fullScreen message="Loading staff directory..." />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Directory</h1>
          <p className="text-gray-600 mt-1">Manage IT staff extensions and contact info</p>
        </div>
        <Button onClick={openCreate} className="bg-green-700 hover:bg-green-800 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Staff
        </Button>
      </div>

      {extensions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No staff entries yet. Click "Add Staff" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {extensions.map((ext) => (
            <Card key={ext.id}>
              <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{ext.staff_name}</h3>
                    {ext.availability && (
                      <Badge variant="outline" className="text-xs">{ext.availability}</Badge>
                    )}
                    {ext.is_emergency && (
                      <Badge className="bg-red-100 text-red-800 text-xs" variant="secondary">
                        Emergency
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5" /> {ext.extension_number}
                    </span>
                    <span>{ext.department}</span>
                    {ext.specialization && <span className="text-gray-400">• {ext.specialization}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(ext)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(ext)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={form.staff_name}
                onChange={(e) => setForm({ ...form, staff_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Extension Number *</Label>
              <Input
                value={form.extension_number}
                onChange={(e) => setForm({ ...form, extension_number: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Department *</Label>
              <Input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Specialization / Role</Label>
              <Input
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Availability</Label>
              <Select
                value={form.availability}
                onValueChange={(v) => setForm({ ...form, availability: v })}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABILITY.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_emergency"
                checked={form.is_emergency}
                onChange={(e) => setForm({ ...form, is_emergency: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_emergency" className="cursor-pointer">
                Emergency contact
              </Label>
            </div>
            <div>
              <Label>Priority Level (display order)</Label>
              <Input
                type="number"
                value={form.priority_level}
                onChange={(e) => setForm({ ...form, priority_level: Number(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={save}
                disabled={saving}
                className="bg-green-700 hover:bg-green-800 text-white"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Staff'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
