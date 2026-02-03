'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

interface SheetContextValue {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined);

function useSheet() {
    const context = React.useContext(SheetContext);
    if (!context) {
        throw new Error('useSheet must be used within a Sheet');
    }
    return context;
}

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
    const [internalOpen, setInternalOpen] = React.useState(open);
    
    const isOpen = open !== undefined ? open : internalOpen;
    const handleOpenChange = onOpenChange || setInternalOpen;

    return (
        <SheetContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
            {children}
        </SheetContext.Provider>
    );
}

export function SheetTrigger({ children }: { children: React.ReactNode }) {
    const { onOpenChange } = useSheet();

    return (
        <div onClick={() => onOpenChange(true)} className="cursor-pointer">
            {children}
        </div>
    );
}

export function SheetContent({ 
    children, 
    className,
    side = 'right'
}: { 
    children: React.ReactNode; 
    className?: string;
    side?: 'left' | 'right';
}) {
    const { open, onOpenChange } = useSheet();

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />
            {/* Sheet */}
            <div
                className={cn(
                    'fixed top-0 h-full w-full sm:max-w-md bg-background shadow-2xl z-50',
                    'animate-in duration-300 ease-out',
                    side === 'right' ? 'right-0 slide-in-from-right' : 'left-0 slide-in-from-left',
                    className
                )}
            >
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                {children}
            </div>
        </>
    );
}

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('p-6 border-b', className)}>
            {children}
        </div>
    );
}

export function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <h2 className={cn('text-lg font-semibold', className)}>
            {children}
        </h2>
    );
}
