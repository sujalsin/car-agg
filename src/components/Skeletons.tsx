'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-muted',
                className
            )}
        />
    );
}

export function CardSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('p-6 bg-card border rounded-xl space-y-4', className)}>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-2 flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
}

export function VehicleCardSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('bg-card border rounded-xl overflow-hidden', className)}>
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    );
}

export function StatsSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border rounded-xl p-4 space-y-2">
                    <Skeleton className="h-8 w-16 mx-auto" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                </div>
            ))}
        </div>
    );
}

export function ScoreGaugeSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <Skeleton className="w-32 h-32 rounded-full" />
            <Skeleton className="h-4 w-24" />
        </div>
    );
}

export function TableSkeleton({ rows = 5, className }: SkeletonProps & { rows?: number }) {
    return (
        <div className={cn('border rounded-xl overflow-hidden', className)}>
            <div className="bg-muted/50 p-4 border-b">
                <Skeleton className="h-5 w-48" />
            </div>
            <div className="divide-y">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ComplaintListSkeleton({ count = 5, className }: SkeletonProps & { count?: number }) {
    return (
        <div className={cn('space-y-3', className)}>
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            ))}
        </div>
    );
}

export function YouTubeVideoSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('flex gap-4 p-3 rounded-lg bg-card border', className)}>
            <Skeleton className="w-40 aspect-video flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        </div>
    );
}

export function SearchFormSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-28" />
        </div>
    );
}

export function HeroSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn('py-8 space-y-6', className)}>
            <div className="space-y-3">
                <Skeleton className="h-10 w-3/4 max-w-lg" />
                <Skeleton className="h-5 w-1/2 max-w-md" />
            </div>
            <SearchFormSkeleton />
            <div className="flex gap-6 pt-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center space-y-1">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function VehiclePageSkeleton() {
    return (
        <div className="min-h-screen bg-background space-y-8">
            {/* Header */}
            <div className="border-b">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>

            {/* Hero */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    </div>
                    <ScoreGaugeSkeleton />
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex gap-1">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-24" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <StatsSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                    <div className="space-y-6">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );
}
