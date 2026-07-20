import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto p-4 rounded-xl glass-panel shadow-2xl border flex items-start gap-3 backdrop-blur-xl ${
                toast.type === 'success'
                  ? 'border-[#0ECB81]/40 bg-[#0ECB81]/10 text-white'
                  : toast.type === 'error'
                  ? 'border-[#F6465D]/40 bg-[#F6465D]/10 text-white'
                  : 'border-[#F0B90B]/40 bg-[#F0B90B]/10 text-white'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#0ECB81]" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#F6465D]" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-[#F0B90B]" />}
              </div>
              <div className="flex-1">
                {toast.title && <h4 className="font-semibold text-sm mb-0.5">{toast.title}</h4>}
                <p className="text-xs text-gray-200">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
