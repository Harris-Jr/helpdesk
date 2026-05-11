import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalShell from '@/components/shared/PortalShell';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import { LayoutDashboard, Ticket, BookOpen, Users, Megaphone, Settings, Phone } from 'lucide-react';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate('/', { replace: true });
        return;
      }
      setUser(u);
      setLoading(false);
    })();
  }, [navigate]);

  const handleLogout = () => signOut(navigate);

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/tickets', label: 'Tickets', icon: Ticket },
    { to: '/admin/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/admin/users', label: 'Users & Staff', icon: Users },
    { to: '/admin/staff-directory', label: 'Staff Directory', icon: Phone },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  if (loading) return <MagnifyingLoader fullScreen message="Loading portal..." />;

  return <PortalShell portalLabel="Admin Portal" user={user} navItems={navItems} onLogout={handleLogout} portalBase="/admin" />;
}