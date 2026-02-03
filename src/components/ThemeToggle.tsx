'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const themes = [
        { value: 'light' as const, icon: Sun, label: 'Light' },
        { value: 'dark' as const, icon: Moon, label: 'Dark' },
        { value: 'system' as const, icon: Monitor, label: 'System' },
    ];

    return (
        <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
            {themes.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-md transition-all',
                        theme === value
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                    title={`${label} mode`}
                    aria-label={`Switch to ${label} mode`}
                >
                    <Icon className="w-4 h-4" />
                </button>
            ))}
        </div>
    );
}

export function ThemeToggleSimple({ className }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
                className
            )}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </button>
    );
}
