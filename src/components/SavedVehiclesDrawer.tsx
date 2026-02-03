'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Bookmark, Trash2, ExternalLink, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSavedVehicles, removeSavedVehicle, SavedVehicle } from '@/lib/saved-vehicles';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SavedVehiclesDrawer() {
    const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setSavedVehicles(getSavedVehicles());
    }, []);

    // Listen for changes
    useEffect(() => {
        const handleChange = () => {
            setSavedVehicles(getSavedVehicles());
        };

        window.addEventListener('savedVehiclesChanged', handleChange);
        return () => window.removeEventListener('savedVehiclesChanged', handleChange);
    }, []);

    const handleRemove = (vehicle: SavedVehicle) => {
        removeSavedVehicle(vehicle.year, vehicle.make, vehicle.model);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger>
                <button
                    className={cn(
                        'relative inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg',
                        'text-sm font-medium transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                >
                    <Bookmark className="w-4 h-4" />
                    <span className="hidden sm:inline">Saved</span>
                    {savedVehicles.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            {savedVehicles.length}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5" />
                        Saved Vehicles
                    </SheetTitle>
                </SheetHeader>

                {savedVehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Bookmark className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">No saved vehicles yet</p>
                        <p className="text-sm text-muted-foreground">
                            Click the bookmark icon on any vehicle page to save it here.
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                        <div className="space-y-3 pr-4">
                            {savedVehicles.map((vehicle) => (
                                <div
                                    key={`${vehicle.year}-${vehicle.make}-${vehicle.model}`}
                                    className="group relative p-4 bg-card border rounded-xl hover:border-primary transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <Link
                                            href={`/vehicle/${vehicle.year}/${encodeURIComponent(vehicle.make)}/${encodeURIComponent(vehicle.model)}`}
                                            className="flex-1 min-w-0"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <h3 className="font-semibold truncate">
                                                {vehicle.year} {vehicle.make} {vehicle.model}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Saved on {formatDate(vehicle.savedAt)}
                                            </p>
                                            {vehicle.notes && (
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                    {vehicle.notes}
                                                </p>
                                            )}
                                        </Link>
                                        <div className="flex flex-col gap-1">
                                            <Link
                                                href={`/vehicle/${vehicle.year}/${encodeURIComponent(vehicle.make)}/${encodeURIComponent(vehicle.model)}`}
                                                onClick={() => setIsOpen(false)}
                                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                                title="View vehicle"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleRemove(vehicle)}
                                                className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                                                title="Remove from saved"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </SheetContent>
        </Sheet>
    );
}

// Compare list drawer
import { getCompareList, removeFromCompare, clearCompareList } from '@/lib/saved-vehicles';
import { Scale, ArrowRight } from 'lucide-react';

export function CompareListDrawer() {
    const [compareList, setCompareList] = useState<SavedVehicle[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setCompareList(getCompareList());
    }, []);

    useEffect(() => {
        const handleChange = () => {
            setCompareList(getCompareList());
        };

        window.addEventListener('compareListChanged', handleChange);
        return () => window.removeEventListener('compareListChanged', handleChange);
    }, []);

    const handleRemove = (vehicle: SavedVehicle) => {
        removeFromCompare(vehicle.year, vehicle.make, vehicle.model);
    };

    const handleClear = () => {
        clearCompareList();
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger>
                <button
                    className={cn(
                        'relative inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg',
                        'text-sm font-medium transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                >
                    <Scale className="w-4 h-4" />
                    <span className="hidden sm:inline">Compare</span>
                    {compareList.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                            {compareList.length}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Scale className="w-5 h-5" />
                        Compare List
                    </SheetTitle>
                </SheetHeader>

                {compareList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Scale className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">No vehicles to compare</p>
                        <p className="text-sm text-muted-foreground">
                            Click "Compare" on any vehicle page to add it here.
                        </p>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
                            <div className="space-y-3 pr-4">
                                {compareList.map((vehicle, index) => (
                                    <div
                                        key={`${vehicle.year}-${vehicle.make}-${vehicle.model}`}
                                        className="relative p-4 bg-card border rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">
                                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                                </h3>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(vehicle)}
                                                className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t space-y-3">
                            {compareList.length >= 2 && (
                                <Link
                                    href="/compare"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Button className="w-full">
                                        Compare Now
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            )}
                            <Button variant="outline" onClick={handleClear} className="w-full">
                                Clear List
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
