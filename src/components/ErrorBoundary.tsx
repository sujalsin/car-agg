'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
        
        // In production, you would send this to an error tracking service
        // Example: Sentry, LogRocket, etc.
        if (process.env.NODE_ENV === 'production') {
            // Send to error tracking service
            // captureException(error, { extra: errorInfo });
        }
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                    <div className="max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        
                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-muted-foreground mb-6">
                            We apologize for the inconvenience. Our team has been notified of this issue.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-muted rounded-lg text-left overflow-auto max-h-48">
                                <p className="font-mono text-sm text-red-600 mb-2">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="font-mono text-xs text-muted-foreground">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg font-medium hover:bg-muted transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Simple error fallback component for specific sections
export function SectionErrorFallback({ 
    title = "Error loading content", 
    message = "There was a problem loading this section.",
    onRetry 
}: { 
    title?: string; 
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="p-6 bg-muted/50 rounded-xl text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-sm text-primary hover:underline"
                >
                    Try again
                </button>
            )}
        </div>
    );
}
