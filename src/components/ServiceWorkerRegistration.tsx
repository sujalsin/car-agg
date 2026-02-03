'use client';

import { useEffect } from 'react';
import { useServiceWorker, useNetworkStatus } from '@/hooks/useServiceWorker';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('[SW] Registered:', registration);
                })
                .catch((error) => {
                    console.error('[SW] Registration failed:', error);
                });
        }
    }, []);

    return null;
}

export function NetworkStatusIndicator() {
    const { isOnline, isOffline } = useNetworkStatus();
    const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

    if (isUpdateAvailable) {
        return (
            <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <RefreshCw className="w-5 h-5" />
                <div className="text-sm">
                    <p className="font-medium">Update available</p>
                    <button 
                        onClick={updateServiceWorker}
                        className="underline hover:no-underline"
                    >
                        Refresh to update
                    </button>
                </div>
            </div>
        );
    }

    if (!isOnline) {
        return (
            <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-yellow-950 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <WifiOff className="w-5 h-5" />
                <div className="text-sm">
                    <p className="font-medium">You're offline</p>
                    <p className="text-xs opacity-75">Cached data is available</p>
                </div>
            </div>
        );
    }

    return null;
}

export function OfflineBanner() {
    const { isOffline } = useNetworkStatus();

    if (!isOffline) return null;

    return (
        <div className="bg-yellow-500 text-yellow-950 px-4 py-2 text-center text-sm font-medium">
            <div className="flex items-center justify-center gap-2">
                <WifiOff className="w-4 h-4" />
                <span>You're offline. Showing cached data.</span>
            </div>
        </div>
    );
}
