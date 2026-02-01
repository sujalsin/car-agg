import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side use
function getSupabaseClient(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.warn('Supabase not configured - caching disabled');
        return null;
    }

    return createClient(url, key);
}

// Vehicle data cache interface
export interface CachedVehicleData {
    id: string;
    year: number;
    make: string;
    model: string;
    data: Record<string, any>;
    cached_at: string;
}

// Get cached vehicle data
export async function getCachedVehicle(
    year: number,
    make: string,
    model: string
): Promise<CachedVehicleData | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('year', year)
            .ilike('make', make)
            .ilike('model', model)
            .single();

        if (error || !data) return null;

        // Check if cache is still valid (24 hours)
        const cachedAt = new Date(data.updated_at);
        const now = new Date();
        const hoursSinceCached = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceCached > 24) {
            return null; // Cache expired
        }

        return data;
    } catch (error) {
        console.error('Error getting cached vehicle:', error);
        return null;
    }
}

// Save vehicle data to cache
export async function cacheVehicleData(
    year: number,
    make: string,
    model: string,
    vehicleData: Record<string, any>
): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('vehicles')
            .upsert({
                year,
                make: make.toUpperCase(),
                model,
                engine: vehicleData.variants?.[0]?.engine || null,
                transmission: vehicleData.variants?.[0]?.transmission || null,
                drivetrain: vehicleData.variants?.[0]?.drivetrain || null,
                fuel_type: vehicleData.variants?.[0]?.fuelType || null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'year,make,model,trim',
            });

        if (error) {
            console.error('Error caching vehicle:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error caching vehicle:', error);
        return false;
    }
}

// Cache complaints for a vehicle
export async function cacheComplaints(
    vehicleId: string,
    complaints: Array<{
        nhtsaId: string;
        dateReceived: string;
        component: string;
        summary: string;
        crash: boolean;
        fire: boolean;
        injuries: number;
        deaths: number;
        mileage?: number;
    }>
): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('complaints')
            .upsert(
                complaints.map(c => ({
                    vehicle_id: vehicleId,
                    nhtsa_id: c.nhtsaId,
                    date_received: c.dateReceived,
                    component: c.component,
                    summary: c.summary,
                    crash: c.crash,
                    fire: c.fire,
                    injuries: c.injuries,
                    deaths: c.deaths,
                    mileage: c.mileage,
                })),
                { onConflict: 'nhtsa_id' }
            );

        if (error) {
            console.error('Error caching complaints:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error caching complaints:', error);
        return false;
    }
}

// Get cached news articles
export async function getCachedNews(maxAgeMinutes: number = 30): Promise<Array<any> | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('news_cache')
            .select('*')
            .order('fetched_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;

        // Check cache age
        const cachedAt = new Date(data.fetched_at);
        const now = new Date();
        const minutesSinceCached = (now.getTime() - cachedAt.getTime()) / (1000 * 60);

        if (minutesSinceCached > maxAgeMinutes) {
            return null; // Cache expired
        }

        return data.articles;
    } catch (error) {
        return null;
    }
}

// Cache news articles
export async function cacheNews(articles: Array<any>): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('news_cache')
            .upsert({
                id: 'latest',
                articles,
                fetched_at: new Date().toISOString(),
            }, {
                onConflict: 'id',
            });

        if (error) {
            console.error('Error caching news:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error caching news:', error);
        return false;
    }
}
