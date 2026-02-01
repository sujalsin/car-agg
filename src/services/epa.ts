import axios from 'axios';

const EPA_BASE_URL = 'https://www.fueleconomy.gov/ws/rest';

export interface EPAVehicle {
    id: string;
    year: number;
    make: string;
    model: string;
    trany: string;
    drive: string;
    cylinders: number;
    displ: number;
    fuelType: string;
    city08: number;
    highway08: number;
    comb08: number;
    co2TailpipeGpm: number;
    fuelCost08: number;
    youSaveSpend: number;
    VClass: string;
}

export interface RealWorldMPG {
    avgMpg: number;
    cityPercent: number;
    highwayPercent: number;
    maxMpg: number;
    minMpg: number;
    vehicleCount: number;
}

export interface FuelPrices {
    regular: number;
    midgrade: number;
    premium: number;
    diesel: number;
    cng: number;
    e85: number;
    electric: number;
}

// Get available years
export async function getYears(): Promise<number[]> {
    try {
        const response = await axios.get(`${EPA_BASE_URL}/vehicle/menu/year`, {
            headers: { Accept: 'application/json' },
        });
        return response.data.menuItem.map((item: { value: string }) =>
            parseInt(item.value)
        );
    } catch (error) {
        console.error('Error getting years:', error);
        return [];
    }
}

// Get makes for a year
export async function getMakes(year: number): Promise<string[]> {
    try {
        const response = await axios.get(
            `${EPA_BASE_URL}/vehicle/menu/make?year=${year}`,
            { headers: { Accept: 'application/json' } }
        );
        if (!response.data.menuItem) return [];
        const items = Array.isArray(response.data.menuItem)
            ? response.data.menuItem
            : [response.data.menuItem];
        return items.map((item: { value: string }) => item.value);
    } catch (error) {
        console.error('Error getting makes:', error);
        return [];
    }
}

// Get models for a year and make
export async function getModels(year: number, make: string): Promise<string[]> {
    try {
        const response = await axios.get(
            `${EPA_BASE_URL}/vehicle/menu/model?year=${year}&make=${encodeURIComponent(
                make
            )}`,
            { headers: { Accept: 'application/json' } }
        );
        if (!response.data.menuItem) return [];
        const items = Array.isArray(response.data.menuItem)
            ? response.data.menuItem
            : [response.data.menuItem];
        return items.map((item: { value: string }) => item.value);
    } catch (error) {
        console.error('Error getting models:', error);
        return [];
    }
}

// Get vehicle options (trim levels) for a year, make, and model
export async function getVehicleOptions(
    year: number,
    make: string,
    model: string
): Promise<Array<{ id: string; text: string }>> {
    try {
        const response = await axios.get(
            `${EPA_BASE_URL}/vehicle/menu/options?year=${year}&make=${encodeURIComponent(
                make
            )}&model=${encodeURIComponent(model)}`,
            { headers: { Accept: 'application/json' } }
        );
        if (!response.data || !response.data.menuItem) return [];
        const items = Array.isArray(response.data.menuItem)
            ? response.data.menuItem
            : [response.data.menuItem];
        return items.map((item: { value: string; text: string }) => ({
            id: item.value,
            text: item.text,
        }));
    } catch (error) {
        console.error('Error getting vehicle options:', error);
        return [];
    }
}

// Get vehicle by EPA ID
export async function getVehicleById(id: string): Promise<EPAVehicle | null> {
    try {
        const response = await axios.get(`${EPA_BASE_URL}/vehicle/${id}`, {
            headers: { Accept: 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('Error getting vehicle:', error);
        return null;
    }
}

// Get all vehicles for a year, make, model
export async function getVehicles(
    year: number,
    make: string,
    model: string
): Promise<EPAVehicle[]> {
    try {
        const options = await getVehicleOptions(year, make, model);
        const vehicles = await Promise.all(
            options.map((option) => getVehicleById(option.id))
        );
        return vehicles.filter((v): v is EPAVehicle => v !== null);
    } catch (error) {
        console.error('Error getting vehicles:', error);
        return [];
    }
}

// Get real-world MPG data reported by owners
export async function getRealWorldMPG(
    vehicleId: string
): Promise<RealWorldMPG | null> {
    try {
        const response = await axios.get(
            `${EPA_BASE_URL}/ympg/shared/ympgVehicle/${vehicleId}`,
            { headers: { Accept: 'application/json' } }
        );
        return {
            avgMpg: response.data.avgMpg || 0,
            cityPercent: response.data.cityPercent || 50,
            highwayPercent: response.data.highwayPercent || 50,
            maxMpg: response.data.maxMpg || 0,
            minMpg: response.data.minMpg || 0,
            vehicleCount: response.data.vehicleCount || 0,
        };
    } catch (error) {
        // No user-reported data available
        return null;
    }
}

// Get current fuel prices
export async function getFuelPrices(): Promise<FuelPrices> {
    try {
        const response = await axios.get(`${EPA_BASE_URL}/fuelprices`, {
            headers: { Accept: 'application/json' },
        });
        return {
            regular: parseFloat(response.data.regular) || 3.5,
            midgrade: parseFloat(response.data.midgrade) || 4.0,
            premium: parseFloat(response.data.premium) || 4.5,
            diesel: parseFloat(response.data.diesel) || 4.0,
            cng: parseFloat(response.data.cng) || 2.5,
            e85: parseFloat(response.data.e85) || 3.0,
            electric: parseFloat(response.data.electric) || 0.15,
        };
    } catch (error) {
        console.error('Error getting fuel prices:', error);
        // Return default prices
        return {
            regular: 3.5,
            midgrade: 4.0,
            premium: 4.5,
            diesel: 4.0,
            cng: 2.5,
            e85: 3.0,
            electric: 0.15,
        };
    }
}

// Calculate annual fuel cost
export function calculateAnnualFuelCost(
    combinedMpg: number,
    annualMiles: number = 12000,
    fuelPrice: number = 3.5
): number {
    if (combinedMpg <= 0) return 0;
    const gallonsPerYear = annualMiles / combinedMpg;
    return Math.round(gallonsPerYear * fuelPrice);
}

// Get fuel economy grade (A-F)
export function getFuelEconomyGrade(combinedMpg: number): string {
    if (combinedMpg >= 40) return 'A';
    if (combinedMpg >= 32) return 'B';
    if (combinedMpg >= 25) return 'C';
    if (combinedMpg >= 18) return 'D';
    return 'F';
}
