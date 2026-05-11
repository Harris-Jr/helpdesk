import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 justify-start"
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-white shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
          <div className="flex gap-1">
            <motion.span className="w-1.5 h-1.5 bg-green-700 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0 }} />
            <motion.span className="w-1.5 h-1.5 bg-green-700 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.15 }} />
            <motion.span className="w-1.5 h-1.5 bg-green-700 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.3 }} />
          </div>
          <span className="text-xs text-gray-400">AI is typing…</span>
        </div>
      </div>
    </motion.div>
  );
}