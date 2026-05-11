import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Fixed mobile bottom tab bar that mirrors main navigation.
 * Hidden on md+ screens. Respects safe-area-inset-bottom.
 *
 * Tab preservation:
 *   For each top-level tab, we remember the LAST sub-path the user visited
 *   under that tab (e.g. /user/my-tickets -> /user/ticket?id=123). Tapping
 *   the tab again restores that sub-path instead of resetting to root,
 *   so switching tabs doesn't lose screen state.
 *
 * Storage: sessionStorage keyed by `tabHistory:<portalBase>`.
 */
export default function BottomTabBar({ navItems = [], portalBase = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = navItems.slice(0, 5);
  const storageKey = `tabHistory:${portalBase || 'default'}`;
  const historyRef = useRef({});

  // Load saved tab history on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) historyRef.current = JSON.parse(saved) || {};
    } catch {}
  }, [storageKey]);

  // Track current location under the matching tab
  useEffect(() => {
    const currentTab = items.find(
      (i) => location.pathname === i.to || location.pathname.startsWith(i.to + '/')
    );
    // Also bucket sub-pages under their owning portal section by best prefix match
    const owningTab =
      currentTab ||
      items.find((i) => location.pathname.startsWith(portalBase + '/') && location.pathname !== i.to);

    if (owningTab) {
      const fullPath = location.pathname + location.search + location.hash;
      historyRef.current[owningTab.to] = fullPath;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(historyRef.current));
      } catch {}
    }
  }, [location.pathname, location.search, location.hash, items, portalBase, storageKey]);

  const handleTabClick = (e, item) => {
    e.preventDefault();
    const remembered = historyRef.current[item.to];
    const alreadyOnTab =
      location.pathname === item.to || location.pathname.startsWith(item.to + '/');

    // If user taps the tab they're currently on, go to its root (reset)
    if (alreadyOnTab) {
      navigate(item.to);
      return;
    }
    // Otherwise restore last sub-path under that tab, or go to its root
    navigate(remembered || item.to);
  };

  return (
    <motion.nav
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-bottom"
    >
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <a
              key={item.to}
              href={item.to}
              onClick={(e) => handleTabClick(e, item)}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 relative"
            >
              {active && (
                <motion.span
                  layoutId="bottomTabIndicator"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-green-700 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 ${active ? 'text-green-700' : 'text-gray-500'}`} />
              <span className={`text-[10px] mt-1 truncate max-w-full ${active ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </motion.nav>
  );
}