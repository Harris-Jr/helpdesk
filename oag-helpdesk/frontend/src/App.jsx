import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';

import PageNotFound from './lib/PageNotFound';
import RootGate from './pages/RootGate';

import UserLayout from './layouts/UserLayout';
import StaffLayout from './layouts/StaffLayout';
import AdminLayout from './layouts/AdminLayout';

import RoleGuard from './components/auth/RoleGuard';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import SubmitTicket from './pages/user/SubmitTicket';
import MyTickets from './pages/user/MyTickets';
import UserTicketDetails from './pages/user/UserTicketDetails';
import UserKnowledgeBase from './pages/user/UserKnowledgeBase';
import UserSettings from './pages/user/UserSettings';
import StaffDirectory from './pages/user/StaffDirectory';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';
import TicketManagement from './pages/staff/TicketManagement';
import StaffTicketDetails from './pages/staff/StaffTicketDetails';
import StaffKnowledgeBase from './pages/staff/StaffKnowledgeBase';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets from './pages/admin/AdminTickets';
import AdminTicketDetails from './pages/admin/AdminTicketDetails';
import AdminKnowledgeBase from './pages/admin/AdminKnowledgeBase';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminStaffDirectory from './pages/admin/AdminStaffDirectory';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Public root — sign-in / auto-redirect */}
            <Route path="/" element={<RootGate />} />

            {/* USER PORTAL */}
            <Route
              path="/user"
              element={<RoleGuard allowedRoles={['user']}><UserLayout /></RoleGuard>}
            >
              <Route index element={<Navigate to="/user/dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="submit-ticket" element={<SubmitTicket />} />
              <Route path="my-tickets" element={<MyTickets />} />
              <Route path="ticket" element={<UserTicketDetails />} />
              <Route path="knowledge-base" element={<UserKnowledgeBase />} />
              <Route path="staff-directory" element={<StaffDirectory />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>

            {/* STAFF PORTAL */}
            <Route
              path="/staff"
              element={<RoleGuard allowedRoles={['staff']}><StaffLayout /></RoleGuard>}
            >
              <Route index element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="tickets" element={<TicketManagement />} />
              <Route path="ticket" element={<StaffTicketDetails />} />
              <Route path="knowledge-base" element={<StaffKnowledgeBase />} />
            </Route>

            {/* ADMIN PORTAL */}
            <Route
              path="/admin"
              element={<RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard>}
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="ticket" element={<AdminTicketDetails />} />
              <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="staff-directory" element={<AdminStaffDirectory />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;