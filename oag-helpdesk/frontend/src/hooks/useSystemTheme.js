import { useEffect } from 'react';

/**
 * Auto-apply dark mode based on the system's prefers-color-scheme.
 * Listens to media query changes and toggles the `.dark` class on <html>.
 */
export default function useSystemTheme() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (isDark) => {
      const root = document.documentElement;
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    apply(mq.matches);
    const listener = (e) => apply(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', listener);
    else mq.addListener(listener);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', listener);
      else mq.removeListener(listener);
    };
  }, []);
}