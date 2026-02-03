'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
    saveVehicle, 
    removeSavedVehicle, 
    isVehicleSaved,
    SavedVehicle 
} from '@/lib/saved-vehicles';

interface SaveVehicleButtonProps {
    year: number;
    make: string;
    model: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
    onSave?: () => void;
    onRemove?: () => void;
}

export function SaveVehicleButton({
    year,
    make,
    model,
    variant = 'default',
    size = 'default',
    className,
    onSave,
    onRemove,
}: SaveVehicleButtonProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsSaved(isVehicleSaved(year, make, model));
    }, [year, make, model]);

    // Listen for changes from other components
    useEffect(() => {
        const handleChange = () => {
            setIsSaved(isVehicleSaved(year, make, model));
        };

        window.addEventListener('savedVehiclesChanged', handleChange);
        return () => window.removeEventListener('savedVehiclesChanged', handleChange);
    }, [year, make, model]);

    const handleClick = useCallback(async () => {
        setIsLoading(true);

        if (isSaved) {
            const success = removeSavedVehicle(year, make, model);
            if (success) {
                setIsSaved(false);
                onRemove?.();
            }
        } else {
            const success = saveVehicle({ year, make, model });
            if (success) {
                setIsSaved(true);
                onSave?.();
            }
        }

        setIsLoading(false);
    }, [isSaved, year, make, model, onSave, onRemove]);

    const sizeClasses = {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    const variantClasses = {
        default: isSaved 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: isSaved
            ? 'border-primary text-primary hover:bg-primary/10'
            : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: isSaved
            ? 'text-primary hover:bg-primary/10'
            : 'hover:bg-accent hover:text-accent-foreground',
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50',
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            aria-label={isSaved ? 'Remove from saved vehicles' : 'Save vehicle'}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
                <BookmarkCheck className="w-4 h-4" />
            ) : (
                <Bookmark className="w-4 h-4" />
            )}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
    );
}

// Compare button variant
import { Scale } from 'lucide-react';
import { addToCompare, removeFromCompare, isInCompareList } from '@/lib/saved-vehicles';

interface CompareButtonProps {
    year: number;
    make: string;
    model: string;
    className?: string;
    onAdd?: () => void;
    onRemove?: () => void;
}

export function CompareButton({
    year,
    make,
    model,
    className,
    onAdd,
    onRemove,
}: CompareButtonProps) {
    const [isInCompare, setIsInCompare] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setIsInCompare(isInCompareList(year, make, model));
    }, [year, make, model]);

    useEffect(() => {
        const handleChange = () => {
            setIsInCompare(isInCompareList(year, make, model));
        };

        window.addEventListener('compareListChanged', handleChange);
        return () => window.removeEventListener('compareListChanged', handleChange);
    }, [year, make, model]);

    const handleClick = useCallback(async () => {
        setIsLoading(true);
        setMessage('');

        if (isInCompare) {
            const success = removeFromCompare(year, make, model);
            if (success) {
                setIsInCompare(false);
                onRemove?.();
            }
        } else {
            const result = addToCompare({ year, make, model });
            if (result.success) {
                setIsInCompare(true);
                onAdd?.();
            } else {
                setMessage(result.message);
            }
        }

        setIsLoading(false);
    }, [isInCompare, year, make, model, onAdd, onRemove]);

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                disabled={isLoading}
                className={cn(
                    'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:pointer-events-none disabled:opacity-50',
                    isInCompare
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    className
                )}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Scale className="w-4 h-4" />
                )}
                <span>{isInCompare ? 'In Compare' : 'Compare'}</span>
            </button>
            {message && (
                <div className="absolute top-full mt-2 left-0 right-0 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-lg whitespace-nowrap z-50">
                    {message}
                </div>
            )}
        </div>
    );
}
