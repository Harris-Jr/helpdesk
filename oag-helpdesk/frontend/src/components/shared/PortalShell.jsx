import React, { useEffect, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/notifications/NotificationBell';
import BottomTabBar from '@/components/shared/BottomTabBar';

/**
 * Generic portal shell used by all 3 role portals.
 * Props:
 *  - portalLabel: "User Portal" | "Staff Portal" | "Admin Portal"
 *  - user: current user object
 *  - navItems: [{ to, label, icon }]
 *  - onLogout
 *  - portalBase: e.g. "/user", "/staff", "/admin"
 */
export default function PortalShell({ portalLabel, user, navItems, onLogout, portalBase, children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // A page is a "sub-page" if its path is NOT one of the top-level nav destinations
  // (and is within the current portal). Use this to swap the logo for a Back button.
  const isTopLevel = navItems.some((item) => item.to === location.pathname);
  const isSubPage = !isTopLevel && (!portalBase || location.pathname.startsWith(portalBase));

  const goBack = () => {
    // Use browser history when possible — preserves scroll & state.
    if (window.history.length > 1) {
      window.history.back();
    } else if (portalBase) {
      window.location.assign(portalBase);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen
            ? 'w-64 translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } lg:w-64 lg:translate-x-0 fixed lg:relative h-full transition-all duration-300 bg-green-700 flex-shrink-0 overflow-hidden z-40 lg:z-auto`}
      >
        <div className="h-full flex flex-col w-64">
          <div className="p-5 border-b border-green-800/40 flex items-center gap-3">
            <img
              src="/oag-logo.png"
              alt="OAG"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-white font-bold text-base">Helpdesk</h1>
              <p className="text-green-200 text-xs">{portalLabel}</p>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeOnMobile}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-green-800 text-white font-medium'
                      : 'text-green-100 hover:bg-green-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-green-800/40">
            <div className="bg-green-800/60 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-green-600 text-white text-sm font-bold">
                    {user?.full_name?.split(' ').map((n) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
                  <p className="text-green-200 text-xs truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="w-full text-green-100 hover:bg-green-700 hover:text-white justify-start"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between safe-top">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:inline-flex"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Sub-page Back button OR brand */}
            {isSubPage ? (
              <Button
                variant="ghost"
                onClick={goBack}
                className="gap-1.5 px-2 text-gray-700 hover:text-gray-900"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2 lg:hidden">
                <img
                  src="/oag-logo.png"
                  alt="OAG"
                  className="w-7 h-7 object-contain"
                />
                <span className="text-sm font-bold text-gray-900">Helpdesk</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell userEmail={user?.email} portalBase={portalBase || '/user'} />
            <span className="text-sm text-gray-600 font-medium hidden sm:inline">{portalLabel}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomTabBar navItems={navItems} portalBase={portalBase} />
      </div>
    </div>
  );
}