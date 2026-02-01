import axios from 'axios';

const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

export interface VehicleSpecs {
    trim: string;
    bodyStyle: string;
    engine: string;
    displacement: string;
    cylinders: number;
    fuelType: string;
    transmission: string;
    drivetrain: string;
    horsepower: number | null;
    doors: number;
    seating: number;
    msrp: number | null;
}

export interface VehicleDetails {
    year: number;
    make: string;
    model: string;
    bodyStyles: string[];
    driveTypes: string[];
    engineOptions: string[];
    transmissionTypes: string[];
    trims: VehicleSpecs[];
}

// Decode a VIN to get detailed vehicle specs
export async function decodeVINForSpecs(vin: string): Promise<Record<string, string>> {
    try {
        const response = await axios.get(
            `${NHTSA_BASE}/DecodeVinValues/${vin}?format=json`
        );

        const result = response.data.Results?.[0];
        if (!result) return {};

        // Extract all non-empty values
        const specs: Record<string, string> = {};
        for (const [key, value] of Object.entries(result)) {
            if (value && typeof value === 'string' && value.trim() !== '') {
                specs[key] = value.trim();
            }
        }
        return specs;
    } catch (error) {
        console.error('Error decoding VIN:', error);
        return {};
    }
}

// Get all models for a make and year
export async function getModelsForMakeYear(make: string, year: number): Promise<Array<{ name: string; id: number }>> {
    try {
        const response = await axios.get(
            `${NHTSA_BASE}/getmodelsformakeyear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
        );

        return (response.data.Results || []).map((r: any) => ({
            name: r.Model_Name,
            id: r.Model_ID,
        }));
    } catch (error) {
        console.error('Error getting models:', error);
        return [];
    }
}

// Get vehicle VINs to lookup specs (uses WMI database)
export async function getVehicleVariants(year: number, make: string, model: string): Promise<VehicleSpecs[]> {
    try {
        // Use NHTSA's decode API with partial VIN patterns
        // This returns available variants for a model
        const response = await axios.get(
            `${NHTSA_BASE}/GetVehicleVariableValuesList/Model?format=json`
        );

        // For now, return empty - will be populated from EPA data
        return [];
    } catch (error) {
        console.error('Error getting variants:', error);
        return [];
    }
}

// Map NHTSA variable codes to readable names
export const SPEC_LABELS: Record<string, string> = {
    Make: 'Make',
    Model: 'Model',
    ModelYear: 'Year',
    Trim: 'Trim Level',
    Series: 'Series',
    BodyClass: 'Body Style',
    Doors: 'Doors',
    DriveType: 'Drivetrain',
    EngineConfiguration: 'Engine Configuration',
    EngineCylinders: 'Cylinders',
    DisplacementL: 'Engine Displacement (L)',
    EngineHP: 'Horsepower',
    EngineKW: 'Power (kW)',
    FuelTypePrimary: 'Fuel Type',
    FuelTypeSecondary: 'Secondary Fuel',
    TransmissionStyle: 'Transmission',
    TransmissionSpeeds: 'Speeds',
    PlantCountry: 'Country of Origin',
    PlantCity: 'Assembled In',
    GVWR: 'Gross Vehicle Weight Rating',
    CurbWeightLB: 'Curb Weight (lbs)',
    WheelBaseShort: 'Wheelbase (in)',
    TrackWidth: 'Track Width (in)',
    OverallHeight: 'Height (in)',
    OverallLength: 'Length (in)',
    OverallWidth: 'Width (in)',
    BedLength: 'Bed Length (in)',
    BedType: 'Bed Type',
    CabType: 'Cab Type',
    Seats: 'Seating Capacity',
    SeatRows: 'Seat Rows',
    Windows: 'Windows',

    // Safety Features
    ABS: 'Anti-lock Brakes (ABS)',
    ESC: 'Electronic Stability Control',
    TractionControl: 'Traction Control',
    ForwardCollisionWarning: 'Forward Collision Warning',
    LaneDepartureWarning: 'Lane Departure Warning',
    LaneKeepSystem: 'Lane Keep Assist',
    AdaptiveCruiseControl: 'Adaptive Cruise Control',
    CIB: 'Automatic Emergency Braking',
    BlindSpotMon: 'Blind Spot Monitoring',
    RearVisibilitySystem: 'Backup Camera',
    ParkAssist: 'Park Assist',

    // Airbags
    AirBagLocFront: 'Front Airbags',
    AirBagLocSide: 'Side Airbags',
    AirBagLocCurtain: 'Curtain Airbags',
    AirBagLocKnee: 'Knee Airbags',

    // Electric/Hybrid
    ElectrificationLevel: 'Electrification',
    ChargerLevel: 'Charger Level',
    ChargerPowerKW: 'Charger Power (kW)',
    BatteryKWh: 'Battery Capacity (kWh)',
    EVDriveUnit: 'EV Drive Unit',

    // Pricing (rarely available)
    BasePrice: 'Base Price',
    DestinationMarket: 'Market',

    // Entertainment
    EntertainmentSystem: 'Entertainment System',

    // Other
    VehicleType: 'Vehicle Type',
    ManufacturerName: 'Manufacturer',
    PlantCompanyName: 'Plant',
};

// Categories for organizing specs  
export const SPEC_CATEGORIES = {
    'Overview': ['Make', 'Model', 'ModelYear', 'Trim', 'Series', 'BodyClass', 'VehicleType'],
    'Engine & Performance': ['EngineConfiguration', 'EngineCylinders', 'DisplacementL', 'EngineHP', 'EngineKW', 'FuelTypePrimary', 'FuelTypeSecondary'],
    'Transmission & Drivetrain': ['TransmissionStyle', 'TransmissionSpeeds', 'DriveType'],
    'Dimensions & Weight': ['Doors', 'Seats', 'SeatRows', 'CurbWeightLB', 'GVWR', 'WheelBaseShort', 'OverallLength', 'OverallWidth', 'OverallHeight', 'TrackWidth', 'BedLength', 'BedType', 'CabType'],
    'Safety Features': ['ABS', 'ESC', 'TractionControl', 'ForwardCollisionWarning', 'LaneDepartureWarning', 'LaneKeepSystem', 'AdaptiveCruiseControl', 'CIB', 'BlindSpotMon', 'RearVisibilitySystem', 'ParkAssist'],
    'Airbags': ['AirBagLocFront', 'AirBagLocSide', 'AirBagLocCurtain', 'AirBagLocKnee'],
    'Electric & Hybrid': ['ElectrificationLevel', 'ChargerLevel', 'ChargerPowerKW', 'BatteryKWh', 'EVDriveUnit'],
    'Manufacturing': ['ManufacturerName', 'PlantCountry', 'PlantCity', 'PlantCompanyName', 'DestinationMarket'],
};

// Format spec value for display
export function formatSpecValue(key: string, value: string): string {
    // Boolean values
    if (value === 'Standard' || value === 'Yes') return '✓ Standard';
    if (value === 'Optional') return '○ Optional';
    if (value === 'Not Applicable' || value === 'No') return '—';

    // Numeric formatting
    if (key === 'EngineHP' || key === 'EngineKW') {
        return `${value} ${key === 'EngineHP' ? 'hp' : 'kW'}`;
    }
    if (key === 'DisplacementL') {
        return `${value}L`;
    }
    if (key === 'CurbWeightLB' || key === 'GVWR') {
        return `${parseInt(value).toLocaleString()} lbs`;
    }
    if (key === 'BatteryKWh') {
        return `${value} kWh`;
    }
    if (key === 'ChargerPowerKW') {
        return `${value} kW`;
    }

    return value;
}
