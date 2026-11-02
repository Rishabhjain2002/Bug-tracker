import { createContext, useCallback, useContext, useState } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';

const ToastContext = createContext(null);

// Short-lived notifications shown in the bottom-left corner
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // useCallback keeps the function stable so pages can use it inside useEffect
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toasts">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
            {toast.type === 'error' ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
