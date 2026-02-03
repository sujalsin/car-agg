'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Scale, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/compare', label: 'Compare', icon: Scale },
    { href: '/saved', label: 'Saved', icon: Bookmark },
];

export function BottomNav() {
    const pathname = usePathname();

    // Don't show bottom nav on desktop
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-pb">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <div className={cn(
                                'p-1.5 rounded-xl transition-colors',
                                isActive && 'bg-primary/10'
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
