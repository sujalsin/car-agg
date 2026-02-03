'use client';

/**
 * Accessibility Utilities
 * 
 * ARIA labels, keyboard navigation, screen reader support,
 * and reduced motion preferences.
 */

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return prefersReducedMotion;
}

/**
 * Hook to announce changes to screen readers
 */
export function useAnnouncer(): (message: string, priority?: 'polite' | 'assertive') => void {
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcer = document.getElementById(`aria-announcer-${priority}`);
        if (announcer) {
            announcer.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    }, []);

    return announce;
}

/**
 * ARIA labels for common actions
 */
export const ARIA_LABELS = {
    // Navigation
    search: 'Search for vehicles',
    compare: 'Compare vehicles',
    save: 'Save vehicle to favorites',
    remove: 'Remove from saved',
    share: 'Share vehicle information',
    print: 'Print vehicle report',
    
    // Vehicle actions
    viewDetails: (vehicle: string) => `View details for ${vehicle}`,
    selectYear: 'Select vehicle year',
    selectMake: 'Select vehicle make',
    selectModel: 'Select vehicle model',
    
    // Tabs
    tab: (name: string) => `${name} tab`,
    tabPanel: (name: string) => `${name} tab panel`,
    
    // Data
    reliabilityScore: (score: number) => `Reliability score: ${score} out of 10`,
    complaintCount: (count: number) => `${count} complaints reported`,
    recallCount: (count: number) => `${count} safety recalls`,
    
    // Charts
    chart: (title: string) => `${title} chart`,
    chartData: (label: string, value: string) => `${label}: ${value}`,
} as const;

/**
 * Keyboard navigation utilities
 */
export function useKeyboardNavigation(options: {
    onEscape?: () => void;
    onEnter?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
}) {
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        switch (event.key) {
            case 'Escape':
                options.onEscape?.();
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                options.onEnter?.();
                break;
            case 'ArrowUp':
                event.preventDefault();
                options.onArrowUp?.();
                break;
            case 'ArrowDown':
                event.preventDefault();
                options.onArrowDown?.();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                options.onArrowLeft?.();
                break;
            case 'ArrowRight':
                event.preventDefault();
                options.onArrowRight?.();
                break;
            case 'Home':
                event.preventDefault();
                options.onHome?.();
                break;
            case 'End':
                event.preventDefault();
                options.onEnd?.();
                break;
        }
    }, [options]);

    return handleKeyDown;
}

/**
 * Trap focus within an element (for modals, drawers)
 */
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        // Focus first element when activated
        firstElement?.focus();

        container.addEventListener('keydown', handleTabKey);
        return () => container.removeEventListener('keydown', handleTabKey);
    }, [isActive, containerRef]);
}

/**
 * Skip link component
 */
export function SkipLink({ targetId }: { targetId: string }) {
    return (
        <a
            href={'#' + targetId}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-medium"
        >
            Skip to main content
        </a>
    );
}

/**
 * Visually hidden component for screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
    return (
        <span className="sr-only">{children}</span>
    );
}

/**
 * Live region for dynamic content announcements
 */
export function LiveRegion() {
    return (
        <>
            <div
                id="aria-announcer-polite"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            />
            <div
                id="aria-announcer-assertive"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
            />
        </>
    );
}

/**
 * High contrast mode detection
 */
export function useHighContrast(): boolean {
    const [isHighContrast, setIsHighContrast] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        setIsHighContrast(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent) => {
            setIsHighContrast(event.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return isHighContrast;
}

/**
 * Focus visible utility - only show focus ring on keyboard navigation
 */
export const focusVisibleClasses = `
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-primary
    focus-visible:ring-offset-2
    focus-visible:ring-offset-background
`;
