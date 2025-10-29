
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X } from 'react-feather';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS: Record<ToastType, React.ElementType> = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
};

const COLORS: Record<ToastType, string> = {
    success: "from-green-500 to-teal-400",
    error: "from-red-500 to-pink-500",
    info: "from-blue-500 to-cyan-400",
    warning: "from-yellow-500 to-amber-400"
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts.slice(-2), { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  const ToastContainerPortal = () => {
    const target = document.getElementById('toast-container');
    if (!target) return null;

    return createPortal(
        <>
        {toasts.map((toast) => {
            const Icon = ICONS[toast.type];
            const color = COLORS[toast.type];
            return (
            <div
                key={toast.id}
                className={`p-4 rounded-lg shadow-lg text-white font-medium bg-gradient-to-r ${color} transition-all duration-300 flex items-center gap-3 animate-fade-in`}
            >
                <Icon className="w-5 h-5" />
                <span className="flex-grow">{toast.message}</span>
                <button onClick={() => removeToast(toast.id)} className="ml-2 p-1 rounded-full hover:bg-white/20">
                    <X size={16}/>
                </button>
            </div>
            );
        })}
        </>
    , target);
  };


  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainerPortal />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
