import { FuelPrices } from '@/services/epa';

export interface OwnershipCostBreakdown {
    totalAnnualCost: number;
    fuelCost: number;
    insuranceCost: number;
    maintenanceCost: number;
    repairCost: number;
    depreciation: number;
    fiveYearCost: number;
}

export interface OwnershipCostInput {
    msrp: number;
    combinedMpg: number;
    fuelType: 'regular' | 'premium' | 'diesel' | 'electric' | 'hybrid';
    vehicleClass: string;
    year: number;
    complaintRate: number; // Complaints per 10,000 vehicles
    annualMiles?: number;
}

// Vehicle class insurance multipliers (base = $1,200/year)
const INSURANCE_MULTIPLIERS: Record<string, number> = {
    'Compact Cars': 1.0,
    'Subcompact Cars': 0.9,
    'Two Seaters': 1.3,
    'Midsize Cars': 1.05,
    'Large Cars': 1.1,
    'Station Wagons': 1.0,
    'Small SUVs': 1.15,
    'Standard SUVs': 1.2,
    'Small Pickup Trucks': 1.1,
    'Standard Pickup Trucks': 1.25,
    'Vans': 1.05,
    'Minivans': 1.0,
    'Special Purpose Vehicles': 1.3,
};

// Maintenance cost per 10,000 miles by vehicle class
const MAINTENANCE_COSTS: Record<string, number> = {
    'Compact Cars': 400,
    'Subcompact Cars': 350,
    'Two Seaters': 600,
    'Midsize Cars': 450,
    'Large Cars': 500,
    'Station Wagons': 450,
    'Small SUVs': 500,
    'Standard SUVs': 600,
    'Small Pickup Trucks': 500,
    'Standard Pickup Trucks': 650,
    'Vans': 550,
    'Minivans': 500,
    'Special Purpose Vehicles': 700,
};

// Average repair cost based on complaint rate
const BASE_REPAIR_COST = 200; // Base annual repair cost
const REPAIR_COST_PER_COMPLAINT = 150; // Additional cost per complaint per 10K vehicles

// Depreciation curves (percentage of value retained each year)
const DEPRECIATION_CURVE = [
    1.0, // Year 0 (new)
    0.80, // Year 1 (20% drop)
    0.70, // Year 2
    0.62, // Year 3
    0.55, // Year 4
    0.48, // Year 5
    0.42, // Year 6
    0.37, // Year 7
    0.33, // Year 8
    0.29, // Year 9
    0.26, // Year 10
];

export function calculateOwnershipCost(
    input: OwnershipCostInput,
    fuelPrices: FuelPrices
): OwnershipCostBreakdown {
    const annualMiles = input.annualMiles || 12000;

    // 1. Calculate fuel cost
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
            // Electric: kWh cost, assume 3.5 miles per kWh
            fuelPrice = fuelPrices.electric;
            mpg = 3.5 * 33.7; // Convert to MPGe for cost calculation
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

    // 2. Calculate insurance cost
    const baseInsurance = 1200;
    const classMultiplier = INSURANCE_MULTIPLIERS[input.vehicleClass] || 1.0;
    const msrpMultiplier = 1 + (input.msrp - 30000) / 100000; // Higher MSRP = higher insurance
    const insuranceCost = Math.round(baseInsurance * classMultiplier * Math.max(msrpMultiplier, 0.8));

    // 3. Calculate maintenance cost
    const baseMaintenance = MAINTENANCE_COSTS[input.vehicleClass] || 500;
    const maintenanceCost = Math.round((annualMiles / 10000) * baseMaintenance);

    // 4. Calculate repair cost based on reliability
    const repairCost =
        BASE_REPAIR_COST + Math.round(input.complaintRate * REPAIR_COST_PER_COMPLAINT);

    // 5. Calculate depreciation
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - input.year;
    const currentValueRatio = DEPRECIATION_CURVE[Math.min(vehicleAge, 10)];
    const nextYearValueRatio = DEPRECIATION_CURVE[Math.min(vehicleAge + 1, 10)];
    const depreciation = Math.round(input.msrp * (currentValueRatio - nextYearValueRatio));

    // Total annual cost
    const totalAnnualCost =
        fuelCost + insuranceCost + maintenanceCost + repairCost + depreciation;

    // Five year projection
    const fiveYearCost = Math.round(totalAnnualCost * 5 * 0.95); // Slight discount for multi-year

    return {
        totalAnnualCost,
        fuelCost,
        insuranceCost,
        maintenanceCost,
        repairCost,
        depreciation,
        fiveYearCost,
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
export function compareOwnershipCosts(
    costs: OwnershipCostBreakdown[]
): {
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
    // Expected costs by class (approximate)
    const expectedCosts: Record<string, number> = {
        'Compact Cars': 6000,
        'Subcompact Cars': 5500,
        'Two Seaters': 8000,
        'Midsize Cars': 7000,
        'Large Cars': 8000,
        'Station Wagons': 7000,
        'Small SUVs': 7500,
        'Standard SUVs': 9000,
        'Small Pickup Trucks': 8000,
        'Standard Pickup Trucks': 10000,
        'Vans': 8500,
        'Minivans': 7500,
        'Special Purpose Vehicles': 10000,
    };

    const expected = expectedCosts[vehicleClass] || 7500;
    const ratio = annualCost / expected;

    if (ratio <= 0.8) return 'A';
    if (ratio <= 0.95) return 'B';
    if (ratio <= 1.1) return 'C';
    if (ratio <= 1.25) return 'D';
    return 'F';
}
