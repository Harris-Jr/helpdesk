import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import { getCurrentUser } from '@/lib/auth';

// Maps role to its home route
export function roleHome(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'staff') return '/staff/dashboard';
  return '/user/dashboard';
}

/**
 * RoleGuard - Enforces strict role isolation at the route level.
 * allowedRoles: array of roles allowed. e.g. ['user'], ['staff'], ['admin']
 * Unauthorized users are redirected to their own role's home.
 */
export default function RoleGuard({ allowedRoles, children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <MagnifyingLoader fullScreen message="Verifying access..." />;
  if (!user) return <Navigate to="/" replace />;

  const role = user.role === 'admin' ? 'admin' : user.role === 'staff' ? 'staff' : 'user';
  if (!allowedRoles.includes(role)) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return children;
}