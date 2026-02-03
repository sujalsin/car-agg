/**
 * Vehicle Pricing Estimation Service
 * 
 * This module provides MSRP estimates for vehicles based on:
 * - Historical pricing data by make/model
 * - Vehicle class and category
 * - Model year (depreciation)
 * - Trim level estimates
 * 
 * These are ESTIMATES for TCO calculations only, not exact prices.
 * Data sourced from publicly available historical pricing information.
 */

export interface PricingEstimate {
    baseMsrp: number;
    range: { low: number; high: number };
    confidence: 'high' | 'medium' | 'low';
    source: 'historical' | 'class-based' | 'inferred';
}

// Base MSRP by make (entry-level luxury/mainstream brands)
const BASE_MSRP_BY_MAKE: Record<string, number> = {
    // Economy brands
    'Nissan': 25000,
    'Hyundai': 26000,
    'Kia': 26000,
    'Mitsubishi': 24000,
    'Chevrolet': 28000,
    'Ford': 29000,
    'Toyota': 28000,
    'Honda': 29000,
    'Mazda': 28000,
    'Subaru': 29000,
    'Volkswagen': 30000,
    'Jeep': 32000,
    'Dodge': 32000,
    'Chrysler': 34000,
    'GMC': 35000,
    'Ram': 38000,
    
    // Luxury brands
    'Acura': 42000,
    'Lexus': 45000,
    'Infiniti': 43000,
    'Audi': 48000,
    'BMW': 52000,
    'Mercedes-Benz': 55000,
    'Cadillac': 50000,
    'Lincoln': 48000,
    'Genesis': 50000,
    'Volvo': 48000,
    'Land Rover': 65000,
    'Jaguar': 60000,
    'Porsche': 75000,
    'Maserati': 80000,
    'Alfa Romeo': 55000,
    'Bentley': 200000,
    'Rolls-Royce': 350000,
    'Aston Martin': 180000,
    'McLaren': 250000,
    'Ferrari': 300000,
    'Lamborghini': 350000,
    
    // Electric brands
    'Tesla': 48000,
    'Rivian': 75000,
    'Lucid': 90000,
    'Polestar': 65000,
};

// Model-specific adjustments (percentage of base)
const MODEL_MULTIPLIERS: Record<string, Record<string, number>> = {
    'Toyota': {
        'Corolla': 0.75,
        'Camry': 0.90,
        'RAV4': 0.95,
        'Highlander': 1.15,
        '4Runner': 1.20,
        'Tacoma': 0.95,
        'Tundra': 1.30,
        'Sienna': 1.10,
        'Prius': 0.90,
        'GR Corolla': 1.10,
        'GR Supra': 1.50,
        'Crown': 1.25,
        'Land Cruiser': 1.50,
        'Sequoia': 1.40,
    },
    'Honda': {
        'Civic': 0.75,
        'Accord': 0.90,
        'CR-V': 0.95,
        'Pilot': 1.15,
        'Passport': 1.10,
        'Odyssey': 1.05,
        'Ridgeline': 1.00,
        'HR-V': 0.80,
        'Prologue': 1.20,
    },
    'Ford': {
        'F-150': 1.15,
        'F-250': 1.50,
        'F-350': 1.80,
        'Ranger': 0.90,
        'Maverick': 0.75,
        'Mustang': 1.05,
        'Bronco': 1.20,
        'Bronco Sport': 0.95,
        'Escape': 0.85,
        'Explorer': 1.10,
        'Edge': 0.95,
        'Expedition': 1.40,
    },
    'Chevrolet': {
        'Silverado 1500': 1.15,
        'Silverado 2500': 1.60,
        'Silverado 3500': 1.90,
        'Colorado': 0.90,
        'Equinox': 0.85,
        'Blazer': 0.95,
        'Traverse': 1.10,
        'Tahoe': 1.30,
        'Suburban': 1.40,
        'Malibu': 0.80,
        'Camaro': 1.00,
        'Corvette': 1.80,
        'Trailblazer': 0.80,
    },
    'Tesla': {
        'Model 3': 0.85,
        'Model Y': 0.95,
        'Model S': 1.50,
        'Model X': 1.70,
        'Cybertruck': 1.10,
    },
    'BMW': {
        '2 Series': 0.75,
        '3 Series': 0.90,
        '4 Series': 1.00,
        '5 Series': 1.20,
        '7 Series': 1.80,
        'X1': 0.80,
        'X3': 0.95,
        'X5': 1.25,
        'X7': 1.60,
    },
    'Mercedes-Benz': {
        'A-Class': 0.70,
        'C-Class': 0.90,
        'E-Class': 1.20,
        'S-Class': 1.80,
        'GLA': 0.80,
        'GLC': 0.95,
        'GLE': 1.25,
        'GLS': 1.50,
    },
    'Audi': {
        'A3': 0.75,
        'A4': 0.90,
        'A6': 1.20,
        'A8': 1.70,
        'Q3': 0.80,
        'Q5': 1.00,
        'Q7': 1.30,
        'Q8': 1.50,
    },
    'Lexus': {
        'IS': 0.80,
        'ES': 0.90,
        'GS': 1.10,
        'LS': 1.60,
        'UX': 0.80,
        'NX': 0.90,
        'RX': 1.10,
        'GX': 1.30,
        'LX': 1.80,
    },
    'Subaru': {
        'Impreza': 0.75,
        'Legacy': 0.80,
        'Crosstrek': 0.85,
        'Forester': 0.90,
        'Outback': 0.95,
        'Ascent': 1.10,
        'WRX': 0.95,
        'BRZ': 0.90,
    },
    'Mazda': {
        'Mazda3': 0.75,
        'Mazda6': 0.85,
        'CX-30': 0.80,
        'CX-5': 0.90,
        'CX-50': 0.95,
        'CX-90': 1.15,
    },
    'Hyundai': {
        'Elantra': 0.70,
        'Sonata': 0.80,
        'Tucson': 0.85,
        'Santa Fe': 0.95,
        'Palisade': 1.05,
        'Kona': 0.75,
        'Ioniq 5': 1.10,
        'Ioniq 6': 1.05,
    },
    'Kia': {
        'Forte': 0.70,
        'K5': 0.80,
        'Sportage': 0.85,
        'Sorento': 0.95,
        'Telluride': 1.05,
        'Soul': 0.70,
        'EV6': 1.10,
        'EV9': 1.40,
    },
    'Nissan': {
        'Sentra': 0.70,
        'Altima': 0.80,
        'Maxima': 0.95,
        'Rogue': 0.85,
        'Murano': 0.95,
        'Pathfinder': 1.05,
        'Armada': 1.25,
        'Frontier': 0.90,
        'Titan': 1.20,
    },
    'Jeep': {
        'Compass': 0.80,
        'Cherokee': 0.85,
        'Grand Cherokee': 1.10,
        'Wrangler': 1.00,
        'Gladiator': 1.15,
        'Wagoneer': 1.50,
        'Grand Wagoneer': 2.00,
    },
    'Volkswagen': {
        'Jetta': 0.75,
        'Passat': 0.85,
        'Arteon': 1.00,
        'Taos': 0.80,
        'Tiguan': 0.90,
        'Atlas': 1.10,
        'ID.4': 1.05,
    },
};

// Vehicle class base prices (used when make is unknown)
const CLASS_BASE_PRICES: Record<string, number> = {
    'Compact Cars': 24000,
    'Subcompact Cars': 20000,
    'Two Seaters': 35000,
    'Midsize Cars': 28000,
    'Large Cars': 35000,
    'Station Wagons': 32000,
    'Small SUVs': 28000,
    'Standard SUVs': 38000,
    'Small Pickup Trucks': 32000,
    'Standard Pickup Trucks': 45000,
    'Vans': 35000,
    'Minivans': 35000,
    'Special Purpose Vehicles': 40000,
};

// Year depreciation factors (newer years cost more)
function getYearMultiplier(year: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    // Newer vehicles cost more (retail pricing)
    // Older vehicles are priced based on when they were new
    if (age <= 0) return 1.05; // Next model year
    if (age === 1) return 1.00; // Current model year
    if (age <= 3) return 0.95; // Recent models
    if (age <= 5) return 0.90; // 4-5 years old
    if (age <= 8) return 0.85; // 6-8 years old
    return 0.80; // 9+ years old
}

// Get trim level multiplier
function getTrimMultiplier(trim: string): number {
    const trimLower = trim.toLowerCase();
    
    // Base trims
    if (trimLower.includes('lx') || trimLower.includes('se') || trimLower.includes('s')) return 1.0;
    if (trimLower.includes('base') || trimLower.includes('sr')) return 0.95;
    
    // Mid trims
    if (trimLower.includes('sport') || trimLower.includes('ex') || trimLower.includes('sel')) return 1.1;
    if (trimLower.includes('xle') || trimLower.includes('le') || trimLower.includes('lt')) return 1.05;
    if (trimLower.includes('touring') || trimLower.includes('limited')) return 1.15;
    
    // High trims
    if (trimLower.includes('platinum') || trimLower.includes('reserve')) return 1.25;
    if (trimLower.includes('ultimate') || trimLower.includes('calligraphy')) return 1.2;
    if (trimLower.includes('denali') || trimLower.includes('high country')) return 1.3;
    if (trimLower.includes('trailhawk') || trimLower.includes('rubicon')) return 1.2;
    if (trimLower.includes('m') || trimLower.includes('amg') || trimLower.includes('rs')) return 1.4;
    
    return 1.0;
}

/**
 * Estimate MSRP for a vehicle
 * This provides a reasonable estimate for TCO calculations
 */
export function estimateMSRP(
    year: number,
    make: string,
    model: string,
    vehicleClass?: string,
    trim?: string
): PricingEstimate {
    const makeCap = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
    const modelCap = model.charAt(0).toUpperCase() + model.slice(1).toLowerCase();
    
    // Start with base price for the make
    let baseMsrp = BASE_MSRP_BY_MAKE[makeCap] || 30000;
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    let source: 'historical' | 'class-based' | 'inferred' = 'historical';
    
    // Apply model-specific multiplier if available
    const makeModels = MODEL_MULTIPLIERS[makeCap];
    if (makeModels && makeModels[modelCap]) {
        baseMsrp *= makeModels[modelCap];
        confidence = 'high';
    } else if (vehicleClass && CLASS_BASE_PRICES[vehicleClass]) {
        // Fall back to class-based pricing if model unknown
        baseMsrp = CLASS_BASE_PRICES[vehicleClass];
        confidence = 'medium';
        source = 'class-based';
    } else {
        confidence = 'low';
        source = 'inferred';
    }
    
    // Apply year adjustment (when vehicle was new)
    const yearMultiplier = getYearMultiplier(year);
    baseMsrp *= yearMultiplier;
    
    // Apply trim multiplier if provided
    if (trim) {
        baseMsrp *= getTrimMultiplier(trim);
    }
    
    // Round to nearest $100
    baseMsrp = Math.round(baseMsrp / 100) * 100;
    
    return {
        baseMsrp,
        range: {
            low: Math.round(baseMsrp * 0.85 / 100) * 100,
            high: Math.round(baseMsrp * 1.25 / 100) * 100,
        },
        confidence,
        source,
    };
}

/**
 * Get estimated used car value (for older vehicles)
 */
export function estimateUsedValue(
    originalMSRP: number,
    year: number
): number {
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - year);
    
    // Simplified depreciation curve
    // Year 1: 20%, Year 2: 15%, Year 3: 12%, then 10% per year
    let value = originalMSRP;
    
    for (let i = 0; i < age; i++) {
        if (i === 0) value *= 0.80;
        else if (i === 1) value *= 0.85;
        else if (i === 2) value *= 0.88;
        else value *= 0.90;
    }
    
    return Math.round(value / 100) * 100;
}

/**
 * Get price category for display
 */
export function getPriceCategory(msrp: number): string {
    if (msrp < 25000) return 'Budget';
    if (msrp < 35000) return 'Affordable';
    if (msrp < 50000) return 'Mid-range';
    if (msrp < 75000) return 'Premium';
    if (msrp < 150000) return 'Luxury';
    return 'Exotic';
}
