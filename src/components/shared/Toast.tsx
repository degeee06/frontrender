
import React from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const toastColors: Record<ToastType, string> = {
    success: "bg-gradient-to-r from-green-500 to-teal-400",
    error: "bg-gradient-to-r from-red-500 to-pink-500",
    info: "bg-gradient-to-r from-blue-500 to-cyan-400",
    warning: "bg-gradient-to-r from-yellow-500 to-amber-400"
};

const toastIcons: Record<ToastType, string> = {
    success: "check-circle",
    error: "alert-circle",
    info: "info",
    warning: "alert-triangle"
};

const Toast: React.FC<{ message: string; type: ToastType; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);
    
    return (
        <div className={`p-4 rounded-lg shadow-lg text-white font-medium ${toastColors[type]} flex items-center gap-3 animate-fade-in`}>
            <i data-feather={toastIcons[type]} className="w-5 h-5"></i>
            <span>{message}</span>
        </div>
    );
};

const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = React.useState<{ id: number; message: string; type: ToastType }[]>([]);

    const show = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };
    
    React.useEffect(() => {
        (window as any).showToast = show;
        return () => { delete (window as any).showToast; }
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    React.useEffect(() => {
        (window as any).feather?.replace();
    }, [toasts]);

    return (
        <div className="fixed top-4 right-4 space-y-2 z-[100]">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

// Export a function to be called from anywhere
export const showToast = (message: string, type: ToastType = 'info') => {
    (window as any).showToast?.(message, type);
};

export { ToastContainer };
