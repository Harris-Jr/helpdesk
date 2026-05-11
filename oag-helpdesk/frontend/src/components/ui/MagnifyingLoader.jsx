import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function MagnifyingLoader({ message = "Loading...", fullScreen = false }) {
  const Wrapper = ({ children }) =>
    fullScreen ? (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {children}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
        {children}
      </div>
    );

  return (
    <Wrapper>
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          className="relative w-16 h-16"
          animate={{
            x: [0, 12, -12, 8, -8, 0],
            y: [0, -8, 8, -4, 4, 0],
            rotate: [0, 10, -10, 5, -5, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Search className="w-16 h-16 text-green-700" strokeWidth={2.5} />
        </motion.div>
        {message && (
          <p className="text-sm font-medium text-gray-600">{message}</p>
        )}
      </div>
    </Wrapper>
  );
}