'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Search, Scale, Bookmark, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggleSimple } from './ThemeToggle';
import { SavedVehiclesDrawer, CompareListDrawer } from './SavedVehiclesDrawer';

interface HeaderProps {
    showBackButton?: boolean;
    backHref?: string;
    backLabel?: string;
}

const navLinks = [
    { href: '/', label: 'Search', icon: Search },
    { href: '/compare', label: 'Compare', icon: Scale },
];

export function Header({ showBackButton, backHref = '/', backLabel = 'Back' }: HeaderProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <Car className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">CARAG</span>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        {showBackButton && (
                            <Link 
                                href={backHref}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-1"
                            >
                                ← {backLabel}
                            </Link>
                        )}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
                                <Car className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">CARAG</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                        isActive 
                                            ? 'bg-primary/10 text-primary' 
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center gap-1">
                        <SavedVehiclesDrawer />
                        <CompareListDrawer />
                        <div className="hidden sm:block">
                            <ThemeToggleSimple />
                        </div>
                        
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background">
                    <nav className="flex flex-col p-4 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                        isActive 
                                            ? 'bg-primary/10 text-primary' 
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                        <div className="pt-2 border-t mt-2">
                            <div className="px-4 py-3">
                                <span className="text-sm text-muted-foreground mb-2 block">Theme</span>
                                <ThemeToggleSimple />
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
