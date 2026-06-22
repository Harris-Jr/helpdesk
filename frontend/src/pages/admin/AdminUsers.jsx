import { useState, useEffect, useCallback } from 'react';
import { User } from '../../entities/User';
import { invoke } from '../../utils/invoke';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, KeyRound } from 'lucide-react';
import MagnifyingLoader from '../../components/MagnifyingLoader';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
      {message}
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ full_name: '', email: '', role: 'user', department: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.full_name.trim() || !form.email.trim()) { setError('Full name and email are required.'); return; }
    setLoading(true);
    try {
      const result = await invoke('createUser', form);
      onCreated(`User created. Temporary password: ${result.tempPassword}`);
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input value={form.full_name} onChange={handle('full_name')} placeholder="e.g. John Banda" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <Input type="email" value={form.email} onChange={handle('email')} placeholder="e.g. john.banda@oag.gov.zm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-gray-400 font-normal">(optional)</span></label>
            <Input value={form.department} onChange={handle('department')} placeholder="e.g. ICT, Audit, Finance" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={submit} disabled={loading} className="flex-1">{loading ? 'Creating...' : 'Create User'}</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [resettingId, setResettingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = useCallback(async () => {
    try {
      setUsers(await User.list('-created_date', 500));
    } catch {
      showToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (u, role) => {
    try {
      await User.update(u.id, { role });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role } : x));
      showToast(`${u.full_name}'s role updated to ${role}.`);
    } catch {
      showToast('Failed to update role.', 'error');
    }
  };

  const resetPassword = async (u) => {
    if (!confirm(`Reset password for ${u.full_name}? A temporary password will be sent to their email.`)) return;
    setResettingId(u.id);
    try {
      const result = await invoke('resetUserPassword', { userId: u.id });
      showToast(result.message || `Password reset email sent to ${u.email}.`);
    } catch (err) {
      showToast(err.message || 'Failed to reset password.', 'error');
    } finally {
      setResettingId(null);
    }
  };

  const handleCreated = (message) => {
    setShowCreate(false);
    load();
    showToast(message || 'User created successfully.');
  };

  if (loading) return <MagnifyingLoader fullScreen message="Loading users..." />;

  const filtered = users.filter((u) => {
    const mq = !q || u.email?.toLowerCase().includes(q.toLowerCase()) || u.full_name?.toLowerCase().includes(q.toLowerCase());
    const mr = roleFilter === 'All' || u.role === roleFilter.toLowerCase();
    return mq && mr;
  });

  const roleBadgeClass = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    staff: 'bg-blue-100 text-blue-700 border-blue-200',
    user: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users & Access</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {users.length} total · {users.filter(u => u.role === 'admin').length} admins · {users.filter(u => u.role === 'staff').length} staff
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search by name or email..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
            <SelectItem value="User">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No users found.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((u) => (
            <Card key={u.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{u.full_name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  {u.department && <p className="text-xs text-gray-400 mt-0.5">{u.department}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${roleBadgeClass[u.role] || roleBadgeClass.user}`}>
                    {u.role || 'user'}
                  </span>
                  <Select value={u.role || 'user'} onValueChange={(v) => changeRole(u, v)}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs flex items-center gap-1"
                    disabled={resettingId === u.id}
                    onClick={() => resetPassword(u)}
                  >
                    <KeyRound className="w-3 h-3" />
                    {resettingId === u.id ? 'Sending...' : 'Reset Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
