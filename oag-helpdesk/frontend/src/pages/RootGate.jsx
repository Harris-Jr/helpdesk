import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, UserCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';
import { roleHome } from '@/components/auth/RoleGuard';

async function resolveUser() {
  try {
    const agoUser = localStorage.getItem('ago_user');
    if (agoUser) return JSON.parse(agoUser);
    const { User } = await import('@/api/entities');
    return await User.me();
  } catch {
    return null;
  }
}

function redirectTo(user, navigate) {
  const role = user.role === 'admin' ? 'admin' : user.role === 'staff' ? 'staff' : 'user';
  navigate(roleHome(role), { replace: true });
}

export default function RootGate() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const u = await resolveUser();
      if (u) {
        redirectTo(u, navigate);
      } else {
        setChecking(false);
      }
    })();
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!credentials.email) throw new Error('Please enter your email.');
      if (!credentials.password) throw new Error('Please enter your password.');
      if (!credentials.email.endsWith('@ago.gov.zm')) throw new Error('Use your @ago.gov.zm email.');

      let authenticatedUser = null;
      // Try AppUser first
      try {
        const { AppUser } = await import('@/api/entities');
        const existing = await AppUser.filter({ email: credentials.email, is_active: true });
        if (existing?.length) {
          const u = existing[0];
          if (u.password_hash === credentials.password) {
            authenticatedUser = {
              id: u.id, email: u.email, full_name: u.full_name, role: u.role,
              province: u.province, district: u.district, job_title: u.job_title,
            };
          }
        }
      } catch {}

      // Try Staff
      if (!authenticatedUser) {
        try {
          const { Staff } = await import('@/api/entities');
          const staff = (await Staff.list()).find(
            (s) => s.email?.toLowerCase() === credentials.email.toLowerCase() && s.is_active
          );
          if (staff && (staff.password_hash === credentials.password || (staff.password_hash === 'password' && credentials.password === 'password'))) {
            authenticatedUser = {
              id: staff.id,
              email: staff.email,
              full_name: staff.full_name,
              role: staff.role.toLowerCase().includes('admin') || staff.role.toLowerCase().includes('head') ? 'admin' : 'staff',
              province: staff.region,
              job_title: staff.role,
            };
          }
        } catch {}
      }

      if (!authenticatedUser) throw new Error('Invalid credentials.');

      localStorage.setItem('ago_user', JSON.stringify(authenticatedUser));
      redirectTo(authenticatedUser, navigate);
    } catch (err) {
      setError(err.message || 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <MagnifyingLoader fullScreen message="Checking session..." />;

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #06402b 0%, #075540 50%, #087450 100%)' }}>
      <div className="absolute inset-0 bg-black/20"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/95 backdrop-blur rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3">
            <img src="/oag-logo.png" alt="OAG" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">OAG Helpdesk</h1>
          <p className="text-gray-600 text-xs mt-1">Office of the Auditor General</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            type="email"
            placeholder="username@ago.gov.zm"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            disabled={loading}
            className="h-11 bg-gray-50 border-0 rounded-xl"
          />
          <Input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            disabled={loading}
            className="h-11 bg-gray-50 border-0 rounded-xl"
          />
          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing In...</> : <><UserCircle className="w-4 h-4 mr-2" />Sign In</>}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          Access is restricted to authorized OAG staff only.
        </p>
      </motion.div>
    </div>
  );
}
