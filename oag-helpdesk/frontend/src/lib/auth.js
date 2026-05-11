// Centralized auth helpers. Used by layouts, guards, and sign-in page.

export async function getCurrentUser() {
  try {
    const agoUser = localStorage.getItem('ago_user');
    if (agoUser) return JSON.parse(agoUser);
    const { User } = await import('@/api/entities');
    return await User.me();
  } catch {
    return null;
  }
}

/**
 * Fully log the user out:
 *  - call local auth logout (ignore errors if guest / not signed in)
 *  - clear all session data (localStorage + sessionStorage + cookies)
 *  - redirect hard to "/" so no stale React state remains
 */
export async function signOut(navigate) {
  // 1. Clear local auth token
  try {
    const { default: auth } = await import('@/api/auth');
    await auth?.logout?.();
  } catch {
    // ignore — guest users / unauthenticated sessions
  }

  // 2. Clear local session data
  try {
    localStorage.removeItem('ago_user');
    localStorage.removeItem('guest_user'); // legacy cleanup
    localStorage.removeItem('dismissed_announcements');
    sessionStorage.clear();
  } catch {}

  // 3. Clear cookies for current domain
  try {
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0].trim();
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
  } catch {}

  // 4. Redirect — use navigate if provided, otherwise hard redirect
  if (navigate) {
    navigate('/', { replace: true });
  } else {
    window.location.replace('/');
  }
}
