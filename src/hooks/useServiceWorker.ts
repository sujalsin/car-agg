'use client';

import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
    isSupported: boolean;
    isRegistered: boolean;
    isUpdateAvailable: boolean;
    offlineReady: boolean;
    error: Error | null;
}

export function useServiceWorker() {
    const [state, setState] = useState<ServiceWorkerState>({
        isSupported: false,
        isRegistered: false,
        isUpdateAvailable: false,
        offlineReady: false,
        error: null,
    });

    useEffect(() => {
        // Check if service workers are supported
        if (!('serviceWorker' in navigator)) {
            setState(prev => ({ ...prev, isSupported: false }));
            return;
        }

        setState(prev => ({ ...prev, isSupported: true }));

        // Register service worker
        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('[SW] Registered:', registration);

                setState(prev => ({ ...prev, isRegistered: true }));

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setState(prev => ({ ...prev, isUpdateAvailable: true }));
                            }
                        });
                    }
                });

                // Check if offline ready (cache has content)
                const checkOfflineReady = async () => {
                    const cacheNames = await caches.keys();
                    setState(prev => ({ 
                        ...prev, 
                        offlineReady: cacheNames.length > 0 
                    }));
                };
                
                checkOfflineReady();

                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data?.type === 'OFFLINE_READY') {
                        setState(prev => ({ ...prev, offlineReady: true }));
                    }
                });

            } catch (error) {
                console.error('[SW] Registration failed:', error);
                setState(prev => ({ 
                    ...prev, 
                    error: error instanceof Error ? error : new Error('SW registration failed') 
                }));
            }
        };

        registerSW();

        // Handle online/offline events
        const handleOnline = () => {
            console.log('[SW] Back online');
        };

        const handleOffline = () => {
            console.log('[SW] Gone offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updateServiceWorker = useCallback(async () => {
        if (!('serviceWorker' in navigator)) return;

        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        
        // Force reload to activate new service worker
        window.location.reload();
    }, []);

    const skipWaiting = useCallback(async () => {
        if (!('serviceWorker' in navigator)) return;

        const registration = await navigator.serviceWorker.ready;
        if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }, []);

    return {
        ...state,
        updateServiceWorker,
        skipWaiting,
    };
}

/**
 * Hook to track online/offline status
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        setIsOffline(!navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setIsOffline(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setIsOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isOnline, isOffline };
}

/**
 * Hook to prefetch pages for offline use
 */
export function usePrefetch() {
    const prefetch = useCallback(async (url: string) => {
        if (!('serviceWorker' in navigator)) return;

        try {
            const cache = await caches.open('carag-v1');
            const response = await fetch(url);
            
            if (response.ok) {
                await cache.put(url, response);
                console.log('[SW] Prefetched:', url);
            }
        } catch (error) {
            console.error('[SW] Prefetch failed:', error);
        }
    }, []);

    const prefetchVehicle = useCallback(async (year: number, make: string, model: string) => {
        const url = `/api/vehicles?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
        await prefetch(url);
    }, [prefetch]);

    return { prefetch, prefetchVehicle };
}
