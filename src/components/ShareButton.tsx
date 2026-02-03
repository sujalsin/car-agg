'use client';

import { useState, useCallback } from 'react';
import { Share2, Check, Copy, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shareVehicle, generateShareUrl } from '@/lib/saved-vehicles';

interface ShareButtonProps {
    year: number;
    make: string;
    model: string;
    reliabilityScore?: number;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export function ShareButton({
    year,
    make,
    model,
    reliabilityScore,
    variant = 'outline',
    size = 'default',
    className,
}: ShareButtonProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);

    const handleShare = useCallback(async () => {
        const success = await shareVehicle(year, make, model, reliabilityScore);
        if (success) {
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        }
        setShowMenu(false);
    }, [year, make, model, reliabilityScore]);

    const handleCopyLink = useCallback(async () => {
        const url = generateShareUrl(year, make, model);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        setShowMenu(false);
    }, [year, make, model]);

    const sizeClasses = {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    const variantClasses = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    sizeClasses[size],
                    variantClasses[variant],
                    shared && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    className
                )}
                aria-label="Share vehicle"
            >
                {shared ? (
                    <Check className="w-4 h-4" />
                ) : (
                    <Share2 className="w-4 h-4" />
                )}
                <span>{shared ? 'Shared!' : 'Share'}</span>
            </button>

            {showMenu && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-popover border rounded-lg shadow-lg z-50 py-1">
                        {typeof navigator.share === 'function' && (
                            <button
                                onClick={handleShare}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Share via...
                            </button>
                        )}
                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span className="text-green-600">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-4 h-4" />
                                    Copy link
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// Simple copy button for any text
interface CopyButtonProps {
    text: string;
    className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Silent fail
        }
    }, [text]);

    return (
        <button
            onClick={handleCopy}
            className={cn(
                'inline-flex items-center justify-center p-2 rounded-lg transition-colors',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                className
            )}
            aria-label="Copy to clipboard"
        >
            {copied ? (
                <Check className="w-4 h-4 text-green-500" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </button>
    );
}
