import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalShell from '@/components/shared/PortalShell';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import WelcomeScreen from '@/components/welcome/WelcomeScreen';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import { LayoutDashboard, PlusCircle, Ticket, BookOpen, Settings, Phone } from 'lucide-react';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function UserLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate('/', { replace: true });
        return;
      }
      setUser(u);
      const welcomeKey = `welcome_seen_${u?.id || u?.email || 'user'}`;
      if (!localStorage.getItem(welcomeKey)) setShowWelcome(true);
      setLoading(false);
    })();
  }, [navigate]);

  const handleLogout = () => signOut(navigate);

  const navItems = [
    { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/user/submit-ticket', label: 'Submit Ticket', icon: PlusCircle },
    { to: '/user/my-tickets', label: 'My Tickets', icon: Ticket },
    { to: '/user/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { to: '/user/staff-directory', label: 'Staff Directory', icon: Phone },
    { to: '/user/settings', label: 'Settings', icon: Settings },
  ];

  if (loading) return <MagnifyingLoader fullScreen message="Loading portal..." />;
  if (showWelcome) return <WelcomeScreen user={user} onComplete={() => setShowWelcome(false)} />;

  return (
    <>
      <PortalShell portalLabel="User Portal" user={user} navItems={navItems} onLogout={handleLogout} portalBase="/user" />
      <ChatbotWidget user={user} />
    </>
  );
}