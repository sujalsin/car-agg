'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer({ 
    toasts, 
    removeToast 
}: { 
    toasts: Toast[]; 
    removeToast: (id: string) => void;
}) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem 
                    key={toast.id} 
                    toast={toast} 
                    onRemove={() => removeToast(toast.id)} 
                />
            ))}
        </div>
    );
}

function ToastItem({ 
    toast, 
    onRemove 
}: { 
    toast: Toast; 
    onRemove: () => void;
}) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onRemove, 300);
        }, toast.duration);

        return () => clearTimeout(timer);
    }, [toast.duration, onRemove]);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(onRemove, 300);
    };

    const icons = {
        success: Check,
        error: X,
        warning: AlertCircle,
        info: Info,
    };

    const styles = {
        success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    };

    const Icon = icons[toast.type];

    return (
        <div
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[400px]',
                'transition-all duration-300 ease-out',
                isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
                styles[toast.type]
            )}
            role="alert"
            aria-live="polite"
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={handleRemove}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Convenience hooks
export function useSuccessToast() {
    const { addToast } = useToast();
    return useCallback((message: string, duration?: number) => {
        addToast(message, 'success', duration);
    }, [addToast]);
}

export function useErrorToast() {
    const { addToast } = useToast();
    return useCallback((message: string, duration?: number) => {
        addToast(message, 'error', duration);
    }, [addToast]);
}

export function useInfoToast() {
    const { addToast } = useToast();
    return useCallback((message: string, duration?: number) => {
        addToast(message, 'info', duration);
    }, [addToast]);
}
