import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Icon } from '../components/Icon';

interface ToastItem {
  id: number;
  text: string;
}

interface ToastApi {
  notify: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const LIFETIME = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current.slice(-2), { id, text }]);
    const timer = window.setTimeout(() => dismiss(id), LIFETIME);
    timers.current.push(timer);
  }, [dismiss]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((item) => (
          <p className="toast" key={item.id}>
            <Icon name="check" size={16} />
            <span>{item.text}</span>
            <button type="button" className="toast__close" onClick={() => dismiss(item.id)}>
              Ocultar
            </button>
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return context;
}
