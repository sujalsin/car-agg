import { FuelPrices } from '@/services/epa';

export interface OwnershipCostBreakdown {
    totalAnnualCost: number;
    fuelCost: number;
    insuranceCost: number;
    maintenanceCost: number;
    repairCost: number;
    depreciation: number;
    fiveYearCost: number;
    // New detailed breakdown
    details: {
        fuelPrice: number;
        fuelType: string;
        annualMiles: number;
        stateInsuranceAverage: number;
        depreciationRate: number;
        vehicleRetainedValue: number;
    };
}

export interface OwnershipCostInput {
    msrp: number;
    combinedMpg: number;
    fuelType: 'regular' | 'premium' | 'diesel' | 'electric' | 'hybrid';
    vehicleClass: string;
    year: number;
    make: string;
    model: string;
    complaintRate: number;
    annualMiles?: number;
    zipcode?: string;
    state?: string;
}

export interface RegionalFuelPrices extends FuelPrices {
    region: string;
    state: string;
    lastUpdated: string;
}

// Brand reliability/depreciation factors (data from industry studies)
// Higher = better value retention
const BRAND_DEPRECIATION_FACTORS: Record<string, number> = {
    // Premium retention brands
    'Toyota': 0.92,
    'Lexus': 0.90,
    'Honda': 0.88,
    'Porsche': 0.88,
    'Subaru': 0.87,
    'Mazda': 0.86,

    // Average retention
    'Hyundai': 0.84,
    'Kia': 0.84,
    'Ford': 0.83,
    'Chevrolet': 0.82,
    'GMC': 0.82,
    'Acura': 0.84,
    'Nissan': 0.81,

    // Below average retention
    'BMW': 0.78,
    'Mercedes-Benz': 0.77,
    'Audi': 0.79,
    'Volkswagen': 0.80,
    'Jeep': 0.80,
    'Dodge': 0.78,
    'Chrysler': 0.76,
    'Infiniti': 0.77,
    'Cadillac': 0.75,
    'Lincoln': 0.74,
    'Jaguar': 0.70,
    'Land Rover': 0.72,
    'Alfa Romeo': 0.68,
    'Maserati': 0.65,

    // Electric brands
    'Tesla': 0.82,
    'Rivian': 0.78,
    'Lucid': 0.70,
};

// Vehicle class depreciation modifiers
const CLASS_DEPRECIATION_FACTORS: Record<string, number> = {
    'Compact Cars': 1.0,
    'Subcompact Cars': 0.98,
    'Two Seaters': 0.85, // Sports cars depreciate faster
    'Midsize Cars': 1.0,
    'Large Cars': 0.95,
    'Station Wagons': 0.95,
    'Small SUVs': 1.05, // SUVs hold value better
    'Standard SUVs': 1.08,
    'Small Pickup Trucks': 1.10, // Trucks hold value well
    'Standard Pickup Trucks': 1.15,
    'Vans': 0.92,
    'Minivans': 0.90,
    'Special Purpose Vehicles': 0.85,
};

// State average annual insurance costs (from NAIC data 2024)
const STATE_INSURANCE_AVERAGES: Record<string, number> = {
    'AL': 1440, 'AK': 1320, 'AZ': 1560, 'AR': 1380, 'CA': 1920,
    'CO': 1680, 'CT': 1800, 'DE': 1560, 'FL': 2400, 'GA': 1740,
    'HI': 1200, 'ID': 1080, 'IL': 1320, 'IN': 1200, 'IA': 1080,
    'KS': 1320, 'KY': 1680, 'LA': 2280, 'ME': 960, 'MD': 1680,
    'MA': 1320, 'MI': 2160, 'MN': 1320, 'MS': 1500, 'MO': 1380,
    'MT': 1200, 'NE': 1200, 'NV': 1680, 'NH': 1080, 'NJ': 1620,
    'NM': 1380, 'NY': 1860, 'NC': 1080, 'ND': 1080, 'OH': 1080,
    'OK': 1560, 'OR': 1320, 'PA': 1380, 'RI': 1680, 'SC': 1440,
    'SD': 1200, 'TN': 1380, 'TX': 1680, 'UT': 1320, 'VT': 1020,
    'VA': 1200, 'WA': 1320, 'WV': 1380, 'WI': 1020, 'WY': 1140,
    'DC': 1560,
};

// EIA PADD regions for fuel prices
const ZIPCODE_TO_PADD: Record<string, string> = {
    // Northeast (PADD 1A) - CT, MA, ME, NH, RI, VT
    '01': '1A', '02': '1A', '03': '1A', '04': '1A', '05': '1A', '06': '1A',
    // Central Atlantic (PADD 1B) - DE, MD, NJ, NY, PA
    '07': '1B', '08': '1B', '10': '1B', '11': '1B', '12': '1B', '13': '1B',
    '14': '1B', '17': '1B', '18': '1B', '19': '1B',
    // Lower Atlantic (PADD 1C) - FL, GA, NC, SC, VA, WV
    '20': '1C', '21': '1C', '22': '1C', '23': '1C', '24': '1C', '25': '1C',
    '26': '1C', '27': '1C', '28': '1C', '29': '1C', '30': '1C', '31': '1C',
    '32': '1C', '33': '1C', '34': '1C',
    // Midwest (PADD 2) - IL, IN, IA, KS, KY, MI, MN, MO, NE, ND, OH, OK, SD, TN, WI
    '35': '2', '36': '2', '37': '2', '38': '2', '39': '2', '40': '2',
    '41': '2', '42': '2', '43': '2', '44': '2', '45': '2', '46': '2',
    '47': '2', '48': '2', '49': '2', '50': '2', '51': '2', '52': '2',
    '53': '2', '54': '2', '55': '2', '56': '2', '57': '2', '58': '2',
    '59': '2', '60': '2', '61': '2', '62': '2', '63': '2', '64': '2',
    '65': '2', '66': '2', '67': '2', '68': '2', '69': '2',
    // Gulf Coast (PADD 3) - AL, AR, LA, MS, NM, TX
    '70': '3', '71': '3', '72': '3', '73': '3', '74': '3', '75': '3',
    '76': '3', '77': '3', '78': '3', '79': '3', '87': '3', '88': '3',
    // Rocky Mountain (PADD 4) - CO, ID, MT, UT, WY
    '80': '4', '81': '4', '82': '4', '83': '4', '84': '4',
    // West Coast (PADD 5) - AK, AZ, CA, HI, NV, OR, WA
    '85': '5', '86': '5', '89': '5', '90': '5', '91': '5', '92': '5',
    '93': '5', '94': '5', '95': '5', '96': '5', '97': '5', '98': '5',
    '99': '5',
};

// Zipcode prefix to state mapping
const ZIPCODE_TO_STATE: Record<string, string> = {
    '01': 'MA', '02': 'MA', '03': 'NH', '04': 'ME', '05': 'VT', '06': 'CT',
    '07': 'NJ', '08': 'NJ', '10': 'NY', '11': 'NY', '12': 'NY', '13': 'NY',
    '14': 'NY', '15': 'PA', '16': 'PA', '17': 'PA', '18': 'PA', '19': 'PA',
    '20': 'DC', '21': 'MD', '22': 'VA', '23': 'VA', '24': 'VA', '25': 'WV',
    '26': 'WV', '27': 'NC', '28': 'NC', '29': 'SC', '30': 'GA', '31': 'GA',
    '32': 'FL', '33': 'FL', '34': 'FL', '35': 'AL', '36': 'AL', '37': 'TN',
    '38': 'TN', '39': 'MS', '40': 'KY', '41': 'KY', '42': 'KY', '43': 'OH',
    '44': 'OH', '45': 'OH', '46': 'IN', '47': 'IN', '48': 'MI', '49': 'MI',
    '50': 'IA', '51': 'IA', '52': 'IA', '53': 'WI', '54': 'WI', '55': 'MN',
    '56': 'MN', '57': 'SD', '58': 'ND', '59': 'MT', '60': 'IL', '61': 'IL',
    '62': 'IL', '63': 'MO', '64': 'MO', '65': 'MO', '66': 'KS', '67': 'KS',
    '68': 'NE', '69': 'NE', '70': 'LA', '71': 'LA', '72': 'AR', '73': 'OK',
    '74': 'OK', '75': 'TX', '76': 'TX', '77': 'TX', '78': 'TX', '79': 'TX',
    '80': 'CO', '81': 'CO', '82': 'WY', '83': 'ID', '84': 'UT', '85': 'AZ',
    '86': 'AZ', '87': 'NM', '88': 'TX', '89': 'NV', '90': 'CA', '91': 'CA',
    '92': 'CA', '93': 'CA', '94': 'CA', '95': 'CA', '96': 'HI', '97': 'OR',
    '98': 'WA', '99': 'WA',
};

// Vehicle class insurance multipliers
const INSURANCE_MULTIPLIERS: Record<string, number> = {
    'Compact Cars': 1.0,
    'Subcompact Cars': 0.9,
    'Two Seaters': 1.4, // Sports cars cost more
    'Midsize Cars': 1.05,
    'Large Cars': 1.1,
    'Station Wagons': 1.0,
    'Small SUVs': 1.15,
    'Standard SUVs': 1.25,
    'Small Pickup Trucks': 1.15,
    'Standard Pickup Trucks': 1.3,
    'Vans': 1.1,
    'Minivans': 1.0,
    'Special Purpose Vehicles': 1.35,
};

// Maintenance cost per 10,000 miles by vehicle class
const MAINTENANCE_COSTS: Record<string, number> = {
    'Compact Cars': 400,
    'Subcompact Cars': 350,
    'Two Seaters': 650,
    'Midsize Cars': 450,
    'Large Cars': 500,
    'Station Wagons': 450,
    'Small SUVs': 500,
    'Standard SUVs': 600,
    'Small Pickup Trucks': 500,
    'Standard Pickup Trucks': 650,
    'Vans': 550,
    'Minivans': 500,
    'Special Purpose Vehicles': 750,
};

// Brand maintenance cost multipliers
const BRAND_MAINTENANCE_MULTIPLIERS: Record<string, number> = {
    'Toyota': 0.85, 'Honda': 0.88, 'Mazda': 0.90, 'Subaru': 0.95,
    'Hyundai': 0.92, 'Kia': 0.92, 'Nissan': 0.95,
    'Ford': 1.0, 'Chevrolet': 1.0, 'GMC': 1.05,
    'BMW': 1.45, 'Mercedes-Benz': 1.50, 'Audi': 1.40,
    'Lexus': 1.1, 'Acura': 1.05, 'Infiniti': 1.20,
    'Porsche': 1.60, 'Land Rover': 1.65, 'Jaguar': 1.55,
    'Tesla': 0.70, // Lower maintenance for EVs
};

// Repair cost factors
const BASE_REPAIR_COST = 200;
const REPAIR_COST_PER_COMPLAINT = 150;

// Get state from zipcode
export function getStateFromZipcode(zipcode: string): string {
    const prefix = zipcode.substring(0, 2);
    return ZIPCODE_TO_STATE[prefix] || 'TX'; // Default to TX
}

// Get PADD region from zipcode
export function getPADDRegion(zipcode: string): string {
    const prefix = zipcode.substring(0, 2);
    return ZIPCODE_TO_PADD[prefix] || '3'; // Default to Gulf Coast
}

// Calculate accurate depreciation with all factors
export function calculateDepreciation(
    msrp: number,
    year: number,
    make: string,
    vehicleClass: string
): { annualDepreciation: number; currentValue: number; retentionRate: number } {
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - year);

    // Get brand factor
    const makeCap = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
    const brandFactor = BRAND_DEPRECIATION_FACTORS[makeCap] || 0.82;

    // Get class factor
    const classFactor = CLASS_DEPRECIATION_FACTORS[vehicleClass] || 1.0;

    // Combined retention factor (higher = better value retention)
    const combinedFactor = brandFactor * classFactor;

    // Calculate value at each year using compound depreciation
    // Year 1: 20% base drop, adjusted by factors
    // Year 2+: 12% base drop, adjusted by factors
    let currentValue = msrp;

    for (let y = 0; y < age; y++) {
        const baseDropRate = y === 0 ? 0.20 : 0.12;
        const adjustedDropRate = baseDropRate * (2 - combinedFactor); // Better brands drop less
        currentValue = currentValue * (1 - adjustedDropRate);
    }

    // Calculate next year's value for annual depreciation
    const nextYearDropRate = 0.12 * (2 - combinedFactor);
    const nextYearValue = currentValue * (1 - nextYearDropRate);
    const annualDepreciation = Math.round(currentValue - nextYearValue);

    // Retention rate
    const retentionRate = currentValue / msrp;

    return {
        annualDepreciation: Math.max(annualDepreciation, 0),
        currentValue: Math.round(currentValue),
        retentionRate: Math.round(retentionRate * 100) / 100,
    };
}

// Main ownership cost calculation
export function calculateOwnershipCost(
    input: OwnershipCostInput,
    fuelPrices: FuelPrices | RegionalFuelPrices
): OwnershipCostBreakdown {
    const annualMiles = input.annualMiles || 12000;

    // Get state from zipcode or use default
    const state = input.state || (input.zipcode ? getStateFromZipcode(input.zipcode) : 'TX');

    // 1. Calculate fuel cost with regional prices
    let fuelPrice: number;
    let mpg = input.combinedMpg;

    switch (input.fuelType) {
        case 'premium':
            fuelPrice = fuelPrices.premium;
            break;
        case 'diesel':
            fuelPrice = fuelPrices.diesel;
            break;
        case 'electric':
            fuelPrice = fuelPrices.electric;
            mpg = 3.5 * 33.7; // Convert to MPGe
            break;
        case 'hybrid':
            fuelPrice = fuelPrices.regular;
            break;
        default:
            fuelPrice = fuelPrices.regular;
    }

    const fuelCost =
        input.fuelType === 'electric'
            ? Math.round((annualMiles / 3.5) * fuelPrice)
            : Math.round((annualMiles / Math.max(mpg, 1)) * fuelPrice);

    // 2. Calculate insurance with state averages and vehicle factors
    const stateBaseInsurance = STATE_INSURANCE_AVERAGES[state] || 1500;
    const classMultiplier = INSURANCE_MULTIPLIERS[input.vehicleClass] || 1.0;
    const msrpMultiplier = 1 + Math.max(0, (input.msrp - 30000) / 150000);
    const insuranceCost = Math.round(stateBaseInsurance * classMultiplier * msrpMultiplier);

    // 3. Calculate maintenance with brand factors
    const baseMaintenance = MAINTENANCE_COSTS[input.vehicleClass] || 500;
    const makeCap = input.make.charAt(0).toUpperCase() + input.make.slice(1).toLowerCase();
    const brandMaintenanceFactor = BRAND_MAINTENANCE_MULTIPLIERS[makeCap] || 1.0;
    const maintenanceCost = Math.round((annualMiles / 10000) * baseMaintenance * brandMaintenanceFactor);

    // 4. Calculate repair cost based on reliability
    const repairCost = BASE_REPAIR_COST + Math.round(input.complaintRate * REPAIR_COST_PER_COMPLAINT);

    // 5. Calculate accurate depreciation
    const depreciationData = calculateDepreciation(
        input.msrp,
        input.year,
        input.make,
        input.vehicleClass
    );
    const depreciation = depreciationData.annualDepreciation;

    // Total annual cost
    const totalAnnualCost = fuelCost + insuranceCost + maintenanceCost + repairCost + depreciation;

    // Five year projection with varying depreciation
    let fiveYearCost = 0;
    let projectedValue = input.msrp;
    for (let y = 0; y < 5; y++) {
        const yearData = calculateDepreciation(input.msrp, input.year - y, input.make, input.vehicleClass);
        fiveYearCost += fuelCost + insuranceCost + maintenanceCost + repairCost + yearData.annualDepreciation;
    }

    return {
        totalAnnualCost,
        fuelCost,
        insuranceCost,
        maintenanceCost,
        repairCost,
        depreciation,
        fiveYearCost: Math.round(fiveYearCost),
        details: {
            fuelPrice,
            fuelType: input.fuelType,
            annualMiles,
            stateInsuranceAverage: STATE_INSURANCE_AVERAGES[state] || 1500,
            depreciationRate: Math.round((1 - depreciationData.retentionRate) * 100),
            vehicleRetainedValue: depreciationData.currentValue,
        },
    };
}

// Format currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Compare ownership costs
export function compareOwnershipCosts(costs: OwnershipCostBreakdown[]): {
    cheapest: number;
    mostExpensive: number;
    averageAnnual: number;
} {
    const annualCosts = costs.map((c) => c.totalAnnualCost);
    return {
        cheapest: Math.min(...annualCosts),
        mostExpensive: Math.max(...annualCosts),
        averageAnnual: Math.round(annualCosts.reduce((a, b) => a + b, 0) / costs.length),
    };
}

// Get cost rating (A-F)
export function getCostRating(annualCost: number, vehicleClass: string): string {
    const expectedCosts: Record<string, number> = {
        'Compact Cars': 6500,
        'Subcompact Cars': 6000,
        'Two Seaters': 9000,
        'Midsize Cars': 7500,
        'Large Cars': 8500,
        'Station Wagons': 7500,
        'Small SUVs': 8000,
        'Standard SUVs': 9500,
        'Small Pickup Trucks': 8500,
        'Standard Pickup Trucks': 10500,
        'Vans': 9000,
        'Minivans': 8000,
        'Special Purpose Vehicles': 11000,
    };

    const expected = expectedCosts[vehicleClass] || 8000;
    const ratio = annualCost / expected;

    if (ratio <= 0.8) return 'A';
    if (ratio <= 0.95) return 'B';
    if (ratio <= 1.1) return 'C';
    if (ratio <= 1.25) return 'D';
    return 'F';
}

// Export state data for UI
export { STATE_INSURANCE_AVERAGES, BRAND_DEPRECIATION_FACTORS };
