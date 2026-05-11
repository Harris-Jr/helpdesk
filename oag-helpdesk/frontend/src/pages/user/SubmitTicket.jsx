import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, TicketCategory } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import AttachmentUploader from '@/components/tickets/AttachmentUploader';

const PROVINCES = [
  'Lusaka — Head Office', 'Lusaka — Provincial Office', 'Copperbelt Province',
  'Central Province', 'Eastern Province', 'Northern Province', 'North-Western Province',
  'Southern Province', 'Western Province', 'Luapula Province', 'Muchinga Province',
];

const DEPARTMENTS = [
  'Accounts / Finance', 'Administration', 'Audit', 'Human Resources',
  'ICT / IT Department', 'Legal', 'Procurement', 'Registry / Records',
  'Senior Management', 'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High'];

const DEFAULT_CATEGORIES = ['Hardware', 'Software', 'Network', 'Email', 'Printer', 'Access', 'Other'];

export default function SubmitTicket() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map((n) => ({ name: n })));
  const mountedRef = useRef(true);

  const [data, setData] = useState({
    issue: '',
    customTitle: '',
    description: '',
    priority: 'Medium',
    province: '',
    department: '',
    device_info: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill from chatbot draft (if user clicked "Create Ticket" in chat)
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem('chatbot_ticket_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setData((d) => ({
          ...d,
          issue: 'Other',
          customTitle: parsed.title || '',
          description: parsed.description || '',
        }));
        sessionStorage.removeItem('chatbot_ticket_draft');
      }
    } catch {}
  }, []);

  // Fetch categories from DB + real-time subscription
  useEffect(() => {
    mountedRef.current = true;

    const load = async () => {
      try {
        const list = await TicketCategory.list('sort_order', 100);
        if (mountedRef.current && list && list.length > 0) {
          setCategories(list);
        }
      } catch {}
    };

    load();

    let unsub;
    try {
      unsub = TicketCategory.subscribe(() => {
        if (mountedRef.current) load();
      });
    } catch {}

    return () => {
      mountedRef.current = false;
      if (unsub) try { unsub(); } catch {}
    };
  }, []);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const title = data.issue === 'Other' ? data.customTitle.trim() : data.issue;
    if (!title || !data.description.trim()) {
      setError('Please provide an issue and description.');
      return;
    }
    setSubmitting(true);
    try {
      const agoUser = localStorage.getItem('ago_user');
      const user = agoUser ? JSON.parse(agoUser) : null;
      const location = [data.province, data.department].filter(Boolean).join(' | ');
      await Ticket.create({
        title,
        description: data.description.trim(),
        status: 'Open',
        priority: data.priority,
        ticket_number: `AGO-${Date.now()}`,
        attachments,
        location,
        device_info: data.device_info,
        last_activity: new Date().toISOString(),
        created_by: user?.email,
      });
      setSuccess(true);
      setTimeout(() => navigate('/user/my-tickets'), 1500);
    } catch (err) {
      setError('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) return <MagnifyingLoader fullScreen message="Submitting your ticket..." />;

  const isOther = data.issue === 'Other';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Submit Support Ticket</h1>
        <p className="text-gray-600 mt-1">Describe your issue and the IT team will respond.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Issue / Category *</Label>
              <ResponsiveSelect
                value={data.issue}
                onValueChange={(v) => set('issue', v)}
                placeholder="Select a category..."
                label="Issue / Category"
                options={[
                  ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
                  { value: 'Other', label: 'Other' },
                ]}
              />
              {isOther && (
                <Input
                  className="mt-2"
                  placeholder="Describe the issue title"
                  value={data.customTitle}
                  onChange={(e) => set('customTitle', e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                rows={5}
                value={data.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Detailed description, error messages, steps to reproduce..."
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label>Priority</Label>
                <ResponsiveSelect
                  value={data.priority}
                  onValueChange={(v) => set('priority', v)}
                  label="Priority"
                  options={PRIORITIES.map((p) => ({ value: p, label: p }))}
                />
              </div>
              <div>
                <Label>Province / Office</Label>
                <ResponsiveSelect
                  value={data.province}
                  onValueChange={(v) => set('province', v)}
                  placeholder="Select..."
                  label="Province / Office"
                  options={PROVINCES.map((p) => ({ value: p, label: p }))}
                />
              </div>
              <div>
                <Label>Department</Label>
                <ResponsiveSelect
                  value={data.department}
                  onValueChange={(v) => set('department', v)}
                  placeholder="Select..."
                  label="Department"
                  options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                />
              </div>
            </div>

            <div>
              <Label>Device / System Info</Label>
              <Input
                placeholder="e.g., HP Laptop, Windows 10, Asset No. 1234"
                value={data.device_info}
                onChange={(e) => set('device_info', e.target.value)}
              />
            </div>

            <div>
              <Label>Attachments / Photos</Label>
              <AttachmentUploader
                attachments={attachments}
                setAttachments={setAttachments}
                uploading={uploading}
                setUploading={setUploading}
                setError={setError}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Ticket submitted. Redirecting...
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/user/dashboard')}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Submit Ticket</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
