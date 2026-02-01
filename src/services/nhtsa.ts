import axios from 'axios';

const NHTSA_BASE_URL = 'https://api.nhtsa.gov';
const VPIC_BASE_URL = 'https://vpic.nhtsa.dot.gov/api';

export interface VehicleSpec {
    make: string;
    model: string;
    year: number;
    vehicleType: string;
    bodyClass: string;
    engineCylinders: string;
    engineDisplacement: string;
    fuelType: string;
    driveType: string;
    transmissionStyle: string;
    plantCountry: string;
}

export interface NHTSAComplaint {
    odiNumber: string;
    manufacturer: string;
    crash: string;
    fire: string;
    numberOfInjuries: number;
    numberOfDeaths: number;
    dateOfIncident: string;
    dateComplaintFiled: string;
    vin: string;
    components: string;
    summary: string;
    mileage?: number;
}

export interface NHTSARecall {
    nhtsaCampaignNumber: string;
    reportReceivedDate: string;
    component: string;
    summary: string;
    consequence: string;
    remedy: string;
    notes: string;
    manufacturer: string;
    possiblyAffected: number;
}

// Decode a VIN to get vehicle information
export async function decodeVIN(vin: string): Promise<VehicleSpec | null> {
    try {
        const response = await axios.get(
            `${VPIC_BASE_URL}/vehicles/decodevin/${vin}?format=json`
        );

        const results = response.data.Results;
        const getValue = (variableId: number) => {
            const item = results.find((r: { VariableId: number }) => r.VariableId === variableId);
            return item?.Value || '';
        };

        return {
            make: getValue(26),
            model: getValue(28),
            year: parseInt(getValue(29)) || 0,
            vehicleType: getValue(39),
            bodyClass: getValue(5),
            engineCylinders: getValue(9),
            engineDisplacement: getValue(11),
            fuelType: getValue(24),
            driveType: getValue(15),
            transmissionStyle: getValue(37),
            plantCountry: getValue(75),
        };
    } catch (error) {
        console.error('Error decoding VIN:', error);
        return null;
    }
}

// Get all makes for a given year
export async function getMakesByYear(year: number): Promise<string[]> {
    try {
        const response = await axios.get(
            `${VPIC_BASE_URL}/vehicles/GetMakesForVehicleType/car?format=json`
        );
        return response.data.Results.map((r: { MakeName: string }) => r.MakeName);
    } catch (error) {
        console.error('Error getting makes:', error);
        return [];
    }
}

// Get models for a make and year
export async function getModelsForMakeYear(
    make: string,
    year: number
): Promise<string[]> {
    try {
        const response = await axios.get(
            `${VPIC_BASE_URL}/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(
                make
            )}/modelyear/${year}?format=json`
        );
        return response.data.Results.map((r: { Model_Name: string }) => r.Model_Name);
    } catch (error) {
        console.error('Error getting models:', error);
        return [];
    }
}

// Get complaints for a vehicle
export async function getComplaints(
    year: number,
    make: string,
    model: string
): Promise<NHTSAComplaint[]> {
    try {
        const response = await axios.get(
            `${NHTSA_BASE_URL}/complaints/complaintsByVehicle?make=${encodeURIComponent(
                make
            )}&model=${encodeURIComponent(model)}&modelYear=${year}`
        );

        if (!response.data.results) {
            return [];
        }

        return response.data.results.map((c: {
            odiNumber: string;
            manufacturer: string;
            crash: string;
            fire: string;
            numberOfInjuries: number;
            numberOfDeaths: number;
            dateOfIncident: string;
            dateComplaintFiled: string;
            vin: string;
            components: string;
            summary: string;
        }) => ({
            odiNumber: c.odiNumber,
            manufacturer: c.manufacturer,
            crash: c.crash,
            fire: c.fire,
            numberOfInjuries: c.numberOfInjuries || 0,
            numberOfDeaths: c.numberOfDeaths || 0,
            dateOfIncident: c.dateOfIncident,
            dateComplaintFiled: c.dateComplaintFiled,
            vin: c.vin,
            components: c.components,
            summary: c.summary,
        }));
    } catch (error) {
        console.error('Error getting complaints:', error);
        return [];
    }
}

// Get recalls for a vehicle
export async function getRecalls(
    year: number,
    make: string,
    model: string
): Promise<NHTSARecall[]> {
    try {
        const response = await axios.get(
            `${NHTSA_BASE_URL}/recalls/recallsByVehicle?make=${encodeURIComponent(
                make
            )}&model=${encodeURIComponent(model)}&modelYear=${year}`
        );

        if (!response.data.results) {
            return [];
        }

        return response.data.results.map((r: {
            NHTSACampaignNumber: string;
            ReportReceivedDate: string;
            Component: string;
            Summary: string;
            Consequence: string;
            Remedy: string;
            Notes: string;
            Manufacturer: string;
            PotentialNumberofUnitsAffected: number;
        }) => ({
            nhtsaCampaignNumber: r.NHTSACampaignNumber,
            reportReceivedDate: r.ReportReceivedDate,
            component: r.Component,
            summary: r.Summary,
            consequence: r.Consequence,
            remedy: r.Remedy,
            notes: r.Notes,
            manufacturer: r.Manufacturer,
            possiblyAffected: r.PotentialNumberofUnitsAffected || 0,
        }));
    } catch (error) {
        console.error('Error getting recalls:', error);
        return [];
    }
}

// Get recall by campaign number
export async function getRecallByCampaign(
    campaignNumber: string
): Promise<NHTSARecall | null> {
    try {
        const response = await axios.get(
            `${NHTSA_BASE_URL}/recalls/campaignNumber/${campaignNumber}`
        );

        if (!response.data.results || response.data.results.length === 0) {
            return null;
        }

        const r = response.data.results[0];
        return {
            nhtsaCampaignNumber: r.NHTSACampaignNumber,
            reportReceivedDate: r.ReportReceivedDate,
            component: r.Component,
            summary: r.Summary,
            consequence: r.Consequence,
            remedy: r.Remedy,
            notes: r.Notes,
            manufacturer: r.Manufacturer,
            possiblyAffected: r.PotentialNumberofUnitsAffected || 0,
        };
    } catch (error) {
        console.error('Error getting recall by campaign:', error);
        return null;
    }
}

// Categorize complaint component for analysis
export function categorizeComponent(component: string): string {
    const componentLower = component.toLowerCase();

    if (
        componentLower.includes('engine') ||
        componentLower.includes('fuel system') ||
        componentLower.includes('exhaust')
    ) {
        return 'Engine';
    }
    if (
        componentLower.includes('power train') ||
        componentLower.includes('transmission') ||
        componentLower.includes('clutch') ||
        componentLower.includes('driveline')
    ) {
        return 'Transmission';
    }
    if (
        componentLower.includes('electrical') ||
        componentLower.includes('battery') ||
        componentLower.includes('lights') ||
        componentLower.includes('wiring')
    ) {
        return 'Electrical';
    }
    if (
        componentLower.includes('air bag') ||
        componentLower.includes('seat belt') ||
        componentLower.includes('child seat')
    ) {
        return 'Safety Systems';
    }
    if (
        componentLower.includes('brake') ||
        componentLower.includes('parking brake') ||
        componentLower.includes('abs')
    ) {
        return 'Brakes';
    }
    if (
        componentLower.includes('steering') ||
        componentLower.includes('suspension') ||
        componentLower.includes('wheel')
    ) {
        return 'Steering/Suspension';
    }
    if (
        componentLower.includes('interior') ||
        componentLower.includes('seat') ||
        componentLower.includes('door') ||
        componentLower.includes('window')
    ) {
        return 'Interior';
    }
    if (
        componentLower.includes('visibility') ||
        componentLower.includes('windshield') ||
        componentLower.includes('wiper')
    ) {
        return 'Visibility';
    }
    if (
        componentLower.includes('structure') ||
        componentLower.includes('body') ||
        componentLower.includes('hood') ||
        componentLower.includes('trunk')
    ) {
        return 'Exterior';
    }

    return 'Other';
}

// Calculate severity score for a complaint
export function calculateComplaintSeverity(complaint: NHTSAComplaint): number {
    let severity = 1; // Base severity

    if (complaint.crash === 'Y') severity += 3;
    if (complaint.fire === 'Y') severity += 4;
    severity += Math.min(complaint.numberOfInjuries * 2, 6);
    severity += Math.min(complaint.numberOfDeaths * 5, 10);

    return Math.min(severity, 10); // Cap at 10
}

// Get recent recalls (for homepage banner)
export interface RecentRecall {
    make: string;
    model: string;
    modelYear: string;
    component: string;
    reportReceivedDate: string;
}

export async function getRecentRecalls(limit: number = 10): Promise<RecentRecall[]> {
    try {
        // Fetch recent recalls for common manufacturers
        const manufacturers = ['Honda', 'Toyota', 'Ford', 'Tesla', 'Hyundai', 'Chevrolet'];
        const currentYear = new Date().getFullYear();
        const recalls: RecentRecall[] = [];

        // Get recalls for popular recent vehicles
        const popularVehicles = [
            { make: 'Honda', model: 'CR-V', year: currentYear },
            { make: 'Toyota', model: 'RAV4', year: currentYear },
            { make: 'Ford', model: 'F-150', year: currentYear },
            { make: 'Tesla', model: 'Model Y', year: currentYear },
            { make: 'Hyundai', model: 'Tucson', year: currentYear },
        ];

        for (const vehicle of popularVehicles) {
            try {
                const vehicleRecalls = await getRecalls(vehicle.year, vehicle.make, vehicle.model);
                if (vehicleRecalls.length > 0) {
                    recalls.push({
                        make: vehicle.make,
                        model: vehicle.model,
                        modelYear: vehicle.year.toString(),
                        component: vehicleRecalls[0].component,
                        reportReceivedDate: vehicleRecalls[0].reportReceivedDate,
                    });
                }
            } catch (e) {
                // Continue with next vehicle
            }

            if (recalls.length >= limit) break;
        }

        return recalls.slice(0, limit);
    } catch (error) {
        console.error('Error getting recent recalls:', error);
        return [];
    }
}

