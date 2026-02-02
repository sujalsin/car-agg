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

// Generic cache entry interface
interface CacheEntry<T> {
    data: T;
    cachedAt: string;
    expiresAt: string;
}

// TTL configurations (in hours)
const CACHE_TTL = {
    vehicleData: 24,       // Full vehicle API response
    complaints: 48,        // NHTSA complaints
    recalls: 48,           // NHTSA recalls
    youtubeVideos: 168,    // 7 days
    fuelPrices: 6,         // Regional fuel prices
    news: 0.5,             // 30 minutes
    specs: 168,            // 7 days for manufacturer specs
};

// Check if cache entry is valid
function isCacheValid(expiresAt: string): boolean {
    return new Date(expiresAt) > new Date();
}

// Calculate expiration time
function getExpirationTime(hours: number): string {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date.toISOString();
}

// ==================== VEHICLE DATA CACHE ====================

export interface CachedVehicleData {
    year: number;
    make: string;
    model: string;
    data: Record<string, any>;
    cachedAt: string;
    expiresAt: string;
}

// Get cached full vehicle data
export async function getCachedVehicleData(
    year: number,
    make: string,
    model: string
): Promise<Record<string, any> | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('vehicle_data_cache')
            .select('*')
            .eq('year', year)
            .ilike('make', make)
            .ilike('model', model)
            .single();

        if (error || !data) return null;

        // Check if cache is still valid
        if (!isCacheValid(data.expires_at)) {
            return null; // Cache expired
        }

        return data.data;
    } catch (error) {
        console.error('Error getting cached vehicle data:', error);
        return null;
    }
}

// Save full vehicle data to cache
export async function cacheVehicleData(
    year: number,
    make: string,
    model: string,
    vehicleData: Record<string, any>
): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const now = new Date().toISOString();
        const expiresAt = getExpirationTime(CACHE_TTL.vehicleData);

        const { error } = await supabase
            .from('vehicle_data_cache')
            .upsert({
                year,
                make: make.toUpperCase(),
                model,
                data: vehicleData,
                cached_at: now,
                expires_at: expiresAt,
            }, {
                onConflict: 'year,make,model',
            });

        if (error) {
            console.error('Error caching vehicle data:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error caching vehicle data:', error);
        return false;
    }
}

// ==================== YOUTUBE VIDEOS CACHE ====================

export interface CachedYouTubeVideo {
    vehicleId: string;
    videoId: string;
    title: string;
    channelName: string;
    thumbnail: string;
    viewCount: number;
    publishedAt: string;
    duration: string;
}

// Get cached YouTube videos for a vehicle
export async function getCachedYouTubeVideos(
    year: number,
    make: string,
    model: string
): Promise<CachedYouTubeVideo[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        const vehicleKey = `${year}-${make.toUpperCase()}-${model}`;

        const { data, error } = await supabase
            .from('youtube_cache')
            .select('*')
            .eq('vehicle_key', vehicleKey)
            .single();

        if (error || !data) return null;

        if (!isCacheValid(data.expires_at)) {
            return null;
        }

        return data.videos;
    } catch (error) {
        return null;
    }
}

// Cache YouTube videos for a vehicle
export async function cacheYouTubeVideos(
    year: number,
    make: string,
    model: string,
    videos: CachedYouTubeVideo[]
): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const vehicleKey = `${year}-${make.toUpperCase()}-${model}`;
        const now = new Date().toISOString();
        const expiresAt = getExpirationTime(CACHE_TTL.youtubeVideos);

        const { error } = await supabase
            .from('youtube_cache')
            .upsert({
                vehicle_key: vehicleKey,
                videos,
                cached_at: now,
                expires_at: expiresAt,
            }, {
                onConflict: 'vehicle_key',
            });

        return !error;
    } catch (error) {
        return false;
    }
}

// ==================== FUEL PRICES CACHE ====================

export interface CachedFuelPrices {
    zipcode: string;
    state: string;
    region: string;
    regular: number;
    premium: number;
    diesel: number;
    electric: number;
}

// Get cached fuel prices for a zipcode
export async function getCachedFuelPrices(
    zipcode: string
): Promise<CachedFuelPrices | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('fuel_prices_cache')
            .select('*')
            .eq('zipcode', zipcode)
            .single();

        if (error || !data) return null;

        if (!isCacheValid(data.expires_at)) {
            return null;
        }

        return data;
    } catch (error) {
        return null;
    }
}

// Cache fuel prices for a zipcode
export async function cacheFuelPrices(
    zipcode: string,
    prices: CachedFuelPrices
): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const now = new Date().toISOString();
        const expiresAt = getExpirationTime(CACHE_TTL.fuelPrices);

        const { error } = await supabase
            .from('fuel_prices_cache')
            .upsert({
                ...prices,
                cached_at: now,
                expires_at: expiresAt,
            }, {
                onConflict: 'zipcode',
            });

        return !error;
    } catch (error) {
        return false;
    }
}

// ==================== NEWS CACHE ====================

export interface CachedNewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    sourceUrl: string;
}

// Get cached news articles
export async function getCachedNews(): Promise<CachedNewsItem[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('news_cache')
            .select('*')
            .eq('id', 'latest')
            .single();

        if (error || !data) return null;

        if (!isCacheValid(data.expires_at)) {
            return null;
        }

        return data.articles;
    } catch (error) {
        return null;
    }
}

// Cache news articles
export async function cacheNews(articles: CachedNewsItem[]): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const now = new Date().toISOString();
        const expiresAt = getExpirationTime(CACHE_TTL.news);

        const { error } = await supabase
            .from('news_cache')
            .upsert({
                id: 'latest',
                articles,
                cached_at: now,
                expires_at: expiresAt,
            }, {
                onConflict: 'id',
            });

        return !error;
    } catch (error) {
        return false;
    }
}

// ==================== COMPLAINTS CACHE ====================

// Get cached complaints
export async function getCachedComplaints(
    year: number,
    make: string,
    model: string
): Promise<any[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        const vehicleKey = `${year}-${make.toUpperCase()}-${model}`;

        const { data, error } = await supabase
            .from('complaints_cache')
            .select('*')
            .eq('vehicle_key', vehicleKey)
            .single();

        if (error || !data) return null;

        if (!isCacheValid(data.expires_at)) {
            return null;
        }

        return data.complaints;
    } catch (error) {
        return null;
    }
}

// Cache complaints
export async function cacheComplaints(
    year: number,
    make: string,
    model: string,
    complaints: any[]
): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const vehicleKey = `${year}-${make.toUpperCase()}-${model}`;
        const now = new Date().toISOString();
        const expiresAt = getExpirationTime(CACHE_TTL.complaints);

        const { error } = await supabase
            .from('complaints_cache')
            .upsert({
                vehicle_key: vehicleKey,
                complaints,
                cached_at: now,
                expires_at: expiresAt,
            }, {
                onConflict: 'vehicle_key',
            });

        return !error;
    } catch (error) {
        return false;
    }
}

// ==================== RECALLS CACHE ====================

// Get cached recalls
export async function getCachedRecalls(
    year: number,
    make: string,
    model: string
): Promise<any[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        const vehicleKey = `${year}-${make.toUpperCase()}-${model}`;

        const { data, error } = await supabase
            .from('recalls_cache')
            .select('*')
            .eq('vehicle_key', vehicleKey)
            .single();

        if (error || !data) return null;

        if (!isCacheValid(data.expires_at)) {
            return null;
        }

        return data.recalls;
    } catch (error) {
        return null;
    }
}

// Cache recalls
export async function cacheRecalls(
    year: number,
    make: string,
    model: string,
    recalls: any[]
): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
        const vehicleKey = `${year}-${make.toUpperCase()}-${model}`;
        const now = new Date().toISOString();
        const expiresAt = getExpirationTime(CACHE_TTL.recalls);

        const { error } = await supabase
            .from('recalls_cache')
            .upsert({
                vehicle_key: vehicleKey,
                recalls,
                cached_at: now,
                expires_at: expiresAt,
            }, {
                onConflict: 'vehicle_key',
            });

        return !error;
    } catch (error) {
        return false;
    }
}

// ==================== CACHE STATS ====================

export async function getCacheStats(): Promise<{
    vehicleDataCount: number;
    youtubeCount: number;
    newsIsCached: boolean;
} | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        const [vehicleData, youtube, news] = await Promise.all([
            supabase.from('vehicle_data_cache').select('id', { count: 'exact' }),
            supabase.from('youtube_cache').select('vehicle_key', { count: 'exact' }),
            supabase.from('news_cache').select('id').eq('id', 'latest').single(),
        ]);

        return {
            vehicleDataCount: vehicleData.count || 0,
            youtubeCount: youtube.count || 0,
            newsIsCached: !!news.data,
        };
    } catch (error) {
        return null;
    }
}
