/**
 * Saved Vehicles Manager
 * 
 * Manages user's saved vehicles and comparison lists using localStorage.
 * All data stays client-side for privacy.
 */

export interface SavedVehicle {
    year: number;
    make: string;
    model: string;
    savedAt: string;
    notes?: string;
}

const STORAGE_KEY = 'carag-saved-vehicles';
const COMPARE_KEY = 'carag-compare-list';
const RECENT_SEARCHES_KEY = 'carag-recent-searches';

// Saved Vehicles
export function getSavedVehicles(): SavedVehicle[] {
    if (typeof window === 'undefined') return [];
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function saveVehicle(vehicle: Omit<SavedVehicle, 'savedAt'>): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
        const saved = getSavedVehicles();
        
        // Check if already saved
        const exists = saved.some(
            v => v.year === vehicle.year && 
                 v.make.toLowerCase() === vehicle.make.toLowerCase() && 
                 v.model.toLowerCase() === vehicle.model.toLowerCase()
        );
        
        if (exists) return false;
        
        const newVehicle: SavedVehicle = {
            ...vehicle,
            savedAt: new Date().toISOString(),
        };
        
        saved.unshift(newVehicle);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.slice(0, 50))); // Max 50 saved
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('savedVehiclesChanged'));
        
        return true;
    } catch {
        return false;
    }
}

export function removeSavedVehicle(year: number, make: string, model: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
        const saved = getSavedVehicles();
        const filtered = saved.filter(
            v => !(v.year === year && 
                   v.make.toLowerCase() === make.toLowerCase() && 
                   v.model.toLowerCase() === model.toLowerCase())
        );
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent('savedVehiclesChanged'));
        
        return true;
    } catch {
        return false;
    }
}

export function isVehicleSaved(year: number, make: string, model: string): boolean {
    const saved = getSavedVehicles();
    return saved.some(
        v => v.year === year && 
             v.make.toLowerCase() === make.toLowerCase() && 
             v.model.toLowerCase() === model.toLowerCase()
    );
}

export function updateVehicleNotes(year: number, make: string, model: string, notes: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
        const saved = getSavedVehicles();
        const updated = saved.map(v => {
            if (v.year === year && 
                v.make.toLowerCase() === make.toLowerCase() && 
                v.model.toLowerCase() === model.toLowerCase()) {
                return { ...v, notes };
            }
            return v;
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('savedVehiclesChanged'));
        
        return true;
    } catch {
        return false;
    }
}

// Compare List
export function getCompareList(): SavedVehicle[] {
    if (typeof window === 'undefined') return [];
    
    try {
        const stored = localStorage.getItem(COMPARE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function addToCompare(vehicle: Omit<SavedVehicle, 'savedAt'>): { success: boolean; message: string } {
    if (typeof window === 'undefined') return { success: false, message: 'Not available' };
    
    try {
        const list = getCompareList();
        
        if (list.length >= 3) {
            return { success: false, message: 'You can only compare up to 3 vehicles' };
        }
        
        const exists = list.some(
            v => v.year === vehicle.year && 
                 v.make.toLowerCase() === vehicle.make.toLowerCase() && 
                 v.model.toLowerCase() === vehicle.model.toLowerCase()
        );
        
        if (exists) {
            return { success: false, message: 'Vehicle already in comparison list' };
        }
        
        const newVehicle: SavedVehicle = {
            ...vehicle,
            savedAt: new Date().toISOString(),
        };
        
        list.push(newVehicle);
        localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('compareListChanged'));
        
        return { success: true, message: 'Added to comparison' };
    } catch {
        return { success: false, message: 'Failed to add vehicle' };
    }
}

export function removeFromCompare(year: number, make: string, model: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
        const list = getCompareList();
        const filtered = list.filter(
            v => !(v.year === year && 
                   v.make.toLowerCase() === make.toLowerCase() && 
                   v.model.toLowerCase() === model.toLowerCase())
        );
        
        localStorage.setItem(COMPARE_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent('compareListChanged'));
        
        return true;
    } catch {
        return false;
    }
}

export function clearCompareList(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
        localStorage.removeItem(COMPARE_KEY);
        window.dispatchEvent(new CustomEvent('compareListChanged'));
        return true;
    } catch {
        return false;
    }
}

export function isInCompareList(year: number, make: string, model: string): boolean {
    const list = getCompareList();
    return list.some(
        v => v.year === year && 
             v.make.toLowerCase() === make.toLowerCase() && 
             v.model.toLowerCase() === model.toLowerCase()
    );
}

// Recent Searches
export function getRecentSearches(): SavedVehicle[] {
    if (typeof window === 'undefined') return [];
    
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function addRecentSearch(vehicle: Omit<SavedVehicle, 'savedAt'>): void {
    if (typeof window === 'undefined') return;
    
    try {
        const recent = getRecentSearches();
        
        // Remove if already exists
        const filtered = recent.filter(
            v => !(v.year === vehicle.year && 
                   v.make.toLowerCase() === vehicle.make.toLowerCase() && 
                   v.model.toLowerCase() === vehicle.model.toLowerCase())
        );
        
        const newSearch: SavedVehicle = {
            ...vehicle,
            savedAt: new Date().toISOString(),
        };
        
        filtered.unshift(newSearch);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered.slice(0, 10)));
        window.dispatchEvent(new CustomEvent('recentSearchesChanged'));
    } catch {
        // Silent fail
    }
}

export function clearRecentSearches(): void {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
        window.dispatchEvent(new CustomEvent('recentSearchesChanged'));
    } catch {
        // Silent fail
    }
}

// Share functionality
export function generateShareUrl(year: number, make: string, model: string): string {
    if (typeof window === 'undefined') return '';
    
    const base = window.location.origin;
    return `${base}/vehicle/${year}/${encodeURIComponent(make)}/${encodeURIComponent(model)}`;
}

export async function shareVehicle(year: number, make: string, model: string, reliabilityScore?: number): Promise<boolean> {
    const url = generateShareUrl(year, make, model);
    const text = `Check out the ${year} ${make} ${model}${reliabilityScore ? ` (Reliability Score: ${reliabilityScore}/10)` : ''} on CARAG`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${year} ${make} ${model} | CARAG`,
                text,
                url,
            });
            return true;
        } catch {
            // Fall through to clipboard
        }
    }
    
    // Fallback to clipboard
    try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        return true;
    } catch {
        return false;
    }
}
