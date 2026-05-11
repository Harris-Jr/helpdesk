import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function WelcomeScreen({ onComplete, user }) {
  const handleEnter = () => {
    const key = `welcome_seen_${user?.id || user?.email || 'user'}`;
    localStorage.setItem(key, 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-20 h-20 mx-auto mb-6">
          
          <img
            src="/oag-logo.png"
            alt="OAG Logo"
            className="w-full h-full object-contain" />
          
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          
          Welcome to OAG Helpdesk
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed">
          
          The Office of the Auditor General's secure, centralized IT support platform.
          Submit tickets, track progress, and get expert help from our IT team.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }} className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8 hidden">
          
          
          <ShieldCheck className="w-4 h-4 text-green-700" />
          <span className=" hidden">Government-grade security</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}>
          
          <Button
            onClick={handleEnter}
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg">
            
            Enter
          </Button>
        </motion.div>
      </motion.div>
    </div>);

}