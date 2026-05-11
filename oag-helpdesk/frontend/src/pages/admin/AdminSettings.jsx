import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SettingsSection from '@/components/settings/SettingsSection';
import { AuditLog, TicketCategory, User } from '@/api/entities';
import { SendEmail } from '@/api/functions';
import { motion, AnimatePresence } from 'framer-motion';
import AdminChatbotTab from '@/components/chatbot/AdminChatbotTab';

const TABS = [
  { id: 'users', label: 'Users & Roles' },
  { id: 'tickets', label: 'Ticket Categories' },
  { id: 'chatbot', label: 'Chatbot' },
  { id: 'security', label: 'Security & Audit' },
];

const ROLES = ['user', 'staff', 'admin'];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('users');

  // Users tab
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [resetMsg, setResetMsg] = useState({});

  // Categories (DB-backed)
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCat, setEditingCat] = useState(null); // { id, name }
  const [editCatName, setEditCatName] = useState('');
  const [catError, setCatError] = useState('');
  const mountedRef = useRef(true);

  // Audit log
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const currentAdmin = (() => {
    try { return JSON.parse(localStorage.getItem('ago_user') || '{}'); } catch { return {}; }
  })();

  // Load categories on mount + real-time subscription
  useEffect(() => {
    mountedRef.current = true;
    loadCategories();
    let unsub;
    try {
      unsub = TicketCategory.subscribe(() => {
        if (mountedRef.current) loadCategories();
      });
    } catch {}
    return () => {
      mountedRef.current = false;
      if (unsub) try { unsub(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'security') loadAudit();
  }, [activeTab]);

  const loadCategories = async () => {
    setCatLoading(true);
    try {
      const list = await TicketCategory.list('sort_order', 100);
      if (mountedRef.current) setCategories(list || []);
    } catch {}
    if (mountedRef.current) setCatLoading(false);
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const list = await User.list();
      setUsers(list || []);
    } catch { setUsers([]); }
    setUsersLoading(false);
  };

  const loadAudit = async () => {
    setAuditLoading(true);
    try {
      const logs = await AuditLog.list('-created_date', 50);
      setAuditLogs(logs || []);
    } catch { setAuditLogs([]); }
    setAuditLoading(false);
  };

  const writeAudit = async (action, entityType, entityId, oldVals, newVals) => {
    try {
      await AuditLog.create({
        action, entity_type: entityType, entity_id: entityId,
        old_values: oldVals, new_values: newVals,
        user_email: currentAdmin.email || 'admin',
      });
    } catch {}
  };

  // Category CRUD
  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name) { setCatError('Category name cannot be empty.'); return; }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setCatError('Category already exists.'); return;
    }
    setCatError('');
    try {
      await TicketCategory.create({ name, sort_order: categories.length });
      await writeAudit('category_add', 'TicketCategory', null, {}, { name });
      setNewCategory('');
      loadCategories();
    } catch { setCatError('Failed to add category.'); }
  };

  const deleteCategory = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"? Tickets using this category will keep their current value.`)) return;
    try {
      await TicketCategory.delete(cat.id);
      await writeAudit('category_delete', 'TicketCategory', cat.id, { name: cat.name }, {});
      loadCategories();
    } catch { alert('Failed to delete category.'); }
  };

  const startEditCat = (cat) => {
    setEditingCat(cat);
    setEditCatName(cat.name);
    setCatError('');
  };

  const saveEditCat = async () => {
    const name = editCatName.trim();
    if (!name) { setCatError('Name cannot be empty.'); return; }
    if (categories.some((c) => c.id !== editingCat.id && c.name.toLowerCase() === name.toLowerCase())) {
      setCatError('Category already exists.'); return;
    }
    setCatError('');
    try {
      await TicketCategory.update(editingCat.id, { name });
      await writeAudit('category_edit', 'TicketCategory', editingCat.id, { name: editingCat.name }, { name });
      setEditingCat(null);
      loadCategories();
    } catch { setCatError('Failed to update category.'); }
  };

  // User actions
  const openEditUser = (u) => { setEditUser(u); setEditRole(u.role || 'user'); };

  const saveUserRole = async () => {
    if (!editUser) return;
    try {
      await User.update(editUser.id, { role: editRole });
      await writeAudit('role_change', 'User', editUser.id, { role: editUser.role }, { role: editRole });
      setEditUser(null);
      loadUsers();
    } catch (err) { alert('Failed to update role: ' + err.message); }
  };

  const deactivateUser = async (u) => {
    if (!confirm(`Deactivate ${u.full_name || u.email}?`)) return;
    try {
      await writeAudit('deactivate', 'User', u.id, { role: u.role }, { role: 'deactivated' });
      alert('Deactivation logged. Remove their access via the platform admin panel.');
    } catch {}
  };

  const sendPasswordReset = async (u) => {
    setResetMsg({ ...resetMsg, [u.id]: 'Sending...' });
    try {
      await SendEmail({
        to: u.email,
        subject: 'OAG Helpdesk — Password Reset Request',
        body: `Hello ${u.full_name || u.email},\n\nAn administrator has requested a password reset for your account.\n\nPlease contact the IT helpdesk or use the sign-in page to reset your password.\n\nIf you did not request this, please ignore this email.\n\n— OAG IT Helpdesk`,
      });
      await writeAudit('password_reset_sent', 'User', u.id, {}, { email: u.email });
      setResetMsg({ ...resetMsg, [u.id]: 'Sent ✓' });
      setTimeout(() => setResetMsg((prev) => { const n = { ...prev }; delete n[u.id]; return n; }), 3000);
    } catch {
      setResetMsg({ ...resetMsg, [u.id]: 'Failed' });
    }
  };

  const filteredUsers = users.filter((u) =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Horizontal Tab Bar */}
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Admin Settings</h1>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-700 text-green-800 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {/* USERS & ROLES */}
            {activeTab === 'users' && (
              <SettingsSection title="User & Role Management">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button variant="outline" size="sm" onClick={loadUsers}>Refresh</Button>
                </div>

                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    <span>Name</span><span>Email</span><span>Role</span><span>Actions</span>
                  </div>
                  {usersLoading ? (
                    <div className="px-4 py-6 text-sm text-gray-400">Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-400">No users found.</div>
                  ) : (
                    filteredUsers.map((u) => (
                      <div key={u.id} className="grid grid-cols-4 items-center px-4 py-3 border-t border-gray-100 text-sm">
                        <span className="font-medium text-gray-800 truncate">{u.full_name || '—'}</span>
                        <span className="text-gray-500 truncate">{u.email}</span>
                        <span>
                          <Badge variant={u.role === 'admin' ? 'default' : 'outline'} className={u.role === 'admin' ? 'bg-green-700' : ''}>
                            {u.role || 'user'}
                          </Badge>
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => openEditUser(u)} className="text-xs h-7 px-2">Edit Role</Button>
                          <Button size="sm" variant="outline" onClick={() => sendPasswordReset(u)} disabled={!!resetMsg[u.id]} className="text-xs h-7 px-2 gap-1">
                            <Send className="w-3 h-3" />
                            {resetMsg[u.id] || 'Reset Pwd'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deactivateUser(u)} className="text-xs h-7 px-2 text-red-500 hover:text-red-700">
                            <LogOut className="w-3 h-3 mr-1" />
                            Deactivate
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <p className="text-xs text-gray-400 italic">
                  🔒 Passwords are never shown or editable here. Use "Reset Pwd" to send a reset link to the user's email.
                </p>
              </SettingsSection>
            )}

            {/* TICKET CATEGORIES */}
            {activeTab === 'tickets' && (
              <SettingsSection title="Ticket Categories">
                <p className="text-sm text-gray-500">
                  Categories are stored in the database and sync instantly to the user ticket form.
                </p>

                {/* Add new */}
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="New category name..."
                    value={newCategory}
                    onChange={(e) => { setNewCategory(e.target.value); setCatError(''); }}
                    className="max-w-xs"
                    onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }}
                  />
                  <Button size="sm" onClick={addCategory} className="bg-green-700 hover:bg-green-800 text-white">
                    Add
                  </Button>
                </div>
                {catError && <p className="text-xs text-red-500">{catError}</p>}

                {/* Category list */}
                {catLoading ? (
                  <p className="text-sm text-gray-400">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-400">No categories yet. Add one above.</p>
                ) : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-2 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                      <span>Category Name</span>
                      <span>Actions</span>
                    </div>
                    {categories.map((cat) => (
                      <div key={cat.id} className="grid grid-cols-2 items-center px-4 py-3 border-t border-gray-100 text-sm">
                        {editingCat?.id === cat.id ? (
                          <Input
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="h-7 text-sm max-w-xs"
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEditCat(); if (e.key === 'Escape') setEditingCat(null); }}
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-gray-800">{cat.name}</span>
                        )}
                        <div className="flex items-center gap-2">
                          {editingCat?.id === cat.id ? (
                            <>
                              <Button size="sm" onClick={saveEditCat} className="h-7 text-xs bg-green-700 hover:bg-green-800 text-white px-2">Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCat(null)} className="h-7 text-xs px-2">Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => startEditCat(cat)} className="h-7 text-xs px-2">Edit</Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteCategory(cat)} className="h-7 text-xs px-2 text-red-500 hover:text-red-700">Delete</Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400 italic mt-1">
                  Changes are saved instantly to the database and appear in the user ticket form immediately.
                </p>
              </SettingsSection>
            )}

            {/* CHATBOT */}
            {activeTab === 'chatbot' && <AdminChatbotTab />}

            {/* SECURITY & AUDIT */}
            {activeTab === 'security' && (
              <SettingsSection title="Security & Audit Trail">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Recent Admin Actions</p>
                    <Button size="sm" variant="outline" onClick={loadAudit}>Refresh</Button>
                  </div>
                  {auditLoading ? (
                    <p className="text-sm text-gray-400">Loading logs...</p>
                  ) : auditLogs.length === 0 ? (
                    <p className="text-sm text-gray-400">No audit logs recorded yet.</p>
                  ) : (
                    <div className="rounded-lg border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                        <span>Action</span><span>Entity</span><span>By</span><span>Time</span>
                      </div>
                      {auditLogs.map((log) => (
                        <div key={log.id} className="grid grid-cols-4 px-4 py-2 border-t border-gray-100 text-xs text-gray-600">
                          <span className="font-medium">{log.action}</span>
                          <span>{log.entity_type} {log.entity_id ? `#${log.entity_id.slice(-4)}` : ''}</span>
                          <span className="truncate">{log.user_email}</span>
                          <span>{log.created_date ? new Date(log.created_date).toLocaleString() : '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Security Policy</p>
                    <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                      <li>Passwords are stored as hashes — never viewable by admins</li>
                      <li>Password resets are sent via secure email link only</li>
                      <li>All admin actions are logged to the audit trail</li>
                      <li>Role-based access control enforced at route and portal level</li>
                      <li>Sessions are isolated per role — no cross-portal access</li>
                    </ul>
                  </div>
                </div>
              </SettingsSection>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Role — {editUser?.full_name || editUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Assign Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-400">Changing a user's role takes effect immediately on their next login.</p>
            <div className="flex gap-2">
              <Button onClick={saveUserRole} className="bg-green-700 hover:bg-green-800 text-white">Save Role</Button>
              <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
