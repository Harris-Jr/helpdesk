import React, { useState } from 'react';
import { User, Bell, Ticket, Globe, Lock, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import { Textarea } from '@/components/ui/textarea';
import SettingsSection from '@/components/settings/SettingsSection';
import SaveBar from '@/components/settings/SaveBar';
import ToggleRow from '@/components/settings/ToggleRow';
import DeleteAccountDialog from '@/components/settings/DeleteAccountDialog';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'tickets', label: 'Ticket Preferences', icon: Ticket },
  { id: 'appearance', label: 'Appearance', icon: Globe },
  { id: 'security', label: 'Security', icon: Lock },
];

const TIMEZONES = [
  'Africa/Lusaka', 'Africa/Johannesburg', 'Africa/Nairobi', 'UTC', 'Europe/London', 'America/New_York',
];

const LANGUAGES = ['English', 'French', 'Portuguese'];

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [profile, setProfile] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('ago_user') || '{}');
      return {
        full_name: u.full_name || '',
        email: u.email || '',
        phone: u.phone || '',
        job_title: u.job_title || '',
        province: u.province || '',
        avatar: u.avatar || '',
      };
    } catch { return { full_name: '', email: '', phone: '', job_title: '', province: '', avatar: '' }; }
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState('');

  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user_notifs') || '{}'); } catch { return {}; }
  });
  const [notifSaved, setNotifSaved] = useState(false);

  const [ticketPrefs, setTicketPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user_ticket_prefs') || '{}'); } catch { return {}; }
  });
  const [ticketSaved, setTicketSaved] = useState(false);

  const [appearance, setAppearance] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user_appearance') || '{}'); } catch { return {}; }
  });
  const [appearanceSaved, setAppearanceSaved] = useState(false);

  const saveProfile = () => {
    const stored = JSON.parse(localStorage.getItem('ago_user') || '{}');
    localStorage.setItem('ago_user', JSON.stringify({ ...stored, ...profile }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const savePassword = () => {
    setPasswordMsg('');
    if (!passwords.current) { setPasswordMsg('Enter your current password.'); return; }
    if (passwords.next.length < 6) { setPasswordMsg('New password must be at least 6 characters.'); return; }
    if (passwords.next !== passwords.confirm) { setPasswordMsg('Passwords do not match.'); return; }
    // In this custom-auth system, we update the stored hash directly
    const stored = JSON.parse(localStorage.getItem('ago_user') || '{}');
    if (stored.password_hash && stored.password_hash !== passwords.current) {
      setPasswordMsg('Current password is incorrect.');
      return;
    }
    localStorage.setItem('ago_user', JSON.stringify({ ...stored, password_hash: passwords.next }));
    setPasswords({ current: '', next: '', confirm: '' });
    setPasswordMsg('Password updated successfully.');
  };

  const saveNotifs = () => {
    localStorage.setItem('user_notifs', JSON.stringify(notifs));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  const saveTicketPrefs = () => {
    localStorage.setItem('user_ticket_prefs', JSON.stringify(ticketPrefs));
    setTicketSaved(true);
    setTimeout(() => setTicketSaved(false), 2500);
  };

  const saveAppearance = () => {
    localStorage.setItem('user_appearance', JSON.stringify(appearance));
    setAppearanceSaved(true);
    setTimeout(() => setAppearanceSaved(false), 2500);
  };

  return (
    <div className="flex min-h-full bg-gray-50">
      {/* Sidebar */}
      <aside className="w-48 flex-shrink-0 bg-white border-r border-gray-200 p-3 space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">Settings</p>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-50 text-green-800 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </aside>

      {/* Main */}
      <div className="flex-1 p-6 max-w-2xl space-y-4 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-900">User Settings</h1>

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <SettingsSection title="Profile Settings" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={profile.email} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+260..." />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input value={profile.job_title} onChange={(e) => setProfile({ ...profile, job_title: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Province / Region</Label>
                <Input value={profile.province} onChange={(e) => setProfile({ ...profile, province: e.target.value })} />
              </div>
            </div>
            <SaveBar onSave={saveProfile} saved={profileSaved} />
          </SettingsSection>
        )}

        {/* SECURITY */}
        {activeTab === 'security' && (
          <>
            <SettingsSection title="Change Password" icon={Lock}>
              <div>
                <Label>Current Password</Label>
                <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
              </div>
              <div>
                <Label>New Password</Label>
                <Input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
              </div>
              {passwordMsg && (
                <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-700' : 'text-red-600'}`}>{passwordMsg}</p>
              )}
              <SaveBar onSave={savePassword} />
            </SettingsSection>

            <SettingsSection title="Two-Factor Authentication" icon={Lock}>
              <ToggleRow
                label="Enable 2FA"
                description="Adds an extra layer of security to your account."
                checked={!!appearance.tfa}
                onChange={(v) => setAppearance({ ...appearance, tfa: v })}
              />
              <p className="text-xs text-gray-500">2FA is enforced via your organisation's email. Contact IT Admin to configure device-based 2FA.</p>
            </SettingsSection>

            <SettingsSection title="Delete Account">
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                onClick={() => setDeleteOpen(true)}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
              <DeleteAccountDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                userEmail={profile.email}
              />
            </SettingsSection>
          </>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <SettingsSection title="Notification Preferences" icon={Bell}>
            <ToggleRow
              label="Ticket Updates"
              description="Get notified when your ticket status changes."
              checked={notifs.ticket_updates !== false}
              onChange={(v) => setNotifs({ ...notifs, ticket_updates: v })}
            />
            <ToggleRow
              label="New Assignments"
              description="Get notified when a ticket is assigned to you."
              checked={notifs.assignments !== false}
              onChange={(v) => setNotifs({ ...notifs, assignments: v })}
            />
            <ToggleRow
              label="Comments & Replies"
              description="Get notified on new comments or replies."
              checked={notifs.comments !== false}
              onChange={(v) => setNotifs({ ...notifs, comments: v })}
            />
            <div className="pt-2">
              <Label>Notification Frequency</Label>
              <ResponsiveSelect
                value={notifs.frequency || 'instant'}
                onValueChange={(v) => setNotifs({ ...notifs, frequency: v })}
                label="Notification Frequency"
                className="mt-1 w-full sm:w-48"
                options={[
                  { value: 'instant', label: 'Instant' },
                  { value: 'daily', label: 'Daily Digest' },
                ]}
              />
            </div>
            <SaveBar onSave={saveNotifs} saved={notifSaved} />
          </SettingsSection>
        )}

        {/* TICKET PREFERENCES */}
        {activeTab === 'tickets' && (
          <SettingsSection title="Ticket Preferences" icon={Ticket}>
            <div>
              <Label>Default Ticket View</Label>
              <ResponsiveSelect
                value={ticketPrefs.view || 'list'}
                onValueChange={(v) => setTicketPrefs({ ...ticketPrefs, view: v })}
                label="Default Ticket View"
                className="mt-1 w-full sm:w-48"
                options={[
                  { value: 'list', label: 'List' },
                  { value: 'board', label: 'Board' },
                ]}
              />
            </div>
            <div>
              <Label>Default Filter</Label>
              <ResponsiveSelect
                value={ticketPrefs.filter || 'my_open'}
                onValueChange={(v) => setTicketPrefs({ ...ticketPrefs, filter: v })}
                label="Default Filter"
                className="mt-1 w-full sm:w-48"
                options={[
                  { value: 'my_open', label: 'My Open Tickets' },
                  { value: 'all', label: 'All Tickets' },
                  { value: 'resolved', label: 'Resolved' },
                ]}
              />
            </div>
            <div>
              <Label>Reply Signature</Label>
              <Textarea
                value={ticketPrefs.signature || ''}
                onChange={(e) => setTicketPrefs({ ...ticketPrefs, signature: e.target.value })}
                placeholder="e.g. Regards, John Doe | IT Department"
                rows={3}
              />
            </div>
            <SaveBar onSave={saveTicketPrefs} saved={ticketSaved} />
          </SettingsSection>
        )}

        {/* APPEARANCE */}
        {activeTab === 'appearance' && (
          <SettingsSection title="Localization & Appearance" icon={Globe}>
            <div>
              <Label>Language</Label>
              <ResponsiveSelect
                value={appearance.language || 'English'}
                onValueChange={(v) => setAppearance({ ...appearance, language: v })}
                label="Language"
                className="mt-1 w-full sm:w-48"
                options={LANGUAGES.map((l) => ({ value: l, label: l }))}
              />
            </div>
            <div>
              <Label>Timezone</Label>
              <ResponsiveSelect
                value={appearance.timezone || 'Africa/Lusaka'}
                onValueChange={(v) => setAppearance({ ...appearance, timezone: v })}
                label="Timezone"
                className="mt-1 w-full sm:w-64"
                options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
              />
            </div>
            <ToggleRow
              label="Dark Mode"
              description="Switch to dark interface theme."
              checked={!!appearance.dark_mode}
              onChange={(v) => setAppearance({ ...appearance, dark_mode: v })}
            />
            <SaveBar onSave={saveAppearance} saved={appearanceSaved} />
          </SettingsSection>
        )}
      </div>
    </div>
  );
}