import { NextRequest, NextResponse } from 'next/server';
import { getStateFromZipcode, getPADDRegion } from '@/lib/ownership-cost';

// Regional fuel price adjustments (relative to national average)
// Based on EIA PADD region data
const PADD_FUEL_MULTIPLIERS: Record<string, { regular: number; premium: number; diesel: number }> = {
    '1A': { regular: 1.08, premium: 1.10, diesel: 1.12 }, // New England - highest
    '1B': { regular: 1.05, premium: 1.08, diesel: 1.08 }, // Central Atlantic
    '1C': { regular: 0.98, premium: 1.00, diesel: 1.02 }, // Lower Atlantic
    '2': { regular: 0.95, premium: 0.97, diesel: 0.98 },  // Midwest - lowest
    '3': { regular: 0.92, premium: 0.95, diesel: 0.95 },  // Gulf Coast - very low
    '4': { regular: 1.02, premium: 1.05, diesel: 1.05 },  // Rocky Mountain
    '5': { regular: 1.18, premium: 1.20, diesel: 1.15 },  // West Coast - highest
};

// State electricity rates (cents per kWh, from EIA 2024 data)
const STATE_ELECTRICITY_RATES: Record<string, number> = {
    'AL': 0.12, 'AK': 0.22, 'AZ': 0.12, 'AR': 0.10, 'CA': 0.25,
    'CO': 0.13, 'CT': 0.21, 'DE': 0.13, 'FL': 0.12, 'GA': 0.12,
    'HI': 0.33, 'ID': 0.10, 'IL': 0.13, 'IN': 0.12, 'IA': 0.12,
    'KS': 0.13, 'KY': 0.11, 'LA': 0.10, 'ME': 0.17, 'MD': 0.13,
    'MA': 0.22, 'MI': 0.16, 'MN': 0.14, 'MS': 0.11, 'MO': 0.12,
    'MT': 0.11, 'NE': 0.11, 'NV': 0.12, 'NH': 0.20, 'NJ': 0.16,
    'NM': 0.13, 'NY': 0.19, 'NC': 0.11, 'ND': 0.11, 'OH': 0.12,
    'OK': 0.11, 'OR': 0.11, 'PA': 0.14, 'RI': 0.21, 'SC': 0.12,
    'SD': 0.12, 'TN': 0.11, 'TX': 0.12, 'UT': 0.10, 'VT': 0.18,
    'VA': 0.12, 'WA': 0.10, 'WV': 0.12, 'WI': 0.14, 'WY': 0.11,
    'DC': 0.13,
};

// National average fuel prices (update periodically or fetch from EIA)
const NATIONAL_AVERAGES = {
    regular: 3.25,
    premium: 4.05,
    diesel: 3.85,
    electric: 0.14, // per kWh
    lastUpdated: '2024-01-15',
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const zipcode = searchParams.get('zipcode');

    if (!zipcode || zipcode.length < 5) {
        // Return national averages
        return NextResponse.json({
            success: true,
            region: 'National Average',
            state: null,
            prices: {
                regular: NATIONAL_AVERAGES.regular,
                premium: NATIONAL_AVERAGES.premium,
                diesel: NATIONAL_AVERAGES.diesel,
                electric: NATIONAL_AVERAGES.electric,
            },
            lastUpdated: NATIONAL_AVERAGES.lastUpdated,
            source: 'EIA National Averages',
        });
    }

    try {
        // Get state and PADD region from zipcode
        const state = getStateFromZipcode(zipcode);
        const paddRegion = getPADDRegion(zipcode);
        const multipliers = PADD_FUEL_MULTIPLIERS[paddRegion] || PADD_FUEL_MULTIPLIERS['3'];

        // Get state-specific electricity rate
        const electricityRate = STATE_ELECTRICITY_RATES[state] || 0.14;

        // Calculate regional prices
        const prices = {
            regular: Math.round(NATIONAL_AVERAGES.regular * multipliers.regular * 100) / 100,
            premium: Math.round(NATIONAL_AVERAGES.premium * multipliers.premium * 100) / 100,
            diesel: Math.round(NATIONAL_AVERAGES.diesel * multipliers.diesel * 100) / 100,
            electric: electricityRate,
        };

        // Get region name
        const regionNames: Record<string, string> = {
            '1A': 'New England',
            '1B': 'Central Atlantic',
            '1C': 'Lower Atlantic',
            '2': 'Midwest',
            '3': 'Gulf Coast',
            '4': 'Rocky Mountain',
            '5': 'West Coast',
        };

        return NextResponse.json({
            success: true,
            region: regionNames[paddRegion] || 'Unknown',
            state,
            paddRegion,
            zipcode,
            prices,
            lastUpdated: NATIONAL_AVERAGES.lastUpdated,
            source: 'EIA Regional Data',
            breakdown: {
                nationalAverage: {
                    regular: NATIONAL_AVERAGES.regular,
                    premium: NATIONAL_AVERAGES.premium,
                    diesel: NATIONAL_AVERAGES.diesel,
                },
                regionalAdjustment: multipliers,
            },
        });
    } catch (error) {
        console.error('Fuel prices error:', error);
        return NextResponse.json({
            success: true,
            region: 'National Average',
            prices: {
                regular: NATIONAL_AVERAGES.regular,
                premium: NATIONAL_AVERAGES.premium,
                diesel: NATIONAL_AVERAGES.diesel,
                electric: NATIONAL_AVERAGES.electric,
            },
            lastUpdated: NATIONAL_AVERAGES.lastUpdated,
            source: 'EIA National Averages (fallback)',
        });
    }
}
