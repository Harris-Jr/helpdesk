import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalShell from '@/components/shared/PortalShell';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import { LayoutDashboard, Ticket, BookOpen } from 'lucide-react';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function StaffLayout() {
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
    { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff/tickets', label: 'Ticket Management', icon: Ticket },
    { to: '/staff/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  ];

  if (loading) return <MagnifyingLoader fullScreen message="Loading portal..." />;

  return <PortalShell portalLabel="Staff Portal" user={user} navItems={navItems} onLogout={handleLogout} portalBase="/staff" />;
}