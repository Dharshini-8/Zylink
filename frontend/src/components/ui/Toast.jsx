import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    info: (msg, dur) => show(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-md ${
                t.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : t.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400'
              }`}
            >
              <div className="flex items-center gap-3">
                {t.type === 'success' && <CheckCircle size={18} className="shrink-0 text-emerald-500" />}
                {t.type === 'error' && <XCircle size={18} className="shrink-0 text-rose-500" />}
                {t.type === 'info' && <AlertCircle size={18} className="shrink-0 text-indigo-500" />}
                <p className="text-xs font-semibold leading-none">{t.message}</p>
              </div>
              <button
                onClick={() => remove(t.id)}
                className="ml-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
