import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const TRIGGER = 70;
const MAX = 110;

/**
 * Pull-to-refresh wrapper. Triggers onRefresh when user pulls down
 * from the top of the scroll container on touch devices.
 */
export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const canPull = useRef(false);

  const onTouchStart = (e) => {
    if (refreshing) return;
    // Only activate when scrolled to very top
    const scroller = e.currentTarget;
    canPull.current = scroller.scrollTop <= 0;
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    if (!canPull.current || refreshing || startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      // Resistance curve
      const distance = Math.min(MAX, dy * 0.5);
      setPull(distance);
    }
  };

  const onTouchEnd = async () => {
    if (refreshing) return;
    if (pull >= TRIGGER) {
      setRefreshing(true);
      setPull(TRIGGER);
      try { await onRefresh?.(); } catch {}
      setRefreshing(false);
    }
    setPull(0);
    startY.current = null;
    canPull.current = false;
  };

  const progress = Math.min(1, pull / TRIGGER);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      <AnimatePresence>
        {(pull > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: pull }}
            exit={{ opacity: 0, y: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-10"
            style={{ transform: `translateY(${Math.max(0, pull - 30)}px)` }}
          >
            <div className="bg-white shadow-md rounded-full p-2 border border-gray-200">
              <RefreshCw
                className={`w-5 h-5 text-green-700 ${refreshing ? 'animate-spin' : ''}`}
                style={{ transform: refreshing ? undefined : `rotate(${progress * 360}deg)` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div animate={{ y: refreshing ? TRIGGER / 2 : 0 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.div>
    </div>
  );
}