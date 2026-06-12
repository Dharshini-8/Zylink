import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export const Dialog = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-slate-950/60"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xl dark:shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-secondary hover:text-foreground transition-all active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="text-sm text-foreground">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
